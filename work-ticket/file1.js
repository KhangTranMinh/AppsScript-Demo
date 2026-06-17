/**
 * File 1 - Ticket data source.
 *
 * Paste this file into Code.gs in the "File 1" Apps Script project.
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
  showDoneAlert('Template created for File 1.');
}

function generateSampleData() {
  const rows = [
    ['WT-1001', 'Create customer onboarding checklist\nInclude owner, due date, and launch steps.', new Date('2026-06-01'), 'CREATED'],
    ['WT-1002', 'Fix invoice export formatting\nAmounts should keep two decimals and preserve currency.', new Date('2026-06-02'), 'IN-PROGRESS'],
    ['WT-1003', 'Review login audit trail\nConfirm IP address and user agent are recorded.', new Date('2026-06-03'), 'DONE'],
    ['WT-1004', 'Add retry handling for webhook delivery\nRetry after transient 5xx responses.', new Date('2026-06-04'), 'CREATED'],
    ['WT-1005', 'Update billing support macro\nAdd cancellation and refund edge cases.', new Date('2026-06-05'), 'IN-PROGRESS'],
    ['WT-1006', 'Prepare weekly operations report\nSummarize reopened tickets and blocked items.', new Date('2026-06-06'), 'CREATED'],
    ['WT-1007', 'Investigate slow dashboard load\nCheck query timing and cache hit rate.', new Date('2026-06-07'), 'IN-PROGRESS'],
    ['WT-1008', 'Archive legacy help articles\nMove deprecated content out of public search.', new Date('2026-06-08'), 'DONE'],
  ];

  const sheet = getOrCreateSheet(CFG.TICKET_SHEET);
  writeTicketRows(sheet, rows);
  showDoneAlert('Generated ' + rows.length + ' File 1 tickets.');
}
