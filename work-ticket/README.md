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
| Date | Ticket date |
| Status | Dropdown: `CREATED`, `IN-PROGRESS`, `DONE` |

`Label` is part of the source data. The final file does not calculate it during import.

Example rows:

| Ticket ID | Label | Ticket Description | Date | Status |
|-----------|-------|--------------------|------|--------|
| `FOOD-1001` | `Food` | Multi-line food task | `2026-06-01` | `CREATED` |
| `TRN-2001` | `Transport` | Multi-line transport task | `2026-06-01` | `CREATED` |

## Menus

### File Ticket Food and File Ticket Transport

| Menu Item | Purpose |
|-----------|---------|
| `Tickets -> Create Template` | Creates the `Tickets` sheet, headers, status dropdown, formatting, and wrapping |
| `Tickets -> Generate Sample Data` | Creates the template and writes sample ticket rows |

`Create Template` clears the `Tickets` sheet and creates:

- Shared headers: `Ticket ID`, `Label`, `Ticket Description`, `Date`, `Status`
- Wrapped multi-line descriptions
- Top-aligned data rows so multi-line descriptions align with Ticket ID, Label, Date, and Status
- `yyyy-mm-dd` date formatting
- `Status` dropdown with `CREATED`, `IN-PROGRESS`, `DONE`
- Light orange row highlight for `IN-PROGRESS`
- Light green row highlight for `DONE`
- A filter on the full table

`Generate Sample Data` also clears the sheet first, then writes demo rows with the correct label:

- Food file rows use `Label = Food`
- Transport file rows use `Label = Transport`

### File Ticket final

| Menu Item | Purpose |
|-----------|---------|
| `Tickets -> Import Data` | Imports labeled rows from Food and Transport into `Tickets final` |
| `Tickets -> Export Data` | Exports edited rows back to Food or Transport by `Ticket ID` and `Label` |

`Import Data` clears `Tickets final`, reads every non-empty Ticket ID from:

- `FILE_FOOD_URL` -> `Tickets`
- `FILE_TRANSPORT_URL` -> `Tickets`

It writes the imported rows using the same 5-column format.

`Export Data` reads `Tickets final`, then sends each row to the matching file:

- `Label = Food` exports to File Ticket Food
- `Label = Transport` exports to File Ticket Transport

## Export Rule

Export sends each row to Food or Transport based on `Label`, then matches the target row by `Ticket ID`.

Rows with status `DONE` are not touched. The exporter skips a row if either:

- The final row status is `DONE`
- The matching Food or Transport row status is already `DONE`

This prevents completed tickets from being overwritten during export.
