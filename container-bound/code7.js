/**
 * MAIN ROUTER FOR BACKEND APIs
 * Initializes spreadsheet and routes API requests to corresponding endpoints
 */

// =====================================
// CONFIGURATION SECTION
// =====================================

const SPREADSHEET_ID = '1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w';
const SHEET_NAMES = {
  SYSTEMS_METADATA: 'Systems_Metadata',
  RELEASE_DETAILS: 'Releases_Details',
  SIRS: 'SIRS',
  SIRS_RELEASES: 'SIRs_Releases',
};

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
      throw new Error('Releases_Details sheet not found - 404');
    }
    
    console.log(`Connected to sheet: ${sheets.releaseDetails.getName()}`);
    console.log(`Total rows: ${sheets.releaseDetails.getLastRow()}, Total columns: ${sheets.releaseDetails.getLastColumn()}`);
    
    return { spreadsheet: spreadsheet, sheets: sheets };
    
  } catch (error) {
    console.error('Error initializing spreadsheet:', error.message);
    throw error;
  }
}

// =====================================
//  READ (GET) ROUTES ENDPOINTS
// =====================================


/**
 * Main entry point for READ (GET) requests
 */
function doGet(e) {
  try {
    // Initialize spreadsheet
    const { sheets } = initSpreadsheet();
    
    // Get path from URL
    const path = e.pathInfo || '';
    
    // Route for releases API requests
    if (path === 'releases' || path === 'api/releases') {
      return handleGetReleases(sheets.releaseDetails);
    }

    // Route for systems API
    if (path === 'systems' || path === 'api/systems') {
      return handleGetSystems(sheets.systemsMetadata);
    }

    // Route for SIRs-Releases API
    if (path === 'sirs-releases' || path === 'api/sirs-releases') {
      return handleGetSIRsReleases(sheets.sirsReleases);
    }
    
    // Default response for root
    return createJsonResponse({
      status: 'ok',
      message: 'API Server is running',
      endpoints: {
        releases: '/api/releases',
        systems: '/api/systems',
        sirsReleases: '/api/sirs-releases'
      },
    });
    
  } catch (error) {
    console.error('Router Error:', error.message);
    return createErrorResponse(error.message, 500);
  }
}

// =====================================
//  CREATE (POST) ROUTES ENDPOINTS
// =====================================

/**
 * Main entry point for CREATE (POST) requests
 */
function doPost(e) {
  try {
    // Initialize spreadsheet
    const { sheets } = initSpreadsheet();
    
    // Get path from URL
    const path = e.pathInfo || '';
    
    // Route for releases API requests
    if (path === 'releases' || path === 'api/releases') {
      return handlePostReleases(sheets.releaseDetails, e.postData);
    }
    
    // Default response for unsupported POST paths
    return createErrorResponse('Endpoint not found for POST request', 404);
    
  } catch (error) {
    console.error('Router POST Error:', error.message);
    return createErrorResponse(error.message, 500);
  }
}

// =====================================
//  UPDATE (PUT) ROUTES ENDPOINTS
// =====================================

/**
 * Main entry point for UPDATE (PUT) requests
 */
function doPut(e) {
  try {
    // Initialize spreadsheet
    const { sheets } = initSpreadsheet();
    
    // Get path from URL
    const path = e.pathInfo || '';
    
    // Route for releases API PUT requests
    // Check if path matches /api/releases/REL-XXXXX pattern
    if (path.startsWith('releases/') || path.startsWith('api/releases/')) {
      // Extract the Release_id from the path
      // Example: "api/releases/REL-BXZ8V" -> "REL-BXZ8V"
      const pathParts = path.split('/');
      const releaseId = pathParts[pathParts.length - 1];
      
      return handlePutRelease(sheets.releaseDetails, releaseId, e.postData);
    }
    
    // Default response for unsupported PUT paths
    return createErrorResponse('Endpoint not found for PUT request', 404);
    
  } catch (error) {
    console.error('Router PUT Error:', error.message);
    return createErrorResponse(error.message, 500);
  }
}


// =====================================
// GET REQUEST HANDLERS
// =====================================


/**
 * Handle GET requests for all releases
 */
function handleGetReleases(releaseSheet) {
  try {
    const releases = getAllReleases(releaseSheet);
    
    return createJsonResponse({
      success: true,
      count: releases.length,
      releases: releases,
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
 * Handle GET requests for all systems
 */
function handleGetSystems(systemsSheet) {
  try {
    const systems = getAllSystems(systemsSheet);
    
    return createJsonResponse({
      success: true,
      count: systems.length,
      systems: systems,  // represents the entire systems array
      metadata: {
        header_row: 3,
        data_start_row: 4,
        sheet_name: systemsSheet.getName(),
        last_data_row: systemsSheet.getLastRow()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in handleGetSystems:', error.message);
    return createErrorResponse(`Failed to retrieve systems: ${error.message}`, 500);
  }
}

/**
 * Handle GET requests for all SIRs-Releases
 */
function handleGetSIRsReleases(sirsReleasesSheet) {
  try {
    const sirsReleases = getAllSIRsReleases(sirsReleasesSheet);
    
    return createJsonResponse({
      success: true,
      count: sirsReleases.length,
      sirs_releases: sirsReleases,
      metadata: {
        header_row: 4,
        data_start_row: 5,
        sheet_name: sirsReleasesSheet.getName(),
        last_data_row: sirsReleasesSheet.getLastRow()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in handleGetSIRsReleases:', error.message);
    return createErrorResponse(`Failed to retrieve SIRs-Releases: ${error.message}`, 500);
  }
}

// =====================================
// POST REQUEST HANDLERS
// =====================================

/**
 * Handle POST requests to create new releases
 */
function handlePostReleases(releaseSheet, postData) {
  try {
    // Parse the POST data
    const data = JSON.parse(postData.contents);
    
    // Create new release
    const createdRelease = createNewRelease(releaseSheet, data);
    
    return createJsonResponse({
      success: true,
      message: 'Release created successfully',
      release: createdRelease,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in handlePostReleases:', error.message);
    return createErrorResponse(`Failed to create release: ${error.message}`, 500);
  }
}

// =====================================
// PUT REQUEST HANDLERS
// =====================================

/**
 * Handle PUT requests to update existing releases
 */
function handlePutRelease(releaseSheet, releaseId, postData) {
  try {
    // Parse the PUT data
    const data = JSON.parse(postData.contents);
    
    // Update the release
    const updatedRelease = updateRelease(releaseSheet, releaseId, data);
    
    return createJsonResponse({
      success: true,
      message: 'Release updated successfully',
      release: updatedRelease,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in handlePutRelease:', error.message);
    return createErrorResponse(`Failed to update release: ${error.message}`, 500);
  }
}

// =====================================
// JSON RESPONSE HELPER FUNCTIONS
// =====================================

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