/**
 * SIRS PER RELEASE REST APIs
 * Handles all the CRUD operations for the SIRs_Releases sheet
 */

// =====================================
// CONFIGURATION
// =====================================

const SIRS_MAPPING_CONFIG = {
  SIR_REL_ID_PREFIX: 'SRL-',
  RANDOM_CHARS: 5,
  ID_CHARACTERS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // No I, O, 0, 1
  MAX_SIRS_PER_BATCH: 500
};


// =====================================
// READ (GET) OPERATIONS ENDPOINTS
// =====================================

/**
 * Retrieves all SIRs linked to any given Release from SIRs_Releases sheet
 * Headers are at row 4, data starts at row 5
 * 
 * @param {Sheet} sirsReleasesSheet - Google Sheet object for SIRs_Releases
 * @returns {Array} Array of SIRs-Releases objects in JSON format
 */
function getAllSIRsReleases(sirsReleasesSheet) {
  try {
    // Get the last row with data
    const lastRow = sirsReleasesSheet.getLastRow();
    const lastColumn = sirsReleasesSheet.getLastColumn();

    // Check if we have enough rows (at least header row + data)
    if (lastRow < 5) {
      console.log('Not enough rows: headers at row 4, need at least row 5 for data');
      return [];
    }

    // Get headers from row 4 (index 3 in 0-based)
    const headerRange = sirsReleasesSheet.getRange(4, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];

    // Get data starting from row 5
    const dataStartRow = 5;
    const dataRowCount = lastRow - 4; // Subtract header row and rows above
    const dataRange = sirsReleasesSheet.getRange(dataStartRow, 1, dataRowCount, lastColumn);
    const sheetData = dataRange.getValues();

    // Convert rows to objects
    const sirsReleases = [];
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];

      // Skip empty rows (where first cell is empty)
      if (!row[0]) continue;

      const sirsRelease = {};
      for (let j = 0; j < headers.length; j++) {
        if (headers[j]) {
          sirsRelease[headers[j]] = row[j];
        }
      }
      sirsReleases.push(sirsRelease);
    }

    console.log(`Retrieved ${sirsReleases.length} SIRs-Releases (headers row 4, data from row 5)`);
    return sirsReleases;

  } catch (error) {
    console.error(`Error retrieving SIRs-Releases: ${error.message}`);
    throw new Error(`Failed to retrieve SIRs-Releases: ${error.message}`);
  }
}

// =====================================
// MAP SIRS MAIN FUNCTION
// =====================================

/**
 * Maps SIRs from SIRs sheet to SIRs_Releases sheet for a specific release
 * 
 * @param {Sheet} sirsSheet - Source SIRs sheet
 * @param {Sheet} sirsReleasesSheet - Target SIRs_Releases sheet
 * @param {string} releaseVersion - Release version
 * @param {string} iteration - Iteration number
 * @param {string|Array} sirIdsInput - Comma-separated string or array of SIR IDs
 * @returns {Object} Mapping results with counts and details
 */
function mapSIRsForRelease(sirsSheet, sirsReleasesSheet, releaseVersion, iteration, sirIdsInput) {
  try {
    console.log(`=== Starting Map SIRs for ${releaseVersion}, iteration ${iteration} ===`);
    
    // Parse SIR IDs
    let sirIds;
    if (Array.isArray(sirIdsInput)) {
      sirIds = sirIdsInput;
    } else {
      sirIds = sirIdsInput.toString()
        .split(/[\n,]+/)
        .map(id => id.trim())
        .filter(id => id !== '');
    }
    
    console.log(`Parsed ${sirIds.length} SIR IDs:`, sirIds);
    
    if (sirIds.length === 0) {
      throw new Error('No valid SIR IDs found');
    }
    
    if (sirIds.length > SIRS_MAPPING_CONFIG.MAX_SIRS_PER_BATCH) {
      throw new Error(`Maximum ${SIRS_MAPPING_CONFIG.MAX_SIRS_PER_BATCH} SIRs allowed per batch`);
    }
    
    // Remove duplicates
    sirIds = [...new Set(sirIds)];
    console.log(`After removing duplicates: ${sirIds.length} unique SIRs`);
    
    // Get existing SIRs data
    const sirsData = getSIRsDataForMapping(sirsSheet);
    console.log(`Found ${Object.keys(sirsData).length} SIRs in source sheet`);
    
    // Get existing SIRs-Releases data
    const releasesData = getSIRsReleasesDataForMapping(sirsReleasesSheet);
    console.log(`Found ${Object.keys(releasesData).length} existing mappings`);
    
    // Get all used Sir_Rel_Ids
    const usedSirRelIds = getUsedSirRelIdsForMapping(sirsReleasesSheet);
    console.log(`Found ${usedSirRelIds.size} used Sir_Rel_Ids`);
    
    // Process mapping
    const results = processSIRsMapping(
      sirIds, 
      releaseVersion, 
      iteration, 
      sirsData, 
      releasesData, 
      usedSirRelIds, 
      sirsReleasesSheet
    );
    
    console.log(`=== Mapping completed ===`);
    console.log(`Inserted: ${results.inserted}, Updated: ${results.updated}, Skipped: ${results.skipped}`);
    
    return {
      releaseVersion: releaseVersion,
      iteration: iteration,
      totalSIRs: sirIds.length,
      ...results
    };
    
  } catch (error) {
    console.error('Error in mapSIRsForRelease:', error);
    throw error;
  }
}

/**
 * Get SIRs data from source sheet for mapping
 */
function getSIRsDataForMapping(sirsSheet) {
  try {
    const lastRow = sirsSheet.getLastRow();
    if (lastRow < 5) {
      console.log('SIRs sheet has less than 5 rows (no data)');
      return {};
    }
    
    const lastColumn = sirsSheet.getLastColumn();
    const headers = sirsSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
    const data = sirsSheet.getRange(5, 1, lastRow - 4, lastColumn).getValues();
    
    const sirIdIndex = headers.indexOf('Bug_id');
    if (sirIdIndex === -1) {
      console.log('Bug_id column not found in SIRs sheet');
      return {};
    }
    
    const sirsData = {};
    
    data.forEach((row, index) => {
      const bugId = row[sirIdIndex];
      if (bugId) {
        const bugIdStr = bugId.toString().trim();
        sirsData[bugIdStr] = {
          rowIndex: index + 5,
          data: row,
          headers: headers
        };
      }
    });
    
    return sirsData;
    
  } catch (error) {
    console.error('Error in getSIRsDataForMapping:', error);
    return {};
  }
}

/**
 * Get existing SIRs-Releases data for duplicate checking
 */
function getSIRsReleasesDataForMapping(sirsReleasesSheet) {
  try {
    const lastRow = sirsReleasesSheet.getLastRow();
    if (lastRow < 5) {
      console.log('SIRs_Releases sheet has less than 5 rows (no data)');
      return {};
    }
    
    const lastColumn = sirsReleasesSheet.getLastColumn();
    const headers = sirsReleasesSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
    const data = sirsReleasesSheet.getRange(5, 1, lastRow - 4, lastColumn).getValues();
    
    const sirIdIndex = headers.indexOf('Sir_id');
    const releaseVersionIndex = headers.indexOf('Release_version');
    const iterationIndex = headers.indexOf('Iteration');
    
    if (sirIdIndex === -1 || releaseVersionIndex === -1 || iterationIndex === -1) {
      console.log('Required columns not found in SIRs_Releases sheet');
      return {};
    }
    
    const releasesData = {};
    
    data.forEach((row, index) => {
      const sirId = row[sirIdIndex];
      const releaseVersion = row[releaseVersionIndex];
      const iteration = row[iterationIndex];
      
      if (sirId && releaseVersion && iteration) {
        const compositeKey = `${sirId.toString().trim()}|${releaseVersion.toString().trim()}|${iteration.toString().trim()}`;
        releasesData[compositeKey] = {
          rowIndex: index + 5,
          data: row,
          sirRelId: row[headers.indexOf('Sir_Rel_Id')]
        };
      }
    });
    
    return releasesData;
    
  } catch (error) {
    console.error('Error in getSIRsReleasesDataForMapping:', error);
    return {};
  }
}

/**
 * Get all used Sir_Rel_Ids from target sheet for mapping
 */
function getUsedSirRelIdsForMapping(sirsReleasesSheet) {
  const usedIds = new Set();
  
  try {
    const lastRow = sirsReleasesSheet.getLastRow();
    
    if (lastRow >= 5) {
      const lastColumn = sirsReleasesSheet.getLastColumn();
      const headers = sirsReleasesSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
      const sirRelIdIndex = headers.indexOf('Sir_Rel_Id');
      
      if (sirRelIdIndex !== -1) {
        const sirRelIds = sirsReleasesSheet.getRange(5, sirRelIdIndex + 1, lastRow - 4, 1).getValues();
        sirRelIds.forEach(row => {
          const sirRelId = row[0];
          if (sirRelId && sirRelId.toString().trim() !== '') {
            usedIds.add(sirRelId.toString().trim());
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in getUsedSirRelIdsForMapping:', error);
  }
  
  return usedIds;
}

/**
 * Generate unique Sir_Rel_Id
 */
function generateUniqueSirRelId(usedIds) {
  let newId;
  let attempts = 0;
  
  do {
    let randomPart = '';
    for (let j = 0; j < SIRS_MAPPING_CONFIG.RANDOM_CHARS; j++) {
      const randomIndex = Math.floor(Math.random() * SIRS_MAPPING_CONFIG.ID_CHARACTERS.length);
      randomPart += SIRS_MAPPING_CONFIG.ID_CHARACTERS.charAt(randomIndex);
    }
    
    newId = SIRS_MAPPING_CONFIG.SIR_REL_ID_PREFIX + randomPart;
    attempts++;
    
    // Fallback for extreme cases
    if (attempts > 50) {
      const timestamp = Date.now().toString(36).slice(-4);
      newId = SIRS_MAPPING_CONFIG.SIR_REL_ID_PREFIX + timestamp;
      break;
    }
    
  } while (usedIds.has(newId));
  
  usedIds.add(newId);
  return newId;
}

/**
 * Check if existing row needs update
 */
function checkIfUpdateNeeded(sourceData, existingData, sourceHeaders, targetHeaders) {
  // Field mapping between source and target
  const fieldMapping = {
    'Change_date': 'Change_date',
    'Bug_severity': 'Bug_severity',
    'Priority': 'Priority',
    'Assigned_to': 'Assigned_to',
    'Bug_status': 'Bug_status',
    'Resolution': 'Resolution',
    'Component': 'Component',
    'Op_sys': 'Op_sys',
    'Short_desc': 'Short_desc',
    'Cf_sirwith': 'Cf_sirwith'
  };
  
  for (const [sourceField, targetField] of Object.entries(fieldMapping)) {
    const sourceIndex = sourceHeaders.indexOf(sourceField);
    const targetIndex = targetHeaders.indexOf(targetField);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newValue = sourceData[sourceIndex] ? sourceData[sourceIndex].toString().trim() : '';
      const existingValue = existingData[targetIndex] ? existingData[targetIndex].toString().trim() : '';
      
      if (newValue !== existingValue) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Process SIRs mapping
 */
function processSIRsMapping(sirIds, releaseVersion, iteration, sirsData, releasesData, usedSirRelIds, sirsReleasesSheet) {
  const results = {
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    notFound: [],
    errors: 0
  };
  
  try {
    // Get headers from target sheet
    const lastColumn = sirsReleasesSheet.getLastColumn();
    const headers = sirsReleasesSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
    
    // Field mapping between source and target
    const fieldMapping = {
      'Change_date': 'Change_date',
      'Bug_severity': 'Bug_severity',
      'Priority': 'Priority',
      'Assigned_to': 'Assigned_to',
      'Bug_status': 'Bug_status',
      'Resolution': 'Resolution',
      'Component': 'Component',
      'Op_sys': 'Op_sys',
      'Short_desc': 'Short_desc',
      'Cf_sirwith': 'Cf_sirwith'
    };
    
    // Process each SIR ID
    for (const sirId of sirIds) {
      try {
        // Check if SIR exists in source data
        if (!sirsData[sirId]) {
          console.log(`SIR ${sirId} not found in source sheet`);
          results.notFound.push(sirId);
          continue;
        }
        
        const compositeKey = `${sirId}|${releaseVersion}|${iteration}`;
        const existingRelease = releasesData[compositeKey];
        const sirSourceData = sirsData[sirId].data;
        const sourceHeaders = sirsData[sirId].headers;
        
        // Prepare new row data
        const newRow = new Array(headers.length).fill('');
        
        // Set composite key fields
        const sirIdIndex = headers.indexOf('Sir_id');
        const releaseVersionIndex = headers.indexOf('Release_version');
        const iterationIndex = headers.indexOf('Iteration');
        const sirRelIdIndex = headers.indexOf('Sir_Rel_Id');
        
        if (sirIdIndex !== -1) newRow[sirIdIndex] = sirId;
        if (releaseVersionIndex !== -1) newRow[releaseVersionIndex] = releaseVersion;
        if (iterationIndex !== -1) newRow[iterationIndex] = iteration;
        
        if (existingRelease) {
          // Check if update is needed
          const needsUpdate = checkIfUpdateNeeded(
            sirSourceData, 
            existingRelease.data, 
            sourceHeaders, 
            headers
          );
          
          if (needsUpdate) {
            // Update existing row (preserve Sir_Rel_Id)
            newRow[sirRelIdIndex] = existingRelease.sirRelId;
            
            // Copy other fields from source
            Object.entries(fieldMapping).forEach(([sourceField, targetField]) => {
              const sourceIndex = sourceHeaders.indexOf(sourceField);
              const targetIndex = headers.indexOf(targetField);
              
              if (sourceIndex !== -1 && targetIndex !== -1 && sirSourceData[sourceIndex] !== undefined) {
                newRow[targetIndex] = sirSourceData[sourceIndex];
              }
            });
            
            // Update the row
            sirsReleasesSheet.getRange(existingRelease.rowIndex, 1, 1, newRow.length).setValues([newRow]);
            console.log(`✓ Updated SIR ${sirId} at row ${existingRelease.rowIndex}`);
            results.updated++;
          } else {
            console.log(`✓ SIR ${sirId} skipped (no changes needed)`);
            results.skipped++;
          }
        } else {
          // Insert new row with generated Sir_Rel_Id
          const newSirRelId = generateUniqueSirRelId(usedSirRelIds);
          newRow[sirRelIdIndex] = newSirRelId;
          
          // Copy fields from source
          Object.entries(fieldMapping).forEach(([sourceField, targetField]) => {
            const sourceIndex = sourceHeaders.indexOf(sourceField);
            const targetIndex = headers.indexOf(targetField);
            
            if (sourceIndex !== -1 && targetIndex !== -1 && sirSourceData[sourceIndex] !== undefined) {
              newRow[targetIndex] = sirSourceData[sourceIndex];
            }
          });
          
          // Append new row
          const lastRow = sirsReleasesSheet.getLastRow();
          const insertRow = lastRow < 5 ? 5 : lastRow + 1;
          sirsReleasesSheet.getRange(insertRow, 1, 1, newRow.length).setValues([newRow]);
          console.log(`✓ Inserted SIR ${sirId} at row ${insertRow} with ID ${newSirRelId}`);
          results.inserted++;
        }
        
        results.processed++;
        
      } catch (error) {
        console.error(`Error processing SIR ${sirId}:`, error);
        results.errors++;
      }
    }
  } catch (error) {
    console.error('Error in processSIRsMapping:', error);
    throw error;
  }
  
  return results;
}

// =====================================
// UPDATE (PUT) OPERATIONS ENDPOINTS
// =====================================

/**
 * Updates an existing SIRs-Release in SIRs_Releases sheet
 * Simple approach: Find row by SIR_Release_id and update it
 * 
 * @param {Sheet} sirsReleasesSheet - Google Sheet object for SIRs_Releases
 * @param {string} sirReleaseId - The SIR_Release_id to update
 * @param {Object} updateData - New data for the SIRs-Release
 * @returns {Object} Updated SIRs-Release object
 */
function updateSIRsRelease(sirsReleasesSheet, sirReleaseId, updateData) {
  try {
    console.log(`Updating SIRs-Release ${sirReleaseId} with data:`, updateData);

    // Get all data from sheet
    const lastRow = sirsReleasesSheet.getLastRow();
    const lastColumn = sirsReleasesSheet.getLastColumn();

    if (lastRow < 5) {
      throw new Error('No data in sheet');
    }

    // Get headers
    const headers = sirsReleasesSheet.getRange(4, 1, 1, lastColumn).getValues()[0];

    // Get all data rows
    const dataRange = sirsReleasesSheet.getRange(5, 1, lastRow - 4, lastColumn);
    const allData = dataRange.getValues();

    // Find row with matching SIR_Release_id
    // Assuming the ID field is named 'SIR_Release_id' in the headers
    const sirReleaseIdIndex = headers.indexOf('Sir_Rel_Id');
    let targetRow = -1;

    for (let i = 0; i < allData.length; i++) {
      if (allData[i][sirReleaseIdIndex] === sirReleaseId) {
        targetRow = i + 5; // Convert to actual row number
        break;
      }
    }

    if (targetRow === -1) {
      throw new Error(`SIRs-Release ${sirReleaseId} not found`);
    }

    // Merge update data with SIR_Release_id
    const finalData = {
      SIR_Release_id: sirReleaseId,
      ...updateData
    };

    // Build updated row
    const updatedRow = headers.map(header => finalData[header] || '');

    // Update the row
    sirsReleasesSheet.getRange(targetRow, 1, 1, updatedRow.length).setValues([updatedRow]);

    console.log(`✓ Updated SIRs-Release ${sirReleaseId} at row ${targetRow}`);
    return finalData;

  } catch (error) {
    console.error(`Update SIRs-Release failed: ${error.message}`);
    throw error;
  }
}

// =====================================
// DELETE OPERATIONS ENDPOINTS
// =====================================

/**
 * Deletes a SIRs-Release from SIRs_Releases sheet by SIR_Release_id
 * Simple approach: Find row by SIR_Release_id and delete it
 * 
 * @param {Sheet} sirsReleasesSheet - Google Sheet object for SIRs_Releases
 * @param {string} sirReleaseId - The SIR_Release_id to delete
 * @returns {Object} The deleted SIRs-Release object
 */
function deleteSIRsRelease(sirsReleasesSheet, sirReleaseId) {
  try {
    console.log(`Finding and deleting SIRs-Release: ${sirReleaseId}`);

    // Get all data from sheet
    const lastRow = sirsReleasesSheet.getLastRow();
    const lastColumn = sirsReleasesSheet.getLastColumn();

    if (lastRow < 5) {
      throw new Error('No data in sheet');
    }

    // Get headers
    const headers = sirsReleasesSheet.getRange(4, 1, 1, lastColumn).getValues()[0];

    // Get all data rows
    const dataRange = sirsReleasesSheet.getRange(5, 1, lastRow - 4, lastColumn);
    const allData = dataRange.getValues();

    // Find row with matching SIR_Release_id
    const sirReleaseIdIndex = headers.indexOf('Sir_Rel_Id');
    let targetRow = -1;
    let sirReleaseData = null;

    for (let i = 0; i < allData.length; i++) {
      if (allData[i][sirReleaseIdIndex] === sirReleaseId) {
        targetRow = i + 5; // Convert to actual row number

        // Build SIRs-Release object before deleting
        sirReleaseData = {};
        for (let j = 0; j < headers.length; j++) {
          sirReleaseData[headers[j]] = allData[i][j];
        }
        break;
      }
    }

    if (targetRow === -1) {
      throw new Error(`SIRs-Release ${sirReleaseId} not found`);
    }

    // Delete the row
    sirsReleasesSheet.deleteRow(targetRow);

    console.log(`✓ Deleted SIRs-Release ${sirReleaseId} from row ${targetRow}`);
    return sirReleaseData;

  } catch (error) {
    console.error(`Delete SIRs-Release failed: ${error.message}`);
    throw error;
  }
}


/**
 * Deletes multiple SIRs-Releases from SIRs_Releases sheet
 * Simple approach: Find rows by SIR_Release_ids and delete them
 * 
 * @param {Sheet} sirsReleasesSheet - Google Sheet object for SIRs_Releases
 * @param {Array} sirReleaseIds - Array of SIR_Release_ids to delete
 * @returns {Object} Results of bulk delete operation
 */
function bulkDeleteSIRsReleases(sirsReleasesSheet, sirReleaseIds) {
  try {
    console.log(`Bulk deleting ${sirReleaseIds.length} SIRs-Releases:`, sirReleaseIds);
    
    // Get all data from sheet
    const lastRow = sirsReleasesSheet.getLastRow();
    const lastColumn = sirsReleasesSheet.getLastColumn();
    
    if (lastRow < 5) {
      throw new Error('No data in sheet');
    }
    
    // Get headers
    const headers = sirsReleasesSheet.getRange(4, 1, 1, lastColumn).getValues()[0];
    
    // Get all data rows
    const dataRange = sirsReleasesSheet.getRange(5, 1, lastRow - 4, lastColumn);
    const allData = dataRange.getValues();
    
    // Find SIR_Release_id column index
    const sirReleaseIdIndex = headers.indexOf('Sir_Rel_Id');
    
    // Track results
    const deletedSIRsReleases = [];
    const notFound = [];
    
    // Find all target rows (store row numbers and data)
    const rowsToDelete = [];
    const rowsData = [];
    
    for (let i = 0; i < allData.length; i++) {
      const currentSirReleaseId = allData[i][sirReleaseIdIndex];
      
      if (sirReleaseIds.includes(currentSirReleaseId)) {
        const targetRow = i + 5; // Convert to actual row number
        
        // Build SIRs-Release object before deleting
        const sirReleaseData = {};
        for (let j = 0; j < headers.length; j++) {
          sirReleaseData[headers[j]] = allData[i][j];
        }
        
        rowsToDelete.push(targetRow);
        rowsData.push(sirReleaseData);
      }
    }
    
    // Check for not found IDs
    const foundIds = rowsData.map(sirRelease => sirRelease.Sir_Rel_Id);
    sirReleaseIds.forEach(id => {
      if (!foundIds.includes(id)) {
        notFound.push(id);
      }
    });
    
    // Delete rows in reverse order to maintain correct row numbers
    rowsToDelete.sort((a, b) => b - a); // Sort descending
    
    for (let i = 0; i < rowsToDelete.length; i++) {
      sirsReleasesSheet.deleteRow(rowsToDelete[i]);
    }
    
    // Add all successfully deleted SIRs-Releases to results
    deletedSIRsReleases.push(...rowsData);
    
    console.log(`✓ Bulk delete completed: ${deletedSIRsReleases.length} deleted, ${notFound.length} not found`);
    
    return {
      deletedCount: deletedSIRsReleases.length,
      deletedSIRsReleases: deletedSIRsReleases,
      notFound: notFound
    };
    
  } catch (error) {
    console.error(`Bulk delete SIRs-Releases failed: ${error.message}`);
    throw error;
  }
}

// =====================================
// TEST FUNCTION FOR PUT ENDPOINT
// =====================================

/**
 * Test PUT with specific SIRs-Release ID
 */
function testPutSIRsReleaseWithId() {
  // Replace with your actual SIRs-Release ID
  const SIR_RELEASE_ID = 'SRL-ABHHT'; // Change this to your SIRs-Release ID

  const sheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w')
    .getSheetByName('SIRs_Releases');

  const result = updateSIRsRelease(sheet, SIR_RELEASE_ID, {
    // Add your update fields here based on your sheet headers
    // Example fields (adjust based on your actual column names):
    Sir_Rel_Id: "SRL-ABHHT",
    Sir_id: "121640",
    Release_version: "3.9.300.1",
    Iteration: "1",
    Change_date: "23 Jul 2025",
    Bug_severity: "medium",
    Priority: "P2",
    Assigned_to: "taotao.zhao@atos.net",
    Bug_status: "CLOSED",
    Resolution: "FIXED",
    Component: "COO",
    Op_sys: "All",
    Short_desc: "[KRA COO] Email Notification upon Approval of a COO",
    Cf_sirwith: "under user"
  });

  return `Updated SIRs-Release ${SIR_RELEASE_ID}`;
}

/**
 * Test DELETE with specific SIRs-Release ID
 */
function testDeleteSIRsReleaseWithId() {
  // Replace with your actual SIRs-Release ID
  const SIR_RELEASE_ID = 'SRL-EHJEU'; // Change this to your SIRs-Release ID

  const sheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w')
    .getSheetByName('SIRs_Releases');

  const result = deleteSIRsRelease(sheet, SIR_RELEASE_ID);

  return `Deleted SIRs-Release ${SIR_RELEASE_ID}`;
}


/**
 * Test BULK DELETE with multiple SIRs-Release IDs
 */
function testBulkDeleteSIRsReleasesWithIds() {
  // Replace with your actual SIRs-Release IDs
  const SIR_RELEASE_IDS = ['SRL-BUF4V', 'SRL-NUVZ2']; // Change these to your SIRs-Release IDs
  
  const sheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w')
    .getSheetByName('SIRs_Releases');
  
  const result = bulkDeleteSIRsReleases(sheet, SIR_RELEASE_IDS);
  
  return `Bulk deleted ${result.deletedCount} SIRs-Releases, ${result.notFound.length} not found`;
}

// =====================================
// TEST FUNCTION
// =====================================

/**
 * Test Map SIRs functionality
 */
function testMapSIRsEndpoint() {
  try {
    console.log('=== Starting Map SIRs Test ===');
    
    // Get the sheets
    const spreadsheet = SpreadsheetApp.openById('1MdDgCq9ArqsGTp4tx51_JEhI6VSU_u9k0D0DwCCGQ7w');
    const sirsSheet = spreadsheet.getSheetByName('SIRs');
    const sirsReleasesSheet = spreadsheet.getSheetByName('SIRs_Releases');
    
    if (!sirsSheet) {
      throw new Error('SIRs sheet not found');
    }
    if (!sirsReleasesSheet) {
      throw new Error('SIRs_Releases sheet not found');
    }
    
    // Test data - use SIR IDs that exist in your SIRs sheet
    const testData = {
      releaseVersion: "1.5.9",
      iteration: "1",
      sirIds: "125869, 125946, 126034" // Make sure these exist in your SIRs sheet
    };
    
    console.log('Test Data:', testData);
    
    // Call the mapping function
    const result = mapSIRsForRelease(
      sirsSheet, 
      sirsReleasesSheet, 
      testData.releaseVersion, 
      testData.iteration, 
      testData.sirIds
    );
    
    console.log('=== Test Result ===');
    console.log('Result:', result);
    
    // Format response
    let message = `✅ Map SIRs Test Completed!\n\n`;
    message += `Release Version: ${result.releaseVersion}\n`;
    message += `Iteration: ${result.iteration}\n`;
    message += `Total SIRs: ${result.totalSIRs}\n\n`;
    message += `Results:\n`;
    message += `✓ ${result.inserted} new mapping(s) created\n`;
    message += `✓ ${result.updated} existing mapping(s) updated\n`;
    message += `✓ ${result.skipped} mapping(s) skipped (no changes needed)\n`;
    message += `✓ ${result.processed} SIR(s) processed successfully\n`;
    
    if (result.notFound && result.notFound.length > 0) {
      message += `\n❌ ${result.notFound.length} SIR ID(s) not found:\n`;
      message += result.notFound.join(', ');
    }
    
    if (result.errors && result.errors > 0) {
      message += `\n\n⚠️ ${result.errors} error(s) occurred`;
    }
    
    return message;
    
  } catch (error) {
    console.error('=== Test Failed ===', error);
    return `❌ Map SIRs test failed: ${error.message}\n\nStack trace: ${error.stack}`;
  }
}
