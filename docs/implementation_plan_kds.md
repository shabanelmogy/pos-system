# Kitchen Display System (KDS) Implementation Plan

Based on the recent backend updates (specifically the addition of `kitchenStationId` to the `categories` table), we now have the foundation to build a fully functional, high-performance Kitchen Display System (KDS).

This plan outlines the steps required to build out the KDS architecture from the ground up.

## User Review Required
> [!IMPORTANT]
> The KDS requires live order synchronization. The backend currently uses REST APIs, which means the frontend would have to constantly poll for new orders. Are you planning to add `Socket.io` or Server-Sent Events (SSE) to the backend for real-time ticket updates, or should we implement a 10-second polling fallback for the MVP?

> [!WARNING]
> We need to build a new `kitchen-station` backend module to support the `kitchenStationId` foreign key. Until this is built, the KDS will act as a "Global" kitchen display, showing all items for all orders rather than filtering by station (e.g., Grill vs Drinks).

---

## Proposed Changes

### Phase 1: Backend Kitchen Station Module
We must scaffold the backend APIs to manage physical kitchen stations and support KDS routing.

#### [NEW] `pos-backend/src/modules/kitchenStation/`
- Create `kitchenStation.schema.js` with `id`, `name` (e.g., "Grill", "Salad Bar"), `branchId`, and `isActive`.
- Create CRUD endpoints (`router`, `controller`, `service`, `repository`) for managing kitchen stations.
- Ensure `item.repository.js` correctly populates the station info when fetching orders.

#### [NEW] `pos-backend/src/modules/user/user.schema.js`
- Update the `role` enum/validation to include a new `kitchen` role. This allows kitchen iPads to securely log in and view the KDS without having access to the POS cash register or Dashboard.

### Phase 2: KDS Frontend Foundation & Routing
Create a completely isolated, distraction-free route in the frontend specifically for the kitchen staff.

#### [NEW] `pos-frontend/src/features/kds/`
- **Route Setup**: Add `/kds` to `App.tsx` outside of the standard POS shell. The KDS should be full-screen, high-contrast, and optimized for touch displays mounted on walls.
- **KDS Store (`useKdsStore.ts`)**: Create a Zustand store to handle the live queue of active orders, filtering them by `kitchenStationId` if a specific station is selected on the tablet.
- **API Wrappers (`kdsApi.ts`)**: Endpoints to fetch active orders (`GET /api/order?lifecycle=ACTIVE`) and bump items/orders to new statuses.

### Phase 3: The Kanban Ticket Board UI
Implement a dynamic, drag-and-drop or tap-to-move Kanban board based on the design mockup provided.

#### [NEW] `features/kds/pages/KitchenBoard.tsx`
- Build a 3-column layout: **PENDING**, **PREPARING**, and **READY**.
- Implement smooth Framer Motion animations for tickets moving between columns.

#### [NEW] `features/kds/components/Ticket.tsx`
- **Header**: Large bold Order Number, Table Number/Takeaway Indicator, and a live Timer (e.g., `04:15`) that turns orange/red if the SLA (Service Level Agreement) time is exceeded.
- **Items List**: Display `orderItems` with their quantities.
- **Modifiers Highlight**: Render the newly supported `itemModifiers` (e.g., "NO ONION", "EXTRA SPICY") in bright, contrasting warning colors (like Red or Yellow) so chefs don't miss them.
- **Bump Actions**: Buttons to mark individual items or the entire order as "Ready".

### Phase 4: Dashboard Integration
Allow administrators to configure KDS routing for their menu.

#### [MODIFY] `features/dashboard/components/ManagementModal.tsx`
- Add a "Kitchen Station" dropdown to the `type === "category"` edit modal. This dropdown will fetch from the new `GET /api/kitchen-station` endpoint, allowing managers to route all "Beverages" to the "Bar" KDS, and all "Burgers" to the "Grill" KDS.

---

## Verification Plan
1. **Station Configuration**: Create two kitchen stations ("Hot Food", "Drinks") via the Dashboard and assign them to categories.
2. **Order Routing**: Place a POS order containing both a Burger and a Coke.
3. **KDS Split Display**: Open the Hot Food KDS and verify only the Burger appears. Open the Drinks KDS and verify only the Coke appears.
4. **Status Bumping**: Tap "Mark Preparing" on the KDS and verify the POS frontend immediately reflects the updated `fulfillmentStatus`.
