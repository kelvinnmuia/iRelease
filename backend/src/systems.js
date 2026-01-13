/**
 * SYSTEMS REST APIs
 * Handles all CRUD operations for the Systems_Metadata sheet
 */

// =====================================
// READ (GET) OPERATIONS ENDPOINTS
// =====================================

/**
 * Retrieves all systems from Systems_Metadata sheet
 * Headers are at row 3, data starts at row 4
 * 
 * @param {Sheet} systemsSheet - Google Sheet object for Systems_Metadata
 * @returns {Array} Array of system objects in JSON format
 */
function getAllSystems(systemsSheet) {
  try {
    // Get the last row with data
    const lastRow = systemsSheet.getLastRow();
    const lastColumn = systemsSheet.getLastColumn();
    
    // Check if we have enough rows (at least header row + data)
    if (lastRow < 4) {
      console.log('Not enough rows: headers at row 3, need at least row 4 for data');
      return [];
    }
    
    // Get headers from row 3 (index 2 in 0-based)
    const headerRange = systemsSheet.getRange(3, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];
    
    // Get data starting from row 4
    const dataStartRow = 4;
    const dataRowCount = lastRow - 3; // Subtract header row and rows above
    const dataRange = systemsSheet.getRange(dataStartRow, 1, dataRowCount, lastColumn);
    const sheetData = dataRange.getValues();
    
    // Convert rows to objects
    const systems = [];
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];
      
      // Skip empty rows (where first cell is empty)
      if (!row[0]) continue;
      
      const system = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j]) {
          system[headers[j]] = row[j];
        }
      }
      systems.push(system);
    }
    
    console.log(`Retrieved ${systems.length} systems (headers row 3, data from row 4)`);
    return systems;
    
  } catch (error) {
    console.error(`Error retrieving systems: ${error.message}`);
    throw new Error(`Failed to retrieve systems: ${error.message}`);
  }
}