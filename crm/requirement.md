create Apps Script

source
- spreadsheet: `https://docs.google.com/spreadsheets/d/1PGHZZ5e2jwk9R7KFheT9ktoNcPCrIs35S07j0Ap9Lks/edit`
- tab name: `Detail`
- list services: `Service level 1`, `Transport`, `Food`, `Delivery`, `Fintech`, `Clean`, `DG`, `Loyalty`, `BD`, `Brand`

target
- spreadsheet: `https://docs.google.com/spreadsheets/d/1xTWrm2yQ4zckt7_4XI9EENGVT82DX5Ok-dhCGnfQy1w/edit`
- tab name: will be one of list services

the logic of source spreadsheet:
1. create menu `Menu` -> `Sync Campaign Name`, action will be defined below
2. find row which column M (`Title`) or N (`Message`) is empty, get column B (`Campaign Name`) and row position into list
3. copy `Campaign Name` to target spreadsheet, same column B, same row
4. consider that the spreadsheet will become bigger -> read / write by batch

the logic after target spreadsheet
1. user will go to each tab (e.g. `Transport`, `Food`) to fill column G (`Title`) and column H (`Message`)
2. create menu `Menu` -> `Sync Title & Message`, action will be defined below
3. find row which column I (`Status`) is not DONE, get column B `Campaign Name`, column G `Title`, column H `Message` into list
4. copy these content to source spreadsheet (column B `Campaign Name`, column M `Title`, column N `Message`)

general rules:
1. 2 sub-folders for 2 spreadsheet (I can copy easily)
2. enum / constant will be separated to another code file (I can change it later)
3. add very clear comments so that I can review code
