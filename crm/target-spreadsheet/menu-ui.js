/**
 * Target spreadsheet menu UI.
 *
 * Keep menu registration in this file so new menu items can be added without
 * mixing UI setup into each sync action file.
 */

var TARGET_MENU_NAME = 'Automation';
var TARGET_SYNC_TITLE_MESSAGE_MENU_ITEM = 'Sync Title & Message';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(TARGET_MENU_NAME)
    .addItem(TARGET_SYNC_TITLE_MESSAGE_MENU_ITEM, 'syncTitleAndMessage')
    .addToUi();
}
