/**
 * File 2 — Generate Data 2
 *
 * Paste this file alongside shared.js in your "File 2" Apps Script project.
 *
 * What it does:
 *   1. Registers a "Run → Generate Data 2" menu item.
 *   2. Creates/clears Sheet C and populates it with 10 European cities.
 *   3. Creates/clears Sheet D and populates it with 20 mixed cities,
 *      including intentional duplicate entries (Shanghai, Beijing, Dubai,
 *      Lagos, Vienna) that overlap with File 1 or within File 2. These rows
 *      are highlighted in red.
 *
 * Dependencies: shared.js (provides CFG, getOrCreateSheet, formatSheet,
 *                prepareData, showDoneAlert)
 */

// ============================================================
// MENU
// ============================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Run')
    .addItem('Generate Data 2', 'generateData2')
    .addToUi();
}

// ============================================================
// DUPLICATE HIGHLIGHTING
// Marks specific rows in a sheet with red background + font
// to visually indicate duplicate entries.
//
// Called manually with known sheet row numbers. Row 1 is the header, so row 2
// is the first data row.
// ============================================================

/**
 * Highlight duplicate rows in red.
 * @param {Sheet} sheet - The sheet to mark.
 * @param {Array<number>} duplicateRows - Sheet row numbers to highlight.
 */
function highlightDuplicates(sheet, duplicateRows) {
  duplicateRows.forEach(row => {
    sheet.getRange(row, 1, 1, CFG.HEADERS.length).setBackground('#ffcccc');
    sheet.getRange(row, 1, 1, CFG.HEADERS.length).setFontColor('#cc0000');
  });
}

// ============================================================
// GENERATE DATA 2
// Creates two sheets with sample city data + marked duplicates.
// ============================================================

function generateData2() {
  const sheet1 = getOrCreateSheet(CFG.SHEET_C);
  const sheet2 = getOrCreateSheet(CFG.SHEET_D);

  sheet1.clear();
  sheet2.clear();

  const headers = CFG.HEADERS;

  // ---- Sheet C: 10 European Cities ----------------------------------------
  const cities1 = [
    ['Madrid',    'Spain',          'Europe', 6751251, 604,  200,  1561],
    ['Rome',      'Italy',          'Europe', 2873000, 1285, 520,  -753],
    ['Vienna',    'Austria',        'Europe', 1911191, 415,  750,  1804],  // duplicate of Sheet D row 10 (array row 9)
    ['Prague',    'Czech Republic', 'Europe', 1309000, 496,  150,  1356],
    ['Athens',    'Greece',         'Europe', 3153355, 412,  280,  -3000],
    ['Amsterdam', 'Netherlands',    'Europe', 872680,  219,  120,  1275],
    ['Stockholm', 'Sweden',         'Europe', 975904,  188,  250,  1252],
    ['Warsaw',    'Poland',         'Europe', 1790658, 517,  350,  1300],
    ['Munich',    'Germany',        'Europe', 1484226, 310,  280,  1175],
    ['Barcelona', 'Spain',          'Europe', 1620343, 101,  350,  10],
  ];

  // ---- Sheet D: 20 Mixed Cities (with intentional duplicates) -------------
  // Cross-file duplicates detected during merge:
  //   - Shanghai: File 1 Sheet A row 4 (array row 3)
  //               File 2 Sheet D row 2 (array row 1)
  //   - Beijing:  File 1 Sheet A row 6 (array row 5)
  //               File 2 Sheet D row 3 (array row 2)
  //   - Dubai:    File 1 Sheet B row 17 (array row 16)
  //               File 2 Sheet D row 4 (array row 3)
  //   - Lagos:    File 1 Sheet B row 8 (array row 7)
  //               File 2 Sheet D row 5 (array row 4)
  //
  // Intra-file duplicate detected during merge:
  //   - Vienna:   File 2 Sheet C row 4 (array row 3)
  //               File 2 Sheet D row 10 (array row 9)
  const cities2 = [
    ['Shanghai',    'China',          'Asia',          27795702, 6341, 630,  751],  // duplicate of File 1 Sheet A row 4 (array row 3)
    ['Beijing',     'China',          'Asia',          20463000, 16411,520,  1045],  // duplicate of File 1 Sheet A row 6 (array row 5)
    ['Dubai',       'UAE',            'Asia',          3331420,  1588, 160,  1833],  // duplicate of File 1 Sheet B row 17 (array row 16)
    ['Lagos',       'Nigeria',        'Africa',        15387639, 1171, 145,  1472],  // duplicate of File 1 Sheet B row 8 (array row 7)
    ['Copenhagen',  'Denmark',        'Europe',        794128,   88,   400,  1167],
    ['Helsinki',    'Finland',        'Europe',        656229,   214,  280,  1550],
    ['Lisbon',      'Portugal',       'Europe',        505526,   100,  340,  -216],
    ['Brussels',    'Belgium',        'Europe',        1208542,  33,   250,  979],
    ['Vienna',      'Austria',        'Europe',        1911191,  415,  750,  1804],  // duplicate of Sheet C row 4 (array row 3)
    ['Jakarta',     'Indonesia',      'Asia',          10770487, 662,  280,  397],
    ['Manila',      'Philippines',    'Asia',          13923452, 43,   160,  1571],
    ['Seoul',       'South Korea',    'Asia',          9776000,  605,  410,  -18],
    ['Singapore',   'Singapore',      'Asia',          5685807,  733,  280,  1819],
    ['Bucharest',   'Romania',        'Europe',        1883425,  228,  400,  1459],
    ['Budapest',    'Hungary',        'Europe',        1752287,  525,  280,  897],
    ['Santiago',    'Chile',          'South America', 6680272,  641,  240,  1541],
    ['Johannesburg','South Africa',   'Africa',        5635127,  1645, 340,  1886],
    ['Auckland',    'New Zealand',    'Oceania',       1657000,  1086, 250,  1350],
    ['Taipei',      'Taiwan',         'Asia',          2646204,  271,  350,  1875],
    ['Guangzhou',   'China',          'Asia',          15311619, 7434, 320,  -214],
  ];

  const data1 = prepareData(cities1);
  const data2 = prepareData(cities2);

  // Write and format both sheets
  formatSheet(sheet1, data1, headers);
  formatSheet(sheet2, data2, headers);

  // Mark duplicate rows in red. The function receives sheet row numbers
  // because it writes directly to spreadsheet ranges.
  // Sheet D: rows 2-5 and 10 (array rows 1-4 and 9)
  highlightDuplicates(sheet2, [2, 3, 4, 5, 10]);
  // Sheet C: row 4 (array row 3)
  highlightDuplicates(sheet1, [4]);

  showDoneAlert(CFG.SHEET_C + ': 10 European cities\n' + CFG.SHEET_D + ': 20 mixed cities\n\nDuplicates highlighted in RED');
}
