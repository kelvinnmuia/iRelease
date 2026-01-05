/**
 * SYSTEMS METADATA CSV UPLOADER
 * Container-bound script for Google Sheets
 * Manages Systems_Metadata sheet with CSV upload functionality
 */

// ============================
// CONFIGURATION SECTION
// ============================

/**
 * Configuration constants for the script
 * Modify these if your sheet structure changes
 */
const SYSTEMS_CONFIG = {
  // Name of the sheet where systems metadata is stored
  SHEET_NAME: 'Systems_Metadata',
  
  // Sheet column indexes (0-based)
  SHEET_COLUMNS: {
    SYSTEM_ID: 0,
    SYSTEM_NAME: 1,
    DESCRIPTION: 2,
    STATUS: 3,
    SYSTEM_CATEGORY: 4
  },
  
  // Headers for the sheet (includes System_id)
  SHEET_HEADERS: ['System_id', 'System_name', 'Description', 'Status', 'System_category'],
  
  // Expected headers in the uploaded CSV (System_id is NOT included here)
  CSV_HEADERS: ['System_name', 'Description', 'Status', 'System_category'],
  
  // System ID settings
  SYSTEM_ID_PREFIX: 'SYS-',
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
 * Displays the HTML upload dialog
 */
function showUploadDialog() {
  const html = HtmlService.createHtmlOutputFromFile('uploadSystemsDialog')
    .setWidth(500)
    .setHeight(400)
    .setTitle('Upload Systems CSV');
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Upload Systems CSV');
}

// ============================
// CSV PROCESSING & UPSERT LOGIC
// ============================

/**
 * Main function to process uploaded CSV content
 * @param {string} csvContent - The CSV file content as string
 * @return {Object} Result object with success status and message
 */
function processCSV(csvContent) {
  try {
    // Validate CSV content
    if (!csvContent || csvContent.trim() === '') {
      throw new Error('CSV file is empty');
    }
    
    // Parse CSV content
    const csvData = parseCSV(csvContent);
    
    // Validate CSV structure
    if (csvData.length === 0) {
      throw new Error('No data found in CSV');
    }
    
    // Get or create the systems metadata sheet
    const sheet = getOrCreateSheet();
    
    // Get existing systems data
    const existingData = getExistingSystems(sheet);
    
    // Get all used system IDs from the sheet
    const usedSystemIds = getAllSystemIds(sheet);
    
    // Generate guaranteed unique IDs for this batch
    const batchIds = generateBatchSystemIds(csvData.length, usedSystemIds);
    
    // Process each row from CSV
    const results = processCSVRows(csvData, existingData, usedSystemIds, batchIds, sheet);
    
    // Format success message
    const message = `Processing Complete:\n` +
                   `✓ ${results.inserted} new system(s) inserted\n` +
                   `✓ ${results.updated} existing system(s) updated\n` +
                   `✓ ${results.skipped} system(s) skipped (no changes)\n` +
                   `✗ ${results.errors} row(s) had errors`;
    
    return {
      success: true,
      message: message
    };
    
  } catch (error) {
    console.error('Error processing CSV:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// ============================
// ID GENERATION FUNCTIONS (GUARANTEED UNIQUE)
// ============================

/**
 * Generates a batch of guaranteed unique System IDs
 * @param {number} count - Number of IDs needed
 * @param {Set} usedSystemIds - Set of already used system IDs
 * @return {Array} Array of guaranteed unique system IDs
 */
function generateBatchSystemIds(count, usedSystemIds) {
  const newIds = new Set();
  const allUsedIds = new Set(usedSystemIds); // Clone existing IDs
  
  // Generate unique IDs for the batch
  for (let i = 0; i < count; i++) {
    let newId;
    let attempts = 0;
    
    do {
      // Generate random part
      let randomPart = '';
      for (let j = 0; j < SYSTEMS_CONFIG.RANDOM_CHARS; j++) {
        const randomIndex = Math.floor(Math.random() * SYSTEMS_CONFIG.ID_CHARACTERS.length);
        randomPart += SYSTEMS_CONFIG.ID_CHARACTERS.charAt(randomIndex);
      }
      
      newId = SYSTEMS_CONFIG.SYSTEM_ID_PREFIX + randomPart;
      attempts++;
      
      // If we somehow can't find a unique ID (extremely unlikely),
      // add increasing counter to ensure uniqueness
      if (attempts > 100) {
        const timestamp = Date.now().toString(36).slice(-4);
        const counter = i.toString().padStart(3, '0');
        newId = SYSTEMS_CONFIG.SYSTEM_ID_PREFIX + timestamp + counter;
      }
      
    } while (allUsedIds.has(newId) || newIds.has(newId));
    
    newIds.add(newId);
    allUsedIds.add(newId); // Add to tracked IDs for this batch
  }
  
  return Array.from(newIds);
}

/**
 * Generates a single guaranteed unique System ID
 * @param {Set} usedSystemIds - Set of already used system IDs
 * @return {string} Guaranteed unique system ID
 */
function generateSystemID(usedSystemIds) {
  let newId;
  let attempts = 0;
  
  do {
    // Generate random part
    let randomPart = '';
    for (let i = 0; i < SYSTEMS_CONFIG.RANDOM_CHARS; i++) {
      const randomIndex = Math.floor(Math.random() * SYSTEMS_CONFIG.ID_CHARACTERS.length);
      randomPart += SYSTEMS_CONFIG.ID_CHARACTERS.charAt(randomIndex);
    }
    
    newId = SYSTEMS_CONFIG.SYSTEM_ID_PREFIX + randomPart;
    attempts++;
    
    // Fallback mechanism (should never be needed in practice)
    if (attempts > 1000) {
      // Use timestamp + random to guarantee uniqueness
      const timestamp = Date.now().toString(36);
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      newId = SYSTEMS_CONFIG.SYSTEM_ID_PREFIX + timestamp.slice(-3) + randomSuffix.slice(0, 2);
      console.warn('Used fallback ID generation:', newId);
    }
    
  } while (usedSystemIds.has(newId));
  
  return newId;
}

// ============================
// CSV PARSING FUNCTIONS
// ============================

/**
 * Parse CSV content into array of objects
 */
function parseCSV(csvContent) {
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
  
  const hasSystemName = headers.some(header => 
    header.toLowerCase() === 'system_name'
  );
  
  if (!hasSystemName) {
    throw new Error('CSV must contain a System_name column');
  }
  
  const data = [];
  const maxRows = Math.min(lines.length - headerLineIndex - 1, SYSTEMS_CONFIG.MAX_ROWS_PER_UPLOAD);
  
  for (let i = headerLineIndex + 1; i <= headerLineIndex + maxRows; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = parseCSVLine(lines[i]);
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = (values[index] || '').trim();
    });
    
    SYSTEMS_CONFIG.CSV_HEADERS.forEach(header => {
      if (!(header in row)) {
        row[header] = '';
      }
    });
    
    data.push(row);
  }
  
  if (lines.length - headerLineIndex - 1 > SYSTEMS_CONFIG.MAX_ROWS_PER_UPLOAD) {
    console.warn(`CSV has ${lines.length - headerLineIndex - 1} rows, but only processing first ${SYSTEMS_CONFIG.MAX_ROWS_PER_UPLOAD} rows.`);
  }
  
  return data;
}

/**
 * Parse a CSV line, handling quoted commas
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
 * Gets or creates the systems metadata sheet
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SYSTEMS_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SYSTEMS_CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, SYSTEMS_CONFIG.SHEET_HEADERS.length)
      .setValues([SYSTEMS_CONFIG.SHEET_HEADERS])
      .setFontWeight('bold')
      .setBackground('#4a86e8')
      .setFontColor('white');
  }
  
  return sheet;
}

/**
 * Gets existing systems data from the sheet
 */
function getExistingSystems(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};
  
  const data = sheet.getRange(2, 1, lastRow - 1, SYSTEMS_CONFIG.SHEET_HEADERS.length).getValues();
  const existingSystems = {};
  
  data.forEach((row, index) => {
    const systemName = row[SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_NAME];
    if (systemName) {
      existingSystems[systemName.toString().toLowerCase().trim()] = {
        rowIndex: index + 2,
        data: row,
        hasSystemId: row[SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_ID] && 
                     row[SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_ID].toString().trim() !== ''
      };
    }
  });
  
  return existingSystems;
}

/**
 * Gets all existing System IDs from the sheet
 */
function getAllSystemIds(sheet) {
  const usedSystemIds = new Set();
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    const systemIdColumn = SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_ID + 1;
    const systemIds = sheet.getRange(2, systemIdColumn, lastRow - 1, 1).getValues();
    
    systemIds.forEach(row => {
      const systemId = row[0];
      if (systemId && systemId.toString().trim() !== '') {
        usedSystemIds.add(systemId.toString().trim());
      }
    });
  }
  
  return usedSystemIds;
}

/**
 * Process CSV rows and update/insert into sheet
 */
function processCSVRows(csvData, existingSystems, usedSystemIds, batchIds, sheet) {
  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  let batchIdIndex = 0;
  
  csvData.forEach((row, index) => {
    try {
      const systemName = row.System_name;
      if (!systemName || systemName.trim() === '') {
        results.errors++;
        return;
      }
      
      const systemKey = systemName.toLowerCase().trim();
      const existingSystem = existingSystems[systemKey];
      
      // Prepare sheet data array
      const sheetData = [
        '', // System_id placeholder
        systemName.trim(),
        row.Description || '',
        row.Status || '',
        row.System_category || ''
      ];
      
      if (existingSystem) {
        let needsUpdate = false;
        let needsSystemId = false;
        
        // Check if existing row has a System_id
        const existingSystemId = existingSystem.data[SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_ID];
        const hasValidSystemId = existingSystemId && existingSystemId.toString().trim() !== '';
        
        if (!hasValidSystemId) {
          needsSystemId = true;
          needsUpdate = true;
        }
        
        // Check if other columns have changed (skip System_id comparison)
        for (let i = 1; i < sheetData.length; i++) {
          const existingValue = existingSystem.data[i] ? existingSystem.data[i].toString().trim() : '';
          const newValue = sheetData[i] ? sheetData[i].toString().trim() : '';
          
          if (existingValue !== newValue) {
            needsUpdate = true;
            break;
          }
        }
        
        if (needsUpdate) {
          // Set System_id: use existing if valid, otherwise use new from batch
          if (hasValidSystemId) {
            sheetData[SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_ID] = existingSystemId.toString().trim();
          } else {
            sheetData[SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_ID] = batchIds[batchIdIndex];
            usedSystemIds.add(batchIds[batchIdIndex]);
            batchIdIndex++;
          }
          
          // Update the existing row
          sheet.getRange(existingSystem.rowIndex, 1, 1, sheetData.length)
            .setValues([sheetData]);
          
          results.updated++;
        } else {
          results.skipped++;
        }
      } else {
        // New system - insert with new System_id
        sheetData[SYSTEMS_CONFIG.SHEET_COLUMNS.SYSTEM_ID] = batchIds[batchIdIndex];
        sheet.appendRow(sheetData);
        usedSystemIds.add(batchIds[batchIdIndex]);
        batchIdIndex++;
        results.inserted++;
      }
      
    } catch (error) {
      console.error(`Error processing row ${index + 2}:`, error);
      console.error('Row data:', row);
      results.errors++;
    }
  });
  
  return results;
}

// ============================
// DEBUG & UTILITY FUNCTIONS
// ============================

/**
 * Test function to verify script is working
 */
function testFunction() {
  return 'Systems Upload Script is working correctly!';
}

/**
 * Debug function to check current sheet data
 */
function debugSheetData() {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    console.log(`=== DEBUG: ${SYSTEMS_CONFIG.SHEET_NAME} SHEET ===`);
    console.log(`Sheet Name: ${sheet.getName()}`);
    console.log(`Last Row: ${lastRow}`);
    
    if (lastRow > 1) {
      const data = sheet.getRange(1, 1, lastRow, SYSTEMS_CONFIG.SHEET_HEADERS.length).getValues();
      console.log('All Sheet Data:');
      data.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
    }
    
    const existingSystems = getExistingSystems(sheet);
    console.log(`\nExisting Systems Map: ${Object.keys(existingSystems).length} systems`);
    Object.keys(existingSystems).forEach((key, idx) => {
      console.log(`${idx + 1}. "${key}" -> Row ${existingSystems[key].rowIndex}`);
    });
    
    return 'Debug complete - check View > Logs';
  } catch (error) {
    console.error('Debug error:', error);
    return `Debug error: ${error.message}`;
  }
}

/**
 * Clear all data from the Systems_Metadata sheet (keeping headers)
 */
function clearSystemsData() {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, SYSTEMS_CONFIG.SHEET_HEADERS.length).clearContent();
      console.log(`Cleared ${lastRow - 1} rows of data from ${SYSTEMS_CONFIG.SHEET_NAME}`);
      return `Cleared ${lastRow - 1} rows of data. Headers remain.`;
    } else {
      console.log('No data to clear (only headers present)');
      return 'No data to clear (only headers present)';
    }
  } catch (error) {
    console.error('Error clearing data:', error);
    return `Error: ${error.message}`;
  }
}