/**
 * File 1 — Generate Data 1
 *
 * Paste this file alongside shared.js in your "File 1" Apps Script project.
 *
 * What it does:
 *   1. Registers a "Run → Generate Data 1" menu item.
 *   2. Creates/clears Sheet A and populates it with 10 Asian cities.
 *   3. Creates/clears Sheet B and populates it with 20 mixed cities from
 *      South America, North America, Africa, Europe, Oceania, and Asia.
 *
 * Dependencies: shared.js (provides CFG, getOrCreateSheet, formatSheet,
 *                prepareData, showDoneAlert)
 */

// ============================================================
// MENU
// Registers the custom menu so the user can run the script
// from the Google Sheets UI.
// ============================================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Run')
    .addItem('Generate Data 1', 'generateData1')
    .addToUi();
}

// ============================================================
// GENERATE DATA 1
// Creates two sheets with sample city data.
// ============================================================

function generateData1() {
  // Get or create target sheets
  const sheet1 = getOrCreateSheet(CFG.SHEET_A);
  const sheet2 = getOrCreateSheet(CFG.SHEET_B);

  // Clear existing content so data is fresh
  sheet1.clear();
  sheet2.clear();

  const headers = CFG.HEADERS;

  // ---- Sheet A: 10 Asian Cities -------------------------------------------
  // Each entry: [City, Country, Continent, Population, Area, _, GDP, Founded]
  const cities1 = [
    ['Tokyo',   'Japan',       'Asia', 37400068, 2194,  1880, 1457],
    ['Delhi',   'India',       'Asia', 31181376, 1484,  370,  1011],
    ['Shanghai','China',       'Asia', 27795702, 6341,  630,  751],
    ['Mumbai',  'India',       'Asia', 20667656, 603,   310,  1507],
    ['Beijing', 'China',       'Asia', 20463000, 16411, 520,  1045],
    ['Dhaka',   'Bangladesh',  'Asia', 22478116, 306,   160,  1608],
    ['Osaka',   'Japan',       'Asia', 19281000, 225,   680,  1583],
    ['Karachi', 'Pakistan',    'Asia', 16839220, 3780,  100,  1729],
    ['Kolkata', 'India',       'Asia', 14974073, 200,   150,  1690],
    ['Bangkok', 'Thailand',    'Asia', 10722891, 1569,  170,  1767],
  ];

  // ---- Sheet B: 20 Mixed Cities from various continents --------------------
  const cities2 = [
    ['São Paulo',      'Brazil',        'South America', 22429411, 1521, 430,  1554],
    ['Mexico City',    'Mexico',        'North America', 21918936, 1495, 411,  1325],
    ['Cairo',          'Egypt',         'Africa',        21322750, 3085, 190,  969],
    ['New York',       'United States', 'North America', 18819000, 783,  1510, 1624],
    ['Buenos Aires',   'Argentina',     'South America', 15369919, 203,  190,  1536],
    ['Istanbul',       'Turkey',        'Europe',        15840920, 5461, 330,  660],
    ['Lagos',          'Nigeria',       'Africa',        15387639, 1171, 145,  1472],
    ['London',         'United Kingdom','Europe',        9002488,  1572, 1070, 43],
    ['Paris',          'France',        'Europe',        2161000,  105,  720,  250],
    ['Moscow',         'Russia',        'Europe',        12537954, 2561, 520,  1147],
    ['Los Angeles',    'United States', 'North America', 12447000, 1302, 1010, 1781],
    ['Rio de Janeiro', 'Brazil',        'South America', 13634274, 1255, 220,  1565],
    ['Sydney',         'Australia',     'Oceania',       5367206,  12368,450,  1788],
    ['Toronto',        'Canada',        'North America', 2730691,  630,  370,  1793],
    ['Berlin',         'Germany',       'Europe',        3677472,  892,  480,  1237],
    ['Dubai',          'UAE',           'Asia',          3331420,  1588, 160,  1833],
    ['Hong Kong',      'China',         'Asia',          7413100,  1106, 380,  1842],
    ['Melbourne',      'Australia',     'Oceania',       5078193,  9993, 340,  1835],
    ['Lima',           'Peru',          'South America', 10882757, 2672, 160,  1535],
    ['Bogota',         'Colombia',      'South America', 10978360, 1587, 180,  1538],
  ];

  // Format and write both sheets
  formatSheet(sheet1, prepareData(cities1), headers);
  formatSheet(sheet2, prepareData(cities2), headers);

  // Show success alert
  showDoneAlert(CFG.SHEET_A + ': 10 Asian cities\n' + CFG.SHEET_B + ': 20 mixed cities');
}
