import Dexie from "dexie";

// Your existing interface
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



// Simple database with just releases table for now
export const db = new Dexie("ireleasedb");
db.version(1).stores({
  releases: "++id, Release_id, System_name, Test_status, lastSynced"
});

// Type the database
export const ireleaseDB = db as Dexie & {
  releases: Dexie.Table<ReleaseRecord, number>;
};

// Event system built into Dexie file
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
      // Clone array to avoid issues if callbacks modify during iteration
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

// Export the event emitter
export const dexieEvents = new DexieEventEmitter()

// Your AppScript URL
const AppScript_URL = "https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec/api/releases";

/**
 * Check if Dexie is empty
 */
export async function isDexieEmpty(): Promise<boolean> {
  const count = await ireleaseDB.releases.count();
  return count === 0;
}

/**
 * Generate a simple random callback name with 5 characters
 */
function generateCallbackName(): string {
  const random = Math.random().toString(36).substring(2, 7);
  return `jsonp_callback_${random}`;
}

/**
 * JSONP function to fetch data from AppScript
 */
export async function fetchFromAppScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = generateCallbackName();
    
    const script = document.createElement('script');
    
    (window as any)[callbackName] = (data: any) => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      console.log('📥 JSONP response received');
      resolve(data);
    };
    
    script.onerror = () => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      reject(new Error('JSONP request failed'));
    };
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    script.src = `${AppScript_URL}?callback=${callbackName}&_=${timestamp}`;
    document.body.appendChild(script);
  });
}

/**
 * Direct fetch from AppScript (if CORS is enabled)
 */
export async function fetchFromAppScriptDirect(): Promise<any> {
  try {
    console.log('🔄 Trying direct fetch...');
    const timestamp = new Date().getTime();
    const url = `${AppScript_URL}?_=${timestamp}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Direct fetch successful');
    return data;
    
  } catch (error) {
    console.log('Direct fetch failed, falling back to JSONP...');
    return await fetchFromAppScript();
  }
}

/**
 * Seed data from AppScript API
 */
export async function seedFromAppScript(): Promise<{success: boolean; count: number}> {
  try {
    console.log('📥 Fetching data from AppScript...');
    
    // Try direct fetch first, fall back to JSONP
    const response = await fetchFromAppScriptDirect();
    
    // Log the full response structure for debugging
    console.log('📦 Full API response structure:', {
      hasSuccess: 'success' in response,
      successValue: response.success,
      hasReleases: 'releases' in response,
      releasesCount: response.releases?.length || 0,
      hasCount: 'count' in response,
      countValue: response.count
    });
    
    // Extract releases array from the response
    let releasesArray = [];
    
    if (response && response.success && Array.isArray(response.releases)) {
      // Your AppScript returns {success: true, count: X, releases: [...]}
      releasesArray = response.releases;
      console.log(`✅ Using releases array from response (${releasesArray.length} items)`);
    } else if (Array.isArray(response)) {
      // If response is already an array (backward compatibility)
      releasesArray = response;
      console.log(`✅ Using response as array (${releasesArray.length} items)`);
    } else if (response && Array.isArray(response.releases)) {
      // If response has releases array without success flag
      releasesArray = response.releases;
      console.log(`✅ Using releases array (${releasesArray.length} items)`);
    } else {
      console.error('❌ Invalid data structure from API:', response);
      return { success: false, count: 0 };
    }
    
    const now = Date.now();
    const releasesToStore = releasesArray.map((release: any) => ({
      ...release,
      lastSynced: now
    }));
    
    console.log(`📊 Processing ${releasesToStore.length} releases`);
    
    // Clear existing data
    await ireleaseDB.releases.clear();
    console.log('🗑️ Cleared existing data');
    
    // Store new data
    await ireleaseDB.releases.bulkAdd(releasesToStore);
    console.log('💾 Stored releases in Dexie');
    
    const storedCount = await ireleaseDB.releases.count();
    console.log(`✅ Seeded ${storedCount} releases`);
    
    // Log sample for verification
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
    console.error('❌ Failed to fetch from AppScript:', error);
    return {
      success: false,
      count: 0
    };
  }
}

/**
 * Initialize database - seed if empty
 */
export async function initializeDatabase(): Promise<{seeded: boolean; count: number}> {
  console.log('🔄 Initializing database...');
  
  const empty = await isDexieEmpty();
  
  if (empty) {
    console.log('Dexie is empty, fetching from AppScript...');
    const result = await seedFromAppScript();
    return {
      seeded: result.success,
      count: result.count
    };
  } else {
    const count = await ireleaseDB.releases.count();
    console.log(`✅ Dexie has ${count} releases`);
    
    // Log sample data
    if (count > 0) {
      const sample = await ireleaseDB.releases.limit(1).toArray();
      console.log('📊 Sample record:', {
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

/**
 * Sync data from AppScript API
 */
export async function syncFromAppScript(): Promise<{success: boolean; count: number}> {
  console.log('🔄 Syncing data from AppScript...');
  return await seedFromAppScript();
}

/**
 * Get all releases from Dexie
 */
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

/**
 * Get single release by ID
 */
export async function getReleaseById(releaseId: string): Promise<ReleaseRecord | undefined> {
  return await ireleaseDB.releases
    .where('Release_id')
    .equals(releaseId)
    .first();
}

/**
 * Get releases by status
 */
export async function getReleasesByStatus(status: string): Promise<ReleaseRecord[]> {
  const releases = await ireleaseDB.releases
    .where('Test_status')
    .equals(status)
    .toArray();
  console.log(`📋 getReleasesByStatus("${status}"): Found ${releases.length} releases`);
  return releases;
}

/**
 * Get total count
 */
export async function getTotalCount(): Promise<number> {
  const count = await ireleaseDB.releases.count();
  console.log(`📊 getTotalCount: ${count} releases`);
  return count;
}

/**
 * Get stats for dashboard
 */
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

/**
 * Test AppScript API connection
 */
export async function testAppScriptConnection(): Promise<{success: boolean; data: any}> {
  try {
    console.log('🧪 Testing AppScript connection...');
    
    const response = await fetchFromAppScriptDirect();
    console.log('📦 Full API response:', response);
    
    if (response && response.success) {
      console.log(`✅ API success: ${response.success}, count: ${response.count}`);
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
      console.warn('⚠️ API returned without success flag:', response);
      return { success: false, data: response };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, data: null };
  }
}

/**
 * Clear all data
 */
export async function clearAllData(): Promise<void> {
  console.log('🗑️ Clearing all data...');
  return await ireleaseDB.releases.clear();
}