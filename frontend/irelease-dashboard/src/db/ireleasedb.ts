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

/**
 * Check if Dexie is empty
 */
export async function isDexieEmpty(): Promise<boolean> {
  const count = await ireleaseDB.releases.count();
  return count === 0;
}

/**
 * Seed data from static JSON file
 */
export async function seedFromStaticJSON(): Promise<{success: boolean; count: number}> {
  try {
    console.log('📥 Seeding data from static JSON...');
    
    // Fetch from public/data/releases.json
    const response = await fetch('/data/releases.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.releases) {
      throw new Error('Invalid JSON structure');
    }
    
    const now = Date.now();
    const releasesToStore = data.releases.map((release: any) => ({
      ...release,
      lastSynced: now
    }));
    
    // Clear and store in Dexie
    await ireleaseDB.releases.clear();
    await ireleaseDB.releases.bulkAdd(releasesToStore);
    
    const storedCount = await ireleaseDB.releases.count();
    console.log(`✅ Seeded ${storedCount} releases from static JSON`);
    
    return {
      success: true,
      count: storedCount
    };
    
  } catch (error) {
    console.error('❌ Failed to seed from JSON:', error);
    throw error;
  }
}

/**
 * Initialize database - seed if empty
 */
export async function initializeDatabase(): Promise<{seeded: boolean; count: number}> {
  const empty = await isDexieEmpty();
  
  if (empty) {
    console.log('Dexie is empty, seeding from static JSON...');
    const result = await seedFromStaticJSON();
    return {
      seeded: true,
      count: result.count
    };
  } else {
    const count = await ireleaseDB.releases.count();
    console.log(`Dexie already has ${count} releases, skipping seed`);
    return {
      seeded: false,
      count
    };
  }
}

/**
 * Get all releases from Dexie
 */
export async function getAllReleases(): Promise<ReleaseRecord[]> {
  return await ireleaseDB.releases.toArray();
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
  return await ireleaseDB.releases
    .where('Test_status')
    .equals(status)
    .toArray();
}

/**
 * Get total count
 */
export async function getTotalCount(): Promise<number> {
  return await ireleaseDB.releases.count();
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  return await ireleaseDB.releases.clear();
}