/**
 * Source spreadsheet menu UI.
 *
 * Keep menu registration in this file so new menu items can be added without
 * mixing UI setup into each sync action file.
 */

var SOURCE_MENU_NAME = 'Automation';
var SOURCE_SYNC_CAMPAIGN_MENU_ITEM = 'Sync Campaign Name';
var SOURCE_EXPORT_CALENDAR_MENU_ITEM = 'Export Calendar';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(SOURCE_MENU_NAME)
    .addItem(SOURCE_SYNC_CAMPAIGN_MENU_ITEM, 'syncCampaignName')
    .addItem(SOURCE_EXPORT_CALENDAR_MENU_ITEM, 'exportCalendar')
    .addToUi();
}
