/**
 * Constants for the SOURCE spreadsheet Apps Script project.
 *
 * This script should be copied into the Apps Script project that is bound to:
 * https://docs.google.com/spreadsheets/d/1PGHZZ5e2jwk9R7KFheT9ktoNcPCrIs35S07j0Ap9Lks/edit
 */

var SOURCE_CONFIG = {
  // Spreadsheet IDs are the long values between /d/ and /edit in the URL.
  SOURCE_SPREADSHEET_ID: '1PGHZZ5e2jwk9R7KFheT9ktoNcPCrIs35S07j0Ap9Lks',
  TARGET_SPREADSHEET_ID: '1xTWrm2yQ4zckt7_4XI9EENGVT82DX5Ok-dhCGnfQy1w',

  SOURCE_SHEET_NAME: 'Detail',

  // Required target tabs. Missing tabs are skipped so they can be added later.
  SERVICE_SHEET_NAMES: [
    'Service level 1',
    'Transport',
    'Food',
    'Delivery',
    'Fintech',
    'Clean',
    'DG',
    'Loyalty',
    'BD',
    'Brand'
  ],

  // SpreadsheetApp row/column numbers are 1-based, matching the spreadsheet UI:
  // A = 1, B = 2, C = 3, D = 4, E = 5, F = 6, G = 7, H = 8,
  // I = 9, J = 10, K = 11, L = 12, M = 13, N = 14.
  // JavaScript arrays returned by getValues() are 0-based, so the code reads
  // these columns from rowValues with COLUMN_NUMBER - 1.
  COLUMNS: {
    CAMPAIGN_NAME: 2, // B
    PIC: 3,           // C
    RELEASE_DATE: 4,  // D
    TIME: 5,          // E
    CHANNEL: 6,       // F
    SERVICE_L1: 7,    // G
    SERVICE_L2: 8,    // H
    CAMPAIGN_TYPE: 9, // I
    LOCATION: 10,     // J
    SEGMENT: 11,      // K
    CONTENT_ANGLE: 12, // L
    TITLE: 13,        // M
    MESSAGE: 14       // N
  },

  REQUIRED_CAMPAIGN_FIELD_COLUMNS: [
    3,  // C PIC
    4,  // D Release Date
    5,  // E Time
    6,  // F Channel
    7,  // G Service L1
    8,  // H Service L2
    9,  // I Campaign type
    10, // J Location
    11, // K Segment
    12  // L Content angle
  ],

  TARGET_COLUMNS: {
    CAMPAIGN_NAME: 2,  // B
    PIC: 3,            // C
    RELEASE_DATE: 4,   // D
    TIME: 5,           // E
    CONTENT_ANGLE: 6,  // F
    TITLE: 7,          // G
    MESSAGE: 8,        // H
    STATUS: 9          // I
  },

  // Row 1 is blank, row 2 is the header row, and data starts on row 3.
  HEADER_ROW_COUNT: 2
};
