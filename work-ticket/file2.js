/**
 * File 2 - Ticket data source.
 *
 * Paste this file into Code.gs in the "File 2" Apps Script project.
 * Paste shared.js into Shared.gs in the same project.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tickets')
    .addItem('Create Template', 'createTemplate')
    .addItem('Generate Sample Data', 'generateSampleData')
    .addToUi();
}

function createTemplate() {
  const sheet = getOrCreateSheet(CFG.TICKET_SHEET);
  createTicketTemplate(sheet);
  showDoneAlert('Template created for File 2.');
}

function generateSampleData() {
  const rows = [
    ['WT-2001', 'Draft partner enablement notes\nCover rollout timing and escalation path.', new Date('2026-06-01'), 'CREATED'],
    ['WT-2002', 'Validate account merge workflow\nConfirm duplicate customer records keep history.', new Date('2026-06-02'), 'IN-PROGRESS'],
    ['WT-2003', 'Close resolved SSO issue\nCustomer confirmed production login is stable.', new Date('2026-06-03'), 'DONE'],
    ['WT-2004', 'Add missing SLA labels\nBackfill labels for priority support tickets.', new Date('2026-06-04'), 'CREATED'],
    ['WT-2005', 'Check notification copy\nMake email and in-app messages consistent.', new Date('2026-06-05'), 'IN-PROGRESS'],
    ['WT-2006', 'Clean up stale test accounts\nKeep accounts used by active QA runs.', new Date('2026-06-06'), 'CREATED'],
    ['WT-2007', 'Document data retention exception\nInclude approval owner and expiration date.', new Date('2026-06-07'), 'IN-PROGRESS'],
    ['WT-2008', 'Verify mobile attachment upload\nTest image and PDF uploads on iOS and Android.', new Date('2026-06-08'), 'DONE'],
  ];

  const sheet = getOrCreateSheet(CFG.TICKET_SHEET);
  writeTicketRows(sheet, rows);
  showDoneAlert('Generated ' + rows.length + ' File 2 tickets.');
}
