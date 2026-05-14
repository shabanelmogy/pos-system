# Implementation Plan - Shift Shortage Monitor

This plan covers the creation of a management screen to track POS shift balances, actual cash counts, and any shortages/variances.

## User Review Required

> [!NOTE]
> The shortage is calculated as the difference between the **Expected Balance** (Opening + Cash Sales) and the **Actual Closing Balance** entered by the staff.

## Proposed Changes

### [Backend] Shift Module Extensions
Add capability to list all shifts with their variance data.

#### [MODIFY] [shift.repository.js](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-backend/src/modules/shift/shift.repository.js)
- Add `findAll(filters)` method to retrieve shifts with cashier and POS point details.

#### [MODIFY] [shift.service.js](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-backend/src/modules/shift/shift.service.js)
- Add `getAllShifts(filters)` method.

#### [MODIFY] [shift.controller.js](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-backend/src/modules/shift/shift.controller.js)
- Add `getAll` endpoint for admins to fetch shift history.

### [Frontend] Dashboard Features
Add the Shortage Monitor page.

#### [NEW] [ShortageMonitor.tsx](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-frontend/src/features/dashboard/pages/ShortageMonitor.tsx)
- Create a data table showing:
    - Shift ID / Date
    - Cashier Name
    - POS Terminal
    - Opening Balance
    - Expected Balance (Calculated)
    - Actual Balance (Entered)
    - **Variance (Shortage/Overage)** (Highlighted in Red if negative)
- Add filters for Date Range and Cashier.

#### [MODIFY] [Dashboard.tsx](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-frontend/src/features/dashboard/pages/Dashboard.tsx)
- Add a sidebar/navigation link for "Shortage Tracking".

## Verification Plan

### Automated Tests
- API Test: Verify `/api/shift` returns shifts with `variance` and `closingBalance`.
- UI Test: Use `browser_subagent` to check if negative variances are styled with red text.

### Manual Verification
- Close a shift in the POS with a deliberate discrepancy.
- Open the "Shortage Monitor" in the Dashboard and verify the discrepancy is logged correctly.
