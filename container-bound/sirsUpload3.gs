/**
 * SIRS CSV UPLOADER
 * Container-bound script for Google Sheets
 * Manages SIRs (System Issue Reports) sheet with CSV upload functionality
 * Optimized for 10,000 records per upload
 */

// ============================
// CONFIGURATION SECTION
// ============================

/**
 * Configuration constants for the script
 */
const SIRS_CONFIG = {
  // Name of the sheet where SIRs data is stored
  SHEET_NAME: 'SIRs',
  
  // Google Sheet column names (exact column headers)
  SHEET_HEADERS: [
    'Bug_id', 'Open_date', 'Change_date', 'Bug_severity', 'Priority',
    'Assigned_to', 'Reporter', 'Bug_status', 'Resolution', 'Component',
    'Op_sys', 'Short_desc', 'Cf_sirwith'
  ],
  
  // Expected headers in the uploaded CSV (lowercase from external system)
  CSV_HEADERS: [
    'bug_id', 'opendate', 'changeddate', 'bug_severity', 'priority',
    'assigned_to', 'reporter', 'bug_status', 'resolution', 'component',
    'op_sys', 'short_desc', 'cf_sirwith'
  ],
  
  // Column index for Bug_id (used for matching)
  BUG_ID_COLUMN: 0,
  
  // Maximum rows to process per upload
  MAX_ROWS_PER_UPLOAD: 10000,
  
  // Maximum execution time (6 minutes - Google Apps Script limit)
  MAX_EXECUTION_TIME: 5.5 * 60 * 1000
};

// ============================
// CORE PROCESSING FUNCTIONS
// ============================

/**
 * Main function to process uploaded CSV content
 * @param {string} csvContent - The CSV file content as string
 * @return {Object} Result object with success status and message
 */
function processSIRsCSV(csvContent) {
  const startTime = new Date();
  
  try {
    console.log('Starting SIRs CSV processing...');
    
    // Validate CSV content
    if (!csvContent || csvContent.trim() === '') {
      throw new Error('CSV file is empty');
    }
    
    // Parse CSV using Google's efficient parser
    const csvData = Utilities.parseCsv(csvContent);
    
    // Validate CSV structure
    if (csvData.length === 0) {
      throw new Error('No data found in CSV');
    }
    
    // Check row limit
    const totalRows = csvData.length - 1; // Exclude header
    if (totalRows > SIRS_CONFIG.MAX_ROWS_PER_UPLOAD) {
      throw new Error(`CSV contains ${totalRows.toLocaleString()} rows. Maximum allowed is ${SIRS_CONFIG.MAX_ROWS_PER_UPLOAD.toLocaleString()} rows per upload.`);
    }
    
    // Extract and validate headers
    const csvHeaders = csvData[0].map(h => h.trim().toLowerCase());
    const sheet = getOrCreateSIRsSheet();
    
    console.log(`CSV contains ${totalRows} data rows`);
    console.log('CSV Headers:', csvHeaders);
    
    // Map CSV headers to sheet columns
    const columnMapping = mapCSVHeadersToSheet(csvHeaders);
    
    // Get existing data for fast lookup
    const existingData = getExistingSIRsData(sheet);
    console.log(`Found ${Object.keys(existingData).length} existing bug records`);
    
    // Process all rows at once
    const results = processAllCSVRows(
      csvData.slice(1), // Skip header
      columnMapping,
      existingData,
      sheet
    );
    
    // Format success message
    const executionTime = ((new Date() - startTime) / 1000).toFixed(2);
    const message = `SIRs CSV Processing Complete (${executionTime}s):\n` +
                   `✓ ${results.inserted} new bug record(s) inserted\n` +
                   `✓ ${results.updated} existing bug record(s) updated\n` +
                   `✓ ${results.skipped} bug record(s) skipped (no changes)\n` +
                   `✗ ${results.errors} row(s) had errors\n` +
                   `Total processed: ${totalRows} rows\n` +
                   `Maximum rows per upload: ${SIRS_CONFIG.MAX_ROWS_PER_UPLOAD.toLocaleString()}`;
    
    console.log('Processing complete:', message);
    
    return {
      success: true,
      message: message
    };
    
  } catch (error) {
    console.error('Error processing SIRs CSV:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// ============================
// CSV HEADER MAPPING
// ============================

/**
 * Map CSV headers to sheet column indices
 * @param {Array} csvHeaders - Headers from CSV file
 * @return {Object} Mapping object with column indices
 */
function mapCSVHeadersToSheet(csvHeaders) {
  const mapping = {};
  
  SIRS_CONFIG.CSV_HEADERS.forEach((expectedHeader, index) => {
    const csvHeaderIndex = csvHeaders.indexOf(expectedHeader);
    if (csvHeaderIndex === -1) {
      throw new Error(`Missing required column: "${expectedHeader}" in CSV`);
    }
    mapping[expectedHeader] = {
      csvIndex: csvHeaderIndex,
      sheetIndex: index
    };
  });
  
  console.log('Column mapping created:', mapping);
  return mapping;
}

// ============================
// SHEET MANAGEMENT FUNCTIONS
// ============================

/**
 * Gets or creates the SIRs sheet
 * @return {Sheet} Google Sheet object
 */
function getOrCreateSIRsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SIRS_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    console.log(`Creating new sheet: ${SIRS_CONFIG.SHEET_NAME}`);
    sheet = spreadsheet.insertSheet(SIRS_CONFIG.SHEET_NAME);
    
    // Set headers with formatting
    const headerRange = sheet.getRange(1, 1, 1, SIRS_CONFIG.SHEET_HEADERS.length);
    headerRange.setValues([SIRS_CONFIG.SHEET_HEADERS])
      .setFontWeight('bold')
      .setBackground('#4a86e8')
      .setFontColor('white')
      .setHorizontalAlignment('center');
    
    // Set column widths
    sheet.setColumnWidths(1, SIRS_CONFIG.SHEET_HEADERS.length, 150);
  }
  
  return sheet;
}

/**
 * Gets all existing SIRs data from the sheet for fast lookup
 * @param {Sheet} sheet - The SIRs sheet
 * @return {Object} Object with bug_id as keys
 */
function getExistingSIRsData(sheet) {
  const existingData = {};
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    const data = sheet.getRange(2, 1, lastRow - 1, SIRS_CONFIG.SHEET_HEADERS.length).getValues();
    
    for (let i = 0; i < data.length; i++) {
      const bugId = data[i][SIRS_CONFIG.BUG_ID_COLUMN];
      if (bugId && bugId.toString().trim() !== '') {
        const bugIdKey = bugId.toString().trim();
        existingData[bugIdKey] = {
          rowIndex: i + 2, // +2 because data starts at row 2
          data: data[i]
        };
      }
    }
  }
  
  return existingData;
}

// ============================
// BATCH PROCESSING FUNCTIONS
// ============================

/**
 * Process all CSV rows in batch
 * @param {Array} csvRows - CSV data rows (without headers)
 * @param {Object} columnMapping - Column mapping object
 * @param {Object} existingData - Existing sheet data
 * @param {Sheet} sheet - The SIRs sheet
 * @return {Object} Results summary
 */
function processAllCSVRows(csvRows, columnMapping, existingData, sheet) {
  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  const newRows = [];
  const updateOperations = [];
  
  // Process each CSV row
  csvRows.forEach((csvRow, index) => {
    try {
      const bugId = getCSVValue(csvRow, 'bug_id', columnMapping);
      
      if (!bugId || bugId.trim() === '') {
        console.warn(`Row ${index + 2}: Missing bug_id, skipping`);
        results.errors++;
        return;
      }
      
      // Prepare sheet row data
      const sheetRow = new Array(SIRS_CONFIG.SHEET_HEADERS.length).fill('');
      
      // Map all columns from CSV to sheet format
      SIRS_CONFIG.CSV_HEADERS.forEach(csvHeader => {
        const mapping = columnMapping[csvHeader];
        const value = csvRow[mapping.csvIndex] || '';
        sheetRow[mapping.sheetIndex] = value.toString().trim();
      });
      
      const trimmedBugId = bugId.trim();
      
      if (existingData[trimmedBugId]) {
        // Existing record - check if update is needed
        const existingRow = existingData[trimmedBugId];
        let needsUpdate = false;
        
        // Compare each column (excluding Bug_id which shouldn't change)
        for (let col = 1; col < sheetRow.length; col++) {
          const existingValue = existingRow.data[col] ? existingRow.data[col].toString().trim() : '';
          const newValue = sheetRow[col] ? sheetRow[col].toString().trim() : '';
          
          if (existingValue !== newValue) {
            needsUpdate = true;
            break;
          }
        }
        
        if (needsUpdate) {
          updateOperations.push({
            rowIndex: existingRow.rowIndex,
            data: sheetRow
          });
          results.updated++;
        } else {
          results.skipped++;
        }
      } else {
        // New record
        newRows.push(sheetRow);
        // Add to existing data to avoid duplicates in this batch
        existingData[trimmedBugId] = { data: sheetRow };
        results.inserted++;
      }
      
    } catch (error) {
      console.error(`Error processing row ${index + 2}:`, error);
      results.errors++;
    }
  });
  
  // Execute batch insert if we have new rows
  if (newRows.length > 0) {
    const lastRow = sheet.getLastRow();
    const insertRange = sheet.getRange(lastRow + 1, 1, newRows.length, SIRS_CONFIG.SHEET_HEADERS.length);
    insertRange.setValues(newRows);
    console.log(`Batch inserted ${newRows.length} new rows`);
  }
  
  // Execute batch updates
  if (updateOperations.length > 0) {
    updateOperations.forEach(op => {
      sheet.getRange(op.rowIndex, 1, 1, SIRS_CONFIG.SHEET_HEADERS.length)
        .setValues([op.data]);
    });
    console.log(`Updated ${updateOperations.length} existing rows`);
  }
  
  return results;
}

// ============================
// UTILITY FUNCTIONS
// ============================

/**
 * Get value from CSV row using column mapping
 * @param {Array} csvRow - CSV row array
 * @param {string} columnName - Column name
 * @param {Object} columnMapping - Column mapping object
 * @return {string} Column value
 */
function getCSVValue(csvRow, columnName, columnMapping) {
  const mapping = columnMapping[columnName];
  if (!mapping || mapping.csvIndex >= csvRow.length) {
    return '';
  }
  return csvRow[mapping.csvIndex] || '';
}

/**
 * Clear all data from the SIRs sheet (keeping headers)
 * @return {string} Result message
 */
function clearSIRsData() {
  try {
    const sheet = getOrCreateSIRsSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, SIRS_CONFIG.SHEET_HEADERS.length).clearContent();
      const message = `Cleared ${lastRow - 1} rows of data from ${SIRS_CONFIG.SHEET_NAME}`;
      console.log(message);
      return message;
    } else {
      const message = 'No data to clear (only headers present)';
      console.log(message);
      return message;
    }
  } catch (error) {
    console.error('Error clearing SIRs data:', error);
    return `Error: ${error.message}`;
  }
}

/**
 * Debug function to check current sheet data
 * @return {string} Debug information
 */
function debugSIRsData() {
  try {
    const sheet = getOrCreateSIRsSheet();
    const lastRow = sheet.getLastRow();
    
    console.log(`=== DEBUG: ${SIRS_CONFIG.SHEET_NAME} SHEET ===`);
    console.log(`Sheet Name: ${sheet.getName()}`);
    console.log(`Last Row: ${lastRow}`);
    
    if (lastRow > 1) {
      const sampleSize = Math.min(5, lastRow - 1);
      const data = sheet.getRange(2, 1, sampleSize, SIRS_CONFIG.SHEET_HEADERS.length).getValues();
      console.log(`Sample Data (first ${sampleSize} rows):`);
      data.forEach((row, index) => {
        console.log(`Row ${index + 2}:`, row);
      });
    }
    
    const existingData = getExistingSIRsData(sheet);
    console.log(`\nExisting Bug Records: ${Object.keys(existingData).length}`);
    
    return 'Debug complete - check View > Logs';
  } catch (error) {
    console.error('Debug error:', error);
    return `Debug error: ${error.message}`;
  }
}

/**
 * Test function to verify script is working
 * @return {string} Test result
 */
function testSIRsFunction() {
  return 'SIRs Upload Script is working correctly!';
}