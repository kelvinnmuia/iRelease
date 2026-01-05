/**
 * SIRS CSV UPLOADER - ULTRA OPTIMIZED
 * One read → Process in memory → One write
 * Maximum speed for 10,000+ records
 */

// ============================
// CONFIGURATION SECTION
// ============================

const SIRS_CONFIG = {
  SHEET_NAME: 'SIRs',
  SHEET_HEADERS: [
    'Bug_id', 'Open_date', 'Change_date', 'Bug_severity', 'Priority',
    'Assigned_to', 'Reporter', 'Bug_status', 'Resolution', 'Component',
    'Op_sys', 'Short_desc', 'Cf_sirwith'
  ],
  CSV_HEADERS: [
    'bug_id', 'opendate', 'changeddate', 'bug_severity', 'priority',
    'assigned_to', 'reporter', 'bug_status', 'resolution', 'component',
    'op_sys', 'short_desc', 'cf_sirwith'
  ],
  BUG_ID_COLUMN: 0,
  MAX_ROWS_PER_UPLOAD: 10000
};

// ============================
// MAIN PROCESSING FUNCTION - ONE READ, ONE WRITE
// ============================

function processSIRsCSV(csvContent) {
  const startTime = new Date();
  
  try {
    console.log('Starting ultra-optimized SIRs processing...');
    
    // Quick validations
    if (!csvContent || csvContent.trim() === '') {
      throw new Error('CSV file is empty');
    }
    
    // Parse CSV (fast)
    const csvData = Utilities.parseCsv(csvContent);
    
    if (csvData.length <= 1) {
      throw new Error('No data rows in CSV');
    }
    
    const totalRows = csvData.length - 1;
    if (totalRows > SIRS_CONFIG.MAX_ROWS_PER_UPLOAD) {
      throw new Error(`Too many rows: ${totalRows}. Max: ${SIRS_CONFIG.MAX_ROWS_PER_UPLOAD}`);
    }
    
    const sheet = getOrCreateSIRsSheet();
    console.log(`Processing ${totalRows} CSV rows...`);
    
    // ============================
    // STEP 1: READ ENTIRE SHEET INTO MEMORY (ONE READ)
    // ============================
    console.log('Reading entire sheet into memory...');
    const sheetReadStart = new Date();
    
    const allSheetData = sheet.getDataRange().getValues();
    const existingDataMap = new Map(); // Using Map for faster lookups
    const headerRow = allSheetData[0];
    
    // Create mapping from header names to column indices
    const sheetHeaderMap = {};
    headerRow.forEach((header, index) => {
      sheetHeaderMap[header.trim().toLowerCase()] = index;
    });
    
    // Build lookup map of existing bug_ids (fast O(1) lookups)
    for (let i = 1; i < allSheetData.length; i++) {
      const row = allSheetData[i];
      const bugId = row[SIRS_CONFIG.BUG_ID_COLUMN];
      if (bugId && bugId.toString().trim()) {
        existingDataMap.set(bugId.toString().trim().toLowerCase(), {
          rowIndex: i,
          data: row
        });
      }
    }
    
    console.log(`Sheet read completed in ${((new Date() - sheetReadStart) / 1000).toFixed(2)}s`);
    console.log(`Found ${existingDataMap.size} existing records in sheet`);
    
    // ============================
    // STEP 2: PROCESS CSV IN MEMORY
    // ============================
    console.log('Processing CSV data in memory...');
    const processStart = new Date();
    
    const csvHeaders = csvData[0].map(h => h.trim().toLowerCase());
    const csvHeaderMap = {};
    
    // Create CSV column mapping
    SIRS_CONFIG.CSV_HEADERS.forEach((expectedHeader, sheetIndex) => {
      const csvIndex = csvHeaders.indexOf(expectedHeader);
      if (csvIndex === -1) {
        throw new Error(`Missing CSV column: ${expectedHeader}`);
      }
      csvHeaderMap[expectedHeader] = {
        csvIndex: csvIndex,
        sheetIndex: sheetIndex
      };
    });
    
    const results = {
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    // Track which rows need updates
    const rowsToUpdate = new Map(); // rowIndex → newData
    const rowsToInsert = [];
    
    // Process each CSV row
    for (let i = 1; i < csvData.length; i++) {
      try {
        const csvRow = csvData[i];
        const bugId = csvRow[csvHeaderMap['bug_id'].csvIndex];
        
        if (!bugId || !bugId.toString().trim()) {
          results.errors++;
          continue;
        }
        
        const bugIdKey = bugId.toString().trim().toLowerCase();
        
        // Prepare sheet row from CSV
        const sheetRow = new Array(SIRS_CONFIG.SHEET_HEADERS.length).fill('');
        SIRS_CONFIG.CSV_HEADERS.forEach(csvHeader => {
          const mapping = csvHeaderMap[csvHeader];
          const value = csvRow[mapping.csvIndex] || '';
          sheetRow[mapping.sheetIndex] = value.toString().trim();
        });
        
        // Check if exists in current sheet data
        if (existingDataMap.has(bugIdKey)) {
          const existing = existingDataMap.get(bugIdKey);
          const existingRow = existing.data;
          
          // Quick compare - convert to string for fast comparison
          const existingString = existingRow.join('|');
          const newString = sheetRow.join('|');
          
          if (existingString !== newString) {
            // Update needed
            rowsToUpdate.set(existing.rowIndex, sheetRow);
            results.updated++;
            
            // Update in-memory representation
            existingDataMap.set(bugIdKey, {
              rowIndex: existing.rowIndex,
              data: sheetRow
            });
          } else {
            results.skipped++;
          }
        } else {
          // New row
          rowsToInsert.push(sheetRow);
          results.inserted++;
          
          // Add to map (with placeholder rowIndex for new rows)
          existingDataMap.set(bugIdKey, {
            rowIndex: allSheetData.length + rowsToInsert.length - 1,
            data: sheetRow
          });
        }
      } catch (error) {
        results.errors++;
        if (results.errors > 50) {
          console.warn('Too many errors, stopping early');
          break;
        }
      }
    }
    
    console.log(`Memory processing completed in ${((new Date() - processStart) / 1000).toFixed(2)}s`);
    console.log(`Results: ${results.inserted} insert, ${results.updated} update, ${results.skipped} skip, ${results.errors} error`);
    
    // ============================
    // STEP 3: WRITE ALL CHANGES AT ONCE (MINIMAL WRITES)
    // ============================
    console.log('Writing changes to sheet...');
    const writeStart = new Date();
    
    let totalWrites = 0;
    
    // Apply updates in batch (if any)
    if (rowsToUpdate.size > 0) {
      console.log(`Applying ${rowsToUpdate.size} updates...`);
      
      // Group updates by contiguous rows for batch writing
      const sortedUpdates = Array.from(rowsToUpdate.entries())
        .sort((a, b) => a[0] - b[0]);
      
      let batchStart = null;
      let batchRows = [];
      let batchStartRow = null;
      
      for (const [rowIndex, rowData] of sortedUpdates) {
        if (batchStart === null) {
          batchStart = rowIndex;
          batchStartRow = rowIndex;
          batchRows.push(rowData);
        } else if (rowIndex === batchStart + batchRows.length) {
          // Contiguous row
          batchRows.push(rowData);
        } else {
          // Non-contiguous, write current batch
          if (batchRows.length > 0) {
            sheet.getRange(batchStartRow, 1, batchRows.length, SIRS_CONFIG.SHEET_HEADERS.length)
              .setValues(batchRows);
            totalWrites++;
          }
          
          // Start new batch
          batchStart = rowIndex;
          batchStartRow = rowIndex;
          batchRows = [rowData];
        }
      }
      
      // Write final batch
      if (batchRows.length > 0) {
        sheet.getRange(batchStartRow, 1, batchRows.length, SIRS_CONFIG.SHEET_HEADERS.length)
          .setValues(batchRows);
        totalWrites++;
      }
      
      console.log(`Updates applied in ${totalWrites} batch write(s)`);
    }
    
    // Insert new rows in ONE batch write
    if (rowsToInsert.length > 0) {
      console.log(`Inserting ${rowsToInsert.length} new rows in one batch...`);
      
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rowsToInsert.length, SIRS_CONFIG.SHEET_HEADERS.length)
        .setValues(rowsToInsert);
      
      totalWrites++;
      console.log(`Insert completed in one batch write`);
    }
    
    console.log(`All writes completed in ${((new Date() - writeStart) / 1000).toFixed(2)}s`);
    console.log(`Total write operations: ${totalWrites}`);
    
    // ============================
    // STEP 4: RETURN RESULTS
    // ============================
    const totalTime = ((new Date() - startTime) / 1000).toFixed(2);
    
    const message = `SIRs CSV Processing Complete (${totalTime}s):\n` +
                   `✓ ${results.inserted} new records inserted\n` +
                   `✓ ${results.updated} existing records updated\n` +
                   `✓ ${results.skipped} records skipped (no changes)\n` +
                   `✗ ${results.errors} rows had errors\n` +
                   `📊 Sheet operations: ${totalWrites} write(s)\n` +
                   `⚡ Performance: ~${Math.round(totalRows / totalTime)} rows/second`;
    
    console.log(message);
    
    return {
      success: true,
      message: message
    };
    
  } catch (error) {
    console.error('Processing error:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// ============================
// OPTIMIZED SHEET FUNCTIONS
// ============================

function getOrCreateSIRsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SIRS_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SIRS_CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, SIRS_CONFIG.SHEET_HEADERS.length)
      .setValues([SIRS_CONFIG.SHEET_HEADERS])
      .setFontWeight('bold');
    
    // Set practical column widths
    const widths = [120, 100, 100, 90, 70, 120, 120, 100, 100, 120, 90, 250, 120];
    widths.forEach((width, index) => {
      sheet.setColumnWidth(index + 1, width);
    });
  }
  
  return sheet;
}

// ============================
// UTILITY FUNCTIONS
// ============================

function clearSIRsData() {
  try {
    const sheet = getOrCreateSIRsSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, SIRS_CONFIG.SHEET_HEADERS.length).clearContent();
      return `Cleared ${lastRow - 1} rows`;
    }
    return 'Sheet is empty';
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function getSIRsStats() {
  try {
    const sheet = getOrCreateSIRsSheet();
    const lastRow = sheet.getLastRow();
    const dataRows = lastRow > 1 ? lastRow - 1 : 0;
    
    // Sample a few rows to check data
    let sampleData = '';
    if (dataRows > 0) {
      const sample = sheet.getRange(2, 1, Math.min(3, dataRows), 3).getValues();
      sampleData = '\nSample bug_ids: ' + sample.map(row => row[0]).join(', ');
    }
    
    return `SIRs Sheet Stats:\n` +
           `Total rows with data: ${dataRows}\n` +
           `Columns: ${SIRS_CONFIG.SHEET_HEADERS.length}\n` +
           `Max upload: ${SIRS_CONFIG.MAX_ROWS_PER_UPLOAD} records` +
           sampleData;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function testSIRsPerformance() {
  const startTime = new Date();
  
  try {
    // Generate test data
    const testRows = 2000; // Test with 2000 first
    let csv = SIRS_CONFIG.CSV_HEADERS.join(',') + '\n';
    
    for (let i = 1; i <= testRows; i++) {
      csv += [
        `TEST-${i.toString().padStart(6, '0')}`,
        `2024-01-${(i % 30 + 1).toString().padStart(2, '0')}`,
        `2024-01-${(i % 30 + 2).toString().padStart(2, '0')}`,
        ['Low', 'Medium', 'High'][i % 3],
        (i % 5 + 1).toString(),
        `user${i % 10}`,
        `rep${i % 8}`,
        ['Open', 'Closed', 'In Progress'][i % 3],
        i % 2 === 0 ? 'Fixed' : '',
        `Comp${i % 6}`,
        i % 2 === 0 ? 'Windows' : 'Linux',
        `Test issue ${i}`,
        i % 10 === 0 ? 'REL-2024.01' : ''
      ].join(',') + '\n';
    }
    
    const result = processSIRsCSV(csv);
    const totalTime = ((new Date() - startTime) / 1000).toFixed(2);
    
    return `Performance Test (${testRows} rows):\n` +
           `Time: ${totalTime} seconds\n` +
           `Rate: ${Math.round(testRows / totalTime)} rows/second\n\n` +
           result.message;
  } catch (error) {
    return `Test Error: ${error.message}`;
  }
}

function benchmarkSIRs() {
  const tests = [100, 500, 1000, 2000];
  let results = 'SIRs Upload Benchmark:\n\n';
  
  tests.forEach(count => {
    const start = new Date();
    
    try {
      // Quick test generation
      let csv = 'bug_id,opendate\n';
      for (let i = 1; i <= count; i++) {
        csv += `BENCH-${i},2024-01-01\n`;
      }
      
      // Minimal processing
      const parsed = Utilities.parseCsv(csv);
      const time = ((new Date() - start) / 1000).toFixed(3);
      
      results += `${count.toString().padStart(4)} rows: ${time}s (parsing only)\n`;
    } catch (e) {
      results += `${count.toString().padStart(4)} rows: ERROR\n`;
    }
  });
  
  return results;
}