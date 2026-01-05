/**
 * RELEASES DETAILS CSV UPLOADER
 * Container-bound script for Google Sheets
 * Manages Releases_Details sheet with CSV upload functionality
 */

// ============================
// CONFIGURATION SECTION
// ============================

/**
 * Configuration constants for releases upload
 */
const RELEASES_CONFIG = {
  // Name of the sheet where releases details are stored
  SHEET_NAME: 'Releases_Details',
  
  // Sheet column indexes (0-based)
  SHEET_COLUMNS: {
    RELEASE_ID: 0,
    SYSTEM_NAME: 1,
    SYSTEM_ID: 2,
    RELEASE_VERSION: 3,
    ITERATION: 4,
    RELEASE_DESCRIPTION: 5,
    FUNCTIONALITY_DELIVERED: 6,
    DATE_DELIVERED_BY_VENDOR: 7,
    NOTIFICATION_DATE_FOR_DEPLOYMENT_TO_TEST: 8,
    DATE_DEPLOYED_TO_TEST: 9,
    DATE_OF_TEST_COMMENCEMENT: 10,
    DATE_OF_TEST_COMPLETION: 11,
    DATE_DEPLOYED_IN_PRODUCTION: 12,
    TIME_TAKEN_TO_DEPLOY_AFTER_DELIVERY: 13,
    TIME_TAKEN_TO_START_TESTING_AFTER_DEPLOYMENT: 14,
    TIME_TAKEN_TO_COMPLETE_TESTING: 15,
    TIME_TAKEN_TO_DEPLOY_AFTER_COMPLETING_TESTING: 16,
    TEST_STATUS: 17,
    DEPLOYMENT_STATUS: 18,
    OUTSTANDING_ISSUES: 19,
    COMMENTS: 20,
    TYPE_OF_RELEASE: 21,
    MONTH: 22,
    TEST_PLAN_CREATION_DATE: 23,
    FINANCIAL_YEAR: 24,
    TEST_PLAN_SLA_DAYS: 25,
    DATE_UPDATED: 26,
    UPDATED_BY: 27
  },
  
  // Headers for the sheet (includes all fields)
  SHEET_HEADERS: [
    'Release_id', 'System_name', 'System_id', 'Release_version', 'Iteration',
    'Release_description', 'Functionality_delivered', 'Date_delivered_by_vendor',
    'Notification_date_for_deployment_to_test', 'Date_deployed_to_test',
    'Date_of_test_commencement', 'Date_of_test_completion', 'Date_deployed_in_production',
    'Time_taken_to_deploy_after_delivery', 'Time_taken_to_start_testing_after_deployment',
    'Time_taken_to_complete_testing', 'Time_taken_to_deploy_after_completing_testing',
    'Test_status', 'Deployment_status', 'Outstanding_issues', 'Comments',
    'Type_of_release', 'Month', 'Test_plan_creation_date', 'Financial_year',
    'Test_plan_SLA_days ', 'Date_updated', 'Updated_by'
  ],
  
  // Expected headers in the uploaded CSV (without Release_id and System_id)
  CSV_HEADERS: [
    'System_name', 'Release_version', 'Iteration', 'Release_description',
    'Functionality_delivered', 'Date_delivered_by_vendor',
    'Notification_date_for_deployment_to_test', 'Date_deployed_to_test',
    'Date_of_test_commencement', 'Date_of_test_completion', 'Date_deployed_in_production',
    'Test_status', 'Deployment_status', 'Outstanding_issues', 'Comments',
    'Type_of_release', 'Month', 'Test_plan_creation_date', 'Financial_year',
    'Test_plan_SLA_days ', 'Date_updated', 'Updated_by'
  ],
  
  // Mandatory fields in uploaded CSV
  MANDATORY_FIELDS: ['System_name', 'Release_version', 'Iteration'],
  
  // Systems metadata sheet name for System_id lookup
  SYSTEMS_SHEET_NAME: 'Systems_Metadata',
  
  // Release ID settings
  RELEASE_ID_PREFIX: 'REL-',
  RANDOM_CHARS: 5,
  
  // Characters to use for random generation
  ID_CHARACTERS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Removed I, O, 0, 1
  
  // Maximum rows to process per CSV upload
  MAX_ROWS_PER_UPLOAD: 1000
};

// ============================
// MENU & DIALOG FUNCTIONS
// ============================

/**
 * Displays the HTML upload dialog for releases
 */
function showReleasesUploadDialog() {
  const html = HtmlService.createHtmlOutputFromFile('uploadReleasesDialog')
    .setWidth(550)
    .setHeight(500)
    .setTitle('Upload Releases CSV');
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Upload Releases CSV');
}

// ============================
// CSV PROCESSING & UPSERT LOGIC
// ============================

/**
 * Main function to process uploaded releases CSV content
 * @param {string} csvContent - The CSV file content as string
 * @return {Object} Result object with success status and message
 */
function processReleasesCSV(csvContent) {
  try {
    console.log('=== STARTING RELEASES CSV PROCESSING ===');
    
    // Validate CSV content
    if (!csvContent || csvContent.trim() === '') {
      throw new Error('CSV file is empty');
    }
    
    // Parse CSV content
    const csvData = parseReleasesCSV(csvContent);
    
    // Validate CSV structure
    if (csvData.length === 0) {
      throw new Error('No data found in CSV');
    }
    
    // Get or create the releases details sheet
    const sheet = getOrCreateReleasesSheet();
    
    // Get existing releases data
    const existingData = getExistingReleases(sheet);
    
    // Get all used release IDs from the sheet
    const usedReleaseIds = getAllReleaseIds(sheet);
    
    // Generate guaranteed unique IDs for this batch
    const batchIds = generateBatchReleaseIds(csvData.length, usedReleaseIds);
    
    // Get System_id mappings from Systems_Metadata sheet
    const systemIdMap = getSystemIdMap();
    
    // Process each row from CSV
    const results = processReleasesRows(csvData, existingData, usedReleaseIds, batchIds, systemIdMap, sheet);
    
    // Format success message
    const message = `Processing Complete:\n` +
                   `✓ ${results.inserted} new release(s) inserted\n` +
                   `✓ ${results.updated} existing release(s) updated\n` +
                   `✓ ${results.skipped} release(s) skipped (no changes)\n` +
                   `✗ ${results.errors} row(s) had errors`;
    
    console.log('=== RELEASES PROCESSING COMPLETE ===');
    console.log('Results:', results);
    
    return {
      success: true,
      message: message
    };
    
  } catch (error) {
    console.error('Error processing releases CSV:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// ============================
// ID GENERATION FUNCTIONS
// ============================

/**
 * Generates a batch of guaranteed unique Release IDs
 * @param {number} count - Number of IDs needed
 * @param {Set} usedReleaseIds - Set of already used release IDs
 * @return {Array} Array of guaranteed unique release IDs
 */
function generateBatchReleaseIds(count, usedReleaseIds) {
  const newIds = new Set();
  const allUsedIds = new Set(usedReleaseIds); // Clone existing IDs
  
  // Generate unique IDs for the batch
  for (let i = 0; i < count; i++) {
    let newId;
    let attempts = 0;
    
    do {
      // Generate random part
      let randomPart = '';
      for (let j = 0; j < RELEASES_CONFIG.RANDOM_CHARS; j++) {
        const randomIndex = Math.floor(Math.random() * RELEASES_CONFIG.ID_CHARACTERS.length);
        randomPart += RELEASES_CONFIG.ID_CHARACTERS.charAt(randomIndex);
      }
      
      newId = RELEASES_CONFIG.RELEASE_ID_PREFIX + randomPart;
      attempts++;
      
      // If we somehow can't find a unique ID (extremely unlikely),
      // add increasing counter to ensure uniqueness
      if (attempts > 100) {
        const timestamp = Date.now().toString(36).slice(-4);
        const counter = i.toString().padStart(3, '0');
        newId = RELEASES_CONFIG.RELEASE_ID_PREFIX + timestamp + counter;
      }
      
    } while (allUsedIds.has(newId) || newIds.has(newId));
    
    newIds.add(newId);
    allUsedIds.add(newId); // Add to tracked IDs for this batch
  }
  
  return Array.from(newIds);
}

// ============================
// CSV PARSING FUNCTIONS
// ============================

/**
 * Parse releases CSV content into array of objects
 */
function parseReleasesCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  
  // Find the first non-empty line to use as headers
  let headerLineIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      headerLineIndex = i;
      break;
    }
  }
  
  // Check if we found a header line
  if (headerLineIndex >= lines.length) {
    throw new Error('No valid data found in CSV');
  }
  
  const headers = lines[headerLineIndex].split(',').map(h => h.trim());
  
  // Validate mandatory headers exist
  RELEASES_CONFIG.MANDATORY_FIELDS.forEach(field => {
    const hasField = headers.some(header => 
      header.toLowerCase() === field.toLowerCase()
    );
    
    if (!hasField) {
      throw new Error(`CSV must contain the "${field}" column`);
    }
  });
  
  const data = [];
  const maxRows = Math.min(lines.length - headerLineIndex - 1, RELEASES_CONFIG.MAX_ROWS_PER_UPLOAD);
  
  for (let i = headerLineIndex + 1; i <= headerLineIndex + maxRows; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = parseCSVLine(lines[i]);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = (values[index] || '').trim();
    });
    
    // Ensure all expected CSV headers are present
    RELEASES_CONFIG.CSV_HEADERS.forEach(header => {
      if (!(header in row)) {
        row[header] = '';
      }
    });
    
    // Validate mandatory fields have values
    const missingMandatory = RELEASES_CONFIG.MANDATORY_FIELDS.filter(field => 
      !row[field] || row[field].trim() === ''
    );
    
    if (missingMandatory.length > 0) {
      throw new Error(`Row ${i - headerLineIndex}: Missing mandatory fields: ${missingMandatory.join(', ')}`);
    }
    
    data.push(row);
  }
  
  if (lines.length - headerLineIndex - 1 > RELEASES_CONFIG.MAX_ROWS_PER_UPLOAD) {
    console.warn(`CSV has ${lines.length - headerLineIndex - 1} rows, but only processing first ${RELEASES_CONFIG.MAX_ROWS_PER_UPLOAD} rows.`);
  }
  
  console.log(`Parsed ${data.length} rows from CSV`);
  return data;
}

/**
 * Parse a CSV line, handling quoted commas (same as systemsUpload.gs)
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values.map(v => v.replace(/^"|"$/g, ''));
}

// ============================
// SHEET MANAGEMENT FUNCTIONS
// ============================

/**
 * Gets or creates the releases details sheet
 */
function getOrCreateReleasesSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(RELEASES_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(RELEASES_CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, RELEASES_CONFIG.SHEET_HEADERS.length)
      .setValues([RELEASES_CONFIG.SHEET_HEADERS])
      .setFontWeight('bold')
      .setBackground('#4a86e8')
      .setFontColor('white');
    
    // Auto-resize columns for better readability
    sheet.autoResizeColumns(1, RELEASES_CONFIG.SHEET_HEADERS.length);
  }
  
  return sheet;
}

/**
 * Gets existing releases data from the sheet
 */
function getExistingReleases(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};
  
  const data = sheet.getRange(2, 1, lastRow - 1, RELEASES_CONFIG.SHEET_HEADERS.length).getValues();
  const existingReleases = {};
  
  data.forEach((row, index) => {
    const systemName = row[RELEASES_CONFIG.SHEET_COLUMNS.SYSTEM_NAME];
    const releaseVersion = row[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_VERSION];
    const iteration = row[RELEASES_CONFIG.SHEET_COLUMNS.ITERATION];
    
    if (systemName && releaseVersion && iteration) {
      const uniqueKey = `${systemName.toString().toLowerCase().trim()}_${releaseVersion.toString().trim()}_${iteration.toString().trim()}`;
      existingReleases[uniqueKey] = {
        rowIndex: index + 2,
        data: row,
        hasReleaseId: row[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_ID] && 
                     row[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_ID].toString().trim() !== ''
      };
    }
  });
  
  return existingReleases;
}

/**
 * Gets all existing Release IDs from the sheet
 */
function getAllReleaseIds(sheet) {
  const usedReleaseIds = new Set();
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    const releaseIdColumn = RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_ID + 1;
    const releaseIds = sheet.getRange(2, releaseIdColumn, lastRow - 1, 1).getValues();
    
    releaseIds.forEach(row => {
      const releaseId = row[0];
      if (releaseId && releaseId.toString().trim() !== '') {
        usedReleaseIds.add(releaseId.toString().trim());
      }
    });
  }
  
  return usedReleaseIds;
}

/**
 * Gets System_id mappings from Systems_Metadata sheet
 */
function getSystemIdMap() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const systemsSheet = spreadsheet.getSheetByName(RELEASES_CONFIG.SYSTEMS_SHEET_NAME);
  
  if (!systemsSheet) {
    throw new Error(`Systems_Metadata sheet not found. Please run systems upload first.`);
  }
  
  const lastRow = systemsSheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error('No systems found in Systems_Metadata sheet. Please upload systems first.');
  }
  
  const systemIdMap = {};
  const data = systemsSheet.getRange(2, 1, lastRow - 1, 2).getValues(); // Get System_id and System_name
  
  data.forEach(row => {
    const systemId = row[0];
    const systemName = row[1];
    
    if (systemName && systemId) {
      systemIdMap[systemName.toString().toLowerCase().trim()] = systemId.toString().trim();
    }
  });
  
  return systemIdMap;
}

// ============================
// CORE PROCESSING LOGIC
// ============================

/**
 * Process releases CSV rows and update/insert into sheet
 */
function processReleasesRows(csvData, existingReleases, usedReleaseIds, batchIds, systemIdMap, sheet) {
  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  let batchIdIndex = 0;
  
  csvData.forEach((row, index) => {
    try {
      console.log(`Processing row ${index + 1}: ${row.System_name} - ${row.Release_version} - ${row.Iteration}`);
      
      // Validate mandatory fields
      if (!row.System_name || !row.Release_version || !row.Iteration) {
        throw new Error('Missing mandatory field(s)');
      }
      
      // Look up System_id
      const systemNameKey = row.System_name.toLowerCase().trim();
      const systemId = systemIdMap[systemNameKey];
      
      if (!systemId) {
        throw new Error(`System "${row.System_name}" not found in Systems_Metadata. Please add system first.`);
      }
      
      // Create unique key for this release
      const uniqueKey = `${systemNameKey}_${row.Release_version.trim()}_${row.Iteration.trim()}`;
      const existingRelease = existingReleases[uniqueKey];
      
      // Prepare sheet data array with all columns
      const sheetData = new Array(RELEASES_CONFIG.SHEET_HEADERS.length).fill('');
      
      // Map CSV data to sheet columns
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.SYSTEM_NAME] = row.System_name.trim();
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.SYSTEM_ID] = systemId;
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_VERSION] = row.Release_version.trim();
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.ITERATION] = row.Iteration.trim();
      
      // Map optional fields
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_DESCRIPTION] = row.Release_description || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.FUNCTIONALITY_DELIVERED] = row.Functionality_delivered || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.DATE_DELIVERED_BY_VENDOR] = row.Date_delivered_by_vendor || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.NOTIFICATION_DATE_FOR_DEPLOYMENT_TO_TEST] = row.Notification_date_for_deployment_to_test || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.DATE_DEPLOYED_TO_TEST] = row.Date_deployed_to_test || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.DATE_OF_TEST_COMMENCEMENT] = row.Date_of_test_commencement || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.DATE_OF_TEST_COMPLETION] = row.Date_of_test_completion || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.DATE_DEPLOYED_IN_PRODUCTION] = row.Date_deployed_in_production || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.TEST_STATUS] = row.Test_status || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.DEPLOYMENT_STATUS] = row.Deployment_status || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.OUTSTANDING_ISSUES] = row.Outstanding_issues || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.COMMENTS] = row.Comments || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.TYPE_OF_RELEASE] = row.Type_of_release || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.MONTH] = row.Month || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.TEST_PLAN_CREATION_DATE] = row.Test_plan_creation_date || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.FINANCIAL_YEAR] = row.Financial_year || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.TEST_PLAN_SLA_DAYS] = row['Test_plan_SLA_days '] || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.DATE_UPDATED] = row.Date_updated || '';
      sheetData[RELEASES_CONFIG.SHEET_COLUMNS.UPDATED_BY] = row.Updated_by || '';
      
      // Time fields are left empty - formulas in sheet will calculate them
      
      if (existingRelease) {
        console.log(`Found existing release at row ${existingRelease.rowIndex}`);
        
        let needsUpdate = false;
        
        // Check if data has changed (compare all fields except time calculation fields)
        for (let i = 0; i < sheetData.length; i++) {
          // Skip time calculation fields (13-16)
          if (i >= 13 && i <= 16) continue;
          
          const existingValue = existingRelease.data[i] ? existingRelease.data[i].toString().trim() : '';
          const newValue = sheetData[i] ? sheetData[i].toString().trim() : '';
          
          if (existingValue !== newValue) {
            console.log(`Field ${RELEASES_CONFIG.SHEET_HEADERS[i]} changed: "${existingValue}" -> "${newValue}"`);
            needsUpdate = true;
            break;
          }
        }
        
        if (needsUpdate) {
          // Keep existing Release_id
          sheetData[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_ID] = existingRelease.data[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_ID];
          
          // Update the existing row
          sheet.getRange(existingRelease.rowIndex, 1, 1, sheetData.length)
            .setValues([sheetData]);
          
          results.updated++;
          console.log(`✓ Updated release`);
        } else {
          results.skipped++;
          console.log(`✓ No changes needed, skipped`);
        }
      } else {
        // New release - assign Release_id
        sheetData[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_ID] = batchIds[batchIdIndex];
        usedReleaseIds.add(batchIds[batchIdIndex]);
        batchIdIndex++;
        
        sheet.appendRow(sheetData);
        results.inserted++;
        console.log(`✓ Inserted new release with ID: ${sheetData[RELEASES_CONFIG.SHEET_COLUMNS.RELEASE_ID]}`);
      }
      
    } catch (error) {
      console.error(`Error processing row ${index + 1}:`, error.message);
      console.error('Row data:', row);
      results.errors++;
    }
  });
  
  return results;
}

// ============================
// TEST & DEBUG FUNCTIONS
// ============================

/**
 * Test function for releases module
 */
function testReleasesFunction() {
  return 'Releases Upload Script is working correctly!';
}

/**
 * Debug function to check releases sheet data
 */
function debugReleasesData() {
  try {
    const sheet = getOrCreateReleasesSheet();
    const lastRow = sheet.getLastRow();
    
    console.log(`=== DEBUG: ${RELEASES_CONFIG.SHEET_NAME} SHEET ===`);
    console.log(`Sheet Name: ${sheet.getName()}`);
    console.log(`Last Row: ${lastRow}`);
    console.log(`Headers: ${RELEASES_CONFIG.SHEET_HEADERS.length} columns`);
    
    if (lastRow > 1) {
      const data = sheet.getRange(1, 1, Math.min(lastRow, 5), RELEASES_CONFIG.SHEET_HEADERS.length).getValues();
      console.log('First 5 rows:');
      data.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row.slice(0, 8)); // Show first 8 columns for readability
      });
    }
    
    return 'Debug complete - check View > Logs';
  } catch (error) {
    console.error('Debug error:', error);
    return `Debug error: ${error.message}`;
  }
}

/**
 * Get current systems for testing
 */
function testSystemIdLookup() {
  try {
    const systemIdMap = getSystemIdMap();
    console.log(`Found ${Object.keys(systemIdMap).length} systems:`);
    Object.keys(systemIdMap).forEach((key, idx) => {
      console.log(`${idx + 1}. "${key}" -> "${systemIdMap[key]}"`);
    });
    
    return `Found ${Object.keys(systemIdMap).length} systems. Check logs for details.`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}