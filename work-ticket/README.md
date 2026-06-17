# Work Ticket

A Google Apps Script project for managing Food and Transport ticket rows across two ticket spreadsheets and one final spreadsheet.

## Project Overview

```text
work-ticket/
├── config.js     # User-edited URLs for File Ticket final
├── shared.js     # Config + shared utilities
├── food.js       # Food ticket file
├── transport.js  # Transport ticket file
├── final.js      # Import/export ticket data
└── README.md
```

## Setup

You need **3 separate Google Sheets files**. Each gets its own Apps Script project.

| File | Sheet It Uses | Local Files to Paste |
|------|---------------|-----------------------------|
| **File Ticket Food** | Tickets | `food.js` into `Code.gs`, `shared.js` into `Shared.gs` |
| **File Ticket Transport** | Tickets | `transport.js` into `Code.gs`, `shared.js` into `Shared.gs` |
| **File Ticket final** | Tickets final | `final.js` into `Code.gs`, `shared.js` into `Shared.gs`, `config.js` into `Config.gs` |

### Step 1 - Create spreadsheets

1. Create a spreadsheet named **File Ticket Food**.
2. Create a spreadsheet named **File Ticket Transport**.
3. Create a spreadsheet named **File Ticket final**.

### Step 2 - File Ticket Food

1. Open **File Ticket Food** -> **Extensions -> Apps Script**.
2. Keep the default `Code.gs` file.
3. Paste the entire content of `food.js` into `Code.gs`.
4. Create one new script file (click `+` -> Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Save all files.
6. Refresh the spreadsheet.
7. Use **Tickets -> Create Template** to create headers and the status dropdown.
8. Use **Tickets -> Generate Sample Data** to add sample tickets.

### Step 3 - File Ticket Transport

1. Open **File Ticket Transport** -> **Extensions -> Apps Script**.
2. Keep the default `Code.gs` file.
3. Paste the entire content of `transport.js` into `Code.gs`.
4. Create one new script file (click `+` -> Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Save all files.
6. Refresh the spreadsheet.
7. Use **Tickets -> Create Template** to create headers and the status dropdown.
8. Use **Tickets -> Generate Sample Data** to add sample tickets.

### Step 4 - File Ticket final

1. Open **File Ticket final** -> **Extensions -> Apps Script**.
2. Keep the default `Code.gs` file.
3. Paste the entire content of `final.js` into `Code.gs`.
4. Create one new script file (click `+` -> Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Create one new script file, name it `Config.gs`, and paste the entire content of `config.js` into it.
6. Copy the spreadsheet URLs for **File Ticket Food** and **File Ticket Transport**.
7. In `Config.gs`, modify the `FILE_FOOD_URL` and `FILE_TRANSPORT_URL` values:

   ```javascript
   FILE_FOOD_URL: 'https://docs.google.com/spreadsheets/d/YOUR_FOOD_FILE_ID/edit',
   FILE_TRANSPORT_URL: 'https://docs.google.com/spreadsheets/d/YOUR_TRANSPORT_FILE_ID/edit',
   ```

8. Save all files.
9. Refresh the spreadsheet.
10. Use **Tickets -> Import Data** to import tickets from Food and Transport.
11. Use **Tickets -> Export Data** to export edited tickets back to Food and Transport.

Only **File Ticket final** needs `Config.gs`. File Ticket Food and File Ticket Transport do not use spreadsheet URLs.

When `shared.js` changes later, replace `Shared.gs` only. Keep `Config.gs` unchanged so the URLs do not need to be re-entered.

## Data Format

All three ticket sheets use the same column order:

| Column | Description |
|--------|-------------|
| Ticket ID | Stable ticket identifier used for import/export matching |
| Label | `Food` or `Transport`; used by File Ticket final to export each ticket back to the right file |
| Ticket Description | Multi-line ticket text |
| Date Time | Auto-filled creation timestamp |
| Status | Dropdown: `CREATED`, `IN-PROGRESS`, `DONE` |

`Label` is part of the source data. The final file does not calculate it during import.

Example rows:

| Ticket ID | Label | Ticket Description | Date Time | Status |
|-----------|-------|--------------------|-----------|--------|
| `FOOD-1001` | `Food` | Multi-line food task | `2026-06-01 09:00` | `CREATED` |
| `TRN-2001` | `Transport` | Multi-line transport task | `2026-06-01 09:00` | `CREATED` |

## Menus

### File Ticket Food and File Ticket Transport

| Menu Item | Purpose |
|-----------|---------|
| `Tickets -> Create Template` | Creates the `Tickets` sheet, headers, status dropdown, formatting, and wrapping |
| `Tickets -> Generate Sample Data` | Creates the template and writes sample ticket rows |

`Create Template` clears the `Tickets` sheet and creates:

- Shared headers: `Ticket ID`, `Label`, `Ticket Description`, `Date Time`, `Status`
- Wrapped multi-line descriptions
- Top-aligned data rows so multi-line descriptions align with Ticket ID, Label, Date, and Status
- `yyyy-mm-dd hh:mm` date-time formatting
- `Status` dropdown with `CREATED`, `IN-PROGRESS`, `DONE`
- Light orange row highlight for `IN-PROGRESS`
- Light green row highlight for `DONE`
- A filter on the full table
- Protected generated columns so normal users edit only `Ticket Description`
- Empty columns outside the ticket table are protected too
- Single-cell edits outside `Ticket Description` are reverted by the script as an extra guard

In Food and Transport files, users should only type into `Ticket Description`.
When a description is entered on a new row, the script fills:

- `Ticket ID`: next ID from the latest existing ID, such as `FOOD-1009` or `TRN-2009`
- `Label`: `Food` or `Transport`
- `Date Time`: current timestamp
- `Status`: `CREATED`

`Generate Sample Data` also clears the sheet first, then writes demo rows with the correct label:

- Food file rows use `Label = Food`
- Transport file rows use `Label = Transport`

### File Ticket final

| Menu Item | Purpose |
|-----------|---------|
| `Tickets -> Import Data` | Imports labeled rows from Food and Transport into `Tickets final`, newest first |
| `Tickets -> Export Data` | Exports edited status values back to Food or Transport by `Ticket ID` and `Label` |

`Import Data` clears `Tickets final`, reads every non-empty Ticket ID from:

- `FILE_FOOD_URL` -> `Tickets`
- `FILE_TRANSPORT_URL` -> `Tickets`

It sorts imported rows by `Date Time` newest first, then writes them using the same 5-column format.

Successful template creation, sample generation, and import run without success popups. Export still shows a result alert because it reports which statuses changed.

In File Ticket final, users should only edit `Status`. Import protects the other columns so Ticket ID, Label, Ticket Description, and Date Time stay aligned with the source files. Empty columns outside the ticket table are protected too. Single-cell edits outside `Status` are reverted by the script as an extra guard.

Google Sheets owners can still type into protected cells. The script-level guard catches normal single-cell edits and restores the previous value when Apps Script provides it.

When a user changes the `Status` dropdown in File Ticket final, the whole row recolors immediately:

- `CREATED` resets to the default background
- `IN-PROGRESS` changes to light orange
- `DONE` changes to light green

`Export Data` reads `Tickets final`, then sends each row to the matching file:

- `Label = Food` exports to File Ticket Food
- `Label = Transport` exports to File Ticket Transport

## Export Rule

Export sends each row to Food or Transport based on `Label`, then matches the target row by `Ticket ID`.

Export writes only the `Status` column back to Food or Transport. Ticket ID, Label, Ticket Description, and Date Time are not overwritten by export.

Rows are updated only when the final status differs from the matching Food or Transport status. The export alert reports only the rows that actually changed.

Rows already marked `DONE` in Food or Transport are not touched. The exporter skips a row if the matching Food or Transport row status is already `DONE`.

This lets File Ticket final mark active tickets as `DONE`, while preventing already completed source tickets from being overwritten later.
