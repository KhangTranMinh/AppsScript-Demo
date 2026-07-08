/**
 * Source spreadsheet script.
 *
 * Menu action:
 * Automation -> Sync Campaign Name
 *
 * Behavior:
 * - Reads the source tab "Detail" in one batch.
 * - Finds rows where Title (M) or Message (N) is empty.
 * - Uses Service L1 (G) to choose the matching target service tab.
 * - Updates the matching target Campaign Name (B) if it already exists.
 * - Appends new Campaign Name values to the bottom of the service tab.
 * - Clears Title (G), Message (H), and Status (I) only on copied rows.
 */

function syncCampaignName() {
  var sourceSpreadsheet = SpreadsheetApp.openById(SOURCE_CONFIG.SOURCE_SPREADSHEET_ID);
  var sourceSheet = sourceSpreadsheet.getSheetByName(SOURCE_CONFIG.SOURCE_SHEET_NAME);

  if (!sourceSheet) {
    throw new Error('Source sheet not found: ' + SOURCE_CONFIG.SOURCE_SHEET_NAME);
  }

  var campaignRows = getRowsMissingTitleOrMessage_(sourceSheet);

  if (campaignRows.length === 0) {
    SpreadsheetApp.getUi().alert('No campaign rows need syncing.');
    return;
  }

  var targetSpreadsheet = SpreadsheetApp.openById(SOURCE_CONFIG.TARGET_SPREADSHEET_ID);
  writeCampaignNamesToTargetSheets_(targetSpreadsheet, campaignRows);

  SpreadsheetApp.getUi().alert('Synced ' + campaignRows.length + ' campaign rows to matching target service tabs.');
}

function getRowsMissingTitleOrMessage_(sheet) {
  var lastRow = sheet.getLastRow();

  if (lastRow <= SOURCE_CONFIG.HEADER_ROW_COUNT) {
    return [];
  }

  var startRow = SOURCE_CONFIG.HEADER_ROW_COUNT + 1;
  var rowCount = lastRow - SOURCE_CONFIG.HEADER_ROW_COUNT;
  var lastColumnToRead = SOURCE_CONFIG.COLUMNS.MESSAGE;

  // Batch read columns A:N so B, M, and N can be checked without per-cell calls.
  var values = sheet.getRange(startRow, 1, rowCount, lastColumnToRead).getValues();
  var campaignRows = [];

  values.forEach(function(rowValues, index) {
    var spreadsheetRow = startRow + index;

    // rowValues is a normal JavaScript array, so it is 0-based. The constants
    // are SpreadsheetApp column numbers, so subtract 1 when reading the array.
    var campaignName = rowValues[SOURCE_CONFIG.COLUMNS.CAMPAIGN_NAME - 1];
    var serviceL1 = rowValues[SOURCE_CONFIG.COLUMNS.SERVICE_L1 - 1];
    var title = rowValues[SOURCE_CONFIG.COLUMNS.TITLE - 1];
    var message = rowValues[SOURCE_CONFIG.COLUMNS.MESSAGE - 1];

    // Only rows with both a campaign name and service are useful to sync.
    if (!isBlank_(campaignName) && !isBlank_(serviceL1) && (isBlank_(title) || isBlank_(message))) {
      campaignRows.push({
        rowNumber: spreadsheetRow,
        campaignName: campaignName,
        serviceL1: String(serviceL1).trim()
      });
    }
  });

  return campaignRows;
}

function writeCampaignNamesToTargetSheets_(targetSpreadsheet, campaignRows) {
  var rowsByServiceName = groupRowsByServiceName_(campaignRows);

  Object.keys(rowsByServiceName).forEach(function(sheetName) {
    if (!isConfiguredServiceSheet_(sheetName)) {
      // Ignore service values that are not in the required service list.
      return;
    }

    var targetSheet = targetSpreadsheet.getSheetByName(sheetName);

    if (!targetSheet) {
      // Some service tabs may be created later. Keep the full required list in
      // constants, but skip missing tabs instead of stopping the whole sync.
      return;
    }

    writeCampaignNamesToTargetSheet_(targetSheet, rowsByServiceName[sheetName]);
  });
}

function groupRowsByServiceName_(campaignRows) {
  return campaignRows.reduce(function(rowsByServiceName, campaignRow) {
    if (!rowsByServiceName[campaignRow.serviceL1]) {
      rowsByServiceName[campaignRow.serviceL1] = [];
    }

    rowsByServiceName[campaignRow.serviceL1].push(campaignRow);
    return rowsByServiceName;
  }, {});
}

function isConfiguredServiceSheet_(sheetName) {
  return SOURCE_CONFIG.SERVICE_SHEET_NAMES.indexOf(sheetName) !== -1;
}

function writeCampaignNamesToTargetSheet_(targetSheet, campaignRows) {
  var startRow = SOURCE_CONFIG.HEADER_ROW_COUNT + 1;
  var targetState = getTargetCampaignState_(targetSheet, startRow);
  var rowsToClear = [];
  var existingUpdates = [];
  var appendValues = [];
  var nextAppendRow = targetState.lastCampaignRow + 1;

  campaignRows.forEach(function(campaignRow) {
    var campaignKey = normalizeKey_(campaignRow.campaignName);
    var existingRow = targetState.rowByCampaignName[campaignKey];

    if (existingRow) {
      existingUpdates.push({
        rowNumber: existingRow,
        campaignName: campaignRow.campaignName
      });
      rowsToClear.push(existingRow);
      return;
    }

    appendValues.push([campaignRow.campaignName]);
    rowsToClear.push(nextAppendRow);
    targetState.rowByCampaignName[campaignKey] = nextAppendRow;
    nextAppendRow += 1;
  });

  writeExistingCampaignNames_(targetSheet, existingUpdates);

  if (appendValues.length > 0) {
    ensureSheetHasRows_(targetSheet, targetState.lastCampaignRow + appendValues.length);

    targetSheet
      .getRange(targetState.lastCampaignRow + 1, SOURCE_CONFIG.COLUMNS.CAMPAIGN_NAME, appendValues.length, 1)
      .setValues(appendValues);
  }

  clearCopiedTargetRows_(targetSheet, rowsToClear);
}

function writeExistingCampaignNames_(targetSheet, existingUpdates) {
  getContiguousRowChunks_(existingUpdates).forEach(function(chunk) {
    var values = chunk.map(function(update) {
      return [update.campaignName];
    });

    targetSheet
      .getRange(chunk[0].rowNumber, SOURCE_CONFIG.COLUMNS.CAMPAIGN_NAME, values.length, 1)
      .setValues(values);
  });
}

function getTargetCampaignState_(targetSheet, startRow) {
  var lastRow = targetSheet.getLastRow();
  var rowByCampaignName = {};

  if (lastRow < startRow) {
    return {
      rowByCampaignName: rowByCampaignName,
      lastCampaignRow: SOURCE_CONFIG.HEADER_ROW_COUNT
    };
  }

  var values = targetSheet
    .getRange(startRow, SOURCE_CONFIG.COLUMNS.CAMPAIGN_NAME, lastRow - startRow + 1, 1)
    .getValues();
  var lastCampaignRow = SOURCE_CONFIG.HEADER_ROW_COUNT;

  values.forEach(function(rowValues, index) {
    var campaignName = rowValues[0];

    if (isBlank_(campaignName)) {
      return;
    }

    var spreadsheetRow = startRow + index;
    rowByCampaignName[normalizeKey_(campaignName)] = spreadsheetRow;
    lastCampaignRow = spreadsheetRow;
  });

  return {
    rowByCampaignName: rowByCampaignName,
    lastCampaignRow: lastCampaignRow
  };
}

function clearCopiedTargetRows_(targetSheet, rowNumbers) {
  var uniqueRowNumbers = getUniqueSortedNumbers_(rowNumbers);

  getContiguousNumberChunks_(uniqueRowNumbers).forEach(function(chunk) {
    // Clear only the user-editable sync fields on rows that were copied. Other
    // campaign rows are left untouched.
    targetSheet
      .getRange(chunk[0], SOURCE_CONFIG.TARGET_COLUMNS.TITLE, chunk.length, 3)
      .clearContent();
  });
}

function getUniqueSortedNumbers_(numbers) {
  var seen = {};

  numbers.forEach(function(number) {
    seen[number] = true;
  });

  return Object.keys(seen).map(function(numberText) {
    return Number(numberText);
  }).sort(function(left, right) {
    return left - right;
  });
}

function getContiguousRowChunks_(rows) {
  var rowByNumber = {};

  rows.forEach(function(row) {
    rowByNumber[row.rowNumber] = row;
  });

  var sortedRows = Object.keys(rowByNumber).map(function(rowNumberText) {
    return rowByNumber[rowNumberText];
  }).sort(function(left, right) {
    return left.rowNumber - right.rowNumber;
  });
  var rowNumbers = sortedRows.map(function(row) {
    return row.rowNumber;
  });
  var numberChunks = getContiguousNumberChunks_(rowNumbers);

  return numberChunks.map(function(numberChunk) {
    return numberChunk.map(function(rowNumber) {
      return rowByNumber[rowNumber];
    });
  });
}

function getContiguousNumberChunks_(numbers) {
  var chunks = [];

  numbers.forEach(function(number) {
    var currentChunk = chunks[chunks.length - 1];
    var previousNumber = currentChunk && currentChunk[currentChunk.length - 1];

    if (!currentChunk || number !== previousNumber + 1) {
      chunks.push([number]);
      return;
    }

    currentChunk.push(number);
  });

  return chunks;
}

function ensureSheetHasRows_(sheet, requiredLastRow) {
  var currentMaxRows = sheet.getMaxRows();

  if (currentMaxRows < requiredLastRow) {
    sheet.insertRowsAfter(currentMaxRows, requiredLastRow - currentMaxRows);
  }
}

function isBlank_(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function normalizeKey_(value) {
  return String(value).trim().toUpperCase();
}
