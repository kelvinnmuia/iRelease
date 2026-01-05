/**
 * SIRs UPLOADER
 * Handles SIRs CSV uploads
 */

const SIRS_CONFIG = {
  SHEET_NAME: 'SIRs',
  SHEET_HEADERS: [
    'Bug_id', 'Open_date', 'Change_date', 'Bug_severity', 'Priority',
    'Assigned_to', 'Reporter', 'Bug_status', 'Resolution', 'Component',
    'Op_sys', 'Short_desc', 'Cf_sirwith'
  ]
};

/**
 * Show SIRs upload dialog
 * Called from main.gs menu
 */
function showSIRsUploadDialog() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('uploadSIRsDialog')
      .setWidth(500)
      .setHeight(400)
      .setTitle('Upload SIRs CSV');
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Upload SIRs CSV');
  } catch (error) {
    console.error('Error showing SIRs dialog:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Process SIRs CSV
 */
function processSIRsCSV(csvContent) {
  try {
    if (!csvContent || csvContent.trim() === '') {
      throw new Error('CSV file is empty');
    }
    
    console.log('Processing SIRs CSV...');
    
    // Get or create sheet
    const sheet = getOrCreateSIRsSheet();
    
    // Parse CSV
    let csvData;
    try {
      csvData = Utilities.parseCsv(csvContent, '\t');
    } catch (e) {
      csvData = Utilities.parseCsv(csvContent, ',');
    }
    
    if (csvData.length < 2) {
      throw new Error('No data rows found in CSV');
    }
    
    console.log(`Found ${csvData.length - 1} rows`);
    
    // Get existing Bug_ids
    const existingBugIds = getExistingBugIds(sheet);
    const headers = csvData[0];
    const newRows = [];
    
    // Process each row
    for (let i = 1; i < csvData.length; i++) {
      const csvRow = csvData[i];
      const sheetRow = mapCSVToSheetRow(csvRow, headers);
      
      const bugId = sheetRow[0];
      if (bugId && !existingBugIds.has(bugId)) {
        newRows.push(sheetRow);
        existingBugIds.add(bugId);
      }
    }
    
    // Write to sheet
    if (newRows.length > 0) {
      const lastRow = sheet.getLastRow();
      const startRow = lastRow > 1 ? lastRow + 1 : 2;
      
      sheet.getRange(startRow, 1, newRows.length, SIRS_CONFIG.SHEET_HEADERS.length)
        .setValues(newRows);
      
      console.log(`Added ${newRows.length} new records`);
    }
    
    return {
      success: true,
      message: `✅ SIRs Upload Complete!\n\n` +
              `• Total rows processed: ${csvData.length - 1}\n` +
              `• New rows added: ${newRows.length}`
    };
    
  } catch (error) {
    console.error('Error in processSIRsCSV:', error);
    return {
      success: false,
      message: `❌ Upload Failed: ${error.message}`
    };
  }
}

/**
 * Get or create SIRs sheet
 */
function getOrCreateSIRsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SIRS_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SIRS_CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, SIRS_CONFIG.SHEET_HEADERS.length)
      .setValues([SIRS_CONFIG.SHEET_HEADERS])
      .setFontWeight('bold');
  }
  
  return sheet;
}

/**
 * Get existing Bug_ids
 */
function getExistingBugIds(sheet) {
  const bugIds = new Set();
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    const bugIdRange = sheet.getRange(2, 1, lastRow - 1, 1);
    const values = bugIdRange.getValues();
    
    values.forEach(row => {
      if (row[0] && row[0].toString().trim() !== '') {
        bugIds.add(row[0].toString().trim());
      }
    });
  }
  
  return bugIds;
}

/**
 * Map CSV row to sheet row
 */
function mapCSVToSheetRow(csvRow, csvHeaders) {
  const sheetRow = new Array(SIRS_CONFIG.SHEET_HEADERS.length).fill('');
  
  csvHeaders.forEach((csvHeader, index) => {
    const value = csvRow[index] || '';
    
    for (let i = 0; i < SIRS_CONFIG.SHEET_HEADERS.length; i++) {
      if (normalizeHeader(SIRS_CONFIG.SHEET_HEADERS[i]) === normalizeHeader(csvHeader)) {
        sheetRow[i] = value.toString().trim();
        break;
      }
    }
  });
  
  return sheetRow;
}

/**
 * Normalize header
 */
function normalizeHeader(header) {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}