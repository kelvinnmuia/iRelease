/**
 * SIRS PER RELEASE REST APIs
 * Handles all CRUD operations for the SIRs_Releases sheet
 */

// =====================================
// READ (GET) OPERATIONS ENDPOINTS
// =====================================

/**
 * Retrieves all SIRs linked to any given Release from SIRs_Releases sheet
 * Headers are at row 4, data starts at row 5
 * 
 * @param {Sheet} sirsReleasesSheet - Google Sheet object for SIRs_Releases
 * @returns {Array} Array of SIRs-Releases objects in JSON format
 */
function getAllSIRsReleases(sirsReleasesSheet) {
  try {
    // Get the last row with data
    const lastRow = sirsReleasesSheet.getLastRow();
    const lastColumn = sirsReleasesSheet.getLastColumn();
    
    // Check if we have enough rows (at least header row + data)
    if (lastRow < 5) {
      console.log('Not enough rows: headers at row 4, need at least row 5 for data');
      return [];
    }
    
    // Get headers from row 4 (index 3 in 0-based)
    const headerRange = sirsReleasesSheet.getRange(4, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];
    
    // Get data starting from row 5
    const dataStartRow = 5;
    const dataRowCount = lastRow - 4; // Subtract header row and rows above
    const dataRange = sirsReleasesSheet.getRange(dataStartRow, 1, dataRowCount, lastColumn);
    const sheetData = dataRange.getValues();
    
    // Convert rows to objects
    const sirsReleases = [];
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Skip empty rows (where first cell is empty)
      if (!row[0]) continue;
      
      const sirsRelease = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j]) {
          sirsRelease[headers[j]] = row[j];
        }
      }
      sirsReleases.push(sirsRelease);
    }
    
    console.log(`Retrieved ${sirsReleases.length} SIRs-Releases (headers row 4, data from row 5)`);
    return sirsReleases;
    
  } catch (error) {
    console.error(`Error retrieving SIRs-Releases: ${error.message}`);
    throw new Error(`Failed to retrieve SIRs-Releases: ${error.message}`);
  }
}