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
  isLocal?: boolean;
  needsSync?: boolean;
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
  isLocal?: boolean;
  needsSync?: boolean;
}

// ============================================
// DATABASE SETUP
// ============================================

export const db = new Dexie("ireleasedb");
db.version(3).stores({
  releases: "++id, Release_id, System_name, Test_status, lastSynced, needsSync, isLocal",
  sirsReleases: "++id, Sir_Rel_Id, Sir_id, Release_version, Bug_status, Priority, lastSynced, needsSync, isLocal"
});

export const ireleaseDB = db as Dexie & {
  releases: Dexie.Table<ReleaseRecord, number>;
  sirsReleases: Dexie.Table<SirsReleaseRecord, number>;
};

// ============================================
// EVENT SYSTEM
// ============================================

type DexieEventType = 'data-updated' | 'sync-started' | 'sync-completed' | 'sync-failed' | 'sirs-data-updated'

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

const APPSCRIPT_BASE_URL = "https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec";

const API_ENDPOINTS = {
  RELEASES: `${APPSCRIPT_BASE_URL}/api/releases`,
  SIRS_RELEASES: `${APPSCRIPT_BASE_URL}/api/sirs-releases`,
  SYSTEMS: `${APPSCRIPT_BASE_URL}/api/systems`,
  SIRS: `${APPSCRIPT_BASE_URL}/api/sirs`,
  MAP_SIRS: `${APPSCRIPT_BASE_URL}/api/map-sirs`
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateCallbackName(): string {
  const random = Math.random().toString(36).substring(2, 7);
  return `jsonp_callback_${random}`;
}

async function fetchWithJSONP(url: string, method: string = 'GET', data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = generateCallbackName();
    
    const script = document.createElement('script');
    
    (window as any)[callbackName] = (responseData: any) => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      console.log(`📥 JSONP response received from ${url}`);
      resolve(responseData);
    };
    
    script.onerror = () => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      reject(new Error(`JSONP request failed for ${url}`));
    };
    
    const timestamp = new Date().getTime();
    let urlWithParams = `${url}?callback=${callbackName}&_=${timestamp}`;
    
    if (method === 'GET' && data) {
      const params = new URLSearchParams(data).toString();
      urlWithParams += `&${params}`;
    }
    
    script.src = urlWithParams;
    document.body.appendChild(script);
  });
}

async function fetchDirect(url: string, method: string = 'GET', data?: any): Promise<any> {
  try {
    console.log(`🔄 Trying direct ${method} fetch from ${url}...`);
    const timestamp = new Date().getTime();
    let fullUrl = `${url}?_=${timestamp}`;
    
    const options: RequestInit = {
      method: method,
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors' as RequestMode
    };
    
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      };
      if (data) {
        options.body = JSON.stringify(data);
      }
    } else if (method === 'GET' && data) {
      const params = new URLSearchParams(data).toString();
      fullUrl += `&${params}`;
    }
    
    const response = await fetch(fullUrl, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log(`✅ Direct ${method} fetch successful from ${url}`);
    return responseData;
    
  } catch (error) {
    console.log(`Direct ${method} fetch failed for ${url}, falling back to JSONP...`);
    return await fetchWithJSONP(url, method, data);
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
      lastSynced: now,
      isLocal: false,
      needsSync: false
    }));
    
    console.log(`📊 Processing ${releasesToStore.length} releases`);
    
    await ireleaseDB.releases.clear();
    console.log('🗑️ Cleared existing releases data');
    
    await ireleaseDB.releases.bulkAdd(releasesToStore);
    console.log('💾 Stored releases in Dexie');
    
    const storedCount = await ireleaseDB.releases.count();
    console.log(`✅ Seeded ${storedCount} releases`);
    
    if (storedCount > 0) {
      const samples = await ireleaseDB.releases.limit(3).toArray();
      console.log('📝 Sample releases stored:');
      samples.forEach((sample, index) => {
        console.log(`  ${index + 1}. ${sample.Release_id} - ${sample.System_name} - ${sample.Test_status}`);
      });
    }
    
    dexieEvents.emit('data-updated', { type: 'releases', count: storedCount });
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

export async function initializeDatabase(): Promise<{seeded: boolean; count: number}> {
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
// SIRS-RELEASES FUNCTIONS (COMPLETE SET)
// ============================================

export async function isSirsReleasesEmpty(): Promise<boolean> {
  const count = await ireleaseDB.sirsReleases.count();
  return count === 0;
}

export async function fetchSirsReleasesFromAppScript(): Promise<any> {
  return fetchWithJSONP(API_ENDPOINTS.SIRS_RELEASES);
}

export async function fetchSirsReleasesDirect(): Promise<any> {
  return fetchDirect(API_ENDPOINTS.SIRS_RELEASES);
}

export async function seedSirsReleasesFromAppScript(): Promise<{success: boolean; count: number}> {
  try {
    console.log('📥 Fetching SIRs-Releases from AppScript...');
    
    const response = await fetchSirsReleasesDirect();
    
    console.log('📦 SIRs-Releases API response structure:', {
      hasSuccess: 'success' in response,
      successValue: response.success,
      hasSirsReleases: 'sirs_releases' in response,
      sirsReleasesCount: response.sirs_releases?.length || 0,
      hasCount: 'count' in response,
      countValue: response.count
    });
    
    let sirsReleasesArray = [];
    
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
    
    const now = Date.now();
    const sirsReleasesToStore = sirsReleasesArray.map((sirsRelease: any) => ({
      ...sirsRelease,
      lastSynced: now,
      isLocal: false,
      needsSync: false
    }));
    
    console.log(`📊 Processing ${sirsReleasesToStore.length} SIRs-Releases`);
    
    await ireleaseDB.sirsReleases.clear();
    console.log('🗑️ Cleared existing SIRs-Releases data');
    
    await ireleaseDB.sirsReleases.bulkAdd(sirsReleasesToStore);
    console.log('💾 Stored SIRs-Releases in Dexie');
    
    const storedCount = await ireleaseDB.sirsReleases.count();
    console.log(`✅ Seeded ${storedCount} SIRs-Releases`);
    
    if (storedCount > 0) {
      const samples = await ireleaseDB.sirsReleases.limit(3).toArray();
      console.log('📝 Sample SIRs-Releases stored:');
      samples.forEach((sample, index) => {
        console.log(`  ${index + 1}. ${sample.Sir_Rel_Id} - ${sample.Short_desc} - ${sample.Bug_status}`);
      });
    }
    
    dexieEvents.emit('sirs-data-updated', { type: 'sirs-releases', count: storedCount });
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

export async function getSirsReleasesByReleaseVersion(releaseVersion: string): Promise<SirsReleaseRecord[]> {
  const sirsReleases = await ireleaseDB.sirsReleases
    .where('Release_version')
    .equals(releaseVersion)
    .toArray();
  console.log(`📋 getSirsReleasesByReleaseVersion("${releaseVersion}"): Found ${sirsReleases.length} SIRs-Releases`);
  return sirsReleases;
}

export async function getSirsReleasesByBugStatus(bugStatus: string): Promise<SirsReleaseRecord[]> {
  const sirsReleases = await ireleaseDB.sirsReleases
    .where('Bug_status')
    .equals(bugStatus)
    .toArray();
  console.log(`📋 getSirsReleasesByBugStatus("${bugStatus}"): Found ${sirsReleases.length} SIRs-Releases`);
  return sirsReleases;
}

export async function getSirsReleasesByPriority(priority: string): Promise<SirsReleaseRecord[]> {
  const sirsReleases = await ireleaseDB.sirsReleases
    .where('Priority')
    .equals(priority)
    .toArray();
  console.log(`📋 getSirsReleasesByPriority("${priority}"): Found ${sirsReleases.length} SIRs-Releases`);
  return sirsReleases;
}

export async function getSirsReleasesBySirId(sirId: number): Promise<SirsReleaseRecord[]> {
  const sirsReleases = await ireleaseDB.sirsReleases
    .where('Sir_id')
    .equals(sirId)
    .toArray();
  console.log(`📋 getSirsReleasesBySirId(${sirId}): Found ${sirsReleases.length} SIRs-Releases`);
  return sirsReleases;
}

export async function syncSirsReleasesFromAppScript(): Promise<{success: boolean; count: number}> {
  console.log('🔄 Syncing SIRs-Releases data from AppScript...');
  dexieEvents.emit('sync-started', { type: 'sirs-releases' });
  const result = await seedSirsReleasesFromAppScript();
  dexieEvents.emit('sync-completed', { type: 'sirs-releases', ...result });
  return result;
}

export async function testSirsReleasesAppScriptConnection(): Promise<{success: boolean; data: any}> {
  try {
    console.log('🧪 Testing SIRs-Releases AppScript connection...');
    
    const response = await fetchSirsReleasesDirect();
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
    console.error('❌ SIRs-Releases test failed:', error);
    return { success: false, data: null };
  }
}

// ============================================
// SIRS-RELEASES CRUD OPERATIONS
// ============================================

export async function createSirsReleaseLocal(data: Partial<SirsReleaseRecord>): Promise<number> {
  try {
    console.log('➕ Creating local SIRs-Release...');
    
    const newSirsRelease: SirsReleaseRecord = {
      ...data as SirsReleaseRecord,
      Sir_Rel_Id: data.Sir_Rel_Id || `LOCAL-${Date.now()}`,
      lastSynced: Date.now(),
      isLocal: true,
      needsSync: true
    };
    
    const id = await ireleaseDB.sirsReleases.add(newSirsRelease);
    console.log(`✅ Created local SIRs-Release with ID: ${id}`);
    
    dexieEvents.emit('sirs-data-updated', { type: 'create', data: newSirsRelease });
    return id;
    
  } catch (error) {
    console.error('❌ Failed to create local SIRs-Release:', error);
    throw error;
  }
}

export async function updateSirsReleaseLocal(sirRelId: string, updates: Partial<SirsReleaseRecord>): Promise<number> {
  try {
    console.log(`📝 Updating local SIRs-Release: ${sirRelId}`);
    
    const existing = await getSirsReleaseById(sirRelId);
    if (!existing) {
      throw new Error(`SIRs-Release not found: ${sirRelId}`);
    }
    
    const updatedRecord = {
      ...existing,
      ...updates,
      lastSynced: Date.now(),
      needsSync: true
    };
    
    const count = await ireleaseDB.sirsReleases
      .where('Sir_Rel_Id')
      .equals(sirRelId)
      .modify(updatedRecord);
    
    console.log(`✅ Updated ${count} SIRs-Release(s)`);
    
    dexieEvents.emit('sirs-data-updated', { type: 'update', id: sirRelId, data: updatedRecord });
    return count;
    
  } catch (error) {
    console.error('❌ Failed to update SIRs-Release:', error);
    throw error;
  }
}

export async function deleteSirsReleaseLocal(sirRelId: string): Promise<void> {
  try {
    console.log(`🗑️ Deleting local SIRs-Release: ${sirRelId}`);
    
    await ireleaseDB.sirsReleases
      .where('Sir_Rel_Id')
      .equals(sirRelId)
      .delete();
    
    console.log(`✅ Deleted SIRs-Release: ${sirRelId}`);
    
    dexieEvents.emit('sirs-data-updated', { type: 'delete', id: sirRelId });
    
  } catch (error) {
    console.error('❌ Failed to delete SIRs-Release:', error);
    throw error;
  }
}

export async function bulkDeleteSirsReleasesLocal(sirRelIds: string[]): Promise<number> {
  try {
    console.log(`🗑️ Bulk deleting ${sirRelIds.length} SIRs-Releases...`);
    
    let deletedCount = 0;
    for (const sirRelId of sirRelIds) {
      await ireleaseDB.sirsReleases
        .where('Sir_Rel_Id')
        .equals(sirRelId)
        .delete();
      deletedCount++;
    }
    
    console.log(`✅ Bulk deleted ${deletedCount} SIRs-Releases`);
    
    dexieEvents.emit('sirs-data-updated', { type: 'bulk-delete', count: deletedCount });
    return deletedCount;
    
  } catch (error) {
    console.error('❌ Failed to bulk delete SIRs-Releases:', error);
    throw error;
  }
}

// ============================================
// SIRS-RELEASES SYNC OPERATIONS
// ============================================

export async function syncSirsReleaseToServer(sirRelId: string): Promise<{success: boolean; data?: any}> {
  try {
    console.log(`🔄 Syncing SIRs-Release ${sirRelId} to server...`);
    
    const sirsRelease = await getSirsReleaseById(sirRelId);
    if (!sirsRelease) {
      throw new Error(`SIRs-Release not found: ${sirRelId}`);
    }
    
    if (!sirsRelease.needsSync) {
      console.log(`ℹ️ SIRs-Release ${sirRelId} doesn't need sync`);
      return { success: true };
    }
    
    let response;
    if (sirsRelease.isLocal) {
      // POST new SIRs-Release
      response = await fetchDirect(API_ENDPOINTS.SIRS_RELEASES, 'POST', sirsRelease);
    } else {
      // PUT update existing SIRs-Release
      const updateUrl = `${API_ENDPOINTS.SIRS_RELEASES}/${sirRelId}`;
      response = await fetchDirect(updateUrl, 'PUT', sirsRelease);
    }
    
    if (response && response.success) {
      // Update local record to mark as synced
      await ireleaseDB.sirsReleases
        .where('Sir_Rel_Id')
        .equals(sirRelId)
        .modify({
          needsSync: false,
          isLocal: false,
          lastSynced: Date.now()
        });
      
      console.log(`✅ Synced SIRs-Release ${sirRelId} to server`);
      return { success: true, data: response };
    } else {
      throw new Error(`Server sync failed: ${response?.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to sync SIRs-Release ${sirRelId}:`, error);
    return { success: false };
  }
}

export async function deleteSirsReleaseFromServer(sirRelId: string): Promise<{success: boolean; data?: any}> {
  try {
    console.log(`🗑️ Deleting SIRs-Release ${sirRelId} from server...`);
    
    const deleteUrl = `${API_ENDPOINTS.SIRS_RELEASES}/${sirRelId}`;
    const response = await fetchDirect(deleteUrl, 'DELETE');
    
    if (response && response.success) {
      // Also delete from local DB
      await deleteSirsReleaseLocal(sirRelId);
      console.log(`✅ Deleted SIRs-Release ${sirRelId} from server`);
      return { success: true, data: response };
    } else {
      throw new Error(`Server delete failed: ${response?.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error(`❌ Failed to delete SIRs-Release ${sirRelId} from server:`, error);
    return { success: false };
  }
}

export async function bulkDeleteSirsReleasesFromServer(sirRelIds: string[]): Promise<{success: boolean; data?: any}> {
  try {
    console.log(`🗑️ Bulk deleting ${sirRelIds.length} SIRs-Releases from server...`);
    
    const response = await fetchDirect(API_ENDPOINTS.SIRS_RELEASES, 'DELETE', {
      sirReleaseIds: sirRelIds
    });
    
    if (response && response.success) {
      // Also delete from local DB
      await bulkDeleteSirsReleasesLocal(sirRelIds);
      console.log(`✅ Bulk deleted ${sirRelIds.length} SIRs-Releases from server`);
      return { success: true, data: response };
    } else {
      throw new Error(`Server bulk delete failed: ${response?.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to bulk delete SIRs-Releases from server:', error);
    return { success: false };
  }
}

export async function getPendingSirsReleasesSync(): Promise<SirsReleaseRecord[]> {
  const pending = await ireleaseDB.sirsReleases
    .where('needsSync')
    .equals(1)
    .toArray();
  console.log(`📋 Found ${pending.length} SIRs-Releases pending sync`);
  return pending;
}

// ============================================
// MAP SIRS FUNCTION
// ============================================

export async function mapSirsToRelease(
  releaseVersion: string,
  iteration: string | number,
  sirIds: number[]
): Promise<{success: boolean; data?: any}> {
  try {
    console.log(`🔗 Mapping ${sirIds.length} SIRs to release ${releaseVersion} iteration ${iteration}...`);
    
    const response = await fetchDirect(API_ENDPOINTS.MAP_SIRS, 'POST', {
      releaseVersion,
      iteration: String(iteration),
      sirIds
    });
    
    if (response && response.success) {
      console.log(`✅ Successfully mapped SIRs to release`);
      return { success: true, data: response };
    } else {
      throw new Error(`Map SIRs failed: ${response?.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to map SIRs to release:', error);
    return { success: false };
  }
}

// ============================================
// COMBINED FUNCTIONS (FOR BOTH APIs)
// ============================================

export async function isDexieEmpty(): Promise<boolean> {
  const releasesCount = await ireleaseDB.releases.count();
  const sirsReleasesCount = await ireleaseDB.sirsReleases.count();
  return releasesCount === 0 && sirsReleasesCount === 0;
}

export async function clearAllData(): Promise<void> {
  console.log('🗑️ Clearing all data...');
  await ireleaseDB.releases.clear();
  await ireleaseDB.sirsReleases.clear();
  dexieEvents.emit('data-updated', { type: 'clear-all' });
}

export async function clearSirsReleasesData(): Promise<void> {
  console.log('🗑️ Clearing all SIRs-Releases data...');
  await ireleaseDB.sirsReleases.clear();
  dexieEvents.emit('sirs-data-updated', { type: 'clear' });
}

// MAIN INITIALIZATION FUNCTION - FETCHES BOTH RELEASES AND SIRS-RELEASES
export async function initializeApp(): Promise<{
  releases: { seeded: boolean; count: number };
  sirsReleases: { seeded: boolean; count: number };
  success: boolean;
}> {
  console.log('🚀 Initializing iReleaseDB application (fetching both APIs)...');
  
  try {
    // Initialize both databases in parallel
    const [releasesResult, sirsReleasesResult] = await Promise.all([
      initializeDatabase(),
      initializeSirsReleasesDatabase()
    ]);
    
    console.log('✅ Application initialized successfully:');
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
  console.log('🚀 Syncing all data from AppScript APIs...');
  dexieEvents.emit('sync-started', { type: 'all' });
  
  try {
    const [releasesResult, sirsReleasesResult] = await Promise.all([
      syncFromAppScript(),
      syncSirsReleasesFromAppScript()
    ]);
    
    console.log('✅ All data synced from APIs:');
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
  console.log('📋 Getting all data from Dexie...');
  
  const releases = await getAllReleases();
  const sirsReleases = await getAllSirsReleases();
  
  console.log(`📊 Total data: ${releases.length} releases, ${sirsReleases.length} SIRs-Releases`);
  
  return {
    releases,
    sirsReleases
  };
}

export async function getSirsReleasesStats() {
  const allSirsReleases = await getAllSirsReleases();
  const total = allSirsReleases.length;
  
  const closed = allSirsReleases.filter(s => s.Bug_status === "CLOSED").length;
  const open = allSirsReleases.filter(s => s.Bug_status === "OPEN").length;
  const inProgress = allSirsReleases.filter(s => s.Bug_status === "IN_PROGRESS").length;
  
  const p1 = allSirsReleases.filter(s => s.Priority === "P1").length;
  const p2 = allSirsReleases.filter(s => s.Priority === "P2").length;
  const p3 = allSirsReleases.filter(s => s.Priority === "P3").length;
  const p4 = allSirsReleases.filter(s => s.Priority === "P4").length;
  
  console.log('📊 SIRs-Releases stats calculated:', { 
    total, closed, open, inProgress, p1, p2, p3, p4 
  });
  
  return {
    total,
    byStatus: { closed, open, inProgress },
    byPriority: { p1, p2, p3, p4 }
  };
}

export async function getCombinedDashboardStats() {
  const releasesStats = await getDashboardStats();
  const sirsReleasesStats = await getSirsReleasesStats();
  
  return {
    releases: releasesStats,
    sirsReleases: sirsReleasesStats,
    combined: {
      totalReleases: releasesStats.total,
      totalSirsReleases: sirsReleasesStats.total,
      testingReleases: releasesStats.inTesting,
      openSirs: sirsReleasesStats.byStatus.open
    }
  };
}

// ============================================
// TEST ALL API CONNECTIONS
// ============================================

export async function testAllApiConnections(): Promise<{
  releases: { success: boolean; data: any };
  sirsReleases: { success: boolean; data: any };
  allConnected: boolean;
}> {
  console.log('🔌 Testing all API connections...');
  
  const [releasesTest, sirsReleasesTest] = await Promise.all([
    testAppScriptConnection(),
    testSirsReleasesAppScriptConnection()
  ]);
  
  const allConnected = releasesTest.success && sirsReleasesTest.success;
  
  console.log('📊 API Connection Test Results:');
  console.log(`   - Releases API: ${releasesTest.success ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   - SIRs-Releases API: ${sirsReleasesTest.success ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   - All APIs: ${allConnected ? '✅ All Connected' : '⚠️ Some Failed'}`);
  
  return {
    releases: releasesTest,
    sirsReleases: sirsReleasesTest,
    allConnected
  };
}

// ============================================
// USAGE EXAMPLE EXPORT
// ============================================

/**
 * Example usage in your application:
 * 
 * 1. Initialize both APIs:
 *    const initResult = await initializeApp();
 *    if (initResult.success) {
 *      console.log('App initialized with data from both APIs');
 *    }
 * 
 * 2. Get all data:
 *    const allData = await getAllData();
 *    console.log('Releases:', allData.releases);
 *    console.log('SIRs-Releases:', allData.sirsReleases);
 * 
 * 3. Get combined stats:
 *    const stats = await getCombinedDashboardStats();
 *    console.log('Dashboard stats:', stats);
 * 
 * 4. Refresh all data:
 *    const syncResult = await syncAllFromAppScript();
 *    if (syncResult.success) {
 *      console.log('Data refreshed from both APIs');
 *    }
 */