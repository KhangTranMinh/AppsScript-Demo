/**
 * Constants for exporting the source CALENDAR layout to the target
 * "Calendar by vertical" layout.
 *
 * The row mapping is intentionally explicit from the target sheet point of
 * view. The source and target templates have fixed layouts, so reviewing exact
 * target row <- source row pairs is safer than hiding the behavior behind a
 * formula.
 */

var EXPORT_CALENDAR_CONFIG = {
  SOURCE_SPREADSHEET_ID: '1PGHZZ5e2jwk9R7KFheT9ktoNcPCrIs35S07j0Ap9Lks',
  TARGET_SPREADSHEET_ID: '1xTWrm2yQ4zckt7_4XI9EENGVT82DX5Ok-dhCGnfQy1w',

  SOURCE_SHEET_NAME: 'CALENDAR',
  TARGET_SHEET_NAME: 'Calendar by vertical',

  // SpreadsheetApp row/column numbers are 1-based, matching the spreadsheet UI.
  // A = 1, B = 2, C = 3, D = 4.
  // The export copies only calendar grid content from D onward. Columns B:C are
  // structural labels in the templates and should not be overwritten.
  CALENDAR_START_COLUMN: 4, // D

  // Current target rows. Add more explicit entries here after more vertical
  // groups are created in the target "Calendar by vertical" sheet.
  ROW_MAPPINGS: [
    // Target vertical group: Transport
    { targetRow: 6, vertical: 'Transport', slot: 'Homepage', sourceRow: 6 },
    { targetRow: 7, vertical: 'Transport', slot: 'Transport - Intrip', sourceRow: 19 },
    { targetRow: 8, vertical: 'Transport', slot: 'Food - Home', sourceRow: 32 },
    { targetRow: 9, vertical: 'Transport', slot: 'Food - Order', sourceRow: 45 },
    { targetRow: 10, vertical: 'Transport', slot: 'Delivery - Home', sourceRow: 58 },
    { targetRow: 11, vertical: 'Transport', slot: 'Delivery - Booking', sourceRow: 71 },
    { targetRow: 12, vertical: 'Transport', slot: 'Clean - Home', sourceRow: 84 },
    { targetRow: 13, vertical: 'Transport', slot: 'Clean - Booking', sourceRow: 97 },
    { targetRow: 14, vertical: 'Transport', slot: 'Flight - Home', sourceRow: 110 },

    // Target vertical group: Food
    { targetRow: 16, vertical: 'Food', slot: 'Homepage', sourceRow: 7 },
    { targetRow: 17, vertical: 'Food', slot: 'Transport - Intrip', sourceRow: 20 },
    { targetRow: 18, vertical: 'Food', slot: 'Food - Home', sourceRow: 33 },
    { targetRow: 19, vertical: 'Food', slot: 'Food - Order', sourceRow: 46 },
    { targetRow: 20, vertical: 'Food', slot: 'Delivery - Home', sourceRow: 59 },
    { targetRow: 21, vertical: 'Food', slot: 'Delivery - Booking', sourceRow: 72 },
    { targetRow: 22, vertical: 'Food', slot: 'Clean - Home', sourceRow: 85 },
    { targetRow: 23, vertical: 'Food', slot: 'Clean - Booking', sourceRow: 98 },
    { targetRow: 24, vertical: 'Food', slot: 'Flight - Home', sourceRow: 111 },

    // Target vertical group: Delivery
    { targetRow: 26, vertical: 'Delivery', slot: 'Homepage', sourceRow: 8 },
    { targetRow: 27, vertical: 'Delivery', slot: 'Transport - Intrip', sourceRow: 21 },
    { targetRow: 28, vertical: 'Delivery', slot: 'Food - Home', sourceRow: 34 },
    { targetRow: 29, vertical: 'Delivery', slot: 'Food - Order', sourceRow: 47 },
    { targetRow: 30, vertical: 'Delivery', slot: 'Delivery - Home', sourceRow: 60 },
    { targetRow: 31, vertical: 'Delivery', slot: 'Delivery - Booking', sourceRow: 73 },
    { targetRow: 32, vertical: 'Delivery', slot: 'Clean - Home', sourceRow: 86 },
    { targetRow: 33, vertical: 'Delivery', slot: 'Clean - Booking', sourceRow: 99 },
    { targetRow: 34, vertical: 'Delivery', slot: 'Flight - Home', sourceRow: 112 }
  ]
};
