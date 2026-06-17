/**
 * Shared Configuration & Utilities
 *
 * This file must be pasted into ALL three Apps Script projects (File 1, File 2, File Final).
 * It provides:
 *   - CFG: centralized configuration object with sheet names, URLs, and headers
 *   - getOrCreateSheet(): safely get or create a sheet by name
 *   - formatSheet(): apply headers, formatting, numbering, borders, and alternating row colors
 *   - prepareData(): compute density (population / area) from raw city arrays
 *   - showDoneAlert(): unified success alert helper
 *
 * ⚠️ Before running "Merge to Final", paste the spreadsheet URLs of File 1 and File 2
 *    into CFG.FILE_1_URL and CFG.FILE_2_URL below.
 */

// ============================================================
// CONFIGURATION
// ============================================================

const CFG = {
  // --- Sheet Names ----------------------------------------------------------
  // These are the sheet tabs created / read by each script.
  // Change them if your sheet names differ.
  SHEET_A: 'Sheet A',       // File 1 — 10 Asian cities
  SHEET_B: 'Sheet B',       // File 1 — 20 mixed cities
  SHEET_C: 'Sheet C',       // File 2 — 10 European cities
  SHEET_D: 'Sheet D',       // File 2 — 20 mixed cities (with duplicates)
  FINAL_SHEET: 'Sheet final', // File Final — merged output

  // --- Source File URLs -----------------------------------------------------
  // Required for File Final only.
  // Paste the full browser URL of each spreadsheet (including the /edit part).
  // Example: 'https://docs.google.com/spreadsheets/d/abc123/edit'
  FILE_1_URL: '',
  FILE_2_URL: '',

  // --- Source Table for Merge -----------------------------------------------
  // Each entry tells mergeToFinal() which file + sheet to read.
  // The "fileUrl" field references the keys above; resolveUrl() converts them.
  SOURCES: [
    { fileUrl: 'FILE_1_URL', sheetName: 'Sheet A' },
    { fileUrl: 'FILE_1_URL', sheetName: 'Sheet B' },
    { fileUrl: 'FILE_2_URL', sheetName: 'Sheet C' },
    { fileUrl: 'FILE_2_URL', sheetName: 'Sheet D' },
  ],

  // --- Column Headers -------------------------------------------------------
  HEADERS: [
    'City', 'Country', 'Continent', 'Population',
    'Area (km²)', 'Density (per km²)', 'GDP (B USD)', 'Founded'
  ],
  FINAL_HEADERS: [
    'City', 'Country', 'Continent', 'Population',
    'Area (km²)', 'Density (per km²)', 'GDP (B USD)', 'Founded', 'Source'
  ],
};

// ============================================================
// SHARED UTILITIES
// ============================================================

/**
 * Get a sheet by name or create it if it doesn't exist.
 * @param {string} name - The sheet tab name.
 * @returns {Sheet} The existing or newly created sheet.
 */
function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

/**
 * Format a sheet with headers, data, number formatting, borders, and alternating row colors.
 * @param {Sheet} sheet - The sheet to format.
 * @param {Array<Array>} data - 2D array of row values (excluding headers).
 * @param {Array<string>} headers - Column header strings.
 */
function formatSheet(sheet, data, headers) {
  // Write header row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style header
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');

  // Write data rows (starting from row 2)
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);

  // Number format for numeric columns (Population, Area, Density, GDP)
  sheet.getRange(2, 4, data.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 5, data.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 6, data.length, 1).setNumberFormat('#,##0');
  sheet.getRange(2, 7, data.length, 1).setNumberFormat('$#,##0.0');

  // Auto-resize to fit content
  sheet.autoResizeColumns(1, headers.length);

  // Add borders around the entire data area
  sheet.getRange(1, 1, data.length + 1, headers.length).setBorder(
    true, true, true, true, true, true,
    '#000000', SpreadsheetApp.BorderStyle.SOLID
  );

  // Alternating row background (light gray on even rows)
  for (let i = 2; i <= data.length + 1; i += 2) {
    sheet.getRange(i, 1, 1, headers.length).setBackground('#f3f3f3');
  }
}

/**
 * Prepare city data by computing density (Population / Area).
 * Expects each city array to have at least 8 elements at indices:
 *   0: City, 1: Country, 2: Continent, 3: Population,
 *   4: Area, 5: (ignored), 6: GDP, 7: Founded
 * @param {Array<Array>} cities - Raw city data.
 * @returns {Array<Array>} Processed rows with computed density.
 */
function prepareData(cities) {
  return cities.map(city => {
    const population = city[3];
    const area = city[4];
    const density = Math.round(population / area);
    return [city[0], city[1], city[2], population, area, density, city[6], city[7]];
  });
}

/**
 * Show a unified success alert dialog.
 * @param {string} message - The message body (without the "✅ Done!" prefix).
 */
function showDoneAlert(message) {
  SpreadsheetApp.getUi().alert('✅ Done!\n\n' + message);
}
