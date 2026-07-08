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
  // A = 1, B = 2, G = 7, M = 13, N = 14.
  // JavaScript arrays returned by getValues() are 0-based, so the code reads
  // these columns from rowValues with COLUMN_NUMBER - 1.
  COLUMNS: {
    CAMPAIGN_NAME: 2, // B
    SERVICE_L1: 7,    // G
    TITLE: 13,        // M
    MESSAGE: 14       // N
  },

  TARGET_COLUMNS: {
    TITLE: 7,   // G
    MESSAGE: 8, // H
    STATUS: 9   // I
  },

  // Row 1 is blank, row 2 is the header row, and data starts on row 3.
  HEADER_ROW_COUNT: 2
};
