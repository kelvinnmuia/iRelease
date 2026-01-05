/**
 * MAIN ENTRY POINT - UPDATED WITH SIRS MAPPING
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
    
    // Create the main menu
    ui.createMenu('Releases Tools')
      .addItem('Upload Systems CSV', 'showSystemsCSV')
      .addItem('Upload Releases CSV', 'showReleasesCSV')
      .addSeparator()
      .addItem('Upload SIRs CSV', 'showSIRsCSV')
      .addItem('Map Releases SIRs', 'showMapSIRs')
      .addSeparator()
      .addSubMenu(
        ui.createMenu('Debug Tools')
          .addItem('Test SIRs Upload', 'testSIRsUpload')
          .addItem('Test SIRs Mapping', 'testMapSIRsFunction')
          .addItem('Debug SIRs Data', 'debugSIRsData')
          .addItem('Debug Mapping Data', 'debugMapSIRsData')
          .addSeparator()
          .addItem('Clear SIRs Data', 'clearSIRsData')
          .addItem('Clear Releases Data', 'clearReleasesData')
      )
      .addToUi();
    
    console.log('✅ Menu created successfully with SIRs Mapping');
  } catch (error) {
    console.error('Error creating menu:', error.message);
  }
}

// ============================
// SIMPLE MENU FUNCTIONS
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
        'This would open the systems upload dialog.\n\n' +
        'Note: systemUpload.gs may not be loaded.'
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
 * Show SIRs CSV upload dialog
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
// SIRS MAPPING FUNCTION (NEW)
// ============================

/**
 * Show SIRs mapping dialog - Calls the function from mapReleasesSIRs.gs
 */
function showMapSIRs() {
  try {
    // Check if mapping function exists
    if (typeof showMapSIRsDialog === 'function') {
      showMapSIRsDialog();
    } else {
      // Try to create dialog directly if function doesn't exist
      const html = HtmlService.createHtmlOutputFromFile('mapSIRsDialog')
        .setWidth(500)
        .setHeight(500)
        .setTitle('Map Releases SIRs');
      
      SpreadsheetApp.getUi().showModalDialog(html, 'Map Releases SIRs');
    }
  } catch (error) {
    // Comprehensive error handling
    let errorMessage = 'Error opening SIRs mapping dialog: ' + error.message;
    
    // Provide helpful troubleshooting
    if (error.message.includes('mapSIRsDialog')) {
      errorMessage += '\n\nPlease ensure mapSIRsDialog.html exists in your project.';
    } else if (error.message.includes('showMapSIRsDialog')) {
      errorMessage += '\n\nPlease ensure mapReleasesSIRs.gs is loaded in your project.';
    }
    
    SpreadsheetApp.getUi().alert(errorMessage);
    console.error('SIRs Mapping Error:', error);
  }
}

// ============================
// HELPER FUNCTIONS FOR DEBUGGING
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
    
    SpreadsheetApp.getUi().alert(
      'SIRs Upload Test Results:\n\n' +
      results.join('\n') + '\n\n' +
      'Use the Upload SIRs CSV menu item to test.'
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Test Error: ' + error.message);
  }
}

/**
 * Test SIRs mapping functionality (NEW)
 */
function testSIRsMapping() {
  try {
    // Check if mapping functions exist
    const mappingFunctions = ['mapSIRsForRelease', 'showMapSIRsDialog', 'debugMapSIRsData', 'clearReleasesData'];
    const results = [];
    
    mappingFunctions.forEach(funcName => {
      try {
        const exists = typeof eval(funcName) === 'function';
        results.push(`${exists ? '✅' : '❌'} ${funcName}`);
      } catch (e) {
        results.push(`❌ ${funcName} (${e.message})`);
      }
    });
    
    // Test ID generation
    let idTestResult = '❌ ID Generation Test';
    try {
      // Create a mock used IDs set
      const mockUsedIds = new Set(['SRL-ABC12', 'SRL-DEF34']);
      // Try to access generateBatchSirRelIds if it exists
      if (typeof generateBatchSirRelIds === 'function') {
        const testIds = generateBatchSirRelIds(3, mockUsedIds);
        if (testIds.length === 3 && testIds.every(id => id.startsWith('SRL-'))) {
          idTestResult = '✅ ID Generation Test';
        }
      }
    } catch (e) {
      idTestResult = `❌ ID Generation Test (${e.message})`;
    }
    results.push(idTestResult);
    
    SpreadsheetApp.getUi().alert(
      'SIRs Mapping Test Results:\n\n' +
      results.join('\n') + '\n\n' +
      'Use the Map Releases SIRs menu item to test.'
    );
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Test Error: ' + error.message);
  }
}

// ============================
// FORWARDING FUNCTIONS FOR DEBUG MENU
// ============================

/**
 * Forward to testMapSIRsFunction in mapReleasesSIRs.gs
 */
function testMapSIRsFunction() {
  try {
    if (typeof testMapSIRsFunction === 'function') {
      const result = testMapSIRsFunction();
      SpreadsheetApp.getUi().alert(result);
    } else {
      SpreadsheetApp.getUi().alert('testMapSIRsFunction not found in mapReleasesSIRs.gs');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Forward to debugMapSIRsData in mapReleasesSIRs.gs
 */
function debugMapSIRsData() {
  try {
    if (typeof debugMapSIRsData === 'function') {
      const result = debugMapSIRsData();
      SpreadsheetApp.getUi().alert(result);
    } else {
      SpreadsheetApp.getUi().alert('debugMapSIRsData not found in mapReleasesSIRs.gs');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Forward to clearReleasesData in mapReleasesSIRs.gs
 */
function clearReleasesData() {
  try {
    if (typeof clearReleasesData === 'function') {
      const result = clearReleasesData();
      SpreadsheetApp.getUi().alert(result);
    } else {
      SpreadsheetApp.getUi().alert('clearReleasesData not found in mapReleasesSIRs.gs');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Forward to clearSIRsData in uploadSIRs.gs
 */
function clearSIRsData() {
  try {
    if (typeof clearSIRsData === 'function') {
      const result = clearSIRsData();
      SpreadsheetApp.getUi().alert(result);
    } else {
      SpreadsheetApp.getUi().alert('clearSIRsData not found');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Forward to debugSIRsData in uploadSIRs.gs
 */
function debugSIRsData() {
  try {
    if (typeof debugSIRsData === 'function') {
      const result = debugSIRsData();
      SpreadsheetApp.getUi().alert(result);
    } else {
      SpreadsheetApp.getUi().alert('debugSIRsData not found');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}