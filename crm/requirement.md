create Apps Script

source
- spreadsheet: `https://docs.google.com/spreadsheets/d/1PGHZZ5e2jwk9R7KFheT9ktoNcPCrIs35S07j0Ap9Lks/edit`
- tab name: `CALENDAR`
- Vertical: Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD
- Slot:
  - Homepage: row 6 - 17 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Transport - Intrip: row 19 - 30 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Food - Home: row 32 - 43 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Food - Order: row 45 - 56 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Delivery - Home: row 58 - 69 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Delivery - Booking: row 71 - 82 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Clean - Home: row 84 - 95 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Clean - Booking: row 97 - 108 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)
  - Flight - Home: row 110 - 121 is Verticals (Transport, Food,  Delivery, DGs - Flight, DGs - Bus, DGs - Train, DGs - Telco, DGs - Insurance, Fintech - CL, Fintech - BPL, Home, BD)

target
- spreadsheet: `https://docs.google.com/spreadsheets/d/1xTWrm2yQ4zckt7_4XI9EENGVT82DX5Ok-dhCGnfQy1w/edit`
- tab name: `Calendar by vertical`
- row 6 - 14 is Slots (Homepage, Transport - Intrip, Food - Home, Food - Order, Delivery - Home, Delivery - Booking, Clean - Home, Clean - Booking, Flight - Home), grouped by vertical Transport
- row 16 - 24 is Slots (Homepage, Transport - Intrip, Food - Home, Food - Order, Delivery - Home, Delivery - Booking, Clean - Home, Clean - Booking, Flight - Home), grouped by vertical Food
- row 26 - 34 is Slots (Homepage, Transport - Intrip, Food - Home, Food - Order, Delivery - Home, Delivery - Booking, Clean - Home, Clean - Booking, Flight - Home), grouped by vertical Delivery
- i will create other vertical group later (ignore, don't throw exception)

the logic of source spreadsheet:
1. menu `Automation` -> `Export Calendar`
2. example rule:
- source row 6 (slot Homepage, vertical Transport) to target row 6 (vertical Transport, slot Homepage)
- source row 7 (slot Homepage, vertical Food) to target row 16 (vertical Food, slot Homepage)
- source row 8 (slot Homepage, vertical Delivery) to target row 26 (vertical Delivery, slot Homepage)
- source row 19 (slot Transport - Intrip, vertical Transport) to target row 7 (vertical Transport, slot Transport - Intrip)
- source row 20 (slot Transport - Intrip, vertical Food) to target row 17 (vertical Food, slot Transport - Intrip)

general rules:
1. code in source spreadsheet only
2. enum / constant will be separated to another code file (I can change it later) e.g. export-calendar-consts.js, export-calendar-code.js
3. add very clear comments so that I can review code
