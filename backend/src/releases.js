/**
 * RELEASES REST APIs
 * Handles all CRUD operations for the Releases_Details sheet
 */

// =====================================
// CONFIGURATION SECTION
// =====================================

const RELEASE_ID_CONFIG = {
  PREFIX: 'REL-',
  RANDOM_CHARS: 5,
  ID_CHARACTERS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Removed I, O, 0, 1
};

// Test data for POST testing
const TEST_RELEASE_DATA = {
  System_name: "iCMS",
  System_id: "SYS-8QKMU",
  Release_version: "1.5.7",
  Iteration: 1,
  Release_description: "Test release description",
  Functionality_delivered: "Test functionality",
  Date_delivered_by_vendor: "15 Jan 2024",
  Notification_date_for_deployment_to_test: "15 Jan 2024",
  Date_deployed_to_test: "16 Jan 2024",
  Date_of_test_commencement: "17 Jan 2024",
  Date_of_test_completion: "19 Jan 2024",
  Date_deployed_in_production: "",
  Test_status: "Passed",
  Deployment_status: "Deployed to production",
  Outstanding_issues: "None",
  Comments: "Test comment",
  Type_of_release: "Minor",
  Month: "January",
  Financial_year: "FY2025"
};

// =====================================
// READ (GET) OPERATIONS ENDPOINTS
// =====================================

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

// =====================================
// CREATE (POST) OPERATIONS ENDPOINTS
// =====================================

/**
 * Creates a new release in Releases_Details sheet
 * Auto-generates a unique Release_id
 * 
 * @param {Sheet} releaseSheet - Google Sheet object for Releases_Details
 * @param {Object} releaseData - Release data object
 * @returns {Object} Created release object with auto-generated ID
 */
function createNewRelease(releaseSheet, releaseData) {
  try {
    console.log('Creating new release with data:', releaseData);

    // Get all existing release IDs
    const usedReleaseIds = getAllReleaseIds(releaseSheet);

    // Generate unique Release_id
    const newReleaseId = generateUniqueReleaseId(usedReleaseIds);

    // Prepare release data with auto-generated ID
    const releaseWithId = {
      Release_id: newReleaseId,
      ...releaseData
    };

    // Get headers to ensure correct column order
    const lastColumn = releaseSheet.getLastColumn();
    const headerRange = releaseSheet.getRange(4, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];

    // Prepare row data in correct column order
    const rowData = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      rowData.push(releaseWithId[header] || '');
    }

    // Find the next empty row (after row 4 headers)
    const lastRow = releaseSheet.getLastRow();
    const insertRow = lastRow < 5 ? 5 : lastRow + 1;

    // Insert the new release
    releaseSheet.getRange(insertRow, 1, 1, rowData.length).setValues([rowData]);

    console.log(`✓ New release created at row ${insertRow} with ID: ${newReleaseId}`);
    console.log('Created release:', releaseWithId);

    return releaseWithId;

  } catch (error) {
    console.error(`Error creating new release: ${error.message}`);
    throw new Error(`Failed to create release: ${error.message}`);
  }
}

// =====================================
// UPDATE (PUT) OPERATIONS ENDPOINTS
// =====================================

/**
 * Updates an existing release in Releases_Details sheet
 * Simple approach: Find row by Release_id and update it
 * 
 * @param {Sheet} releaseSheet - Google Sheet object for Releases_Details
 * @param {string} releaseId - The Release_id to update
 * @param {Object} updateData - New data for the release
 * @returns {Object} Updated release object
 */
function updateRelease(releaseSheet, releaseId, updateData) {
  try {
    console.log(`Updating release ${releaseId} with data:`, updateData);
    
    // Get all data from sheet
    const lastRow = releaseSheet.getLastRow();
    const lastColumn = releaseSheet.getLastColumn();
    
    if (lastRow < 5) {
      throw new Error('No data in sheet');
    }
    
    // Get headers
    const headers = releaseSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
    
    // Get all data rows
    const dataRange = releaseSheet.getRange(5, 1, lastRow - 4, lastColumn);
    const allData = dataRange.getValues();
    
    // Find row with matching Release_id
    const releaseIdIndex = headers.indexOf('Release_id');
    let targetRow = -1;
    
    for (let i = 0; i < allData.length; i++) {
      if (allData[i][releaseIdIndex] === releaseId) {
        targetRow = i + 5; // Convert to actual row number
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error(`Release ${releaseId} not found`);
    }
    
    // Merge update data with Release_id
    const finalData = {
      Release_id: releaseId,
      ...updateData
    };
    
    // Build updated row
    const updatedRow = headers.map(header => finalData[header] || '');
    
    // Update the row
    releaseSheet.getRange(targetRow, 1, 1, updatedRow.length).setValues([updatedRow]);
    
    console.log(`✓ Updated release ${releaseId} at row ${targetRow}`);
    return finalData;
    
  } catch (error) {
    console.error(`Update failed: ${error.message}`);
    throw error;
  }
}


// =====================================
// DELETE OPERATIONS ENDPOINTS
// =====================================

/**
 * Deletes a release from Releases_Details sheet by Release_id
 * Simple approach: Find row by Release_id and delete it
 * 
 * @param {Sheet} releaseSheet - Google Sheet object for Releases_Details
 * @param {string} releaseId - The Release_id to delete
 * @returns {Object} The deleted release object
 */
function deleteRelease(releaseSheet, releaseId) {
  try {
    console.log(`Finding and deleting release: ${releaseId}`);
    
    // Get all data from sheet
    const lastRow = releaseSheet.getLastRow();
    const lastColumn = releaseSheet.getLastColumn();
    
    if (lastRow < 5) {
      throw new Error('No data in sheet');
    }
    
    // Get headers
    const headers = releaseSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
    
    // Get all data rows
    const dataRange = releaseSheet.getRange(5, 1, lastRow - 4, lastColumn);
    const allData = dataRange.getValues();
    
    // Find row with matching Release_id
    const releaseIdIndex = headers.indexOf('Release_id');
    let targetRow = -1;
    let releaseData = null;
    
    for (let i = 0; i < allData.length; i++) {
      if (allData[i][releaseIdIndex] === releaseId) {
        targetRow = i + 5; // Convert to actual row number
        
        // Build release object before deleting
        releaseData = {};
        for (let j = 0; j < headers.length; j++) {
          releaseData[headers[j]] = allData[i][j];
        }
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error(`Release ${releaseId} not found`);
    }
    
    // Delete the row
    releaseSheet.deleteRow(targetRow);
    
    console.log(`✓ Deleted release ${releaseId} from row ${targetRow}`);
    return releaseData;
    
  } catch (error) {
    console.error(`Delete failed: ${error.message}`);
    throw error;
  }
}


/**
 * Deletes multiple releases from Releases_Details sheet
 * Simple approach: Find rows by Release_ids and delete them
 * 
 * @param {Sheet} releaseSheet - Google Sheet object for Releases_Details
 * @param {Array} releaseIds - Array of Release_ids to delete
 * @returns {Object} Results of bulk delete operation
 */
function bulkDeleteReleases(releaseSheet, releaseIds) {
  try {
    console.log(`Bulk deleting ${releaseIds.length} releases:`, releaseIds);
    
    // Get all data from sheet
    const lastRow = releaseSheet.getLastRow();
    const lastColumn = releaseSheet.getLastColumn();
    
    if (lastRow < 5) {
      throw new Error('No data in sheet');
    }
    
    // Get headers
    const headers = releaseSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
    
    // Get all data rows
    const dataRange = releaseSheet.getRange(5, 1, lastRow - 4, lastColumn);
    const allData = dataRange.getValues();
    
    // Find Release_id column index
    const releaseIdIndex = headers.indexOf('Release_id');
    
    // Track results
    const deletedReleases = [];
    const notFound = [];
    
    // Find all target rows (store row numbers and data)
    const rowsToDelete = [];
    const rowsData = [];
    
    for (let i = 0; i < allData.length; i++) {
      const currentReleaseId = allData[i][releaseIdIndex];
      
      if (releaseIds.includes(currentReleaseId)) {
        const targetRow = i + 5; // Convert to actual row number
        
        // Build release object before deleting
        const releaseData = {};
        for (let j = 0; j < headers.length; j++) {
          releaseData[headers[j]] = allData[i][j];
        }
        
        rowsToDelete.push(targetRow);
        rowsData.push(releaseData);
      }
    }
    
    // Check for not found IDs
    const foundIds = rowsData.map(release => release.Release_id);
    releaseIds.forEach(id => {
      if (!foundIds.includes(id)) {
        notFound.push(id);
      }
    });
    
    // Delete rows in reverse order to maintain correct row numbers
    rowsToDelete.sort((a, b) => b - a); // Sort descending
    
    for (let i = 0; i < rowsToDelete.length; i++) {
      releaseSheet.deleteRow(rowsToDelete[i]);
    }
    
    // Add all successfully deleted releases to results
    deletedReleases.push(...rowsData);
    
    console.log(`✓ Bulk delete completed: ${deletedReleases.length} deleted, ${notFound.length} not found`);
    
    return {
      deletedCount: deletedReleases.length,
      deletedReleases: deletedReleases,
      notFound: notFound
    };
    
  } catch (error) {
    console.error(`Bulk delete failed: ${error.message}`);
    throw error;
  }
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Gets all existing Release IDs from the sheet
 * 
 * @param {Sheet} releaseSheet - Google Sheet object for Releases_Details
 * @returns {Set} Set of all used release IDs
 */
function getAllReleaseIds(releaseSheet) {
  const usedReleaseIds = new Set();
  const lastRow = releaseSheet.getLastRow();

  if (lastRow > 4) { // Check if we have data beyond headers
    // Find Release_id column index
    const lastColumn = releaseSheet.getLastColumn();
    const headerRange = releaseSheet.getRange(4, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];
    const releaseIdIndex = headers.indexOf('Release_id');

    if (releaseIdIndex !== -1) {
      const releaseIds = releaseSheet.getRange(5, releaseIdIndex + 1, lastRow - 4, 1).getValues();

      releaseIds.forEach(row => {
        const releaseId = row[0];
        if (releaseId && releaseId.toString().trim() !== '') {
          usedReleaseIds.add(releaseId.toString().trim());
        }
      });
    }
  }

  console.log(`Found ${usedReleaseIds.size} existing release IDs`);
  return usedReleaseIds;
}

/**
 * Generates a unique Release ID
 * 
 * @param {Set} usedReleaseIds - Set of already used release IDs
 * @returns {string} Unique release ID
 */
function generateUniqueReleaseId(usedReleaseIds) {
  let newId;
  let attempts = 0;

  do {
    // Generate random part
    let randomPart = '';
    for (let j = 0; j < RELEASE_ID_CONFIG.RANDOM_CHARS; j++) {
      const randomIndex = Math.floor(Math.random() * RELEASE_ID_CONFIG.ID_CHARACTERS.length);
      randomPart += RELEASE_ID_CONFIG.ID_CHARACTERS.charAt(randomIndex);
    }

    newId = RELEASE_ID_CONFIG.PREFIX + randomPart;
    attempts++;

    // Fallback for extreme cases
    if (attempts > 50) {
      const timestamp = Date.now().toString(36).slice(-4);
      newId = RELEASE_ID_CONFIG.PREFIX + timestamp;
    }

  } while (usedReleaseIds.has(newId));

  console.log(`Generated new Release ID: ${newId} (attempts: ${attempts})`);
  return newId;
}

// =====================================
// TEST FUNCTION FOR POST ENDPOINT
// =====================================

/**
 * Simple direct test - no HTTP calls
 */
function testPostSimple() {
  try {
    console.log('=== STARTING SIMPLE POST TEST ===');

    // Get the sheet directly
    const ss = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w');
    const sheet = ss.getSheetByName('Releases_Details');

    if (!sheet) {
      throw new Error('Sheet not found');
    }

    console.log('Sheet found:', sheet.getName());

    // Create test data (copy of your TEST_RELEASE_DATA)
    const testData = {
      System_name: "iCMS",
      System_id: "SYS-8QKMU",
      Release_version: "1.5.7",
      Iteration: 1,
      Release_description: "Test release description",
      Functionality_delivered: "Hot fix for sirs 123455, 123955, 124098, 126945",
      Date_delivered_by_vendor: "10 Jan 2026",
      Notification_date_for_deployment_to_test: "11 Jan 2026",
      Date_deployed_to_test: "12 Jan 2026",
      Date_of_test_commencement: "13 Jan 2026",
      Date_of_test_completion: "14 Jan 2026",
      Date_deployed_in_production: "14 Jan 2026",
      Test_status: "Passed",
      Deployment_status: "Deployed to production",
      Outstanding_issues: "None",
      Comments: "Test comment",
      Type_of_release: "Minor",
      Month: "January",
      Financial_year: "FY2026"
    };

    console.log('Test data:', testData);

    // Call the function directly
    const result = createNewRelease(sheet, testData);

    console.log('=== TEST SUCCESSFUL ===');
    console.log('Created release ID:', result.Release_id);
    console.log('Inserted at row:', sheet.getLastRow());

    return `✅ Success! Created release: ${result.Release_id}`;

  } catch (error) {
    console.error('=== TEST FAILED ===');
    console.error('Error:', error);
    return `❌ Failed: ${error.message}`;
  }
}

/**
 * Test PUT with specific release ID
 */
function testPutWithId() {
  // Replace with your actual release ID
  const RELEASE_ID = 'REL-7C9VC'; // Change this to your release ID
  
  const sheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w')
    .getSheetByName('Releases_Details');
  
  const result = updateRelease(sheet, RELEASE_ID, {
    System_name: "iCMS",
    System_id: "SYS-8QKMU",
    Release_version: "1.5.8",
    Iteration: 1,
    Release_description: "Test release descriptions",
    Functionality_delivered: "Hot fix for sirs 123455, 123955, 124098, 126945",
    Date_delivered_by_vendor: "10 Jan 2025",
    Notification_date_for_deployment_to_test: "11 Jan 2025",
    Date_deployed_to_test: "12 Jan 2025",
    Date_of_test_commencement: "13 Jan 2025",
    Date_of_test_completion: "14 Jan 2025",
    Date_deployed_in_production: "14 Jan 2025",
    Test_status: "Passed",
    Deployment_status: "Deployed to post-production",
    Outstanding_issues: "Dashboard issues fixed",
    Comments: "Test comment two",
    Type_of_release: "Minor",
    Month: "January",
    Financial_year: "FY2025"
  });
  
  return `Updated ${RELEASE_ID}`;
}

/**
 * Test DELETE with specific release ID
 */
function testDeleteWithId() {
  // Replace with your actual release ID
  const RELEASE_ID = 'REL-7C9VC'; // Change this to your release ID
  
  const sheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w')
    .getSheetByName('Releases_Details');
  
  const result = deleteRelease(sheet, RELEASE_ID);
  
  return `Deleted ${RELEASE_ID}`;
}

/**
 * Test BULK DELETE with multiple release IDs
 */
function testBulkDeleteWithIds() {
  // Replace with your actual release IDs
  const RELEASE_IDS = ['REL-LYC75', 'REL-Z3EA5']; // Change these to your release IDs
  
  const sheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w')
    .getSheetByName('Releases_Details');
  
  const result = bulkDeleteReleases(sheet, RELEASE_IDS);
  
  return `Bulk deleted ${result.deletedCount} releases, ${result.notFound.length} not found`;
}