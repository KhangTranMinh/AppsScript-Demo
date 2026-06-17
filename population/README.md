# Merge Sheet — Sample Data

A Google Apps Script project that generates sample city data across multiple spreadsheets and merges them with duplicate detection.

---

## Project Overview

```
merge-sheet/
├── shared.js     # Config + shared utilities (all projects)
├── file1.js      # Generate Data 1 — Sheet A (Asia) + Sheet B (Mixed)
├── file2.js      # Generate Data 2 — Sheet C (Europe) + Sheet D (Mixed w/ dupes)
├── final.js      # Merge to Final — reads from external files & merges
└── README.md
```

---

## Setup

You need **3 separate Google Sheets files**. Each gets its own Apps Script project.

| File | Sheets It Creates | Local Source Files to Paste |
|------|-------------------|------------------|
| **File 1** | Sheet A (10 Asian cities), Sheet B (20 mixed cities) | `shared.js` + `file1.js` |
| **File 2** | Sheet C (10 European cities), Sheet D (20 mixed w/ dupes) | `shared.js` + `file2.js` |
| **File Final** | Sheet final (merged) | `shared.js` + `final.js` |

### Step 1 — Create spreadsheets

1. Open Google Sheets → create a new spreadsheet. Rename it to **File 1**.
2. Create another new spreadsheet. Rename it to **File 2**.
3. Create a third spreadsheet. Rename it to **File Final**.

### Step 2 — File 1

1. Open **File 1** → **Extensions → Apps Script**
2. Keep the default `Code.gs` file.
3. Paste the entire content of `file1.js` into `Code.gs`.
4. Create one new script file (click `+` → Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Save all files (⌘S).
6. Refresh the spreadsheet.
7. You will see a **Run → Generate Data 1** menu. Click it.

### Step 3 — File 2

1. Open **File 2** → **Extensions → Apps Script**
2. Keep the default `Code.gs` file.
3. Paste the entire content of `file2.js` into `Code.gs`.
4. Create one new script file (click `+` → Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. Save all files (⌘S).
6. Refresh the spreadsheet.
7. You will see a **Run → Generate Data 2** menu. Click it.

### Step 4 — File Final

1. Open **File Final** → **Extensions → Apps Script**
2. Keep the default `Code.gs` file.
3. Paste the entire content of `final.js` into `Code.gs`.
4. Create one new script file (click `+` → Script), name it `Shared.gs`, and paste the entire content of `shared.js` into it.
5. **Copy the spreadsheet URLs:**

   - Go back to **File 1** → copy the full URL from your browser's address bar.
   - Go back to **File 2** → copy its URL too.

6. **In `Shared.gs`, modify the `FILE_1_URL` and `FILE_2_URL` values:**

   ```javascript
   FILE_1_URL: 'https://docs.google.com/spreadsheets/d/YOUR_FILE_1_ID/edit',
   FILE_2_URL: 'https://docs.google.com/spreadsheets/d/YOUR_FILE_2_ID/edit',
   ```


7. Save all files (⌘S).
8. Refresh the spreadsheet.
9. You will see a **Run → Merge to Final** menu. Click it.

---

## Expected Results

| Sheet | Content |
|-------|---------|
| **Sheet A** | Tokyo, Delhi, Shanghai, Mumbai, Beijing, Dhaka, Osaka, Karachi, Kolkata, Bangkok |
| **Sheet B** | 20 cities from South America, North America, Africa, Europe, Oceania, and Asia |
| **Sheet C** | Madrid, Rome, Vienna, Prague, Athens, Amsterdam, Stockholm, Warsaw, Munich, Barcelona |
| **Sheet D** | 20 cities — **5 intentional duplicate entries highlighted in red** (see below) |
| **Sheet final** | **60 rows total** → 55 unique + 5 duplicates (highlighted red) |

### Duplicate Breakdown

| Duplicate | Appears In | Type |
|-----------|-----------|------|
| Shanghai | File 1 (Sheet A) + File 2 (Sheet D) | Cross-file |
| Beijing   | File 1 (Sheet A) + File 2 (Sheet D) | Cross-file |
| Dubai     | File 1 (Sheet B) + File 2 (Sheet D) | Cross-file |
| Lagos     | File 1 (Sheet B) + File 2 (Sheet D) | Cross-file |
| Vienna    | File 2 (Sheet C) + File 2 (Sheet D) | Intra-file |

In **File 2**, the generator pre-highlights the duplicate rows in red:

| Sheet | Highlighted Rows | Array Rows | Cities |
|-------|------------------|------------|--------|
| **Sheet C** | 4 | 3 | Vienna |
| **Sheet D** | 2, 3, 4, 5, 10 | 1, 2, 3, 4, 9 | Shanghai, Beijing, Dubai, Lagos, Vienna |

---

## File Reference

### `shared.js` — Required in ALL projects

**Configuration (`CFG`)**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `SHEET_A` | string | `'Sheet A'` | Sheet name for File 1 data set 1 |
| `SHEET_B` | string | `'Sheet B'` | Sheet name for File 1 data set 2 |
| `SHEET_C` | string | `'Sheet C'` | Sheet name for File 2 data set 1 |
| `SHEET_D` | string | `'Sheet D'` | Sheet name for File 2 data set 2 |
| `FINAL_SHEET` | string | `'Sheet final'` | Output sheet for merged data |
| `FILE_1_URL` | string | `''` | URL of the File 1 spreadsheet (set before merge) |
| `FILE_2_URL` | string | `''` | URL of the File 2 spreadsheet (set before merge) |
| `SOURCES` | array | — | Table of { fileUrl, sheetName } for merge |
| `HEADERS` | array | — | 8-column headers for data sheets |
| `FINAL_HEADERS` | array | — | 9-column headers (adds "Source") |

**Shared Functions**

| Function | Purpose |
|----------|---------|
| `getOrCreateSheet(name)` | Get a sheet by name or create it if missing |
| `formatSheet(sheet, data, headers)` | Write headers + data, apply formatting, borders, alternating rows |
| `prepareData(cities)` | Compute density from raw city arrays |
| `showDoneAlert(message)` | Show a unified success dialog |

### `file1.js` — Generate Data 1

**Menu:** `Run → Generate Data 1`

Creates **Sheet A** (10 Asian cities) and **Sheet B** (20 mixed cities).

**Functions:**
- `onOpen()` — registers the menu
- `generateData1()` — creates and populates both sheets

### `file2.js` — Generate Data 2

**Menu:** `Run → Generate Data 2`

Creates **Sheet C** (10 European cities) and **Sheet D** (20 mixed cities with intentional duplicates). Duplicate rows are pre-highlighted in red within File 2: Vienna in Sheet C, plus Shanghai, Beijing, Dubai, Lagos, and Vienna in Sheet D.

**Functions:**
- `onOpen()` — registers the menu
- `highlightDuplicates(sheet, duplicateRows)` — highlights specific rows in red
- `generateData2()` — creates and populates both sheets

### `final.js` — Merge to Final

**Menu:** `Run → Merge to Final`

Opens the external spreadsheets (File 1 & File 2) via URL, reads all 4 sheets, combines data, detects duplicates by city+country, writes the merged result to **Sheet final** with source tracking and red highlighting.

**Functions:**

| Function | Purpose |
|----------|---------|
| `onOpen()` | Registers the menu |
| `resolveUrl(token)` | Resolves `'FILE_1_URL'` / `'FILE_2_URL'` tokens to actual URLs |
| `getSheetDataFromFile(fileUrl, sheetName)` | Reads data rows from an external sheet |
| `findAndMarkDuplicates(allData)` | Detects duplicates by city+country, merges source labels |
| `formatFinalSheet(sheet, data, duplicateRows)` | Writes merged data with formatting and red highlights |
| `mergeToFinal()` | Main orchestrator — reads, merges, writes, shows summary |

---

## Customization

### Changing sheet names

Edit the `CFG` object at the top of `shared.js`:

```javascript
SHEET_A: 'My Custom Sheet A',
FINAL_SHEET: 'Final Merged Results',
```

### Changing cities or adding more data

Edit the `cities1` / `cities2` arrays in `file1.js` or `file2.js`.

### Adding more source sheets

1. Add a new entry to `CFG.SOURCES` in `shared.js`.
2. If it's from a new spreadsheet, add a new URL field (e.g., `FILE_3_URL`) and update `resolveUrl()` in `final.js`.

---

## Architecture Notes

**Why 3 separate spreadsheet files?** Google Apps Script runs within a single spreadsheet. To keep data generation from different files independent (and avoid name collisions across projects), each pair of scripts lives in its own spreadsheet. The final merge script opens the other files via `SpreadsheetApp.openByUrl()` to read their data.

**Why a shared.js file?** All the utility functions (`getOrCreateSheet`, `formatSheet`, `prepareData`, `showDoneAlert`) are identical across all three files. Centralizing them in `shared.js` avoids code duplication and means one change updates all projects.

**Duplicate detection logic:** `findAndMarkDuplicates` uses a `Map` keyed by `"city|country"` (case-insensitive). The first occurrence is tracked; subsequent occurrences are flagged as duplicates and their source labels are concatenated (e.g., `"Sheet B, Sheet D"`).
