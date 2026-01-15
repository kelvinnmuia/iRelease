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

// =====================================
// UPDATE (PUT) OPERATIONS ENDPOINTS
// =====================================

/**
 * Updates an existing SIRs-Release in SIRs_Releases sheet
 * Simple approach: Find row by SIR_Release_id and update it
 * 
 * @param {Sheet} sirsReleasesSheet - Google Sheet object for SIRs_Releases
 * @param {string} sirReleaseId - The SIR_Release_id to update
 * @param {Object} updateData - New data for the SIRs-Release
 * @returns {Object} Updated SIRs-Release object
 */
function updateSIRsRelease(sirsReleasesSheet, sirReleaseId, updateData) {
  try {
    console.log(`Updating SIRs-Release ${sirReleaseId} with data:`, updateData);

    // Get all data from sheet
    const lastRow = sirsReleasesSheet.getLastRow();
    const lastColumn = sirsReleasesSheet.getLastColumn();

    if (lastRow < 5) {
      throw new Error('No data in sheet');
    }

    // Get headers
    const headers = sirsReleasesSheet.getRange(4, 1, 1, lastColumn).getValues()[0];

    // Get all data rows
    const dataRange = sirsReleasesSheet.getRange(5, 1, lastRow - 4, lastColumn);
    const allData = dataRange.getValues();

    // Find row with matching SIR_Release_id
    // Assuming the ID field is named 'SIR_Release_id' in the headers
    const sirReleaseIdIndex = headers.indexOf('Sir_Rel_Id');
    let targetRow = -1;

    for (let i = 0; i < allData.length; i++) {
      if (allData[i][sirReleaseIdIndex] === sirReleaseId) {
        targetRow = i + 5; // Convert to actual row number
        break;
      }
    }

    if (targetRow === -1) {
      throw new Error(`SIRs-Release ${sirReleaseId} not found`);
    }

    // Merge update data with SIR_Release_id
    const finalData = {
      SIR_Release_id: sirReleaseId,
      ...updateData
    };

    // Build updated row
    const updatedRow = headers.map(header => finalData[header] || '');

    // Update the row
    sirsReleasesSheet.getRange(targetRow, 1, 1, updatedRow.length).setValues([updatedRow]);

    console.log(`✓ Updated SIRs-Release ${sirReleaseId} at row ${targetRow}`);
    return finalData;

  } catch (error) {
    console.error(`Update SIRs-Release failed: ${error.message}`);
    throw error;
  }
}

// =====================================
// TEST FUNCTION FOR PUT ENDPOINT
// =====================================

/**
 * Test PUT with specific SIRs-Release ID
 */
function testPutSIRsReleaseWithId() {
  // Replace with your actual SIRs-Release ID
  const SIR_RELEASE_ID = 'SRL-WF8J9'; // Change this to your SIRs-Release ID

  const sheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w')
    .getSheetByName('SIRs_Releases');

  const result = updateSIRsRelease(sheet, SIR_RELEASE_ID, {
    // Add your update fields here based on your sheet headers
    // Example fields (adjust based on your actual column names):
    Sir_Rel_Id: "SRL-WF8J9",
    Sir_id: "121640",
    Release_version: "3.9.300.1",
    Iteration: "1",
    Change_date: "23 Jul 2025",
    Bug_severity: "minor",
    Priority: "P1",
    Assigned_to: "taotao.zhao@atos.net",
    Bug_status: "CLOSED",
    Resolution: "FIXED",
    Component: "COO",
    Op_sys: "All",
    Short_desc: "[KRA COO] Email Notification upon Approval of a COO",
    Cf_sirwith: "under user"
  });

  return `Updated SIRs-Release ${SIR_RELEASE_ID}`;
}