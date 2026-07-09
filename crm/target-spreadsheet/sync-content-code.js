/**
 * Target spreadsheet script.
 *
 * Menu action:
 * Automation -> Sync Title & Message
 *
 * Behavior:
 * - Reads each configured service tab in batches.
 * - Finds rows where Status (I) is not DONE.
 * - Uses service tab name + Campaign Name (B) to find the matching source row.
 * - Copies target Title (G) and Message (H) back to source Title (M) and
 *   Message (N).
 * - Marks successfully synced target rows as DONE and highlights B:I in green.
 */

function syncTitleAndMessage() {
  var targetSpreadsheet = SpreadsheetApp.openById(TARGET_CONFIG.TARGET_SPREADSHEET_ID);
  var sourceSpreadsheet = SpreadsheetApp.openById(TARGET_CONFIG.SOURCE_SPREADSHEET_ID);
  var sourceSheet = sourceSpreadsheet.getSheetByName(TARGET_CONFIG.SOURCE_SHEET_NAME);

  if (!sourceSheet) {
    throw new Error('Source sheet not found: ' + TARGET_CONFIG.SOURCE_SHEET_NAME);
  }

  var rowsToSync = getRowsNotDoneFromServiceSheets_(targetSpreadsheet);

  if (rowsToSync.length === 0) {
    SpreadsheetApp.getUi().alert('No title/message rows need syncing.');
    return;
  }

  var syncResult = writeTitleAndMessageToSource_(sourceSheet, rowsToSync);
  markTargetRowsDone_(targetSpreadsheet, syncResult.syncedTargetRowsBySheetName);

  SpreadsheetApp.getUi().alert('Synced ' + syncResult.syncedCount + ' title/message rows to source Detail tab and marked target rows DONE.');
}

function getRowsNotDoneFromServiceSheets_(targetSpreadsheet) {
  var rowsToSync = [];

  TARGET_CONFIG.SERVICE_SHEET_NAMES.forEach(function(sheetName) {
    var sheet = targetSpreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      // Some service tabs may be created later. Keep the full required list in
      // constants, but skip missing tabs instead of stopping the whole sync.
      return;
    }

    rowsToSync = rowsToSync.concat(getRowsNotDoneFromSheet_(sheet, sheetName));
  });

  return rowsToSync;
}

function getRowsNotDoneFromSheet_(sheet, sheetName) {
  var lastRow = sheet.getLastRow();

  if (lastRow <= TARGET_CONFIG.HEADER_ROW_COUNT) {
    return [];
  }

  var startRow = TARGET_CONFIG.HEADER_ROW_COUNT + 1;
  var rowCount = lastRow - TARGET_CONFIG.HEADER_ROW_COUNT;
  var lastColumnToRead = TARGET_CONFIG.TARGET_COLUMNS.STATUS;

  // Batch read columns A:I so B, G, H, and I can be checked without per-cell calls.
  var values = sheet.getRange(startRow, 1, rowCount, lastColumnToRead).getValues();
  var rowsToSync = [];

  values.forEach(function(rowValues, index) {
    var spreadsheetRow = startRow + index;

    // rowValues is a normal JavaScript array, so it is 0-based. The constants
    // are SpreadsheetApp column numbers, so subtract 1 when reading the array.
    var campaignName = rowValues[TARGET_CONFIG.TARGET_COLUMNS.CAMPAIGN_NAME - 1];
    var title = rowValues[TARGET_CONFIG.TARGET_COLUMNS.TITLE - 1];
    var message = rowValues[TARGET_CONFIG.TARGET_COLUMNS.MESSAGE - 1];
    var status = rowValues[TARGET_CONFIG.TARGET_COLUMNS.STATUS - 1];

    if (!isBlank_(campaignName) && !isDoneStatus_(status)) {
      rowsToSync.push({
        sheetName: sheetName,
        rowNumber: spreadsheetRow,
        campaignName: campaignName,
        title: title,
        message: message
      });
    }
  });

  return rowsToSync;
}

function writeTitleAndMessageToSource_(sourceSheet, rowsToSync) {
  var sourceRowByKey = buildSourceRowIndex_(sourceSheet);
  var rowsMatchedToSource = [];
  var targetRowBySourceNumber = {};

  rowsToSync.forEach(function(rowToSync) {
    var sourceRowNumber = sourceRowByKey[getSourceMatchKey_(rowToSync.sheetName, rowToSync.campaignName)];

    if (!sourceRowNumber) {
      // The campaign may have been removed from source, or the service/campaign
      // pair may not match. Skip it instead of writing to the wrong row.
      return;
    }

    rowsMatchedToSource.push({
      rowNumber: sourceRowNumber,
      targetSheetName: rowToSync.sheetName,
      targetRowNumber: rowToSync.rowNumber,
      campaignName: rowToSync.campaignName,
      title: rowToSync.title,
      message: rowToSync.message
    });
  });

  if (rowsMatchedToSource.length === 0) {
    return {
      syncedCount: 0,
      syncedTargetRowsBySheetName: {}
    };
  }

  // If duplicate target rows point to the same source row, the later row in the
  // collected sync list wins.
  var rowBySourceNumber = {};

  rowsMatchedToSource.forEach(function(rowToSync) {
    rowBySourceNumber[rowToSync.rowNumber] = rowToSync;
    targetRowBySourceNumber[rowToSync.rowNumber] = {
      sheetName: rowToSync.targetSheetName,
      rowNumber: rowToSync.targetRowNumber
    };
  });

  var uniqueRowsToSync = Object.keys(rowBySourceNumber).map(function(rowNumberText) {
    return rowBySourceNumber[rowNumberText];
  });

  // Write contiguous source-row groups as ranges. Only columns M:N are touched,
  // so sparse syncs do not rewrite unrelated columns or formulas.
  getContiguousRowChunks_(uniqueRowsToSync).forEach(function(chunk) {
    var titleMessageValues = chunk.map(function(rowToSync) {
      return [rowToSync.title, rowToSync.message];
    });

    sourceSheet
      .getRange(chunk[0].rowNumber, TARGET_CONFIG.SOURCE_COLUMNS.TITLE, titleMessageValues.length, 2)
      .setValues(titleMessageValues);
  });

  return {
    syncedCount: uniqueRowsToSync.length,
    syncedTargetRowsBySheetName: groupTargetRowsBySheetName_(uniqueRowsToSync, targetRowBySourceNumber)
  };
}

function groupTargetRowsBySheetName_(syncedSourceRows, targetRowBySourceNumber) {
  var rowsBySheetName = {};

  syncedSourceRows.forEach(function(sourceRow) {
    var targetRow = targetRowBySourceNumber[sourceRow.rowNumber];

    if (!targetRow) {
      return;
    }

    if (!rowsBySheetName[targetRow.sheetName]) {
      rowsBySheetName[targetRow.sheetName] = [];
    }

    rowsBySheetName[targetRow.sheetName].push({
      rowNumber: targetRow.rowNumber
    });
  });

  return rowsBySheetName;
}

function markTargetRowsDone_(targetSpreadsheet, syncedTargetRowsBySheetName) {
  Object.keys(syncedTargetRowsBySheetName).forEach(function(sheetName) {
    var sheet = targetSpreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      return;
    }

    getContiguousRowChunks_(syncedTargetRowsBySheetName[sheetName]).forEach(function(chunk) {
      var statusValues = chunk.map(function() {
        return [TARGET_CONFIG.STATUS_DONE];
      });

      sheet
        .getRange(chunk[0].rowNumber, TARGET_CONFIG.TARGET_COLUMNS.STATUS, statusValues.length, 1)
        .setValues(statusValues);

      sheet
        .getRange(
          chunk[0].rowNumber,
          TARGET_CONFIG.TARGET_HIGHLIGHT_COLUMNS.START,
          chunk.length,
          getTargetHighlightColumnCount_()
        )
        .setBackground(TARGET_CONFIG.DONE_ROW_BACKGROUND);
    });
  });
}

function getTargetHighlightColumnCount_() {
  return TARGET_CONFIG.TARGET_HIGHLIGHT_COLUMNS.END - TARGET_CONFIG.TARGET_HIGHLIGHT_COLUMNS.START + 1;
}

function buildSourceRowIndex_(sourceSheet) {
  var lastRow = sourceSheet.getLastRow();

  if (lastRow <= TARGET_CONFIG.HEADER_ROW_COUNT) {
    return {};
  }

  var startRow = TARGET_CONFIG.HEADER_ROW_COUNT + 1;
  var rowCount = lastRow - TARGET_CONFIG.HEADER_ROW_COUNT;
  var lastColumnToRead = TARGET_CONFIG.SOURCE_COLUMNS.SERVICE_L1;
  var values = sourceSheet.getRange(startRow, 1, rowCount, lastColumnToRead).getValues();
  var sourceRowByKey = {};

  values.forEach(function(rowValues, index) {
    var spreadsheetRow = startRow + index;

    // rowValues is 0-based, while SpreadsheetApp column constants are 1-based.
    var campaignName = rowValues[TARGET_CONFIG.SOURCE_COLUMNS.CAMPAIGN_NAME - 1];
    var serviceL1 = rowValues[TARGET_CONFIG.SOURCE_COLUMNS.SERVICE_L1 - 1];

    if (isBlank_(campaignName) || isBlank_(serviceL1)) {
      return;
    }

    sourceRowByKey[getSourceMatchKey_(serviceL1, campaignName)] = spreadsheetRow;
  });

  return sourceRowByKey;
}

function getSourceMatchKey_(serviceName, campaignName) {
  return normalizeKeyPart_(serviceName) + '||' + normalizeKeyPart_(campaignName);
}

function normalizeKeyPart_(value) {
  return String(value).trim().toUpperCase();
}

function getContiguousRowChunks_(rows) {
  var sortedRows = rows.slice().sort(function(left, right) {
    return left.rowNumber - right.rowNumber;
  });
  var chunks = [];

  sortedRows.forEach(function(row) {
    var currentChunk = chunks[chunks.length - 1];
    var previousRow = currentChunk && currentChunk[currentChunk.length - 1];

    if (!currentChunk || row.rowNumber !== previousRow.rowNumber + 1) {
      chunks.push([row]);
      return;
    }

    currentChunk.push(row);
  });

  return chunks;
}

function isDoneStatus_(status) {
  return String(status).trim().toUpperCase() === TARGET_CONFIG.STATUS_DONE;
}

function isBlank_(value) {
  return value === null || value === undefined || String(value).trim() === '';
}
