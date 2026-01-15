/**
 * SIRS REST APIs
 * Handles all GET operations for the SIRs sheet
 */

// =====================================
// CONFIGURATION SECTION
// =====================================

// Test data structure reference
const TEST_SIR_DATA = {
  SIR_id: "SIR-12345",
  System_name: "iCMS",
  System_id: "SYS-8QKMU",
  SIR_description: "Test SIR description",
  Priority: "High",
  Status: "Open",
  Date_reported: "15 Jan 2024",
  Date_resolved: "",
  Resolution_details: "",
  Assigned_to: "Developer Team",
  Comments: "Test comment"
};

// =====================================
// READ (GET) OPERATIONS ENDPOINTS
// =====================================

/**
 * Retrieves all SIRs from SIRs sheet
 * Headers are at row 4, data starts at row 5
 * 
 * @param {Sheet} sirsSheet - Google Sheet object for SIRs
 * @returns {Array} Array of SIR objects in JSON format
 */
function getAllSIRs(sirsSheet) {
  try {
    // Get the last row with data
    const lastRow = sirsSheet.getLastRow();
    const lastColumn = sirsSheet.getLastColumn();

    // Check if we have enough rows (at least header row + data)
    if (lastRow < 5) {
      console.log('Not enough rows: headers at row 4, need at least row 5 for data');
      return [];
    }

    // Get headers from row 4 (index 3 in 0-based)
    const headerRange = sirsSheet.getRange(4, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];

    // Get data starting from row 5
    const dataStartRow = 5;
    const dataRowCount = lastRow - 4; // Subtract header row and rows above
    const dataRange = sirsSheet.getRange(dataStartRow, 1, dataRowCount, lastColumn);
    const sheetData = dataRange.getValues();

    // Convert rows to objects
    const sirs = [];
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];

      // Skip empty rows (where first cell is empty)
      if (!row[0]) continue;

      const sir = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j]) {
          sir[headers[j]] = row[j];
        }
      }
      sirs.push(sir);
    }

    console.log(`Retrieved ${sirs.length} SIRs (headers row 4, data from row 5)`);
    return sirs;

  } catch (error) {
    console.error(`Error retrieving SIRs: ${error.message}`);
    throw new Error(`Failed to retrieve SIRs: ${error.message}`);
  }
}

// =====================================
// TEST FUNCTION FOR GET ENDPOINT
// =====================================

/**
 * Simple direct test - no HTTP calls
 */
function testGetSIRsSimple() {
  try {
    console.log('=== STARTING SIMPLE GET SIRS TEST ===');

    // Get the sheet directly
    const ss = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w');
    const sheet = ss.getSheetByName('SIRs');

    if (!sheet) {
      throw new Error('SIRs sheet not found');
    }

    console.log('Sheet found:', sheet.getName());

    // Call the function directly
    const result = getAllSIRs(sheet);

    console.log('=== TEST SUCCESSFUL ===');
    console.log(`Retrieved ${result.length} SIRs`);
    console.log('First SIR:', result[0]);

    return `✅ Success! Retrieved ${result.length} SIRs`;

  } catch (error) {
    console.error('=== TEST FAILED ===');
    console.error('Error:', error);
    return `❌ Failed: ${error.message}`;
  }
}