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
      .addItem('Upload SIRs CSV', 'showSIRsCSV')  // ALL FUNCTIONS IN THIS FILE
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

/**
 * SIRs CSV - Simple version (ALL IN THIS FILE)
 */
function showSIRsCSV() {
  try {
    // SIMPLE DIRECT APPROACH - like the online example
    const html = HtmlService.createHtmlOutputFromFile('uploadSIRsDialog')
      .setWidth(500)
      .setHeight(400)
      .setTitle('Upload SIRs CSV');
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Upload SIRs CSV');
  } catch (error) {
    // Fallback - show simple message
    SpreadsheetApp.getUi().alert(
      'Upload SIRs CSV\n\n' +
      'This will upload SIRs (bug tracking) data.\n\n' +
      'Error: ' + error.message
    );
  }
}

// ============================
// SIRs PROCESSING FUNCTION (for HTML dialog)
// ============================

/**
 * Process SIRs CSV - called from HTML dialog
 */
function processSIRsCSV(csvContent) {
  try {
    // Simple test response
    return {
      success: true,
      message: '✅ SIRs CSV processing works!\n\n' +
              'This is a test. Add your CSV processing logic here.'
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ Error: ' + error.message
    };
  }
}

// ============================
// TEST FUNCTION
// ============================

/**
 * Test if menu works
 */
function testMenu() {
  console.log('Testing menu functions...');
  
  // Check all functions exist
  const functions = [
    'onOpen',
    'showSystemsCSV', 
    'showReleasesCSV',
    'showSIRsCSV',
    'processSIRsCSV'
  ];
  
  const results = [];
  functions.forEach(funcName => {
    const exists = typeof this[funcName] === 'function';
    results.push(`${exists ? '✅' : '❌'} ${funcName}`);
  });
  
  console.log(results.join('\n'));
  
  // Force menu creation
  onOpen();
  
  SpreadsheetApp.getUi().alert(
    'Menu Test Results:\n\n' +
    results.join('\n') +
    '\n\nMenu should show 3 items now.'
  );
}