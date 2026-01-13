/**
 * Handles HTTP GET requests
 * @param {Object} e - Event object containing request parameters
 * @returns {ContentService.TextOutput} HTTP response
 */
function doGet(e) {
  console.log('Router: Received GET request');
  // Router logic will go here
  return ContentService.createTextOutput('Router is working');
}

/**
 * Handles HTTP POST requests  
 * @param {Object} e - Event object containing request parameters
 * @returns {ContentService.TextOutput} HTTP response
 */
function doPost(e) {
  console.log('Router: Received POST request');
  // Router logic will go here
  return ContentService.createTextOutput('Router is working');
}