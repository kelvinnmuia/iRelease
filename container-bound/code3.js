/**
 * MAIN ROUTER FOR BACKEND APIs
 * Initializes spreadsheet and routes API requests to corresponding endpoints
 */

// Configuration
const SPREADSHEET_ID = '1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w';
const SHEET_NAMES = {
  SYSTEMS_METADATA: 'Systems_Metadata',
  RELEASE_DETAILS: 'Releases_Details',
  SIRS: 'SIRS',
  SIRS_RELEASES: 'SIRs_Releases',
};

/**
 * Main entry point for releases GET requests
 */
function doGet(e) {
  try {
    // Initialize spreadsheet
    const { sheets } = initSpreadsheet();
    
    // Get path from URL
    const path = e.pathInfo || '';
    
    // Route requests
    if (path === 'releases' || path === 'api/releases') {
      return handleGetReleases(sheets.releaseDetails);
    }
    
    // Route for testing structure
    if (path === 'test-structure') {
      return handleTestStructure(sheets.releaseDetails);
    }
    
    // Default response for root
    return createJsonResponse({
      status: 'ok',
      message: 'Releases API is running',
      endpoints: {
        releases: '/api/releases',
        test_structure: '/api/test-structure'
      },
      note: 'Headers start at row 4, data from row 5'
    });
    
  } catch (error) {
    console.error('Router Error:', error.message);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Initialize spreadsheet connection
 */
function initSpreadsheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    const sheets = {
      systemsMetadata: spreadsheet.getSheetByName(SHEET_NAMES.SYSTEMS_METADATA),
      releaseDetails: spreadsheet.getSheetByName(SHEET_NAMES.RELEASE_DETAILS),
      sirs: spreadsheet.getSheetByName(SHEET_NAMES.SIRS),
      sirsReleases: spreadsheet.getSheetByName(SHEET_NAMES.SIRS_RELEASES),
    };
    
    // Validate required sheet exists
    if (!sheets.releaseDetails) {
      throw new Error('Releases_Details sheet not found');
    }
    
    console.log(`Connected to sheet: ${sheets.releaseDetails.getName()}`);
    console.log(`Total rows: ${sheets.releaseDetails.getLastRow()}, Total columns: ${sheets.releaseDetails.getLastColumn()}`);
    
    return { spreadsheet: spreadsheet, sheets: sheets };
    
  } catch (error) {
    console.error('Error initializing spreadsheet:', error.message);
    throw error;
  }
}

/**
 * Handle GET requests for all releases
 */
function handleGetReleases(releaseSheet) {
  try {
    const releases = getAllReleases(releaseSheet);
    
    return createJsonResponse({
      success: true,
      count: releases.length,
      data: releases,
      metadata: {
        header_row: 4,
        data_start_row: 5,
        sheet_name: releaseSheet.getName(),
        last_data_row: releaseSheet.getLastRow()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in handleGetReleases:', error.message);
    return createErrorResponse(`Failed to retrieve releases: ${error.message}`, 500);
  }
}

/**
 * Handle test structure request
 */
function handleTestStructure(releaseSheet) {
  try {
    const testResult = testReleaseStructure(releaseSheet);
    return createJsonResponse(testResult);
  } catch (error) {
    return createErrorResponse(`Failed to test structure: ${error.message}`, 500);
  }
}

/**
 * Create JSON response
 */
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Create error response
 */
function createErrorResponse(message, statusCode = 400) {
  return createJsonResponse({
    success: false,
    error: message,
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  });
}

/**
 * Test function (for manual testing in Apps Script editor)
 */
function testReleasesAPI() {
  try {
    const { sheets } = initSpreadsheet();
    
    // Test the structure first
    console.log('Testing sheet structure...');
    const structureTest = testReleaseStructure(sheets.releaseDetails);
    console.log('Structure test:', structureTest);
    
    // Then get all releases
    console.log('\nGetting all releases...');
    const releases = getAllReleases(sheets.releaseDetails);
    
    console.log(`Test successful: Retrieved ${releases.length} releases`);
    if (releases.length > 0) {
      console.log('Sample release:', JSON.stringify(releases[0], null, 2));
    }
    
    return {
      success: true,
      structure_test: structureTest,
      count: releases.length,
      sample: releases[0] || null
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return { success: false, error: error.message };
  }
}