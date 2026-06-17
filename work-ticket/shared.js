/**
 * Shared Configuration & Utilities
 *
 * Paste this file into a script file named "Shared.gs" in all three Apps
 * Script projects (File 1, File 2, File Final).
 */

const CFG = {
  TICKET_SHEET: 'Tickets',
  FINAL_SHEET: 'Tickets final',

  // Required for File Final only.
  FILE_1_URL: '',
  FILE_2_URL: '',

  SOURCES: [
    { fileUrl: 'FILE_1_URL', sheetName: 'Tickets', label: 'File 1' },
    { fileUrl: 'FILE_2_URL', sheetName: 'Tickets', label: 'File 2' },
  ],

  HEADERS: ['Ticket ID', 'Ticket Description', 'Date', 'Status'],
  FINAL_HEADERS: ['Ticket ID', 'Ticket Description', 'Date', 'Status', 'Source'],
  STATUSES: ['CREATED', 'IN-PROGRESS', 'DONE'],
};

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function createTicketTemplate(sheet) {
  sheet.clear();
  sheet.getRange(1, 1, 1, CFG.HEADERS.length).setValues([CFG.HEADERS]);
  formatTicketSheet(sheet, 1, CFG.HEADERS.length);
}

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
    sheet.getRange(2, 2, lastRow - 1, 1).setWrap(true);
    sheet.getRange(2, 3, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd');
    applyStatusValidation(sheet, 2, lastRow - 1);
  }

  sheet.setColumnWidth(1, 130);
  sheet.setColumnWidth(2, 420);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 150);
  if (columnCount >= 5) sheet.setColumnWidth(5, 100);
  sheet.autoResizeRows(1, lastRow);

  sheet.getRange(1, 1, lastRow, columnCount).createFilter();
}

function applyStatusValidation(sheet, startRow, rowCount) {
  if (rowCount <= 0) return;
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CFG.STATUSES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(startRow, 4, rowCount, 1).setDataValidation(rule);
}

function writeTicketRows(sheet, rows) {
  createTicketTemplate(sheet);
  if (!rows.length) return;
  sheet.getRange(2, 1, rows.length, CFG.HEADERS.length).setValues(rows);
  formatTicketSheet(sheet, rows.length + 1, CFG.HEADERS.length);
}

function normalizeTicketId(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeStatus(value) {
  return String(value || '').trim().toUpperCase();
}

function resolveUrl(token) {
  if (token === 'FILE_1_URL') return CFG.FILE_1_URL;
  if (token === 'FILE_2_URL') return CFG.FILE_2_URL;
  return token;
}

function showDoneAlert(message) {
  SpreadsheetApp.getUi().alert('Done\n\n' + message);
}
