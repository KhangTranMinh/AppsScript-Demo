# Work Ticket

A Google Apps Script project for managing ticket rows across two source spreadsheets and one final spreadsheet.

## Project Overview

```text
work-ticket/
├── shared.js     # Config + shared utilities
├── file1.js      # File 1 ticket source
├── file2.js      # File 2 ticket source
├── final.js      # Import/export ticket data
└── README.md
```

## Setup

You need **3 separate Google Sheets files**. Each gets its own Apps Script project.

| File | Sheet It Uses | Local Source Files to Paste |
|------|---------------|-----------------------------|
| **File 1** | Tickets | `file1.js` into `Code.gs`, `shared.js` into `Shared.gs` |
| **File 2** | Tickets | `file2.js` into `Code.gs`, `shared.js` into `Shared.gs` |
| **File Final** | Tickets final | `final.js` into `Code.gs`, `shared.js` into `Shared.gs` |

### Step 1 - Create spreadsheets

1. Create a spreadsheet named **File 1**.
2. Create a spreadsheet named **File 2**.
3. Create a spreadsheet named **File Final**.

### Step 2 - File 1

1. Open **File 1** -> **Extensions -> Apps Script**.
2. Keep the default `Code.gs` file.
3. Paste the entire content of `file1.js` into `Code.gs`.
4. Create one new script file (click `+` -> Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Save all files.
6. Refresh the spreadsheet.
7. Use **Tickets -> Create Template** to create headers and the status dropdown.
8. Use **Tickets -> Generate Sample Data** to add sample tickets.

### Step 3 - File 2

1. Open **File 2** -> **Extensions -> Apps Script**.
2. Keep the default `Code.gs` file.
3. Paste the entire content of `file2.js` into `Code.gs`.
4. Create one new script file (click `+` -> Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Save all files.
6. Refresh the spreadsheet.
7. Use **Tickets -> Create Template** to create headers and the status dropdown.
8. Use **Tickets -> Generate Sample Data** to add sample tickets.

### Step 4 - File Final

1. Open **File Final** -> **Extensions -> Apps Script**.
2. Keep the default `Code.gs` file.
3. Paste the entire content of `final.js` into `Code.gs`.
4. Create one new script file (click `+` -> Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Copy the spreadsheet URLs for **File 1** and **File 2**.
6. In `Shared.gs`, modify the `FILE_1_URL` and `FILE_2_URL` values:

   ```javascript
   FILE_1_URL: 'https://docs.google.com/spreadsheets/d/YOUR_FILE_1_ID/edit',
   FILE_2_URL: 'https://docs.google.com/spreadsheets/d/YOUR_FILE_2_ID/edit',
   ```

7. Save all files.
8. Refresh the spreadsheet.
9. Use **Tickets -> Import Data** to import tickets from File 1 and File 2.
10. Use **Tickets -> Export Data** to export edited tickets back to File 1 and File 2.

## Data Format

| Column | Description |
|--------|-------------|
| Ticket ID | Stable ticket identifier used for import/export matching |
| Ticket Description | Multi-line ticket text |
| Date | Ticket date |
| Status | Dropdown: `CREATED`, `IN-PROGRESS`, `DONE` |
| Source | Final sheet only; tracks whether a row came from File 1 or File 2 |

## Menus

### File 1 and File 2

| Menu Item | Purpose |
|-----------|---------|
| `Tickets -> Create Template` | Creates the `Tickets` sheet, headers, status dropdown, formatting, and wrapping |
| `Tickets -> Generate Sample Data` | Creates the template and writes sample ticket rows |

### File Final

| Menu Item | Purpose |
|-----------|---------|
| `Tickets -> Import Data` | Imports rows from File 1 and File 2 into `Tickets final` |
| `Tickets -> Export Data` | Exports edited rows back to File 1 or File 2 by `Ticket ID` and `Source` |

## Export Rule

Export matches rows by `Ticket ID` and `Source`.

Rows with status `DONE` are not touched. The exporter skips a row if either:

- The final row status is `DONE`
- The matching source row status is already `DONE`

This prevents completed tickets from being overwritten during export.
