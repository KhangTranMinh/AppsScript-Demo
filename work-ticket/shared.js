/**
 * Shared Configuration & Utilities
 *
 * Paste this file into a script file named "Shared.gs" in all three Apps
 * Script projects (File Ticket Food, File Ticket Transport, File Ticket final).
 *
 * Data contract:
 *   - Every ticket sheet uses the same 5 columns from CFG.HEADERS.
 *   - Label is a normal column in every file, not something computed only in
 *     the final file.
 *   - File Ticket final uses Label + Ticket ID to decide where a row exports.
 *   - Food/Transport users enter only Ticket Description. The script fills
 *     Ticket ID, Label, Date Time, and Status.
 *   - File Ticket final users update only Status.
 *
 * User-edited URLs live in config.js / Config.gs, not here.
 */

const CFG = {
  TICKET_SHEET: 'Tickets',
  FINAL_SHEET: 'Tickets final',

  SOURCES: [
    { fileUrl: 'FILE_FOOD_URL', sheetName: 'Tickets', label: 'Food' },
    { fileUrl: 'FILE_TRANSPORT_URL', sheetName: 'Tickets', label: 'Transport' },
  ],

  // Column order is shared by Food, Transport, and final sheets.
  // Export logic depends on Ticket ID at column 1, Label at column 2, and
  // Status at column 5.
  HEADERS: ['Ticket ID', 'Label', 'Ticket Description', 'Date Time', 'Status'],
  STATUSES: ['CREATED', 'IN-PROGRESS', 'DONE'],
  STATUS_COLORS: {
    DONE: '#d9ead3',
    'IN-PROGRESS': '#fce5cd',
  },
  ID_COLUMN: 1,
  LABEL_COLUMN: 2,
  DESCRIPTION_COLUMN: 3,
  DATE_TIME_COLUMN: 4,
  STATUS_COLUMN: 5,
  TEMPLATE_ROW_COUNT: 1000,
  TEMPLATE_COLUMN_COUNT: 26,
};

/**
 * Get an existing sheet tab or create it when missing.
 * @param {string} name Sheet tab name.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

/**
 * Reset a ticket sheet to an empty template.
 *
 * This clears existing rows, writes the shared headers, and applies formatting,
 * date-time formatting, filter, wrapping, allowed edit range, and status
 * dropdown validation.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function createTicketTemplate(sheet) {
  sheet.clear();
  sheet.getRange(1, 1, 1, CFG.HEADERS.length).setValues([CFG.HEADERS]);
  formatTicketSheet(sheet, 1, CFG.HEADERS.length);
}

/**
 * Format a ticket table.
 *
 * Column assumptions:
 *   1. Ticket ID
 *   2. Label
 *   3. Ticket Description - wrapped because it can contain multiple lines
 *   4. Date Time - formatted as yyyy-mm-dd hh:mm
 *   5. Status - validated against CFG.STATUSES
 *
 * Data rows are top-aligned so multi-line descriptions line up with the
 * ticket metadata in the same row.
 *
 * Status row colors:
 *   - DONE: light green
 *   - IN-PROGRESS: light orange
 *   - CREATED or blank: default background
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowCount Number of rows including the header.
 * @param {number} columnCount Number of columns to format.
 */
function formatTicketSheet(sheet, rowCount, columnCount) {
  const lastRow = Math.max(rowCount, 2);
  const existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();

  const headerRange = sheet.getRange(1, 1, 1, columnCount);
  headerRange
    .setFontWeight('bold')
    .setBackground('#1f4e79')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, lastRow, columnCount)
    .setBorder(true, true, true, true, true, true, '#d9d9d9', SpreadsheetApp.BorderStyle.SOLID);

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, columnCount).setVerticalAlignment('top');
    sheet.getRange(2, CFG.DESCRIPTION_COLUMN, lastRow - 1, 1).setWrap(true);
    sheet.getRange(2, CFG.DATE_TIME_COLUMN, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
    applyStatusValidation(sheet, 2, lastRow - 1);
    applyStatusRowColors(sheet, 2, lastRow - 1, columnCount);
  }

  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 100);
  sheet.setColumnWidth(3, 420);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 150);
  sheet.autoResizeRows(1, lastRow);

  sheet.getRange(1, 1, lastRow, columnCount).createFilter();
  applyEditProtection(sheet);
}

/**
 * Highlight entire data rows based on Status.
 *
 * CREATED rows keep the default background. DONE and IN-PROGRESS rows use
 * light colors so the table remains readable.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} startRow First data row.
 * @param {number} rowCount Number of data rows.
 * @param {number} columnCount Number of columns in the table.
 */
function applyStatusRowColors(sheet, startRow, rowCount, columnCount) {
  if (rowCount <= 0) return;

  const statuses = sheet.getRange(startRow, CFG.STATUS_COLUMN, rowCount, 1).getValues();
  statuses.forEach((row, index) => {
    applyStatusRowColor(sheet, startRow + index, columnCount, row[0]);
  });
}

/**
 * Highlight or reset one full data row based on Status.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} rowNumber Sheet row number.
 * @param {number} columnCount Number of columns in the table.
 * @param {*} status Status cell value.
 */
function applyStatusRowColor(sheet, rowNumber, columnCount, status) {
  const color = CFG.STATUS_COLORS[normalizeStatus(status)] || null;
  sheet.getRange(rowNumber, 1, 1, columnCount).setBackground(color);
}

/**
 * Protect generated columns while leaving the intended input column editable.
 *
 * In Food and Transport files, users edit only Ticket Description. In the
 * final file, users edit only Status. The whole sheet is protected first, then
 * only the intended input column is opened. That means empty columns outside
 * the ticket table are locked too.
 *
 * The active user who creates the protection can still change protected ranges,
 * but other editors are guided to the intended column.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function applyEditProtection(sheet) {
  const sheetName = sheet.getName();
  const isSourceSheet = sheetName === CFG.TICKET_SHEET && isTicketSourceFile();
  const isFinalSheet = sheetName === CFG.FINAL_SHEET;
  if (!isSourceSheet && !isFinalSheet) return;

  ensureMinimumRows(sheet, CFG.TEMPLATE_ROW_COUNT);
  ensureMinimumColumns(sheet, CFG.TEMPLATE_COLUMN_COUNT);
  const maxRows = sheet.getMaxRows();
  const editableColumn = isSourceSheet ? CFG.DESCRIPTION_COLUMN : CFG.STATUS_COLUMN;
  const editableRange = sheet.getRange(2, editableColumn, maxRows - 1, 1);

  removeTicketProtections(sheet);
  const protection = sheet.protect().setDescription('Ticket managed columns');
  protection.setUnprotectedRanges([editableRange]);
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}

/**
 * Ensure the sheet has enough rows for the protected/editable input range.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} minRows
 */
function ensureMinimumRows(sheet, minRows) {
  const currentRows = sheet.getMaxRows();
  if (currentRows < minRows) {
    sheet.insertRowsAfter(currentRows, minRows - currentRows);
  }
}

/**
 * Ensure the sheet has enough columns so empty columns outside the ticket table
 * are included in the sheet protection.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} minColumns
 */
function ensureMinimumColumns(sheet, minColumns) {
  const currentColumns = sheet.getMaxColumns();
  if (currentColumns < minColumns) {
    sheet.insertColumnsAfter(currentColumns, minColumns - currentColumns);
  }
}

/**
 * Remove protections previously created by this script before recreating them.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function removeTicketProtections(sheet) {
  sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)
    .filter(protection => protection.getDescription() === 'Ticket managed columns')
    .forEach(protection => protection.remove());
}

/**
 * Add a dropdown validation rule to the Status column.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} startRow First row to validate.
 * @param {number} rowCount Number of rows to validate.
 */
function applyStatusValidation(sheet, startRow, rowCount) {
  if (rowCount <= 0) return;
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CFG.STATUSES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(startRow, CFG.STATUS_COLUMN, rowCount, 1).setDataValidation(rule);
}

/**
 * Handle user edits.
 *
 * Source files:
 *   - Users edit Ticket Description.
 *   - The script fills Ticket ID, Label, Date Time, and Status = CREATED.
 *
 * Final file:
 *   - Users edit Status.
 *   - The script recolors the whole row immediately.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function onEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();
  if (sheetName === CFG.TICKET_SHEET && isTicketSourceFile()) {
    handleSourceDescriptionEdit(e);
    return;
  }

  if (sheetName !== CFG.FINAL_SHEET) return;

  const editedRange = e.range;
  const startColumn = editedRange.getColumn();
  const endColumn = startColumn + editedRange.getNumColumns() - 1;
  if (CFG.STATUS_COLUMN < startColumn || CFG.STATUS_COLUMN > endColumn) return;

  const startRow = Math.max(editedRange.getRow(), 2);
  const endRow = editedRange.getRow() + editedRange.getNumRows() - 1;
  if (startRow > endRow) return;

  const statuses = sheet.getRange(startRow, CFG.STATUS_COLUMN, endRow - startRow + 1, 1).getValues();
  statuses.forEach((row, index) => {
    applyStatusRowColor(sheet, startRow + index, CFG.HEADERS.length, row[0]);
  });
}

/**
 * Fill generated metadata when a Food/Transport description is entered.
 *
 * A new ticket is detected by a non-empty description with an empty Ticket ID.
 * Existing tickets keep their original ID and Date Time when the description is
 * edited again.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function handleSourceDescriptionEdit(e) {
  const editedRange = e.range;
  const startColumn = editedRange.getColumn();
  const endColumn = startColumn + editedRange.getNumColumns() - 1;
  if (CFG.DESCRIPTION_COLUMN < startColumn || CFG.DESCRIPTION_COLUMN > endColumn) return;

  const sheet = editedRange.getSheet();
  const startRow = Math.max(editedRange.getRow(), 2);
  const endRow = editedRange.getRow() + editedRange.getNumRows() - 1;
  if (startRow > endRow) return;

  let nextNumber = getLatestTicketNumber(sheet, TICKET_FILE.idPrefix) + 1;
  const rows = sheet.getRange(startRow, 1, endRow - startRow + 1, CFG.HEADERS.length).getValues();

  rows.forEach((row, index) => {
    const rowNumber = startRow + index;
    const description = String(row[CFG.DESCRIPTION_COLUMN - 1] || '').trim();
    if (!description) return;

    let ticketId = normalizeTicketId(row[CFG.ID_COLUMN - 1]);
    if (!ticketId) {
      ticketId = TICKET_FILE.idPrefix + '-' + nextNumber;
      nextNumber++;
      sheet.getRange(rowNumber, CFG.ID_COLUMN).setValue(ticketId);
    }

    sheet.getRange(rowNumber, CFG.LABEL_COLUMN).setValue(TICKET_FILE.label);
    if (!row[CFG.DATE_TIME_COLUMN - 1]) {
      sheet.getRange(rowNumber, CFG.DATE_TIME_COLUMN).setValue(new Date());
    }
    if (!normalizeStatus(row[CFG.STATUS_COLUMN - 1])) {
      sheet.getRange(rowNumber, CFG.STATUS_COLUMN).setValue('CREATED');
    }
    sheet.getRange(rowNumber, CFG.DATE_TIME_COLUMN).setNumberFormat('yyyy-mm-dd hh:mm');
    sheet.getRange(rowNumber, CFG.DESCRIPTION_COLUMN).setWrap(true);
    sheet.getRange(rowNumber, 1, 1, CFG.HEADERS.length).setVerticalAlignment('top');
    applyStatusRowColor(sheet, rowNumber, CFG.HEADERS.length, sheet.getRange(rowNumber, CFG.STATUS_COLUMN).getValue());
  });
}

/**
 * Check whether the current Apps Script project is a Food/Transport source.
 * Food and Transport define TICKET_FILE in their Code.gs file; final does not.
 * @returns {boolean}
 */
function isTicketSourceFile() {
  return typeof TICKET_FILE !== 'undefined' && TICKET_FILE.label && TICKET_FILE.idPrefix;
}

/**
 * Find the largest numeric suffix already used for a ticket prefix.
 *
 * Example: FOOD-1008 returns 1008 for prefix FOOD. If no matching IDs exist,
 * this returns TICKET_FILE.startNumber so the next ID starts at startNumber + 1.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} prefix
 * @returns {number}
 */
function getLatestTicketNumber(sheet, prefix) {
  const lastRow = sheet.getLastRow();
  let latest = Number(TICKET_FILE.startNumber || 0);
  if (lastRow < 2) return latest;

  const ids = sheet.getRange(2, CFG.ID_COLUMN, lastRow - 1, 1).getValues();
  const pattern = new RegExp('^' + prefix + '-(\\d+)$', 'i');
  ids.forEach(row => {
    const match = String(row[0] || '').trim().match(pattern);
    if (!match) return;
    latest = Math.max(latest, Number(match[1]));
  });
  return latest;
}

/**
 * Replace the sheet with the ticket template and write data rows.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Array<Array>} rows Ticket rows matching CFG.HEADERS order.
 */
function writeTicketRows(sheet, rows) {
  createTicketTemplate(sheet);
  if (!rows.length) return;
  sheet.getRange(2, 1, rows.length, CFG.HEADERS.length).setValues(rows);
  formatTicketSheet(sheet, rows.length + 1, CFG.HEADERS.length);
}

/**
 * Normalize Ticket ID values before matching.
 * @param {*} value
 * @returns {string}
 */
function normalizeTicketId(value) {
  return String(value || '').trim().toUpperCase();
}

/**
 * Normalize Status values before comparing with DONE.
 * @param {*} value
 * @returns {string}
 */
function normalizeStatus(value) {
  return String(value || '').trim().toUpperCase();
}

/**
 * Convert a CFG.SOURCES URL token into the configured spreadsheet URL.
 *
 * File Ticket final reads URL values from USER_CONFIG in Config.gs. Food and
 * Transport do not call this function, so they do not need Config.gs.
 * Raw URLs are returned unchanged.
 * @param {string} token
 * @returns {string}
 */
function resolveUrl(token) {
  if (token === 'FILE_FOOD_URL') return USER_CONFIG.FILE_FOOD_URL;
  if (token === 'FILE_TRANSPORT_URL') return USER_CONFIG.FILE_TRANSPORT_URL;
  return token;
}

/**
 * Show a consistent completion dialog.
 * @param {string} message
 */
function showDoneAlert(message) {
  SpreadsheetApp.getUi().alert('Done\n\n' + message);
}
