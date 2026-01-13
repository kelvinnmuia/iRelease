/**
 * RELEASES REST APIs
 * Handles all CRUD operations for the Releases_Details sheet
 */

/**
 * Retrieves all releases from Releases_Details sheet
 * Headers are at row 4, data starts at row 5
 * 
 * @param {Sheet} releaseSheet - Google Sheet object for Releases_Details
 * @returns {Array} Array of release objects in JSON format
 */
function getAllReleases(releaseSheet) {
  try {
    // Get the last row with data
    const lastRow = releaseSheet.getLastRow();
    const lastColumn = releaseSheet.getLastColumn();
    
    // Check if we have enough rows (at least header row + data)
    if (lastRow < 5) {
      console.log('Not enough rows: headers at row 4, need at least row 5 for data');
      return [];
    }
    
    // Get headers from row 4 (index 3 in 0-based)
    const headerRange = releaseSheet.getRange(4, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];
    
    // Get data starting from row 5
    const dataStartRow = 5;
    const dataRowCount = lastRow - 4; // Subtract header row and rows above
    const dataRange = releaseSheet.getRange(dataStartRow, 1, dataRowCount, lastColumn);
    const sheetData = dataRange.getValues();
    
    // Convert rows to objects
    const releases = [];
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Skip empty rows (where first cell is empty)
      if (!row[0]) continue;
      
      const release = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j]) {
          release[headers[j]] = row[j];
        }
      }
      releases.push(release);
    }
    
    console.log(`Retrieved ${releases.length} releases (headers row 4, data from row 5)`);
    return releases;
    
  } catch (error) {
    console.error(`Error retrieving releases: ${error.message}`);
    throw new Error(`Failed to retrieve releases: ${error.message}`);
  }
}

/**
 * Test function to verify the data structure
 */
function testReleaseStructure(releaseSheet) {
  try {
    // Get a sample to check structure
    const lastColumn = releaseSheet.getLastColumn();
    
    // Get headers from row 4
    const headerRange = releaseSheet.getRange(4, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];
    
    // Get first data row (row 5)
    const firstDataRow = releaseSheet.getRange(5, 1, 1, lastColumn);
    const firstData = firstDataRow.getValues()[0];
    
    console.log('Headers from row 4:', headers);
    console.log('First data row (row 5):', firstData);
    
    // Create sample object
    const sampleRelease = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) {
        sampleRelease[headers[j]] = firstData[j];
      }
    }
    
    console.log('Sample release object:', JSON.stringify(sampleRelease, null, 2));
    
    return {
      success: true,
      headerRow: 4,
      dataStartRow: 5,
      headers: headers.filter(h => h), // Remove empty headers
      sample: sampleRelease
    };
    
  } catch (error) {
    console.error('Test failed:', error.message);
    return { success: false, error: error.message };
  }
}