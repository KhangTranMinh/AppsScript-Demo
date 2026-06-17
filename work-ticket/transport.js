/**
 * File Ticket Transport - Ticket file.
 *
 * Paste this file into Code.gs in the "File Ticket Transport" Apps Script project.
 * Paste shared.js into Shared.gs in the same project.
 *
 * Menus:
 *   - Tickets -> Create Template
 *   - Tickets -> Generate Sample Data
 *
 * This file always writes Label = "Transport". File Ticket final later uses
 * that label to export edited rows back into this spreadsheet.
 */

const TICKET_FILE = {
  label: 'Transport',
  idPrefix: 'TRN',
  startNumber: 2000,
};

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
 * Create an empty Transport ticket sheet with the shared ticket columns.
 */
function createTemplate() {
  const sheet = getOrCreateSheet(CFG.TICKET_SHEET);
  createTicketTemplate(sheet);
  showDoneAlert('Template created for File Ticket Transport.');
}

/**
 * Generate Transport sample tickets.
 *
 * Ticket descriptions intentionally contain line breaks to verify that the
 * template wraps multi-line descriptions correctly.
 */
function generateSampleData() {
  const rows = [
    ['TRN-2001', 'Transport', 'Schedule airport pickup\nConfirm driver, pickup time, and passenger phone.', new Date('2026-06-01T09:00:00'), 'CREATED'],
    ['TRN-2002', 'Transport', 'Review fuel reimbursement\nValidate mileage and receipt attachment.', new Date('2026-06-02T10:15:00'), 'IN-PROGRESS'],
    ['TRN-2003', 'Transport', 'Close completed shuttle booking\nTrip was completed and invoice matched.', new Date('2026-06-03T11:30:00'), 'DONE'],
    ['TRN-2004', 'Transport', 'Add missing vehicle inspection\nBackfill checklist for weekly van review.', new Date('2026-06-04T13:00:00'), 'CREATED'],
    ['TRN-2005', 'Transport', 'Confirm delivery route update\nMake pickup and drop-off order consistent.', new Date('2026-06-05T14:20:00'), 'IN-PROGRESS'],
    ['TRN-2006', 'Transport', 'Clean up expired parking passes\nKeep passes used by active drivers only.', new Date('2026-06-06T15:45:00'), 'CREATED'],
    ['TRN-2007', 'Transport', 'Document transit delay exception\nInclude approval owner and new arrival time.', new Date('2026-06-07T16:10:00'), 'IN-PROGRESS'],
    ['TRN-2008', 'Transport', 'Verify mobile ticket upload\nTest image and PDF receipts from drivers.', new Date('2026-06-08T17:25:00'), 'DONE'],
  ];

  const sheet = getOrCreateSheet(CFG.TICKET_SHEET);
  writeTicketRows(sheet, rows);
  showDoneAlert('Generated ' + rows.length + ' Transport tickets.');
}
