/**
 * RELEASES MANAGEMENT MODULE
 * Handles all CRUD operations for Releases_Details sheet
 */

// ============================
// CACHE CONFIGURATION
// ============================

const CACHE_TTL = 300; // 5 minutes in seconds
const CACHE_KEYS = {
  ALL_RELEASES: 'all_releases_data'
};

// ============================
// RELEASES DATA OPERATIONS
// ============================

/**
 * Retrieves all releases from Releases_Details sheet with caching
 * Uses cache-first approach to improve performance and reduce quota usage
 * 
 * @param {Sheet} releaseSheet - Google Sheet object for Releases_Details
 * @returns {Array} Array of release objects in JSON format
 */
function getAllReleases(releaseSheet) {
  const cache = CacheService.getScriptCache();
  const startTime = new Date();
  
  console.log(`[Releases] Starting data retrieval from ${releaseSheet.getName()}`);
  
  // Try to get data from cache first
  const cachedData = cache.get(CACHE_KEYS.ALL_RELEASES);
  if (cachedData) {
    const endTime = new Date();
    console.log(`[Releases] Cache HIT: Retrieved ${JSON.parse(cachedData).length} releases from cache in ${endTime - startTime}ms`);
    return JSON.parse(cachedData);
  }
  
  console.log(`[Releases] Cache MISS: Fetching data from sheet`);
  
  try {
    // Get all data from sheet
    const lastRow = releaseSheet.getLastRow();
    const lastColumn = releaseSheet.getLastColumn();
    
    if (lastRow <= 1) {
      console.log('[Releases] No data rows found (only headers exist)');
      return [];
    }
    
    // Read data in batch for performance
    const dataRange = releaseSheet.getRange(1, 1, lastRow, lastColumn);
    const sheetData = dataRange.getValues();
    
    // Extract headers (first row)
    const headers = sheetData[0].map(header => header.trim());
    
    // Convert rows to objects
    const releases = [];
    for (let i = 1; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Skip empty rows (where first cell is empty)
      if (!row[0]) continue;
      
      const release = {};
      for (let j = 0; j < headers.length; j++) {
        // Handle empty header cells
        if (headers[j]) {
          release[headers[j]] = row[j];
        }
      }
      releases.push(release);
    }
    
    // Cache the results
    const jsonData = JSON.stringify(releases);
    cache.put(CACHE_KEYS.ALL_RELEASES, jsonData, CACHE_TTL);
    
    const endTime = new Date();
    console.log(`[Releases] Retrieved ${releases.length} releases from sheet in ${endTime - startTime}ms`);
    console.log(`[Releases] Sample data (first release):`, JSON.stringify(releases[0] || {}).substring(0, 200) + '...');
    
    return releases;
    
  } catch (error) {
    console.error(`[Releases] Error retrieving releases:`, error.message);
    throw new Error(`Failed to retrieve releases: ${error.message}`);
  }
}

/**
 * Clears the releases cache (useful when data changes)
 */
function clearReleasesCache() {
  const cache = CacheService.getScriptCache();
  cache.remove(CACHE_KEYS.ALL_RELEASES);
  console.log('[Releases] Cache cleared');
  return { success: true, message: 'Releases cache cleared' };
}

/**
 * Gets cache statistics (for debugging/monitoring)
 */
function getCacheStats() {
  const cache = CacheService.getScriptCache();
  // Note: CacheService doesn't provide direct stats in Apps Script
  // This is a placeholder for future implementation
  return {
    cacheKey: CACHE_KEYS.ALL_RELEASES,
    ttl: CACHE_TTL,
    description: 'All releases data cache'
  };
}