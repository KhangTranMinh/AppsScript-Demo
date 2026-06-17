/**
 * File Ticket Food - Ticket file.
 *
 * Paste this file into Code.gs in the "File Ticket Food" Apps Script project.
 * Paste shared.js into Shared.gs in the same project.
 *
 * Menus:
 *   - Tickets -> Create Template
 *   - Tickets -> Generate Sample Data
 *
 * This file always writes Label = "Food". File Ticket final later uses that
 * label to export edited rows back into this spreadsheet.
 */

/**
 * Register the custom menu when the spreadsheet opens.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tickets')
    .addItem('Create Template', 'createTemplate')
    .addItem('Generate Sample Data', 'generateSampleData')
    .addToUi();
}

/**
 * Create an empty Food ticket sheet with the shared ticket columns.
 */
function createTemplate() {
  const sheet = getOrCreateSheet(CFG.TICKET_SHEET);
  createTicketTemplate(sheet);
  showDoneAlert('Template created for File Ticket Food.');
}

/**
 * Generate Food sample tickets.
 *
 * Ticket descriptions intentionally contain line breaks to verify that the
 * template wraps multi-line descriptions correctly.
 */
function generateSampleData() {
  const rows = [
    ['FOOD-1001', 'Food', 'Order pantry restock\nInclude rice, cooking oil, and canned goods.', new Date('2026-06-01'), 'CREATED'],
    ['FOOD-1002', 'Food', 'Review lunch vendor invoice\nCheck delivery fees and tax lines.', new Date('2026-06-02'), 'IN-PROGRESS'],
    ['FOOD-1003', 'Food', 'Close completed snack delivery\nAll items were received and stored.', new Date('2026-06-03'), 'DONE'],
    ['FOOD-1004', 'Food', 'Update weekly meal plan\nAdd vegetarian and allergy-safe options.', new Date('2026-06-04'), 'CREATED'],
    ['FOOD-1005', 'Food', 'Confirm catering headcount\nCollect final count before placing order.', new Date('2026-06-05'), 'IN-PROGRESS'],
    ['FOOD-1006', 'Food', 'Prepare kitchen cleanup checklist\nAssign owner for fridge and dry storage.', new Date('2026-06-06'), 'CREATED'],
    ['FOOD-1007', 'Food', 'Investigate missing receipt\nAsk vendor to resend itemized receipt.', new Date('2026-06-07'), 'IN-PROGRESS'],
    ['FOOD-1008', 'Food', 'Archive old menu notes\nMove last quarter notes out of active planning.', new Date('2026-06-08'), 'DONE'],
  ];

  const sheet = getOrCreateSheet(CFG.TICKET_SHEET);
  writeTicketRows(sheet, rows);
  showDoneAlert('Generated ' + rows.length + ' Food tickets.');
}
