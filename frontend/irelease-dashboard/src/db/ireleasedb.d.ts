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
export interface SystemRecord {
    id?: number;
    System_id: string;
    System_name: string;
    Description: string;
    Status: string;
    System_category: string;
    lastSynced?: number;
}
/**
 * Main Dexie database instance for the iRelease application
 * Contains three tables: releases, sirsReleases, and systems
 * Version 3 includes the systems table addition
 */
export declare const db: Dexie;
/**
 * Typed database instance with proper TypeScript interfaces
 * Provides type-safe access to all three database tables
 */
export declare const ireleaseDB: Dexie & {
    releases: Dexie.Table<ReleaseRecord, number>;
    sirsReleases: Dexie.Table<SirsReleaseRecord, number>;
    systems: Dexie.Table<SystemRecord, number>;
};
type DexieEventType = 'data-updated' | 'sync-started' | 'sync-completed' | 'sync-failed';
declare class DexieEventEmitter {
    private listeners;
    on(event: DexieEventType, callback: Function): void;
    off(event: DexieEventType, callback: Function): void;
    emit(event: DexieEventType, data?: any): void;
}
export declare const dexieEvents: DexieEventEmitter;
/**
 * Checks if the releases table is empty
 *
 * @returns {Promise<boolean>} True if table is empty, false otherwise
 */
export declare function isReleasesEmpty(): Promise<boolean>;
/**
 * Fetches the releases data from AppScript using JSONP
 *
 * @returns {Promise<any>} Promise resolving to the API response data
 */
export declare function fetchFromAppScript(): Promise<any>;
/**
 * Directly fetches the releases data from AppScript using the fetch API
 * This function will not fall back to JSONP if CORS fails
 *
 * @returns {Promise<any>} Promise resolving to the API response data
 */
export declare function fetchFromAppScriptDirect(): Promise<any>;
/**
 * Seeds the releases table with data from AppScript
 * Handles adds, updates, AND deletes while preserving IDs
 *
 * @returns {Promise<{success: boolean; count: number}>} Promise resolving to
 *   an object with success flag and count of total records in the database
 */
export declare function seedFromAppScript(): Promise<{
    success: boolean;
    count: number;
}>;
/**
 * Initializes the Releases database by checking if it's empty.
 * If it is, fetches the data from AppScript and seeds the database.
 * If not, logs the current count and sample record (if any).
 * @returns A promise resolving to an object with a seeded flag and count of total records in the database.
 */
export declare function initializeReleasesDatabase(): Promise<{
    seeded: boolean;
    count: number;
}>;
/**
 * Syncs the releases data from AppScript.
 * Emits 'sync-started' and 'sync-completed' events.
 * @returns A promise resolving to an object with a success flag and count of total records in the database.
 */
export declare function syncFromAppScript(): Promise<{
    success: boolean;
    count: number;
}>;
export declare function getAllReleases(): Promise<ReleaseRecord[]>;
/**
 * Retrieves a release record by its ID.
 * @param {string} releaseId - The ID of the release record.
 * @returns {Promise<ReleaseRecord | undefined>} - A promise resolving to the release record if found, or undefined if not found.
 */
export declare function getReleaseById(releaseId: string): Promise<ReleaseRecord | undefined>;
/**
 * Retrieves all release records with a given test status.
 * @param {string} status - The test status to filter by.
 * @returns {Promise<ReleaseRecord[]>} - A promise resolving to an array of release records with the given test status.
 */
export declare function getReleasesByStatus(status: string): Promise<ReleaseRecord[]>;
/**
 * Retrieves the total count of release records in the database.
 * @returns {Promise<number>} - A promise resolving to the total count of release records.
 */
export declare function getTotalCount(): Promise<number>;
/**
 * Retrieves dashboard statistics, including the total count of releases, as well as the counts of releases in testing, passed, and failed.
 * @returns {Promise<{ total: number, inTesting: number, passed: number, failed: number}>} - A promise resolving to an object containing the dashboard statistics.
 */
export declare function getDashboardStats(): Promise<{
    total: number;
    inTesting: number;
    passed: number;
    failed: number;
}>;
/**
 * Tests the connection to the Releases AppScript API.
 * @returns {Promise<{success: boolean; data: any}>} - A promise resolving to an object containing the success flag and the response data from the API.
 */
export declare function testAppScriptConnection(): Promise<{
    success: boolean;
    data: any;
}>;
/**
 * Checks if the SIRs-Releases table in the database is empty.
 * @returns A promise resolving to a boolean indicating whether the table is empty.
 */
export declare function isSirsReleasesEmpty(): Promise<boolean>;
/**
 * Fetches the SIRs-Releases data from the AppScript API using JSONP.
 * @returns A promise resolving to the parsed JSON response.
 */
export declare function fetchSirsReleasesFromAppScript(): Promise<any>;
/**
 * Fetches the SIRs-Releases data from the AppScript API using the JSONP endpoint but without JSONP.
 * @returns A promise resolving to the parsed JSON response.
 */
export declare function fetchSirsReleasesFromAppScriptDirect(): Promise<any>;
/**
 * Seeds the SIRs-Releases table in the database from the AppScript API.
 * Uses the JSONP endpoint to fetch the data.
 * Handles adds, updates, AND deletes.
 * @returns A promise resolving to an object containing the success flag and count of total records in the database.
 */
export declare function seedSirsReleasesFromAppScript(): Promise<{
    success: boolean;
    count: number;
}>;
/**
 * Initializes the SIRs-Releases database table by checking if it's empty.
 * If it is, fetches data from AppScript and seeds the database table.
 * If not, logs the existing record count and returns the count.
 * @returns {Promise<{seeded: boolean; count: number}>}
 *   Resolves with an object containing two properties: seeded and count.
 *   seeded is a boolean indicating whether the database was seeded.
 *   count is the number of records in the SIRs-Releases table.
 */
export declare function initializeSirsReleasesDatabase(): Promise<{
    seeded: boolean;
    count: number;
}>;
/**
 * Syncs SIRs-Releases data from AppScript.
 * Emits `sync-started` and `sync-completed` events with type `sirs-releases`.
 * Resolves with an object containing two properties: success and count.
 * success is a boolean indicating whether the sync was successful.
 * count is the number of records in the SIRs-Releases table.
 * @returns {Promise<{success: boolean; count: number}>}
 */
export declare function syncSirsReleasesFromAppScript(): Promise<{
    success: boolean;
    count: number;
}>;
/**
 * Retrieves all SIRs-Releases from the database.
 * @returns {Promise<SirsReleaseRecord[]>} A promise that resolves with an array of SIRs-Release records.
 */
export declare function getAllSirsReleases(): Promise<SirsReleaseRecord[]>;
/**
 * Retrieves a SIRs-Release record from the database by its Sir_Rel_Id.
 * @param {string} sirRelId - The Sir_Rel_Id of the SIRs-Release to retrieve.
 * @returns {Promise<SirsReleaseRecord | undefined>} A promise that resolves with the SIRs-Release record if found, or undefined if not found.
 */
export declare function getSirsReleaseById(sirRelId: string): Promise<SirsReleaseRecord | undefined>;
/**
 * Tests the SIRs-Releases AppScript connection by fetching data from the API and validating the response.
 * @returns {Promise<{success: boolean; data: any}>} A promise that resolves with an object containing a success flag and the response data.
 */
export declare function testSirsReleasesAppScriptConnection(): Promise<{
    success: boolean;
    data: any;
}>;
/**
 * Retrieves an array of SIRs-Release records filtered by the given Release_version.
 * @param {string} releaseVersion - The Release_version to filter by.
 * @returns {Promise<SirsReleaseRecord[]>} A promise that resolves with an array of SIRs-Release records.
 */
export declare function getSirsReleasesByReleaseVersion(releaseVersion: string): Promise<SirsReleaseRecord[]>;
/**
 * Checks if the Systems table is empty.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the table is empty.
 */
export declare function isSystemsEmpty(): Promise<boolean>;
/**
 * Retrieves an array of System records from the AppScript API.
 * @returns {Promise<any>} A promise that resolves with an array of System records.
 */
export declare function fetchSystemsFromAppScript(): Promise<any>;
/**
 * Retrieves an array of System records from the AppScript API using the direct fetch method.
 * This method bypasses the JSONP fallback and will throw an error if the request fails.
 * @returns {Promise<any>} A promise that resolves with an array of System records.
 */
export declare function fetchSystemsFromAppScriptDirect(): Promise<any>;
/**
 * Seeds the Systems table with data from the AppScript API.
 * This function fetches data from the API, processes it, and then stores it in the Dexie database.
 * If the table is empty, it will use bulkAdd to add records with auto-increment IDs.
 * If the table is not empty, it will sync records by identifying records to DELETE (exist in Dexie but not in API) and records to UPDATE/ADD (exist in API but not in Dexie or have changed).
 * @returns {Promise<{success: boolean; count: number}>} A promise that resolves with an object containing a boolean indicating whether the sync was successful and the total number of records in the database.
 */
export declare function seedSystemsFromAppScript(): Promise<{
    success: boolean;
    count: number;
}>;
/**
 * Initializes the Systems database table by checking if it's empty.
 * If it's empty, fetches Systems data from AppScript and seeds the database.
 * If it's not empty, returns the current record count and a sample record.
 * @returns {Promise<{seeded: boolean; count: number}>}
 */
export declare function initializeSystemsDatabase(): Promise<{
    seeded: boolean;
    count: number;
}>;
/**
 * Syncs the Systems database table by fetching Systems data from AppScript.
 * If the Systems table is empty, it will seed the database with the fetched data.
 * If the Systems table is not empty, it will refresh the data by deleting all existing records and re-seeding the database with the fetched data.
 * @returns {Promise<{success: boolean; count: number}>} A promise that resolves with an object containing a boolean success flag and a count of the number of records seeded or refreshed.
 */
export declare function syncSystemsFromAppScript(): Promise<{
    success: boolean;
    count: number;
}>;
/**
 * Retrieves all system records from the Systems table in the Dexie database.
 * @returns {Promise<SystemRecord[]>} A promise that resolves with an array of system records.
 */
export declare function getAllSystems(): Promise<SystemRecord[]>;
/**
 * Retrieves a system record from the Systems table in the Dexie database by its System_id.
 * @param {string} systemId - The System_id of the system record to retrieve.
 * @returns {Promise<SystemRecord | undefined>} A promise that resolves with the system record matching the given System_id, or undefined if no such record exists.
 */
export declare function getSystemById(systemId: string): Promise<SystemRecord | undefined>;
/**
 * Retrieves a system record from the Systems table in the Dexie database by its System_name.
 * @param {string} systemName - The System_name of the system record to retrieve.
 * @returns {Promise<SystemRecord | undefined>} A promise that resolves with the system record matching the given System_name, or undefined if no such record exists.
 */
export declare function getSystemByName(systemName: string): Promise<SystemRecord | undefined>;
/**
 * Retrieves an array of system records from the Systems table in the Dexie database
 * that match the given status.
 * @param {string} status - The status of the system records to retrieve.
 * @returns {Promise<SystemRecord[]>} A promise that resolves with an array of system records
 * matching the given status.
 */
export declare function getSystemsByStatus(status: string): Promise<SystemRecord[]>;
/**
 * Retrieves an array of system records from the Systems table in the Dexie database
 * that match the given System_category.
 * @param {string} category - The System_category of the system records to retrieve.
 * @returns {Promise<SystemRecord[]>} A promise that resolves with an array of system records
 * matching the given System_category.
 */
export declare function getSystemsByCategory(category: string): Promise<SystemRecord[]>;
/**
 * Retrieves the total count of system records in the Systems table in the Dexie database.
 * @returns {Promise<number>} A promise that resolves with the total count of system records.
 */
export declare function getSystemsTotalCount(): Promise<number>;
/**
 * Tests the connection to the Systems AppScript API.
 * @returns {Promise<{success: boolean; data: any}>} - A promise resolving to an object containing the success flag and the response data from the API.
 */
export declare function testSystemsAppScriptConnection(): Promise<{
    success: boolean;
    data: any;
}>;
/**
 * Checks if the Dexie database is empty by verifying that all tables have no records.
 * @returns {Promise<boolean>} A promise that resolves to true if the database is empty, and false otherwise.
 */
export declare function isDexieEmpty(): Promise<boolean>;
/**
 * Clears all data from the Dexie database by deleting all records from the releases, sirsReleases, and systems tables.
 * Emits a 'data-updated' event with type 'clear-all' after clearing all data.
 */
export declare function clearAllData(): Promise<void>;
/**
 * Clears all Systems data from the Dexie database by deleting all records from the systems table.
 * Emits a 'data-updated' event with type 'clear-systems' after clearing all Systems data.
 */
export declare function clearSystemsData(): Promise<void>;
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
export declare function initializeAllDatabases(): Promise<{
    releases: {
        seeded: boolean;
        count: number;
    };
    sirsReleases: {
        seeded: boolean;
        count: number;
    };
    systems: {
        seeded: boolean;
        count: number;
    };
    success: boolean;
}>;
/**
 * Syncs ALL data from AppScript APIs.
 * Syncs Releases, SIRs-Releases, and Systems database tables from AppScript APIs.
 * @returns A promise that resolves with an object containing three properties: releases, sirsReleases, and systems.
 *   Each of these properties is an object with two properties: success and count.
 *   success is a boolean indicating whether the database table was successfully synced.
 *   count is a number indicating the number of records in the database.
 *   The success property of the returned object is a boolean indicating whether all database tables were successfully synced.
 */
export declare function syncAllFromAppScript(): Promise<{
    releases: {
        success: boolean;
        count: number;
    };
    sirsReleases: {
        success: boolean;
        count: number;
    };
    systems: {
        success: boolean;
        count: number;
    };
    success: boolean;
}>;
/**
 * Retrieves all data from the Dexie database.
 * Retrieves all Releases, SIRs-Releases, and Systems records from the database and returns them as an object.
 * @returns A promise that resolves with an object containing three properties: releases, sirsReleases, and systems.
 *   Each of these properties is an array of objects containing the data from the respective database table.
 */
export declare function getAllData(): Promise<{
    releases: ReleaseRecord[];
    sirsReleases: SirsReleaseRecord[];
    systems: SystemRecord[];
}>;
/**
 * Tests all AppScript API connections by fetching data from each API and validating the response.
 * @returns A promise that resolves with an object containing three properties: releases, sirsReleases, and systems.
 *   Each of these properties is an object with two properties: success and data.
 *   success is a boolean indicating whether the API connection was successful.
 *   data is the response data from the API, or null if the connection failed.
 */
export declare function testAllApiConnections(): Promise<{
    releases: {
        success: boolean;
        data: any;
    };
    sirsReleases: {
        success: boolean;
        data: any;
    };
    systems: {
        success: boolean;
        data: any;
    };
}>;
export {};
