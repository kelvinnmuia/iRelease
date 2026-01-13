/**
 * SPREADSHEET INITIALIZER AND MAIN ROUTER
 * Standalone Google Apps Script
 * Initializes spreadsheet connection and serves as the main router for API requests
 */

// ============================
// CONFIGURATION SECTION
// ============================

const SPREADSHEET_ID = '1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w';
const SHEET_NAMES = {
  SYSTEMS_METADATA: 'Systems_Metadata',
  RELEASE_DETAILS: 'Releases_Details',
  SIRS: 'SIRs',
  SIRS_RELEASES: 'SIRs_Releases',
};

// ============================
// SPREADSHEET INITIALIZATION
// ============================

/**
 * Initializes connection to Google Spreadsheet and retrieves all sheet references
 * This function serves as the single source of truth for spreadsheet access
 * 
 * @returns {Object} Object containing spreadsheet and sheet references
 * @throws {Error} If spreadsheet or sheets cannot be accessed
 */
function initSpreadsheet() {
  try {
    console.log('Initializing spreadsheet connection...');
    
    // Open the spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    console.log(`Connected to spreadsheet: "${spreadsheet.getName()}"`);
    
    // Get all sheet references
    const sheets = {
      systemsMetadata: spreadsheet.getSheetByName(SHEET_NAMES.SYSTEMS_METADATA),
      releaseDetails: spreadsheet.getSheetByName(SHEET_NAMES.RELEASE_DETAILS),
      sirs: spreadsheet.getSheetByName(SHEET_NAMES.SIRS),
      sirsReleases: spreadsheet.getSheetByName(SHEET_NAMES.SIRS_RELEASES),
    };
    
    // Create a mapping from camelCase keys to uppercase constants for display
    const KEY_DISPLAY_NAMES = {
      systemsMetadata: 'SYSTEMS_METADATA',
      releaseDetails: 'RELEASE_DETAILS',
      sirs: 'SIRS',
      sirsReleases: 'SIRS_RELEASES'
    };
    
    // Validate all sheets exist
    let allSheetsFound = true;
    for (const [key, sheet] of Object.entries(sheets)) {
      if (sheet) {
        // Display only the sheet name followed by row count
        const actualName = sheet.getName();
        console.log(`✓ Found ${actualName} (${sheet.getLastRow()} rows)`);
      } else {
        console.error(`✗ Sheet not found: ${KEY_DISPLAY_NAMES[key] || key}`);
        allSheetsFound = false;
      }
    }
    
    if (!allSheetsFound) {
      throw new Error('One or more required sheets were not found in the spreadsheet');
    }
    
    console.log('Spreadsheet initialization successful!');
    return {
      spreadsheet: spreadsheet,
      sheets: sheets
    };
    
  } catch (error) {
    console.error('Error initializing spreadsheet:', error.message);
    throw error;
  }
}

// ============================
//         MAIN ROUTER
// ============================

/**
 * Handles HTTP GET requests
 * @param {Object} e - Event object containing request parameters
 * @returns {ContentService.TextOutput} HTTP response
 */
function doGet(e) {
  console.log('Router: Received GET request');
  
  try {
    // Initialize spreadsheet connection
    const { sheets } = initSpreadsheet();
    
    // Parse the path from the request
    const path = e.pathInfo || '';
    console.log(`Router: Request path: ${path}`);
    
    // Route to appropriate function based on path
    if (path === 'releases' || path === 'api/releases') {
      return handleGetReleases(sheets.releaseDetails);
    }
    
    // Default response for root or unknown paths
    return createJsonResponse({
      status: 'ok',
      message: 'Release Log API is running',
      endpoints: {
        releases: '/api/releases',
        systems: '/api/systems (coming soon)',
        sirs: '/api/sirs (coming soon)'
      }
    });
    
  } catch (error) {
    console.error('Router Error:', error.message);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Handles HTTP POST requests  
 * @param {Object} e - Event object containing request parameters
 * @returns {ContentService.TextOutput} HTTP response
 */
function doPost(e) {
  console.log('Router: Received POST request');
  // Router logic for POST will go here
  return ContentService.createTextOutput('POST router is working');
}

// ============================
// ROUTER HELPER FUNCTIONS
// ============================

/**
 * Handles GET requests for releases data
 * @param {Sheet} releaseSheet - Releases_Details sheet reference
 * @returns {ContentService.TextOutput} JSON response
 */
function handleGetReleases(releaseSheet) {
  try {
    console.log('Router: Handling releases GET request');
    const releases = getAllReleases(releaseSheet);
    
    return createJsonResponse({
      success: true,
      count: releases.length,
      data: releases,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Router: Error in handleGetReleases:', error.message);
    return createErrorResponse(`Failed to retrieve releases: ${error.message}`, 500);
  }
}

/**
 * Creates a standardized JSON response
 * @param {Object} data - Data to include in response
 * @returns {ContentService.TextOutput} JSON response
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add CORS headers for frontend access
  output.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  
  return output;
}

/**
 * Creates an error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {ContentService.TextOutput} Error response
 */
function createErrorResponse(message, statusCode = 400) {
  return createJsonResponse({
    success: false,
    error: message,
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  });
}

// ============================
// TEST FUNCTIONS
// ============================

/**
 * Test function to verify releases retrieval (run from Apps Script editor)
 */
function testReleasesRetrieval() {
  try {
    console.log('Testing releases retrieval...');
    const { sheets } = initSpreadsheet();
    const releases = getAllReleases(sheets.releaseDetails);
    
    console.log(`Retrieved ${releases.length} releases`);
    if (releases.length > 0) {
      console.log('First release sample:', JSON.stringify(releases[0], null, 2));
    }
    
    return {
      success: true,
      count: releases.length,
      sample: releases[0] || null
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}

