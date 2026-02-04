import Dexie from "dexie";
// ============================================
// DATABASE SETUP
// ============================================
/**
 * Main Dexie database instance for the iRelease application
 * Contains three tables: releases, sirsReleases, and systems
 * Version 3 includes the systems table addition
 */
export const db = new Dexie("ireleasedb");
db.version(3).stores({
    releases: "++id, Release_id, System_name, Test_status, lastSynced",
    sirsReleases: "++id, Sir_Rel_Id, Sir_id, Release_version, Bug_status, Priority, lastSynced",
    systems: "++id, System_id, System_name, Status, System_category, lastSynced"
});
/**
 * Typed database instance with proper TypeScript interfaces
 * Provides type-safe access to all three database tables
 */
export const ireleaseDB = db;
class DexieEventEmitter {
    constructor() {
        this.listeners = new Map();
    }
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            [...callbacks].forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }
}
export const dexieEvents = new DexieEventEmitter();
// ============================================
// URL CONFIGURATION
// ============================================
const APPSCRIPT_BASE_URL = "https://script.google.com/macros/s/AKfycbyX2Hcoqhe-qZsgA6OsE0JzlnbSR1KdsH3JcKPqpAGI2c6EHtIWoqFEG8xkswdOcWBU/exec";
const API_ENDPOINTS = {
    RELEASES: `${APPSCRIPT_BASE_URL}/api/releases`,
    SIRS_RELEASES: `${APPSCRIPT_BASE_URL}/api/sirs-releases`,
    SYSTEMS: `${APPSCRIPT_BASE_URL}/api/systems`
};
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Generates a unique callback name for JSONP requests
 * Uses random alphanumeric string to avoid collisions
 *
 * @returns {string} Unique callback function name
 */
function generateCallbackName() {
    const random = Math.random().toString(36).substring(2, 7);
    return `jsonp_callback_${random}`;
}
/**
 * Fetches data using JSONP for cross-origin requests
 * Creates a script tag with callback parameter for Google Apps Script APIs
 *
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} Promise resolving to the API response data
 * @throws {Error} If JSONP request fails
 */
async function fetchWithJSONP(url) {
    return new Promise((resolve, reject) => {
        const callbackName = generateCallbackName();
        const script = document.createElement('script');
        window[callbackName] = (data) => {
            document.body.removeChild(script);
            delete window[callbackName];
            console.log(`📥 JSONP response received from ${url}`);
            resolve(data);
        };
        script.onerror = () => {
            document.body.removeChild(script);
            delete window[callbackName];
            reject(new Error(`JSONP request failed for ${url}`));
        };
        const timestamp = new Date().getTime();
        script.src = `${url}?callback=${callbackName}&_=${timestamp}`;
        document.body.appendChild(script);
    });
}
/**
 * Attempts direct fetch first, falls back to JSONP if CORS fails
 * Adds timestamp parameter to prevent browser caching
 *
 * @param {string} url - The API endpoint URL
 * @returns {Promise<any>} Promise resolving to the API response data
 */
async function fetchDirect(url) {
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
    }
    catch (error) {
        console.log(`Direct fetch failed for ${url}, falling back to JSONP...`);
        return await fetchWithJSONP(url);
    }
}
// ============================================
// RELEASES FUNCTIONS
// ============================================
/**
 * Checks if the releases table is empty
 *
 * @returns {Promise<boolean>} True if table is empty, false otherwise
 */
export async function isReleasesEmpty() {
    const count = await ireleaseDB.releases.count();
    return count === 0;
}
/**
 * Fetches the releases data from AppScript using JSONP
 *
 * @returns {Promise<any>} Promise resolving to the API response data
 */
export async function fetchFromAppScript() {
    return fetchWithJSONP(API_ENDPOINTS.RELEASES);
}
/**
 * Directly fetches the releases data from AppScript using the fetch API
 * This function will not fall back to JSONP if CORS fails
 *
 * @returns {Promise<any>} Promise resolving to the API response data
 */
export async function fetchFromAppScriptDirect() {
    return fetchDirect(API_ENDPOINTS.RELEASES);
}
/**
 * Seeds the releases table with data from AppScript
 * Handles adds, updates, AND deletes while preserving IDs
 *
 * @returns {Promise<{success: boolean; count: number}>} Promise resolving to
 *   an object with success flag and count of total records in the database
 */
export async function seedFromAppScript() {
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
        }
        else if (Array.isArray(response)) {
            releasesArray = response;
            console.log(`✅ Using response as array (${releasesArray.length} items)`);
        }
        else if (response && Array.isArray(response.releases)) {
            releasesArray = response.releases;
            console.log(`✅ Using releases array (${releasesArray.length} items)`);
        }
        else {
            console.error('❌ Invalid data structure from Releases API:', response);
            return { success: false, count: 0 };
        }
        const now = Date.now();
        const releasesToStore = releasesArray.map((release) => ({
            ...release,
            lastSynced: now
        }));
        console.log(`📊 Processing ${releasesToStore.length} releases from API`);
        // Get existing records BEFORE any changes
        const existingReleases = await ireleaseDB.releases.toArray();
        const existingCount = existingReleases.length;
        if (existingCount === 0) {
            // Initial fetch - use bulkAdd for auto-increment IDs
            console.log('🆕 Initial fetch - adding new records with auto-increment IDs');
            await ireleaseDB.releases.bulkAdd(releasesToStore);
            console.log('💾 Added new releases to Dexie');
        }
        else {
            // Refresh - handle adds, updates, AND deletes
            console.log('🔄 Refresh - syncing with source (add/update/delete)');
            // Create maps for efficient lookups
            const existingIdMap = new Map(); // Release_id -> Dexie id
            const existingReleaseIds = new Set(); // All existing Release_ids
            existingReleases.forEach(record => {
                if (record.Release_id) {
                    existingIdMap.set(record.Release_id, record.id);
                    existingReleaseIds.add(record.Release_id);
                }
            });
            // Create Set of Release_ids from API response
            const apiReleaseIds = new Set(releasesToStore.map((r) => r.Release_id));
            // Identify records to DELETE (exist in Dexie but not in API)
            const recordsToDelete = existingReleases
                .filter(record => !apiReleaseIds.has(record.Release_id))
                .map(record => record.id)
                .filter(id => id !== undefined);
            console.log(`🗑️  Found ${recordsToDelete.length} records to delete (removed from source)`);
            // Identify records to UPDATE/ADD
            const recordsToUpsert = releasesToStore.map((release) => {
                const existingId = existingIdMap.get(release.Release_id);
                return existingId ? { ...release, id: existingId } : release;
            });
            const updateCount = recordsToUpsert.filter((r) => r.id).length;
            const addCount = recordsToUpsert.length - updateCount;
            console.log(`📝 Processing ${recordsToUpsert.length} records to upsert (${updateCount} updates, ${addCount} new)`);
            // Perform deletions first (if any)
            if (recordsToDelete.length > 0) {
                await ireleaseDB.releases.bulkDelete(recordsToDelete);
                console.log(`✅ Deleted ${recordsToDelete.length} records`);
            }
            // Then perform upserts (updates + adds)
            await ireleaseDB.releases.bulkPut(recordsToUpsert);
            console.log('💾 Upserted records in Dexie');
        }
        const finalCount = await ireleaseDB.releases.count();
        console.log(`✅ Sync complete. Total records in database: ${finalCount}`);
        dexieEvents.emit('data-updated', { type: 'releases', count: finalCount });
        if (finalCount > 0) {
            const samples = await ireleaseDB.releases.limit(3).toArray();
            console.log('📝 Sample releases stored:');
            samples.forEach((sample, index) => {
                console.log(`  ${index + 1}. ID:${sample.id} ${sample.Release_id} - ${sample.System_name} - ${sample.Test_status}`);
            });
        }
        return {
            success: true,
            count: finalCount
        };
    }
    catch (error) {
        console.error('❌ Failed to fetch releases from AppScript:', error);
        return {
            success: false,
            count: 0
        };
    }
}
/**
 * Initializes the Releases database by checking if it's empty.
 * If it is, fetches the data from AppScript and seeds the database.
 * If not, logs the current count and sample record (if any).
 * @returns A promise resolving to an object with a seeded flag and count of total records in the database.
 */
export async function initializeReleasesDatabase() {
    console.log('🔄 Initializing releases database...');
    const empty = await isReleasesEmpty();
    if (empty) {
        console.log('Releases table is empty, fetching from AppScript...');
        const result = await seedFromAppScript();
        return {
            seeded: result.success,
            count: result.count
        };
    }
    else {
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
/**
 * Syncs the releases data from AppScript.
 * Emits 'sync-started' and 'sync-completed' events.
 * @returns A promise resolving to an object with a success flag and count of total records in the database.
 */
export async function syncFromAppScript() {
    console.log('🔄 Syncing releases data from AppScript...');
    dexieEvents.emit('sync-started', { type: 'releases' });
    const result = await seedFromAppScript();
    dexieEvents.emit('sync-completed', { type: 'releases', ...result });
    return result;
}
export async function getAllReleases() {
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
 * Retrieves a release record by its ID.
 * @param {string} releaseId - The ID of the release record.
 * @returns {Promise<ReleaseRecord | undefined>} - A promise resolving to the release record if found, or undefined if not found.
 */
export async function getReleaseById(releaseId) {
    return await ireleaseDB.releases
        .where('Release_id')
        .equals(releaseId)
        .first();
}
/**
 * Retrieves all release records with a given test status.
 * @param {string} status - The test status to filter by.
 * @returns {Promise<ReleaseRecord[]>} - A promise resolving to an array of release records with the given test status.
 */
export async function getReleasesByStatus(status) {
    const releases = await ireleaseDB.releases
        .where('Test_status')
        .equals(status)
        .toArray();
    console.log(`📋 getReleasesByStatus("${status}"): Found ${releases.length} releases`);
    return releases;
}
/**
 * Retrieves the total count of release records in the database.
 * @returns {Promise<number>} - A promise resolving to the total count of release records.
 */
export async function getTotalCount() {
    const count = await ireleaseDB.releases.count();
    console.log(`📊 getTotalCount: ${count} releases`);
    return count;
}
/**
 * Retrieves dashboard statistics, including the total count of releases, as well as the counts of releases in testing, passed, and failed.
 * @returns {Promise<{ total: number, inTesting: number, passed: number, failed: number}>} - A promise resolving to an object containing the dashboard statistics.
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
 * Tests the connection to the Releases AppScript API.
 * @returns {Promise<{success: boolean; data: any}>} - A promise resolving to an object containing the success flag and the response data from the API.
 */
export async function testAppScriptConnection() {
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
        }
        else {
            console.warn('⚠️ Releases API returned without success flag:', response);
            return { success: false, data: response };
        }
    }
    catch (error) {
        console.error('❌ Releases API test failed:', error);
        return { success: false, data: null };
    }
}
// ============================================
// SIRS-RELEASES FUNCTIONS 
// ============================================
/**
 * Checks if the SIRs-Releases table in the database is empty.
 * @returns A promise resolving to a boolean indicating whether the table is empty.
 */
export async function isSirsReleasesEmpty() {
    const count = await ireleaseDB.sirsReleases.count();
    return count === 0;
}
/**
 * Fetches the SIRs-Releases data from the AppScript API using JSONP.
 * @returns A promise resolving to the parsed JSON response.
 */
export async function fetchSirsReleasesFromAppScript() {
    return fetchWithJSONP(API_ENDPOINTS.SIRS_RELEASES);
}
/**
 * Fetches the SIRs-Releases data from the AppScript API using the JSONP endpoint but without JSONP.
 * @returns A promise resolving to the parsed JSON response.
 */
export async function fetchSirsReleasesFromAppScriptDirect() {
    return fetchDirect(API_ENDPOINTS.SIRS_RELEASES);
}
/**
 * Seeds the SIRs-Releases table in the database from the AppScript API.
 * Uses the JSONP endpoint to fetch the data.
 * Handles adds, updates, AND deletes.
 * @returns A promise resolving to an object containing the success flag and count of total records in the database.
 */
export async function seedSirsReleasesFromAppScript() {
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
        // sirs_releases response from API
        if (response && response.success && Array.isArray(response.sirs_releases)) {
            sirsReleasesArray = response.sirs_releases;
            console.log(`✅ Using sirs_releases array from response (${sirsReleasesArray.length} items)`);
        }
        else if (Array.isArray(response)) {
            sirsReleasesArray = response;
            console.log(`✅ Using response as array (${sirsReleasesArray.length} items)`);
        }
        else if (response && Array.isArray(response.sirs_releases)) {
            sirsReleasesArray = response.sirs_releases;
            console.log(`✅ Using sirs_releases array (${sirsReleasesArray.length} items)`);
        }
        else {
            console.error('❌ Invalid data structure from SIRs-Releases API:', response);
            return { success: false, count: 0 };
        }
        console.log(`📊 Processing ${sirsReleasesArray.length} SIRs-Releases from API response`);
        const now = Date.now();
        const sirsReleasesToStore = sirsReleasesArray.map((sirsRelease) => ({
            ...sirsRelease,
            lastSynced: now
        }));
        console.log(`📊 Prepared ${sirsReleasesToStore.length} SIRs-Releases for storage`);
        // Get existing records BEFORE any changes
        const existingSirsReleases = await ireleaseDB.sirsReleases.toArray();
        const existingCount = existingSirsReleases.length;
        if (existingCount === 0) {
            // Initial fetch - use bulkAdd for auto-increment IDs
            console.log('🆕 Initial fetch - adding new records with auto-increment IDs');
            await ireleaseDB.sirsReleases.bulkAdd(sirsReleasesToStore);
            console.log('💾 Added new SIRs-Releases to Dexie');
        }
        else {
            // Refresh - handle adds, updates, AND deletes
            console.log('🔄 Refresh - syncing with source (add/update/delete)');
            // Create maps for efficient lookups
            const existingIdMap = new Map(); // Sir_Rel_Id -> Dexie id
            const existingSirRelIds = new Set(); // All existing Sir_Rel_Ids
            existingSirsReleases.forEach(record => {
                if (record.Sir_Rel_Id) {
                    existingIdMap.set(record.Sir_Rel_Id, record.id);
                    existingSirRelIds.add(record.Sir_Rel_Id);
                }
            });
            // Create Set of Sir_Rel_Ids from API response
            const apiSirRelIds = new Set(sirsReleasesToStore.map((r) => r.Sir_Rel_Id));
            // Identify records to DELETE (exist in Dexie but not in API)
            const recordsToDelete = existingSirsReleases
                .filter(record => !apiSirRelIds.has(record.Sir_Rel_Id))
                .map(record => record.id)
                .filter(id => id !== undefined);
            console.log(`🗑️  Found ${recordsToDelete.length} records to delete (removed from source)`);
            // Identify records to UPDATE/ADD
            const recordsToUpsert = sirsReleasesToStore.map((sirsRelease) => {
                const existingId = existingIdMap.get(sirsRelease.Sir_Rel_Id);
                return existingId ? { ...sirsRelease, id: existingId } : sirsRelease;
            });
            const updateCount = recordsToUpsert.filter((r) => r.id).length;
            const addCount = recordsToUpsert.length - updateCount;
            console.log(`📝 Processing ${recordsToUpsert.length} records to upsert (${updateCount} updates, ${addCount} new)`);
            // Perform deletions first (if any)
            if (recordsToDelete.length > 0) {
                await ireleaseDB.sirsReleases.bulkDelete(recordsToDelete);
                console.log(`✅ Deleted ${recordsToDelete.length} records`);
            }
            // Then perform upserts (updates + adds)
            await ireleaseDB.sirsReleases.bulkPut(recordsToUpsert);
            console.log('💾 Upserted records in Dexie');
        }
        const finalCount = await ireleaseDB.sirsReleases.count();
        console.log(`✅ Sync complete. Total records in database: ${finalCount}`);
        dexieEvents.emit('data-updated', { type: 'sirs-releases', count: finalCount });
        if (finalCount > 0) {
            const samples = await ireleaseDB.sirsReleases.limit(3).toArray();
            console.log('📝 Sample SIRs-Releases stored:');
            samples.forEach((sample, index) => {
                console.log(`  ${index + 1}. ID:${sample.id} ${sample.Sir_Rel_Id} - ${sample.Short_desc} - ${sample.Bug_status}`);
            });
        }
        return {
            success: true,
            count: finalCount
        };
    }
    catch (error) {
        console.error('❌ Failed to fetch SIRs-Releases from AppScript:', error);
        return {
            success: false,
            count: 0
        };
    }
}
/**
 * Initializes the SIRs-Releases database table by checking if it's empty.
 * If it is, fetches data from AppScript and seeds the database table.
 * If not, logs the existing record count and returns the count.
 * @returns {Promise<{seeded: boolean; count: number}>}
 *   Resolves with an object containing two properties: seeded and count.
 *   seeded is a boolean indicating whether the database was seeded.
 *   count is the number of records in the SIRs-Releases table.
 */
export async function initializeSirsReleasesDatabase() {
    console.log('🔄 Initializing SIRs-Releases database...');
    const empty = await isSirsReleasesEmpty();
    if (empty) {
        console.log('SIRs-Releases table is empty, fetching from AppScript...');
        const result = await seedSirsReleasesFromAppScript();
        return {
            seeded: result.success,
            count: result.count
        };
    }
    else {
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
/**
 * Syncs SIRs-Releases data from AppScript.
 * Emits `sync-started` and `sync-completed` events with type `sirs-releases`.
 * Resolves with an object containing two properties: success and count.
 * success is a boolean indicating whether the sync was successful.
 * count is the number of records in the SIRs-Releases table.
 * @returns {Promise<{success: boolean; count: number}>}
 */
export async function syncSirsReleasesFromAppScript() {
    console.log('🔄 Syncing SIRs-Releases data from AppScript...');
    dexieEvents.emit('sync-started', { type: 'sirs-releases' });
    const result = await seedSirsReleasesFromAppScript();
    dexieEvents.emit('sync-completed', { type: 'sirs-releases', ...result });
    return result;
}
/**
 * Retrieves all SIRs-Releases from the database.
 * @returns {Promise<SirsReleaseRecord[]>} A promise that resolves with an array of SIRs-Release records.
 */
export async function getAllSirsReleases() {
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
/**
 * Retrieves a SIRs-Release record from the database by its Sir_Rel_Id.
 * @param {string} sirRelId - The Sir_Rel_Id of the SIRs-Release to retrieve.
 * @returns {Promise<SirsReleaseRecord | undefined>} A promise that resolves with the SIRs-Release record if found, or undefined if not found.
 */
export async function getSirsReleaseById(sirRelId) {
    return await ireleaseDB.sirsReleases
        .where('Sir_Rel_Id')
        .equals(sirRelId)
        .first();
}
/**
 * Tests the SIRs-Releases AppScript connection by fetching data from the API and validating the response.
 * @returns {Promise<{success: boolean; data: any}>} A promise that resolves with an object containing a success flag and the response data.
 */
export async function testSirsReleasesAppScriptConnection() {
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
        }
        else {
            console.warn('⚠️ SIRs-Releases API returned without success flag:', response);
            return { success: false, data: response };
        }
    }
    catch (error) {
        console.error('❌ SIRs-Releases API test failed:', error);
        return { success: false, data: null };
    }
}
/**
 * Retrieves an array of SIRs-Release records filtered by the given Release_version.
 * @param {string} releaseVersion - The Release_version to filter by.
 * @returns {Promise<SirsReleaseRecord[]>} A promise that resolves with an array of SIRs-Release records.
 */
export async function getSirsReleasesByReleaseVersion(releaseVersion) {
    const sirsReleases = await ireleaseDB.sirsReleases
        .where('Release_version')
        .equals(releaseVersion)
        .toArray();
    console.log(`📋 getSirsReleasesByReleaseVersion("${releaseVersion}"): Found ${sirsReleases.length} SIRs-Releases`);
    return sirsReleases;
}
// ============================================
// SYSTEMS FUNCTIONS 
// ============================================
/**
 * Checks if the Systems table is empty.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the table is empty.
 */
export async function isSystemsEmpty() {
    const count = await ireleaseDB.systems.count();
    return count === 0;
}
/**
 * Retrieves an array of System records from the AppScript API.
 * @returns {Promise<any>} A promise that resolves with an array of System records.
 */
export async function fetchSystemsFromAppScript() {
    return fetchWithJSONP(API_ENDPOINTS.SYSTEMS);
}
/**
 * Retrieves an array of System records from the AppScript API using the direct fetch method.
 * This method bypasses the JSONP fallback and will throw an error if the request fails.
 * @returns {Promise<any>} A promise that resolves with an array of System records.
 */
export async function fetchSystemsFromAppScriptDirect() {
    return fetchDirect(API_ENDPOINTS.SYSTEMS);
}
/**
 * Seeds the Systems table with data from the AppScript API.
 * This function fetches data from the API, processes it, and then stores it in the Dexie database.
 * If the table is empty, it will use bulkAdd to add records with auto-increment IDs.
 * If the table is not empty, it will sync records by identifying records to DELETE (exist in Dexie but not in API) and records to UPDATE/ADD (exist in API but not in Dexie or have changed).
 * @returns {Promise<{success: boolean; count: number}>} A promise that resolves with an object containing a boolean indicating whether the sync was successful and the total number of records in the database.
 */
export async function seedSystemsFromAppScript() {
    try {
        console.log('📥 Fetching Systems from AppScript...');
        const response = await fetchSystemsFromAppScriptDirect();
        console.log('📦 Systems API response structure:', {
            hasSuccess: 'success' in response,
            successValue: response.success,
            hasSystems: 'systems' in response,
            systemsCount: response.systems?.length || 0,
            hasCount: 'count' in response,
            countValue: response.count
        });
        let systemsArray = [];
        // systems response from API
        if (response && response.success && Array.isArray(response.systems)) {
            systemsArray = response.systems;
            console.log(`✅ Using systems array from response (${systemsArray.length} items)`);
        }
        else if (Array.isArray(response)) {
            systemsArray = response;
            console.log(`✅ Using response as array (${systemsArray.length} items)`);
        }
        else if (response && Array.isArray(response.systems)) {
            systemsArray = response.systems;
            console.log(`✅ Using systems array (${systemsArray.length} items)`);
        }
        else {
            console.error('❌ Invalid data structure from Systems API:', response);
            return { success: false, count: 0 };
        }
        console.log(`📊 Processing ${systemsArray.length} Systems from API response`);
        const now = Date.now();
        const systemsToStore = systemsArray.map((system) => ({
            ...system,
            lastSynced: now
        }));
        console.log(`📊 Prepared ${systemsToStore.length} Systems for storage`);
        // Get existing records BEFORE any changes
        const existingSystems = await ireleaseDB.systems.toArray();
        const existingCount = existingSystems.length;
        if (existingCount === 0) {
            // Initial fetch - use bulkAdd for auto-increment IDs
            console.log('🆕 Initial fetch - adding new records with auto-increment IDs');
            await ireleaseDB.systems.bulkAdd(systemsToStore);
            console.log('💾 Added new Systems to Dexie');
        }
        else {
            // Refresh - handle adds, updates, AND deletes
            console.log('🔄 Refresh - syncing with source (add/update/delete)');
            // Create maps for efficient lookups
            const existingIdMap = new Map(); // System_id -> Dexie id
            const existingSystemIds = new Set(); // All existing System_ids
            existingSystems.forEach(record => {
                if (record.System_id) {
                    existingIdMap.set(record.System_id, record.id);
                    existingSystemIds.add(record.System_id);
                }
            });
            // Create Set of System_ids from API response
            const apiSystemIds = new Set(systemsToStore.map((r) => r.System_id));
            // Identify records to DELETE (exist in Dexie but not in API)
            const recordsToDelete = existingSystems
                .filter(record => !apiSystemIds.has(record.System_id))
                .map(record => record.id)
                .filter(id => id !== undefined);
            console.log(`🗑️  Found ${recordsToDelete.length} records to delete (removed from source)`);
            // Identify records to UPDATE/ADD
            const recordsToUpsert = systemsToStore.map((system) => {
                const existingId = existingIdMap.get(system.System_id);
                return existingId ? { ...system, id: existingId } : system;
            });
            const updateCount = recordsToUpsert.filter((r) => r.id).length;
            const addCount = recordsToUpsert.length - updateCount;
            console.log(`📝 Processing ${recordsToUpsert.length} records to upsert (${updateCount} updates, ${addCount} new)`);
            // Perform deletions first (if any)
            if (recordsToDelete.length > 0) {
                await ireleaseDB.systems.bulkDelete(recordsToDelete);
                console.log(`✅ Deleted ${recordsToDelete.length} records`);
            }
            // Then perform upserts (updates + adds)
            await ireleaseDB.systems.bulkPut(recordsToUpsert);
            console.log('💾 Upserted records in Dexie');
        }
        const finalCount = await ireleaseDB.systems.count();
        console.log(`✅ Sync complete. Total records in database: ${finalCount}`);
        dexieEvents.emit('data-updated', { type: 'systems', count: finalCount });
        if (finalCount > 0) {
            const samples = await ireleaseDB.systems.limit(3).toArray();
            console.log('📝 Sample Systems stored:');
            samples.forEach((sample, index) => {
                console.log(`  ${index + 1}. ID:${sample.id} ${sample.System_id} - ${sample.System_name} - ${sample.Status}`);
            });
        }
        return {
            success: true,
            count: finalCount
        };
    }
    catch (error) {
        console.error('❌ Failed to fetch Systems from AppScript:', error);
        return {
            success: false,
            count: 0
        };
    }
}
/**
 * Initializes the Systems database table by checking if it's empty.
 * If it's empty, fetches Systems data from AppScript and seeds the database.
 * If it's not empty, returns the current record count and a sample record.
 * @returns {Promise<{seeded: boolean; count: number}>}
 */
export async function initializeSystemsDatabase() {
    console.log('🔄 Initializing Systems database...');
    const empty = await isSystemsEmpty();
    if (empty) {
        console.log('Systems table is empty, fetching from AppScript...');
        const result = await seedSystemsFromAppScript();
        return {
            seeded: result.success,
            count: result.count
        };
    }
    else {
        const count = await ireleaseDB.systems.count();
        console.log(`✅ Systems table has ${count} records`);
        if (count > 0) {
            const sample = await ireleaseDB.systems.limit(1).toArray();
            console.log('📊 Sample System record:', {
                id: sample[0].id,
                System_id: sample[0].System_id,
                System_name: sample[0].System_name,
                Status: sample[0].Status
            });
        }
        return {
            seeded: false,
            count
        };
    }
}
/**
 * Syncs the Systems database table by fetching Systems data from AppScript.
 * If the Systems table is empty, it will seed the database with the fetched data.
 * If the Systems table is not empty, it will refresh the data by deleting all existing records and re-seeding the database with the fetched data.
 * @returns {Promise<{success: boolean; count: number}>} A promise that resolves with an object containing a boolean success flag and a count of the number of records seeded or refreshed.
 */
export async function syncSystemsFromAppScript() {
    console.log('🔄 Syncing Systems data from AppScript...');
    dexieEvents.emit('sync-started', { type: 'systems' });
    const result = await seedSystemsFromAppScript();
    dexieEvents.emit('sync-completed', { type: 'systems', ...result });
    return result;
}
/**
 * Retrieves all system records from the Systems table in the Dexie database.
 * @returns {Promise<SystemRecord[]>} A promise that resolves with an array of system records.
 */
export async function getAllSystems() {
    const systems = await ireleaseDB.systems.toArray();
    console.log(`📋 getAllSystems: Returning ${systems.length} systems`);
    if (systems.length > 0) {
        console.log('📝 First system:', {
            System_id: systems[0].System_id,
            System_name: systems[0].System_name,
            Status: systems[0].Status
        });
    }
    return systems;
}
/**
 * Retrieves a system record from the Systems table in the Dexie database by its System_id.
 * @param {string} systemId - The System_id of the system record to retrieve.
 * @returns {Promise<SystemRecord | undefined>} A promise that resolves with the system record matching the given System_id, or undefined if no such record exists.
 */
export async function getSystemById(systemId) {
    return await ireleaseDB.systems
        .where('System_id')
        .equals(systemId)
        .first();
}
/**
 * Retrieves a system record from the Systems table in the Dexie database by its System_name.
 * @param {string} systemName - The System_name of the system record to retrieve.
 * @returns {Promise<SystemRecord | undefined>} A promise that resolves with the system record matching the given System_name, or undefined if no such record exists.
 */
export async function getSystemByName(systemName) {
    return await ireleaseDB.systems
        .where('System_name')
        .equals(systemName)
        .first();
}
/**
 * Retrieves an array of system records from the Systems table in the Dexie database
 * that match the given status.
 * @param {string} status - The status of the system records to retrieve.
 * @returns {Promise<SystemRecord[]>} A promise that resolves with an array of system records
 * matching the given status.
 */
export async function getSystemsByStatus(status) {
    const systems = await ireleaseDB.systems
        .where('Status')
        .equals(status)
        .toArray();
    console.log(`📋 getSystemsByStatus("${status}"): Found ${systems.length} systems`);
    return systems;
}
/**
 * Retrieves an array of system records from the Systems table in the Dexie database
 * that match the given System_category.
 * @param {string} category - The System_category of the system records to retrieve.
 * @returns {Promise<SystemRecord[]>} A promise that resolves with an array of system records
 * matching the given System_category.
 */
export async function getSystemsByCategory(category) {
    const systems = await ireleaseDB.systems
        .where('System_category')
        .equals(category)
        .toArray();
    console.log(`📋 getSystemsByCategory("${category}"): Found ${systems.length} systems`);
    return systems;
}
/**
 * Retrieves the total count of system records in the Systems table in the Dexie database.
 * @returns {Promise<number>} A promise that resolves with the total count of system records.
 */
export async function getSystemsTotalCount() {
    const count = await ireleaseDB.systems.count();
    console.log(`📊 getSystemsTotalCount: ${count} systems`);
    return count;
}
/**
 * Tests the connection to the Systems AppScript API.
 * @returns {Promise<{success: boolean; data: any}>} - A promise resolving to an object containing the success flag and the response data from the API.
 */
export async function testSystemsAppScriptConnection() {
    try {
        console.log('🧪 Testing Systems AppScript connection...');
        const response = await fetchSystemsFromAppScriptDirect();
        console.log('📦 Systems API response:', response);
        if (response && response.success) {
            console.log(`✅ Systems API success: ${response.success}, count: ${response.count}`);
            console.log(`📊 Systems array length: ${response.systems?.length || 0}`);
            if (response.systems && response.systems.length > 0) {
                console.log('📝 First System sample:', {
                    System_id: response.systems[0].System_id,
                    System_name: response.systems[0].System_name,
                    Status: response.systems[0].Status
                });
            }
            return { success: true, data: response };
        }
        else {
            console.warn('⚠️ Systems API returned without success flag:', response);
            return { success: false, data: response };
        }
    }
    catch (error) {
        console.error('❌ Systems API test failed:', error);
        return { success: false, data: null };
    }
}
// ==============================================
// FUNCTIONS TO FETCH DATA FOR ALL DEXIE TABLES
// ==============================================
/**
 * Checks if the Dexie database is empty by verifying that all tables have no records.
 * @returns {Promise<boolean>} A promise that resolves to true if the database is empty, and false otherwise.
 */
export async function isDexieEmpty() {
    const [releasesCount, sirsReleasesCount, systemsCount] = await Promise.all([
        ireleaseDB.releases.count(),
        ireleaseDB.sirsReleases.count(),
        ireleaseDB.systems.count()
    ]);
    return releasesCount === 0 && sirsReleasesCount === 0 && systemsCount === 0;
}
/**
 * Clears all data from the Dexie database by deleting all records from the releases, sirsReleases, and systems tables.
 * Emits a 'data-updated' event with type 'clear-all' after clearing all data.
 */
export async function clearAllData() {
    console.log('🗑️ Clearing all data...');
    await Promise.all([
        ireleaseDB.releases.clear(),
        ireleaseDB.sirsReleases.clear(),
        ireleaseDB.systems.clear()
    ]);
    dexieEvents.emit('data-updated', { type: 'clear-all' });
}
/*export async function clearSirsReleasesData(): Promise<void> {
  console.log('🗑️ Clearing all SIRs-Releases data...');
  await ireleaseDB.sirsReleases.clear();
  dexieEvents.emit('data-updated', { type: 'clear-sirs-releases' });
}*/
/**
 * Clears all Systems data from the Dexie database by deleting all records from the systems table.
 * Emits a 'data-updated' event with type 'clear-systems' after clearing all Systems data.
 */
export async function clearSystemsData() {
    console.log('🗑️ Clearing all Systems data...');
    await ireleaseDB.systems.clear();
    dexieEvents.emit('data-updated', { type: 'clear-systems' });
}
/**
 * Initializes all three databases tables (releases, sirsReleases, and systems) by checking if they are empty.
 * If a database is empty, fetches data from AppScript and seeds the database.
 * If not, logs the existing record count and returns the count.
 * @returns {Promise<{releases: {seeded: boolean; count: number}; sirsReleases: {seeded: boolean; count: number}; systems: {seeded: boolean; count: number}; success: boolean}>}
 *   Resolves with an object containing four properties: releases, sirsReleases, systems, and success.
 *   releases, sirsReleases, and systems are objects containing two properties each: seeded and count.
 *   seeded is a boolean indicating whether the database was seeded.
 *   count is the number of records in the database.
 *   success is a boolean indicating whether all databases were successfully initialized.
 */
export async function initializeAllDatabases() {
    console.log('🚀 Initializing ALL databases (checking both tables)...');
    try {
        const [releasesResult, sirsReleasesResult, systemsResult] = await Promise.all([
            initializeReleasesDatabase(),
            initializeSirsReleasesDatabase(),
            initializeSystemsDatabase()
        ]);
        console.log('✅ ALL databases initialized:');
        console.log(`   - Releases: ${releasesResult.count} records (${releasesResult.seeded ? 'seeded from API' : 'loaded from cache'})`);
        console.log(`   - SIRs-Releases: ${sirsReleasesResult.count} records (${sirsReleasesResult.seeded ? 'seeded from API' : 'loaded from cache'})`);
        console.log(`   - Systems: ${systemsResult.count} records (${systemsResult.seeded ? 'seeded from API' : 'loaded from cache'})`);
        return {
            releases: releasesResult,
            sirsReleases: sirsReleasesResult,
            systems: systemsResult,
            success: true
        };
    }
    catch (error) {
        console.error('❌ Failed to initialize application:', error);
        return {
            releases: { seeded: false, count: 0 },
            sirsReleases: { seeded: false, count: 0 },
            systems: { seeded: false, count: 0 },
            success: false
        };
    }
}
/**
 * Syncs ALL data from AppScript APIs.
 * Syncs Releases, SIRs-Releases, and Systems database tables from AppScript APIs.
 * @returns A promise that resolves with an object containing three properties: releases, sirsReleases, and systems.
 *   Each of these properties is an object with two properties: success and count.
 *   success is a boolean indicating whether the database table was successfully synced.
 *   count is a number indicating the number of records in the database.
 *   The success property of the returned object is a boolean indicating whether all database tables were successfully synced.
 */
export async function syncAllFromAppScript() {
    console.log('🚀 Syncing ALL data from AppScript APIs...');
    dexieEvents.emit('sync-started', { type: 'all' });
    try {
        const [releasesResult, sirsReleasesResult, systemsResult] = await Promise.all([
            syncFromAppScript(),
            syncSirsReleasesFromAppScript(),
            syncSystemsFromAppScript()
        ]);
        console.log('✅ ALL data synced from APIs:');
        console.log(`   - Releases: ${releasesResult.count} records`);
        console.log(`   - SIRs-Releases: ${sirsReleasesResult.count} records`);
        console.log(`   - Systems: ${systemsResult.count} records`);
        dexieEvents.emit('sync-completed', {
            type: 'all',
            releases: releasesResult,
            sirsReleases: sirsReleasesResult,
            systems: systemsResult
        });
        return {
            releases: releasesResult,
            sirsReleases: sirsReleasesResult,
            systems: systemsResult,
            success: releasesResult.success && sirsReleasesResult.success && systemsResult.success
        };
    }
    catch (error) {
        console.error('❌ Failed to sync all data:', error);
        dexieEvents.emit('sync-failed', { type: 'all', error });
        return {
            releases: { success: false, count: 0 },
            sirsReleases: { success: false, count: 0 },
            systems: { success: false, count: 0 },
            success: false
        };
    }
}
/**
 * Retrieves all data from the Dexie database.
 * Retrieves all Releases, SIRs-Releases, and Systems records from the database and returns them as an object.
 * @returns A promise that resolves with an object containing three properties: releases, sirsReleases, and systems.
 *   Each of these properties is an array of objects containing the data from the respective database table.
 */
export async function getAllData() {
    console.log('📋 Getting ALL data from Dexie...');
    const [releases, sirsReleases, systems] = await Promise.all([
        getAllReleases(),
        getAllSirsReleases(),
        getAllSystems()
    ]);
    console.log(`📊 Total data: ${releases.length} releases, ${sirsReleases.length} SIRs-Releases, ${systems.length} systems`);
    return {
        releases,
        sirsReleases,
        systems
    };
}
/**
 * Tests all AppScript API connections by fetching data from each API and validating the response.
 * @returns A promise that resolves with an object containing three properties: releases, sirsReleases, and systems.
 *   Each of these properties is an object with two properties: success and data.
 *   success is a boolean indicating whether the API connection was successful.
 *   data is the response data from the API, or null if the connection failed.
 */
export async function testAllApiConnections() {
    console.log('🔌 Testing ALL API connections...');
    const [releasesTest, sirsReleasesTest, systemsTest] = await Promise.all([
        testAppScriptConnection(),
        testSirsReleasesAppScriptConnection(),
        testSystemsAppScriptConnection()
    ]);
    console.log('📊 API Test Results:');
    console.log(`   - Releases API: ${releasesTest.success ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   - SIRs-Releases API: ${sirsReleasesTest.success ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   - Systems API: ${systemsTest.success ? '✅ Connected' : '❌ Failed'}`);
    return {
        releases: releasesTest,
        sirsReleases: sirsReleasesTest,
        systems: systemsTest
    };
}
