/**
 * File Final - Import and export ticket data.
 *
 * Paste this file into Code.gs in the "File Final" Apps Script project.
 * Paste shared.js into Shared.gs in the same project, then set FILE_1_URL and
 * FILE_2_URL in Shared.gs.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tickets')
    .addItem('Import Data', 'importData')
    .addItem('Export Data', 'exportData')
    .addToUi();
}

function getSourceSpreadsheet(fileUrl) {
  if (!fileUrl) {
    throw new Error('Missing source URL. Set FILE_1_URL and FILE_2_URL in Shared.gs.');
  }
  return SpreadsheetApp.openByUrl(fileUrl);
}

function readTicketsFromSource(source) {
  const fileUrl = resolveUrl(source.fileUrl);
  const ss = getSourceSpreadsheet(fileUrl);
  const sheet = ss.getSheetByName(source.sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + source.sheetName + '" not found in ' + source.label + '.');
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, CFG.HEADERS.length).getValues();
  return values
    .filter(row => normalizeTicketId(row[0]))
    .map(row => [row[0], row[1], row[2], row[3], source.label]);
}

function importData() {
  try {
    let rows = [];
    CFG.SOURCES.forEach(source => {
      rows = rows.concat(readTicketsFromSource(source));
    });

    const sheet = getOrCreateSheet(CFG.FINAL_SHEET);
    sheet.clear();
    sheet.getRange(1, 1, 1, CFG.FINAL_HEADERS.length).setValues([CFG.FINAL_HEADERS]);
    if (rows.length) {
      sheet.getRange(2, 1, rows.length, CFG.FINAL_HEADERS.length).setValues(rows);
    }
    formatTicketSheet(sheet, rows.length + 1, CFG.FINAL_HEADERS.length);

    showDoneAlert('Imported ' + rows.length + ' tickets.');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.message);
  }
}

function readFinalRows() {
  const sheet = getOrCreateSheet(CFG.FINAL_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet.getRange(2, 1, lastRow - 1, CFG.FINAL_HEADERS.length).getValues()
    .filter(row => normalizeTicketId(row[0]))
    .map(row => ({
      ticketId: normalizeTicketId(row[0]),
      values: row.slice(0, CFG.HEADERS.length),
      status: normalizeStatus(row[3]),
      source: String(row[4] || '').trim(),
    }));
}

function buildSourceIndex() {
  const index = new Map();

  CFG.SOURCES.forEach(source => {
    const fileUrl = resolveUrl(source.fileUrl);
    const ss = getSourceSpreadsheet(fileUrl);
    const sheet = ss.getSheetByName(source.sheetName);
    if (!sheet) {
      throw new Error('Sheet "' + source.sheetName + '" not found in ' + source.label + '.');
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const values = sheet.getRange(2, 1, lastRow - 1, CFG.HEADERS.length).getValues();
    values.forEach((row, offset) => {
      const ticketId = normalizeTicketId(row[0]);
      if (!ticketId) return;
      index.set(source.label + '|' + ticketId, {
        sheet,
        rowNumber: offset + 2,
        status: normalizeStatus(row[3]),
      });
    });
  });

  return index;
}

function exportData() {
  try {
    const finalRows = readFinalRows();
    const sourceIndex = buildSourceIndex();
    let updated = 0;
    let skippedDone = 0;
    let missing = 0;

    finalRows.forEach(row => {
      if (row.status === 'DONE') {
        skippedDone++;
        return;
      }

      const key = row.source + '|' + row.ticketId;
      const target = sourceIndex.get(key);
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
