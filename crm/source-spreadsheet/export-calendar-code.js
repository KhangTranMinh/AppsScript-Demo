/**
 * Source spreadsheet calendar export.
 *
 * Menu action:
 * Automation -> Export Calendar
 *
 * Behavior:
 * - Reads calendar grid content from source CALENDAR.
 * - Uses the explicit sourceRow -> targetRow mapping in
 *   export-calendar-consts.js.
 * - Writes to target "Calendar by vertical".
 * - Copies only columns D onward, leaving target label columns B:C untouched.
 */

function exportCalendar() {
  var sourceSpreadsheet = SpreadsheetApp.openById(EXPORT_CALENDAR_CONFIG.SOURCE_SPREADSHEET_ID);
  var targetSpreadsheet = SpreadsheetApp.openById(EXPORT_CALENDAR_CONFIG.TARGET_SPREADSHEET_ID);
  var sourceSheet = sourceSpreadsheet.getSheetByName(EXPORT_CALENDAR_CONFIG.SOURCE_SHEET_NAME);
  var targetSheet = targetSpreadsheet.getSheetByName(EXPORT_CALENDAR_CONFIG.TARGET_SHEET_NAME);

  if (!sourceSheet) {
    throw new Error('Source calendar sheet not found: ' + EXPORT_CALENDAR_CONFIG.SOURCE_SHEET_NAME);
  }

  if (!targetSheet) {
    throw new Error('Target calendar sheet not found: ' + EXPORT_CALENDAR_CONFIG.TARGET_SHEET_NAME);
  }

  var mappings = getValidExportCalendarMappings_(targetSheet);

  if (mappings.length === 0) {
    SpreadsheetApp.getUi().alert('No calendar rows are available to export.');
    return;
  }

  var columnCount = getCalendarColumnCount_(sourceSheet);

  if (columnCount <= 0) {
    SpreadsheetApp.getUi().alert('No calendar columns found from column D onward.');
    return;
  }

  var sourceRowsByNumber = readSourceCalendarRows_(sourceSheet, mappings, columnCount);
  writeTargetCalendarRows_(targetSheet, mappings, sourceRowsByNumber, columnCount);

  SpreadsheetApp.getUi().alert('Exported ' + mappings.length + ' calendar rows.');
}

function getValidExportCalendarMappings_(targetSheet) {
  var maxTargetRows = targetSheet.getMaxRows();

  return EXPORT_CALENDAR_CONFIG.ROW_MAPPINGS.filter(function(mapping) {
    // Future vertical groups can be added to constants before the target sheet
    // has enough rows. Skip those rows instead of stopping the export.
    return mapping.targetRow <= maxTargetRows;
  });
}

function getCalendarColumnCount_(sourceSheet) {
  var lastColumn = sourceSheet.getLastColumn();
  return lastColumn - EXPORT_CALENDAR_CONFIG.CALENDAR_START_COLUMN + 1;
}

function readSourceCalendarRows_(sourceSheet, mappings, columnCount) {
  var minSourceRow = getMinMappedRow_(mappings, 'sourceRow');
  var maxSourceRow = getMaxMappedRow_(mappings, 'sourceRow');
  var rowCount = maxSourceRow - minSourceRow + 1;
  var values = sourceSheet
    .getRange(minSourceRow, EXPORT_CALENDAR_CONFIG.CALENDAR_START_COLUMN, rowCount, columnCount)
    .getValues();
  var sourceRowsByNumber = {};

  mappings.forEach(function(mapping) {
    sourceRowsByNumber[mapping.sourceRow] = values[mapping.sourceRow - minSourceRow];
  });

  return sourceRowsByNumber;
}

function writeTargetCalendarRows_(targetSheet, mappings, sourceRowsByNumber, columnCount) {
  var targetUpdates = mappings.map(function(mapping) {
    return {
      rowNumber: mapping.targetRow,
      values: sourceRowsByNumber[mapping.sourceRow]
    };
  });

  // Write contiguous target row groups together. With the current layout this
  // produces three writes: Transport rows 6-14, Food rows 16-24, Delivery
  // rows 26-34.
  getContiguousTargetUpdateChunks_(targetUpdates).forEach(function(chunk) {
    var values = chunk.map(function(update) {
      return update.values;
    });

    targetSheet
      .getRange(chunk[0].rowNumber, EXPORT_CALENDAR_CONFIG.CALENDAR_START_COLUMN, values.length, columnCount)
      .setValues(values);
  });
}

function getContiguousTargetUpdateChunks_(updates) {
  var sortedUpdates = updates.slice().sort(function(left, right) {
    return left.rowNumber - right.rowNumber;
  });
  var chunks = [];

  sortedUpdates.forEach(function(update) {
    var currentChunk = chunks[chunks.length - 1];
    var previousUpdate = currentChunk && currentChunk[currentChunk.length - 1];

    if (!currentChunk || update.rowNumber !== previousUpdate.rowNumber + 1) {
      chunks.push([update]);
      return;
    }

    currentChunk.push(update);
  });

  return chunks;
}

function getMinMappedRow_(mappings, fieldName) {
  return mappings.reduce(function(minRow, mapping) {
    return Math.min(minRow, mapping[fieldName]);
  }, mappings[0][fieldName]);
}

function getMaxMappedRow_(mappings, fieldName) {
  return mappings.reduce(function(maxRow, mapping) {
    return Math.max(maxRow, mapping[fieldName]);
  }, mappings[0][fieldName]);
}
