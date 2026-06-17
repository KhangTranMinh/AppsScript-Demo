/**
 * File Final — Merge to Final
 *
 * Paste this file alongside shared.js in your "File Final" Apps Script project.
 *
 * What it does:
 *   1. Registers a "Run → Merge to Final" menu item.
 *   2. Reads data from Sheet A & Sheet B (File 1) and Sheet C & Sheet D (File 2)
 *      by opening those spreadsheets via URL.
 *   3. Combines all data, detects duplicates by (city, country), merges source
 *      labels, and writes everything to a final sheet.
 *   4. Highlights duplicate rows in red, applies alternating row colors for
 *      unique rows, and shows a summary count.
 *
 * Configuration:
 *   - CFG.FILE_1_URL and CFG.FILE_2_URL must be set in shared.js to point to
 *     the actual spreadsheet URLs.
 *   - CFG.SOURCES defines which sheets to pull from.
 *   - CFG.FINAL_SHEET is the output sheet name.
 *
 * Dependencies: shared.js (provides CFG, getOrCreateSheet, showDoneAlert)
 */

// ============================================================
// MENU
// ============================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Run')
    .addItem('Merge to Final', 'mergeToFinal')
    .addToUi();
}

// ============================================================
// URL RESOLVER
// Translates a token like 'FILE_1_URL' into the actual URL
// stored in CFG. Passes raw URLs through unchanged.
// ============================================================

/**
 * Resolve a token or URL to an actual URL.
 * @param {string} token - Either a config key ('FILE_1_URL'|'FILE_2_URL') or a full URL.
 * @returns {string} The resolved URL.
 */
function resolveUrl(token) {
  if (token === 'FILE_1_URL') return CFG.FILE_1_URL;
  if (token === 'FILE_2_URL') return CFG.FILE_2_URL;
  return token;
}

// ============================================================
// MERGE
// ============================================================

/**
 * Read all data rows from a specific sheet in an external spreadsheet.
 *
 * Opens the file by URL, finds the named sheet, and reads rows 2..lastRow
 * (skipping the header row). Returns an array of row objects.
 *
 * @param {string} fileUrl - The full URL of the source spreadsheet.
 * @param {string} sheetName - The tab name within that spreadsheet.
 * @returns {Array<Object>} Array of { city, country, continent, population, area, density, gdp, founded, source }.
 * @throws {Error} If the URL is empty, sheet is missing, or sheet has no data rows.
 */
function getSheetDataFromFile(fileUrl, sheetName) {
  if (!fileUrl) {
    throw new Error('No URL configured for source. Please set CFG.FILE_1_URL and CFG.FILE_2_URL in shared.js');
  }

  const ss = SpreadsheetApp.openByUrl(fileUrl);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found in ' + fileUrl);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error('Sheet "' + sheetName + '" is empty. Please run Generate Data first.');
  }

  // Read all columns (8 columns from header) minus header row
  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();

  // Map rows to objects, tagging each with its source sheet name
  return data.map(row => ({
    city: row[0], country: row[1], continent: row[2],
    population: row[3], area: row[4], density: row[5],
    gdp: row[6], founded: row[7], source: sheetName
  }));
}

/**
 * Detect duplicate entries in the combined data set.
 *
 * Uses a Map keyed by "city|country" (lowercase) to track first occurrences.
 * When a duplicate is found:
 *   - The row index is recorded (2-based to match sheet row numbering).
 *   - The duplicate's source label is merged with the original's label
 *     (e.g., "Sheet B, Sheet D").
 *
 * @param {Array<Object>} allData - Combined data from all source sheets.
 * @returns {{ data: Array<Object>, duplicateRows: Array<number> }}
 *   Processed data (with merged source labels) and duplicate row indices.
 */
function findAndMarkDuplicates(allData) {
  const seen = new Map();      // key → index of first occurrence
  const duplicateRows = [];    // 2-based row numbers for duplicates

  allData.forEach((item, index) => {
    const key = `${item.city}|${item.country}`.toLowerCase();

    if (seen.has(key)) {
      duplicateRows.push(index + 2);                // +2 for header + 0-index offset
      const existingItem = allData[seen.get(key)];  // get the first occurrence
      item.source = `${existingItem.source}, ${item.source}`;  // merge source labels
    } else {
      seen.set(key, index);
    }
  });

  return { data: allData, duplicateRows };
}

/**
 * Write and format the final merged sheet.
 *
 * Includes headers, data rows, number formatting, auto-resize, borders,
 * alternating row colors (skipping duplicates), and red highlighting for
 * duplicate rows.
 *
 * @param {Sheet} sheet - The target sheet.
 * @param {Array<Object>} data - Merged row objects with a 'source' field.
 * @param {Array<number>} duplicateRows - 2-based row indices to highlight.
 */
function formatFinalSheet(sheet, data, duplicateRows) {
  const headers = ['City', 'Country', 'Continent', 'Population', 'Area (km²)',
                   'Density (per km²)', 'GDP (B USD)', 'Founded', 'Source'];

  // Write header row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Convert objects back to 2D array for batch writing
  const dataArray = data.map(d => [
    d.city, d.country, d.continent, d.population, d.area,
    d.density, d.gdp, d.founded, d.source
  ]);

  sheet.getRange(2, 1, dataArray.length, 9).setValues(dataArray);

  // Number formatting for numeric columns
  sheet.getRange(2, 4, dataArray.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 5, dataArray.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 6, dataArray.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 7, dataArray.length, 1).setNumberFormat('$#,##0.0');

  sheet.autoResizeColumns(1, headers.length);

  // Borders around the entire table
  sheet.getRange(1, 1, dataArray.length + 1, headers.length)
    .setBorder(true, true, true, true, true, true,
               '#000000', SpreadsheetApp.BorderStyle.SOLID);

  // Alternating row colors (skip duplicate rows so their red stands out)
  for (let i = 2; i <= dataArray.length + 1; i += 2) {
    if (!duplicateRows.includes(i)) {
      sheet.getRange(i, 1, 1, 9).setBackground('#f3f3f3');
    }
  }

  // Highlight duplicates in red
  duplicateRows.forEach(row => {
    sheet.getRange(row, 1, 1, 9).setBackground('#ffcccc');
    sheet.getRange(row, 1, 1, 9).setFontColor('#cc0000');
  });
}

/**
 * Main merge entry point.
 *
 * Orchestrates reading from all source files/sheets, combining data,
 * detecting duplicates, and writing the formatted final sheet.
 * Wraps everything in try/catch to show user-friendly error messages.
 */
function mergeToFinal() {
  try {
    const sources = CFG.SOURCES;
    let combinedData = [];

    // Read data from each source (file + sheet) and concatenate
    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      const fileUrl = resolveUrl(s.fileUrl);
      const rows = getSheetDataFromFile(fileUrl, s.sheetName);
      combinedData = combinedData.concat(rows);
    }

    // Detect and mark duplicates
    const { data: processedData, duplicateRows } = findAndMarkDuplicates(combinedData);

    // Write to final sheet
    const finalSheet = getOrCreateSheet(CFG.FINAL_SHEET);
    finalSheet.clear();
    formatFinalSheet(finalSheet, processedData, duplicateRows);

    // Compute summary
    const total = processedData.length;
    const unique = total - duplicateRows.length;

    // Show results
    showDoneAlert(
      'Total: ' + total + ' rows\n' +
      'Unique: ' + unique + '\n' +
      'Duplicates: ' + duplicateRows.length + '\n\n' +
      'Duplicates highlighted in RED'
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Error: ' + e.message);
  }
}
