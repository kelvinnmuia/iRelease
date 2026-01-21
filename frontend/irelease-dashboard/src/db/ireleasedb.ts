import Dexie from "dexie";

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

export const db = new Dexie("ireleasedb");
db.version(1).stores({
  records: "++id, Release_id, lastSynced"
});

export const ireleaseDB = db as Dexie & {
  records: Dexie.Table<ReleaseRecord, number>;
};

// Your Apps Script URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxA8wFlmM0NMKhNSG-fOWA4tRpV-k9w-sJ9P0KWpSAlKL8qkctT27-kDAvF65Vhw50H/exec/api/releases';

/**
 * SIMPLE JSONP Fetch for Apps Script
 */
async function fetchReleasesJSONP(): Promise<Omit<ReleaseRecord, 'id' | 'lastSynced'>[]> {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}`;
    
    (window as any)[callbackName] = (data: any) => {
      // Clean up
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      if (data.success) {
        console.log(`✅ JSONP returned ${data.count} releases`);
        resolve(data.releases || []);
      } else {
        reject(new Error('API returned success: false'));
      }
    };
    
    const script = document.createElement('script');
    script.src = `${API_URL}?callback=${callbackName}`;
    
    script.onerror = () => {
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(new Error('JSONP request failed'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Smart sync using JSONP
 */
export async function syncReleasesToDexie(): Promise<{updated: number, inserted: number}> {
  try {
    console.log('Starting JSONP sync...');
    
    // Get data via JSONP
    const apiReleases = await fetchReleasesJSONP();
    const now = Date.now();
    
    // Get existing data
    const existingReleases = await ireleaseDB.records.toArray();
    const existingMap = new Map(existingReleases.map(r => [r.Release_id, r]));
    
    const updates: ReleaseRecord[] = [];
    const inserts: ReleaseRecord[] = [];
    
    apiReleases.forEach((apiRelease: any) => {
      const existing = existingMap.get(apiRelease.Release_id);
      
      if (existing && existing.id) {
        // Compare data (excluding id and lastSynced)
        const existingCopy = { ...existing };
        delete existingCopy.id;
        delete existingCopy.lastSynced;
        
        const apiCopy = { ...apiRelease };
        
        if (JSON.stringify(existingCopy) !== JSON.stringify(apiCopy)) {
          updates.push({
            ...apiRelease,
            id: existing.id,
            lastSynced: now
          });
        }
      } else {
        inserts.push({
          ...apiRelease,
          lastSynced: now
        });
      }
    });
    
    // Apply changes
    for (const update of updates) {
      await ireleaseDB.records.update(update.id!, update);
    }
    
    if (inserts.length > 0) {
      await ireleaseDB.records.bulkAdd(inserts);
    }
    
    console.log(`Sync complete: ${updates.length} updated, ${inserts.length} new`);
    return { updated: updates.length, inserted: inserts.length };
    
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

/**
 * Test JSONP connection
 */
export function testJSONPConnection(): Promise<any> {
  return new Promise((resolve) => {
    const callbackName = `test_${Date.now()}`;
    
    (window as any)[callbackName] = (data: any) => {
      console.log('✅ JSONP Test Response:', {
        success: data.success,
        count: data.count,
        hasReleases: !!data.releases,
        sampleId: data.releases?.[0]?.Release_id
      });
      
      delete (window as any)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      resolve(data);
    };
    
    const script = document.createElement('script');
    script.src = `${API_URL}?callback=${callbackName}`;
    
    script.onerror = () => {
      console.error('❌ JSONP Test Failed');
      delete (window as any)[callbackName];
      resolve(null);
    };
    
    document.head.appendChild(script);
  });
}

// Keep these essential functions
export async function getAllReleases(): Promise<ReleaseRecord[]> {
  return await ireleaseDB.records.toArray();
}

export async function getTotalCount(): Promise<number> {
  return await ireleaseDB.records.count();
}

export async function clearAllData(): Promise<void> {
  return await ireleaseDB.records.clear();
}