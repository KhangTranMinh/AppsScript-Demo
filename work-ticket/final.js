/**
 * File Ticket final - Import and export ticket data.
 *
 * Paste this file into Code.gs in the "File Ticket final" Apps Script project.
 * Paste shared.js into Shared.gs and config.js into Config.gs in the same
 * project, then set FILE_FOOD_URL and FILE_TRANSPORT_URL in Config.gs.
 *
 * Import:
 *   - Reads Food and Transport ticket sheets.
 *   - Sorts rows by Date Time, newest first.
 *   - Writes the sorted rows into Tickets final.
 *
 * Export:
 *   - Uses Label to choose Food or Transport.
 *   - Uses Ticket ID to find the matching row in that file.
 *   - Skips rows where the final status or target file status is DONE.
 */

/**
 * Register the final-file menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tickets')
    .addItem('Import Data', 'importData')
    .addItem('Export Data', 'exportData')
    .addToUi();
}

/**
 * Open a spreadsheet by URL after validating that the URL was configured.
 * @param {string} fileUrl
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getTicketSpreadsheet(fileUrl) {
  if (!fileUrl) {
    throw new Error('Missing file URL. Set FILE_FOOD_URL and FILE_TRANSPORT_URL in Config.gs.');
  }
  return SpreadsheetApp.openByUrl(fileUrl);
}

/**
 * Read ticket rows from one configured ticket file.
 *
 * The returned rows preserve CFG.HEADERS order:
 * Ticket ID, Label, Ticket Description, Date Time, Status.
 * @param {{fileUrl: string, sheetName: string, label: string}} ticketFile
 * @returns {Array<Array>}
 */
function readTicketsFromFile(ticketFile) {
  const fileUrl = resolveUrl(ticketFile.fileUrl);
  const ss = getTicketSpreadsheet(fileUrl);
  const sheet = ss.getSheetByName(ticketFile.sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + ticketFile.sheetName + '" not found in ' + ticketFile.label + '.');
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, CFG.HEADERS.length).getValues();
  return values
    .filter(row => normalizeTicketId(row[0]));
}

/**
 * Import all Food and Transport tickets into the final sheet.
 *
 * This clears Tickets final before writing fresh imported rows.
 */
function importData() {
  try {
    let rows = [];
    CFG.SOURCES.forEach(ticketFile => {
      rows = rows.concat(readTicketsFromFile(ticketFile));
    });
    rows.sort(compareTicketRowsByDateTimeDesc);

    const sheet = getOrCreateSheet(CFG.FINAL_SHEET);
    sheet.clear();
    sheet.getRange(1, 1, 1, CFG.HEADERS.length).setValues([CFG.HEADERS]);
    if (rows.length) {
      sheet.getRange(2, 1, rows.length, CFG.HEADERS.length).setValues(rows);
    }
    formatTicketSheet(sheet, rows.length + 1, CFG.HEADERS.length);

    showDoneAlert('Imported ' + rows.length + ' tickets.');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.message);
  }
}

/**
 * Sort ticket rows by Date Time descending.
 *
 * Rows with invalid or blank Date Time values are treated as oldest.
 * @param {Array} left
 * @param {Array} right
 * @returns {number}
 */
function compareTicketRowsByDateTimeDesc(left, right) {
  return getTicketTime(right) - getTicketTime(left);
}

/**
 * Convert the Date Time cell to a timestamp for sorting.
 * @param {Array} row
 * @returns {number}
 */
function getTicketTime(row) {
  const value = row[CFG.DATE_TIME_COLUMN - 1];
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Read editable rows from Tickets final.
 *
 * The returned objects keep the original row values for export, plus normalized
 * fields used for matching and DONE checks.
 * @returns {Array<{ticketId: string, values: Array, label: string, status: string}>}
 */
function readFinalRows() {
  const sheet = getOrCreateSheet(CFG.FINAL_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet.getRange(2, 1, lastRow - 1, CFG.HEADERS.length).getValues()
    .filter(row => normalizeTicketId(row[0]))
    .map(row => ({
      ticketId: normalizeTicketId(row[0]),
      values: row.slice(0, CFG.HEADERS.length),
      label: String(row[1] || '').trim(),
      status: normalizeStatus(row[4]),
    }));
}

/**
 * Build a lookup table of target rows in Food and Transport.
 *
 * Key format is "Label|Ticket ID", for example "Food|FOOD-1001".
 * The stored status lets exportData avoid overwriting target rows already DONE.
 * @returns {Map<string, {sheet: GoogleAppsScript.Spreadsheet.Sheet, rowNumber: number, status: string}>}
 */
function buildTicketIndex() {
  const index = new Map();

  CFG.SOURCES.forEach(ticketFile => {
    const fileUrl = resolveUrl(ticketFile.fileUrl);
    const ss = getTicketSpreadsheet(fileUrl);
    const sheet = ss.getSheetByName(ticketFile.sheetName);
    if (!sheet) {
      throw new Error('Sheet "' + ticketFile.sheetName + '" not found in ' + ticketFile.label + '.');
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const values = sheet.getRange(2, 1, lastRow - 1, CFG.HEADERS.length).getValues();
    values.forEach((row, offset) => {
      const ticketId = normalizeTicketId(row[0]);
      if (!ticketId) return;
      index.set(ticketFile.label + '|' + ticketId, {
        sheet,
        rowNumber: offset + 2,
        status: normalizeStatus(row[4]),
      });
    });
  });

  return index;
}

/**
 * Export edited final rows back to Food or Transport.
 *
 * Rules:
 *   - Route by Label.
 *   - Match by Ticket ID.
 *   - Skip if final row status is DONE.
 *   - Skip if target row status is already DONE.
 */
function exportData() {
  try {
    const finalRows = readFinalRows();
    const ticketIndex = buildTicketIndex();
    let updated = 0;
    let skippedDone = 0;
    let missing = 0;

    finalRows.forEach(row => {
      if (row.status === 'DONE') {
        skippedDone++;
        return;
      }

      const key = row.label + '|' + row.ticketId;
      const target = ticketIndex.get(key);
      if (!target) {
        missing++;
        return;
      }

      if (target.status === 'DONE') {
        skippedDone++;
        return;
      }

      target.sheet.getRange(target.rowNumber, 1, 1, CFG.HEADERS.length).setValues([row.values]);
      updated++;
    });

    showDoneAlert(
      'Updated: ' + updated + '\n' +
      'Skipped DONE: ' + skippedDone + '\n' +
      'Missing ticket IDs: ' + missing
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.message);
  }
}
