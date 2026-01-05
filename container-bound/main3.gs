/**
 * MAIN ENTRY POINT - SIMPLE WORKING VERSION
 * All functions in one file like the online example
 */

// ============================
// MENU CONFIGURATION
// ============================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Create the main menu - SIMPLE & DIRECT
    ui.createMenu('Releases Tools')
      .addItem('Upload Systems CSV', 'showSystemsCSV')
      .addItem('Upload Releases CSV', 'showReleasesCSV')
      .addSeparator()
      .addItem('Upload SIRs CSV', 'showSIRsCSV')
      .addItem('Map Releases SIRs', 'showMapSIRs')
      .addToUi();
    
    console.log('✅ Menu created successfully');
  } catch (error) {
    console.error('Error creating menu:', error.message);
  }
}

// ============================
// SIMPLE MENU FUNCTIONS (ALL IN THIS FILE)
// ============================

/**
 * Systems CSV - Simple version
 */
function showSystemsCSV() {
  try {
    // Try to call external function if it exists
    if (typeof showUploadDialog === 'function') {
      showUploadDialog();
    } else {
      // Fallback to simple message
      SpreadsheetApp.getUi().alert(
        'Upload Systems CSV\n\n' +
        'This would open the systems upload dialog.'
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Releases CSV - Simple version
 */
function showReleasesCSV() {
  try {
    // Try to load HTML if it exists
    const html = HtmlService.createHtmlOutputFromFile('uploadReleasesDialog')
      .setWidth(550)
      .setHeight(500)
      .setTitle('Upload Releases CSV');
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Upload Releases CSV');
  } catch (error) {
    // Fallback to simple message
    SpreadsheetApp.getUi().alert(
      'Upload Releases CSV\n\n' +
      'This would open the releases upload dialog.\n\n' +
      'Error: ' + error.message
    );
  }
}

// ============================
// SIRS UPLOAD FUNCTION
// ============================

/**
 * Show SIRs CSV upload dialog - Updated version
 */
function showSIRsCSV() {
  try {
    // Create HTML dialog for SIRs upload
    const html = HtmlService.createHtmlOutputFromFile('uploadSIRsDialog')
      .setWidth(600)
      .setHeight(650)
      .setTitle('Upload SIRs CSV');
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Upload SIRs CSV');
  } catch (error) {
    // Fallback with detailed error
    SpreadsheetApp.getUi().alert(
      'Upload SIRs CSV\n\n' +
      'Error opening upload dialog: ' + error.message + '\n\n' +
      'Please ensure uploadSIRsDialog.html exists in your project.'
    );
  }
}

// ============================
// HELPER FUNCTION FOR TESTING
// ============================

/**
 * Test SIRs upload functionality
 */
function testSIRsUpload() {
  try {
    // Check if SIRs functions exist
    const functions = ['processSIRsCSV', 'clearSIRsData', 'debugSIRsData'];
    const results = [];
    
    functions.forEach(funcName => {
      try {
        const exists = typeof eval(funcName) === 'function';
        results.push(`${exists ? '✅' : '❌'} ${funcName}`);
      } catch (e) {
        results.push(`❌ ${funcName} (${e.message})`);
      }
    });
    
    // Create a test CSV with sample data
    const testCSV = 'bug_id,opendate,changeddate,bug_severity,priority,assigned_to,reporter,bug_status,resolution,component,op_sys,short_desc,cf_sirwith\n' +
                   'BUG-001,2023-01-15,2023-01-20,High,1,john.doe,jane.smith,Open,,Authentication,Windows,Login issue,\n' +
                   'BUG-002,2023-02-10,2023-02-12,Medium,2,sarah.lee,mike.wong,Closed,Fixed,Database,Linux,Timeout error,REL-2023.01';
    
    SpreadsheetApp.getUi().alert(
      'SIRs Upload Test Results:\n\n' +
      results.join('\n') + '\n\n' +
      'Test CSV prepared with 2 sample records.\n' +
      'Use the Upload SIRs CSV menu item to test.'
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Test Error: ' + error.message);
  }
}