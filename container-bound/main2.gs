/**
 * MAIN ENTRY POINT
 * Central file that coordinates all modules
 * Only this file has onOpen()
 */

// ============================
// MENU CONFIGURATION
// ============================

/**
 * Creates custom menu when spreadsheet opens
 * This is the ONLY onOpen function in the project
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Create the main menu
    ui.createMenu('Releases Tools')
      .addItem('Upload Systems CSV', 'showSystemsUploadDialog')
      .addItem('Upload Releases CSV', 'showReleasesUploadDialog')
      .addToUi();
    
    console.log('✅ Menu created successfully');
  } catch (error) {
    console.error('❌ Error creating menu:', error.message);
  }
}

// ============================
// FORWARDING FUNCTIONS
// ============================

/**
 * Forward to systems upload dialog
 * Calls function from systemsUpload.gs
 */
function showSystemsUploadDialog() {
  try {
    // This function should exist in systemsUpload.gs
    if (typeof showUploadDialog === 'function') {
      return showUploadDialog();
    } else {
      SpreadsheetApp.getUi().alert(
        'Systems upload function not found. Please check if systemsUpload.gs file exists.'
      );
    }
  } catch (error) {
    console.error('Error calling systems upload:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Forward to releases upload dialog
 */
function showReleasesUploadDialog() {
  try {
    // Direct approach - no recursion
    const html = HtmlService.createHtmlOutputFromFile('uploadReleasesDialog')
      .setWidth(550)
      .setHeight(500)
      .setTitle('Upload Releases CSV');
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Upload Releases CSV');
    
  } catch (error) {
    console.error('Error showing releases dialog:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

// ============================
// TESTING FUNCTIONS
// ============================

/**
 * Test that all modules are connected
 */
function testAllModules() {
  const results = [];
  
  // Test systems module
  try {
    if (typeof processCSV === 'function') {
      results.push('✅ Systems module loaded (processCSV exists)');
    } else {
      results.push('❌ Systems module not found (processCSV missing)');
    }
  } catch (e) {
    results.push('❌ Systems module error: ' + e.message);
  }
  
  // Test releases module
  try {
    if (typeof processReleasesCSV === 'function') {
      results.push('✅ Releases module loaded (processReleasesCSV exists)');
    } else {
      results.push('❌ Releases module not found (processReleasesCSV missing)');
    }
  } catch (e) {
    results.push('❌ Releases module error: ' + e.message);
  }
  
  // Test dialog functions
  try {
    if (typeof showUploadDialog === 'function') {
      results.push('✅ Systems dialog function loaded');
    } else {
      results.push('❌ Systems dialog function missing');
    }
  } catch (e) {
    results.push('❌ Systems dialog error: ' + e.message);
  }
  
  try {
    if (typeof showReleasesUploadDialog === 'function') {
      results.push('✅ Releases dialog function loaded');
    } else {
      results.push('❌ Releases dialog function missing');
    }
  } catch (e) {
    results.push('❌ Releases dialog error: ' + e.message);
  }
  
  // Show results
  const message = results.join('\n');
  console.log(message);
  
  // Also show in UI
  SpreadsheetApp.getUi().alert(
    'Module Test Results:\n\n' + message + 
    '\n\nCheck console for more details.'
  );
  
  return message;
}

/**
 * Quick status check
 */
function checkProjectStatus() {
  const status = {
    menuCreated: true, // Will be set when onOpen runs
    systemsModule: typeof processCSV === 'function',
    releasesModule: typeof processReleasesCSV === 'function',
    systemsDialog: typeof showUploadDialog === 'function',
    releasesDialog: typeof showReleasesUploadDialog === 'function'
  };
  
  return status;
}

/**
 * Reset and reload menu
 */
function refreshMenu() {
  // Clear any existing menu
  try {
    onOpen();
    return 'Menu refreshed. Please reload the spreadsheet.';
  } catch (error) {
    return 'Error refreshing menu: ' + error.message;
  }
}