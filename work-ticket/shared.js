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
  HEADERS: ['Ticket ID', 'Label', 'Ticket Description', 'Date', 'Status'],
  STATUSES: ['CREATED', 'IN-PROGRESS', 'DONE'],
  STATUS_COLORS: {
    DONE: '#d9ead3',
    'IN-PROGRESS': '#fce5cd',
  },
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
 * date formatting, filter, wrapping, and status dropdown validation.
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
 *   4. Date - formatted as yyyy-mm-dd
 *   5. Status - validated against CFG.STATUSES
 *
 * Data rows are top-aligned so multi-line descriptions line up with the
 * ticket metadata in the same row.
 *
 * Status row colors:
 *   - DONE: light green
 *   - IN-PROGRESS: light orange
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
    sheet.getRange(2, 3, lastRow - 1, 1).setWrap(true);
    sheet.getRange(2, 4, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');
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

  const statuses = sheet.getRange(startRow, 5, rowCount, 1).getValues();
  statuses.forEach((row, index) => {
    const color = CFG.STATUS_COLORS[normalizeStatus(row[0])] || null;
    if (color) {
      sheet.getRange(startRow + index, 1, 1, columnCount).setBackground(color);
    }
  });
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
  sheet.getRange(startRow, 5, rowCount, 1).setDataValidation(rule);
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
