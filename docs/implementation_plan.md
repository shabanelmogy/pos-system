# Implementation Plan - POS Enhancements

This plan outlines the steps to implement the first phase of the suggested POS enhancements, focusing on UI efficiency and management insights.

## User Review Required

> [!IMPORTANT]
> The Kitchen Display System (KDS) and Inventory modules will require new database tables. This plan focuses on UI/UX and Analytics first.

## Proposed Changes

### [Component] MenuContainer (Option Bar)
Add operational status and loyalty badges to the top bar.

#### [MODIFY] [MenuContainer.tsx](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-frontend/src/features/pos/components/menu/MenuContainer.tsx)
- Integrate a "Kitchen Status" indicator.
- Add a "Shift Sales" display using a new hook for real-time totals.
- Add a loyalty point badge if a customer is selected.

### [Feature] Analytics & Reporting
Create a new Analytics page in the dashboard.

#### [NEW] [Analytics.tsx](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-frontend/src/features/dashboard/pages/Analytics.tsx)
- Implement Chart.js or Recharts to show category performance.
- Add peak-hour line charts.

#### [MODIFY] [Dashboard.tsx](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-frontend/src/features/dashboard/pages/Dashboard.tsx)
- Add a link to the new Analytics page.

### [Backend] Analytics Data API
Create endpoints to serve aggregated data for the charts.

#### [NEW] [analytics.controller.js](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-backend/src/modules/analytics/analytics.controller.js)
- Methods for `getSalesByCategory` and `getSalesByHour`.

#### [NEW] [analytics.service.js](file:///e:/MVP/pos-system/Restaurant_POS_System/pos-backend/src/modules/analytics/analytics.service.js)
- SQL aggregation logic using Drizzle.

## Verification Plan

### Automated Tests
- Verify that `getSalesByCategory` returns correct JSON structures.
- Use `browser_subagent` to verify the new Option Bar badges render correctly.

### Manual Verification
- Select a customer and check if the loyalty badge updates.
- Check the Analytics page to ensure charts are populating.
