import Dexie from "dexie";

// ============================================
// INTERFACES
// ============================================

export interface ReleaseRecord {
  id?: number;
  Release_id: string;
  System_name: string;
  System_id: string;
  Release_version: string;
  Iteration: number;
  Release_description: string;
  Functionality_delivered: string;
  Date_delivered_by_vendor: string;
  Notification_date_for_deployment_to_test: string;
  Date_deployed_to_test: string;
  Date_of_test_commencement: string;
  Date_of_test_completion: string;
  Date_deployed_in_production: string;
  Time_taken_to_deploy_after_delivery: number;
  Time_taken_to_start_testing_after_deployment: number;
  Time_taken_to_complete_testing: number;
  Time_taken_to_deploy_after_completing_testing: number;
  Test_status: string;
  Deployment_status: string;
  Outstanding_issues: string;
  Comments: string;
  Type_of_release: string;
  Month: string;
  Test_plan_creation_date: string;
  Financial_year: string;
  Test_plan_SLA_days: number;
  Date_updated: string;
  Updated_by: string;
  lastSynced?: number;
}

export interface SirsReleaseRecord {
  id?: number;
  Sir_Rel_Id: string;
  Sir_id: number;
  Release_version: string;
  Iteration: string;
  Change_date: string;
  Bug_severity: string;
  Priority: string;
  Assigned_to: string;
  Bug_status: string;
  Resolution: string;
  Component: string;
  Op_sys: string;
  Short_desc: string;
  Cf_sirwith: string;
  lastSynced?: number;
}

// ============================================
// DATABASE SETUP
// ============================================

export const db = new Dexie("ireleasedb");
db.version(2).stores({
  releases: "++id, Release_id, System_name, Test_status, lastSynced",
  sirsReleases: "++id, Sir_Rel_Id, Sir_id, Release_version, Bug_status, Priority, lastSynced"
});

export const ireleaseDB = db as Dexie & {
  releases: Dexie.Table<ReleaseRecord, number>;
  sirsReleases: Dexie.Table<SirsReleaseRecord, number>;
};

// ============================================
// EVENT SYSTEM
// ============================================

type DexieEventType = 'data-updated' | 'sync-started' | 'sync-completed' | 'sync-failed'

class DexieEventEmitter {
  private listeners: Map<DexieEventType, Function[]> = new Map()

  on(event: DexieEventType, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: DexieEventType, callback: Function) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: DexieEventType, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      [...callbacks].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }
}

export const dexieEvents = new DexieEventEmitter()

// ============================================
// URL CONFIGURATION
// ============================================

const APPSCRIPT_BASE_URL = "https://script.google.com/macros/s/AKfycbxF76N3CGwMl13VO1TzIYue0qoBc3KwUKzngsiFFuRLPM96xfaYFQ4yUMHeayUJ0Ag/exec";

const API_ENDPOINTS = {
  RELEASES: `${APPSCRIPT_BASE_URL}/api/releases`,
  SIRS_RELEASES: `${APPSCRIPT_BASE_URL}/api/sirs-releases`
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateCallbackName(): string {
  const random = Math.random().toString(36).substring(2, 7);
  return `jsonp_callback_${random}`;
}

async function fetchWithJSONP(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = generateCallbackName();
    
    const script = document.createElement('script');
    
    (window as any)[callbackName] = (data: any) => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      console.log(`📥 JSONP response received from ${url}`);
      resolve(data);
    };
    
    script.onerror = () => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      reject(new Error(`JSONP request failed for ${url}`));
    };
    
    const timestamp = new Date().getTime();
    script.src = `${url}?callback=${callbackName}&_=${timestamp}`;
    document.body.appendChild(script);
  });
}

async function fetchDirect(url: string): Promise<any> {
  try {
    console.log(`🔄 Trying direct fetch from ${url}...`);
    const timestamp = new Date().getTime();
    const fullUrl = `${url}?_=${timestamp}`;
    
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Direct fetch successful from ${url}`);
    return data;
    
  } catch (error) {
    console.log(`Direct fetch failed for ${url}, falling back to JSONP...`);
    return await fetchWithJSONP(url);
  }
}

// ============================================
// RELEASES FUNCTIONS
// ============================================

export async function isReleasesEmpty(): Promise<boolean> {
  const count = await ireleaseDB.releases.count();
  return count === 0;
}

export async function fetchFromAppScript(): Promise<any> {
  return fetchWithJSONP(API_ENDPOINTS.RELEASES);
}

export async function fetchFromAppScriptDirect(): Promise<any> {
  return fetchDirect(API_ENDPOINTS.RELEASES);
}

export async function seedFromAppScript(): Promise<{success: boolean; count: number}> {
  try {
    console.log('📥 Fetching releases from AppScript...');
    
    const response = await fetchFromAppScriptDirect();
    
    console.log('📦 Releases API response structure:', {
      hasSuccess: 'success' in response,
      successValue: response.success,
      hasReleases: 'releases' in response,
      releasesCount: response.releases?.length || 0,
      hasCount: 'count' in response,
      countValue: response.count
    });
    
    let releasesArray = [];
    
    if (response && response.success && Array.isArray(response.releases)) {
      releasesArray = response.releases;
      console.log(`✅ Using releases array from response (${releasesArray.length} items)`);
    } else if (Array.isArray(response)) {
      releasesArray = response;
      console.log(`✅ Using response as array (${releasesArray.length} items)`);
    } else if (response && Array.isArray(response.releases)) {
      releasesArray = response.releases;
      console.log(`✅ Using releases array (${releasesArray.length} items)`);
    } else {
      console.error('❌ Invalid data structure from Releases API:', response);
      return { success: false, count: 0 };
    }
    
    const now = Date.now();
    const releasesToStore = releasesArray.map((release: any) => ({
      ...release,
      lastSynced: now
    }));
    
    console.log(`📊 Processing ${releasesToStore.length} releases`);
    
    await ireleaseDB.releases.clear();
    console.log('🗑️ Cleared existing releases data');
    
    await ireleaseDB.releases.bulkAdd(releasesToStore);
    console.log('💾 Stored releases in Dexie');
    
    const storedCount = await ireleaseDB.releases.count();
    console.log(`✅ Seeded ${storedCount} releases`);
    
    dexieEvents.emit('data-updated', { type: 'releases', count: storedCount });
    
    if (storedCount > 0) {
      const samples = await ireleaseDB.releases.limit(3).toArray();
      console.log('📝 Sample releases stored:');
      samples.forEach((sample, index) => {
        console.log(`  ${index + 1}. ${sample.Release_id} - ${sample.System_name} - ${sample.Test_status}`);
      });
    }
    
    return {
      success: true,
      count: storedCount
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch releases from AppScript:', error);
    return {
      success: false,
      count: 0
    };
  }
}

export async function initializeReleasesDatabase(): Promise<{seeded: boolean; count: number}> {
  console.log('🔄 Initializing releases database...');
  
  const empty = await isReleasesEmpty();
  
  if (empty) {
    console.log('Releases table is empty, fetching from AppScript...');
    const result = await seedFromAppScript();
    return {
      seeded: result.success,
      count: result.count
    };
  } else {
    const count = await ireleaseDB.releases.count();
    console.log(`✅ Releases table has ${count} records`);
    
    if (count > 0) {
      const sample = await ireleaseDB.releases.limit(1).toArray();
      console.log('📊 Sample release record:', {
        id: sample[0].id,
        Release_id: sample[0].Release_id,
        Test_status: sample[0].Test_status
      });
    }
    
    return {
      seeded: false,
      count
    };
  }
}

export async function syncFromAppScript(): Promise<{success: boolean; count: number}> {
  console.log('🔄 Syncing releases data from AppScript...');
  dexieEvents.emit('sync-started', { type: 'releases' });
  const result = await seedFromAppScript();
  dexieEvents.emit('sync-completed', { type: 'releases', ...result });
  return result;
}

export async function getAllReleases(): Promise<ReleaseRecord[]> {
  const releases = await ireleaseDB.releases.toArray();
  console.log(`📋 getAllReleases: Returning ${releases.length} releases`);
  
  if (releases.length > 0) {
    console.log('📝 First release:', {
      Release_id: releases[0].Release_id,
      Test_status: releases[0].Test_status
    });
  }
  
  return releases;
}

export async function getReleaseById(releaseId: string): Promise<ReleaseRecord | undefined> {
  return await ireleaseDB.releases
    .where('Release_id')
    .equals(releaseId)
    .first();
}

export async function getReleasesByStatus(status: string): Promise<ReleaseRecord[]> {
  const releases = await ireleaseDB.releases
    .where('Test_status')
    .equals(status)
    .toArray();
  console.log(`📋 getReleasesByStatus("${status}"): Found ${releases.length} releases`);
  return releases;
}

export async function getTotalCount(): Promise<number> {
  const count = await ireleaseDB.releases.count();
  console.log(`📊 getTotalCount: ${count} releases`);
  return count;
}

export async function getDashboardStats() {
  const allReleases = await getAllReleases();
  const total = allReleases.length;
  
  const inTesting = allReleases.filter(r => r.Test_status === "In Testing").length;
  const passed = allReleases.filter(r => r.Test_status === "Passed").length;
  const failed = allReleases.filter(r => r.Test_status === "Failed").length;
  
  console.log('📊 Dashboard stats calculated:', { total, inTesting, passed, failed });
  
  return {
    total,
    inTesting,
    passed,
    failed
  };
}

export async function testAppScriptConnection(): Promise<{success: boolean; data: any}> {
  try {
    console.log('🧪 Testing Releases AppScript connection...');
    
    const response = await fetchFromAppScriptDirect();
    console.log('📦 Releases API response:', response);
    
    if (response && response.success) {
      console.log(`✅ Releases API success: ${response.success}, count: ${response.count}`);
      console.log(`📊 Releases array length: ${response.releases?.length || 0}`);
      
      if (response.releases && response.releases.length > 0) {
        console.log('📝 First release sample:', {
          Release_id: response.releases[0].Release_id,
          System_name: response.releases[0].System_name,
          Test_status: response.releases[0].Test_status
        });
      }
      
      return { success: true, data: response };
    } else {
      console.warn('⚠️ Releases API returned without success flag:', response);
      return { success: false, data: response };
    }
    
  } catch (error) {
    console.error('❌ Releases API test failed:', error);
    return { success: false, data: null };
  }
}

// ============================================
// SIRS-RELEASES FUNCTIONS (EXACT MIRROR OF RELEASES - FIXED)
// ============================================

export async function isSirsReleasesEmpty(): Promise<boolean> {
  const count = await ireleaseDB.sirsReleases.count();
  return count === 0;
}

export async function fetchSirsReleasesFromAppScript(): Promise<any> {
  return fetchWithJSONP(API_ENDPOINTS.SIRS_RELEASES);
}

export async function fetchSirsReleasesFromAppScriptDirect(): Promise<any> {
  return fetchDirect(API_ENDPOINTS.SIRS_RELEASES);
}

export async function seedSirsReleasesFromAppScript(): Promise<{success: boolean; count: number}> {
  try {
    console.log('📥 Fetching SIRs-Releases from AppScript...');
    
    const response = await fetchSirsReleasesFromAppScriptDirect();
    
    console.log('📦 SIRs-Releases API response structure:', {
      hasSuccess: 'success' in response,
      successValue: response.success,
      hasSirsReleases: 'sirs_releases' in response,
      sirsReleasesCount: response.sirs_releases?.length || 0,
      hasCount: 'count' in response,
      countValue: response.count
    });
    
    let sirsReleasesArray = [];
    
    // EXACT SAME LOGIC AS RELEASES - CORRECT ORDER
    if (response && response.success && Array.isArray(response.sirs_releases)) {
      sirsReleasesArray = response.sirs_releases;
      console.log(`✅ Using sirs_releases array from response (${sirsReleasesArray.length} items)`);
    } else if (Array.isArray(response)) {
      sirsReleasesArray = response;
      console.log(`✅ Using response as array (${sirsReleasesArray.length} items)`);
    } else if (response && Array.isArray(response.sirs_releases)) {
      sirsReleasesArray = response.sirs_releases;
      console.log(`✅ Using sirs_releases array (${sirsReleasesArray.length} items)`);
    } else {
      console.error('❌ Invalid data structure from SIRs-Releases API:', response);
      return { success: false, count: 0 };
    }
    
    console.log(`📊 Processing ${sirsReleasesArray.length} SIRs-Releases from API response`);
    
    const now = Date.now();
    const sirsReleasesToStore = sirsReleasesArray.map((sirsRelease: any) => ({
      ...sirsRelease,
      lastSynced: now
    }));
    
    console.log(`📊 Prepared ${sirsReleasesToStore.length} SIRs-Releases for storage`);
    
    await ireleaseDB.sirsReleases.clear();
    console.log('🗑️ Cleared existing SIRs-Releases data');
    
    await ireleaseDB.sirsReleases.bulkAdd(sirsReleasesToStore);
    console.log('💾 Stored SIRs-Releases in Dexie');
    
    const storedCount = await ireleaseDB.sirsReleases.count();
    console.log(`✅ Seeded ${storedCount} SIRs-Releases`);
    
    dexieEvents.emit('data-updated', { type: 'sirs-releases', count: storedCount });
    
    if (storedCount > 0) {
      const samples = await ireleaseDB.sirsReleases.limit(3).toArray();
      console.log('📝 Sample SIRs-Releases stored:');
      samples.forEach((sample, index) => {
        console.log(`  ${index + 1}. ${sample.Sir_Rel_Id} - ${sample.Short_desc} - ${sample.Bug_status}`);
      });
    }
    
    return {
      success: true,
      count: storedCount
    };
    
  } catch (error) {
    console.error('❌ Failed to fetch SIRs-Releases from AppScript:', error);
    return {
      success: false,
      count: 0
    };
  }
}

export async function initializeSirsReleasesDatabase(): Promise<{seeded: boolean; count: number}> {
  console.log('🔄 Initializing SIRs-Releases database...');
  
  const empty = await isSirsReleasesEmpty();
  
  if (empty) {
    console.log('SIRs-Releases table is empty, fetching from AppScript...');
    const result = await seedSirsReleasesFromAppScript();
    return {
      seeded: result.success,
      count: result.count
    };
  } else {
    const count = await ireleaseDB.sirsReleases.count();
    console.log(`✅ SIRs-Releases table has ${count} records`);
    
    if (count > 0) {
      const sample = await ireleaseDB.sirsReleases.limit(1).toArray();
      console.log('📊 Sample SIRs-Release record:', {
        id: sample[0].id,
        Sir_Rel_Id: sample[0].Sir_Rel_Id,
        Bug_status: sample[0].Bug_status
      });
    }
    
    return {
      seeded: false,
      count
    };
  }
}

export async function syncSirsReleasesFromAppScript(): Promise<{success: boolean; count: number}> {
  console.log('🔄 Syncing SIRs-Releases data from AppScript...');
  dexieEvents.emit('sync-started', { type: 'sirs-releases' });
  const result = await seedSirsReleasesFromAppScript();
  dexieEvents.emit('sync-completed', { type: 'sirs-releases', ...result });
  return result;
}

export async function getAllSirsReleases(): Promise<SirsReleaseRecord[]> {
  const sirsReleases = await ireleaseDB.sirsReleases.toArray();
  console.log(`📋 getAllSirsReleases: Returning ${sirsReleases.length} SIRs-Releases`);
  
  if (sirsReleases.length > 0) {
    console.log('📝 First SIRs-Release:', {
      Sir_Rel_Id: sirsReleases[0].Sir_Rel_Id,
      Bug_status: sirsReleases[0].Bug_status,
      Short_desc: sirsReleases[0].Short_desc
    });
  }
  
  return sirsReleases;
}

export async function getSirsReleaseById(sirRelId: string): Promise<SirsReleaseRecord | undefined> {
  return await ireleaseDB.sirsReleases
    .where('Sir_Rel_Id')
    .equals(sirRelId)
    .first();
}

export async function testSirsReleasesAppScriptConnection(): Promise<{success: boolean; data: any}> {
  try {
    console.log('🧪 Testing SIRs-Releases AppScript connection...');
    
    const response = await fetchSirsReleasesFromAppScriptDirect();
    console.log('📦 SIRs-Releases API response:', response);
    
    if (response && response.success) {
      console.log(`✅ SIRs-Releases API success: ${response.success}, count: ${response.count}`);
      console.log(`📊 SIRs-Releases array length: ${response.sirs_releases?.length || 0}`);
      
      if (response.sirs_releases && response.sirs_releases.length > 0) {
        console.log('📝 First SIRs-Release sample:', {
          Sir_Rel_Id: response.sirs_releases[0].Sir_Rel_Id,
          Bug_status: response.sirs_releases[0].Bug_status,
          Short_desc: response.sirs_releases[0].Short_desc
        });
      }
      
      return { success: true, data: response };
    } else {
      console.warn('⚠️ SIRs-Releases API returned without success flag:', response);
      return { success: false, data: response };
    }
    
  } catch (error) {
    console.error('❌ SIRs-Releases API test failed:', error);
    return { success: false, data: null };
  }
}

export async function getSirsReleasesByReleaseVersion(releaseVersion: string): Promise<SirsReleaseRecord[]> {
  const sirsReleases = await ireleaseDB.sirsReleases
    .where('Release_version')
    .equals(releaseVersion)
    .toArray();
  console.log(`📋 getSirsReleasesByReleaseVersion("${releaseVersion}"): Found ${sirsReleases.length} SIRs-Releases`);
  return sirsReleases;
}

// ==============================================
// FUNCTIONS TO FETCH DATA FOR ALL DEXIE TABLES
// ==============================================

export async function isDexieEmpty(): Promise<boolean> {
  const [releasesCount, sirsReleasesCount] = await Promise.all([
    ireleaseDB.releases.count(),
    ireleaseDB.sirsReleases.count()
  ]);
  return releasesCount === 0 && sirsReleasesCount === 0;
}

export async function clearAllData(): Promise<void> {
  console.log('🗑️ Clearing all data...');
  await Promise.all([
    ireleaseDB.releases.clear(),
    ireleaseDB.sirsReleases.clear()
  ]);
  dexieEvents.emit('data-updated', { type: 'clear-all' });
}

export async function clearSirsReleasesData(): Promise<void> {
  console.log('🗑️ Clearing all SIRs-Releases data...');
  await ireleaseDB.sirsReleases.clear();
  dexieEvents.emit('data-updated', { type: 'clear-sirs-releases' });
}

export async function initializeAllDatabases(): Promise<{
  releases: { seeded: boolean; count: number };
  sirsReleases: { seeded: boolean; count: number };
  success: boolean;
}> {
  console.log('🚀 Initializing ALL databases (checking both tables)...');
  
  try {
    const [releasesResult, sirsReleasesResult] = await Promise.all([
      initializeReleasesDatabase(),
      initializeSirsReleasesDatabase()
    ]);
    
    console.log('✅ ALL databases initialized:');
    console.log(`   - Releases: ${releasesResult.count} records (${releasesResult.seeded ? 'seeded from API' : 'loaded from cache'})`);
    console.log(`   - SIRs-Releases: ${sirsReleasesResult.count} records (${sirsReleasesResult.seeded ? 'seeded from API' : 'loaded from cache'})`);
    
    return {
      releases: releasesResult,
      sirsReleases: sirsReleasesResult,
      success: true
    };
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    return {
      releases: { seeded: false, count: 0 },
      sirsReleases: { seeded: false, count: 0 },
      success: false
    };
  }
}

export async function syncAllFromAppScript(): Promise<{
  releases: {success: boolean; count: number};
  sirsReleases: {success: boolean; count: number};
  success: boolean;
}> {
  console.log('🚀 Syncing ALL data from AppScript APIs...');
  dexieEvents.emit('sync-started', { type: 'all' });
  
  try {
    const [releasesResult, sirsReleasesResult] = await Promise.all([
      syncFromAppScript(),
      syncSirsReleasesFromAppScript()
    ]);
    
    console.log('✅ ALL data synced from APIs:');
    console.log(`   - Releases: ${releasesResult.count} records`);
    console.log(`   - SIRs-Releases: ${sirsReleasesResult.count} records`);
    
    dexieEvents.emit('sync-completed', { 
      type: 'all', 
      releases: releasesResult, 
      sirsReleases: sirsReleasesResult 
    });
    
    return {
      releases: releasesResult,
      sirsReleases: sirsReleasesResult,
      success: releasesResult.success && sirsReleasesResult.success
    };
    
  } catch (error) {
    console.error('❌ Failed to sync all data:', error);
    dexieEvents.emit('sync-failed', { type: 'all', error });
    return {
      releases: { success: false, count: 0 },
      sirsReleases: { success: false, count: 0 },
      success: false
    };
  }
}

export async function getAllData(): Promise<{
  releases: ReleaseRecord[];
  sirsReleases: SirsReleaseRecord[];
}> {
  console.log('📋 Getting ALL data from Dexie...');
  
  const [releases, sirsReleases] = await Promise.all([
    getAllReleases(),
    getAllSirsReleases()
  ]);
  
  console.log(`📊 Total data: ${releases.length} releases, ${sirsReleases.length} SIRs-Releases`);
  
  return {
    releases,
    sirsReleases
  };
}

export async function testAllApiConnections(): Promise<{
  releases: { success: boolean; data: any };
  sirsReleases: { success: boolean; data: any };
}> {
  console.log('🔌 Testing ALL API connections...');
  
  const [releasesTest, sirsReleasesTest] = await Promise.all([
    testAppScriptConnection(),
    testSirsReleasesAppScriptConnection()
  ]);
  
  console.log('📊 API Test Results:');
  console.log(`   - Releases API: ${releasesTest.success ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   - SIRs-Releases API: ${sirsReleasesTest.success ? '✅ Connected' : '❌ Failed'}`);
  
  return {
    releases: releasesTest,
    sirsReleases: sirsReleasesTest
  };
}