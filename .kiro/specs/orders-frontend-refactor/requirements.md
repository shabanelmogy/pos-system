# Requirements Document

## Introduction

The orders frontend feature at `pos-frontend/src/features/orders/` is misaligned with the updated backend API contract. The backend now exposes a well-defined REST API with a triple-state order model (`lifecycle`, `fulfillmentStatus`, `paymentStatus`) and two distinct PATCH endpoints for status transitions. The frontend currently uses stale field names, wrong HTTP methods, untyped data, and missing UI states. This refactor aligns the frontend fully with the backend contract, introduces TypeScript types, Zod validation schemas, a React Query hook, status constants, and proper loading/error states.

## Glossary

- **Order_API**: The frontend Axios wrapper module at `orders/api/orderApi.ts` responsible for all HTTP calls to `/api/order`.
- **Order_Types**: The TypeScript interface module at `orders/types/order.types.ts` defining `Order`, `OrderItem`, and `OrderItemModifier` shapes.
- **Order_Schemas**: The Zod validation module at `orders/schemas/orderSchemas.ts` that validates API responses at runtime.
- **Order_Constants**: The constants module at `orders/constants/orderConstants.ts` defining status enums, label maps, and transition maps.
- **useOrders**: The custom React Query hook at `orders/hooks/useOrders.ts` that fetches and caches the orders list.
- **OrderCard**: The React component at `orders/components/OrderCard.tsx` that renders a single order summary.
- **Invoice**: The React component at `orders/components/invoice/Invoice.tsx` that renders and prints an order receipt.
- **Orders_Page**: The React page component at `orders/pages/Orders.tsx` that renders the full orders list view.
- **Lifecycle**: The `lifecycle` field on an order — one of `ACTIVE`, `COMPLETED`, `VOIDED`, `CANCELLED`.
- **FulfillmentStatus**: The `fulfillmentStatus` field on an order — one of `PENDING`, `PREPARING`, `PARTIALLY_READY`, `READY`, `SERVED`, `DISPATCHED`, `DELIVERED`, `PICKED_UP`.
- **PaymentStatus**: The `paymentStatus` field on an order — one of `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`.
- **Backend**: The Express/Drizzle backend at `pos-backend/src/modules/order/`.

---

## Requirements

### Requirement 1: TypeScript Type Definitions

**User Story:** As a frontend developer, I want strongly-typed TypeScript interfaces for all order-related data, so that I can catch field mismatches at compile time and eliminate `any` types throughout the feature.

#### Acceptance Criteria

1. THE Order_Types SHALL define an `OrderItemModifier` interface with fields: `id` (string), `orderItemId` (string), `modifierId` (string), `name` (string), `unitPrice` (string), `quantity` (string).
2. THE Order_Types SHALL define an `OrderItem` interface with fields: `id`, `orderId`, `menuItemId`, `nameSnapshot`, `unitPrice`, `quantity`, `subtotal`, `taxAmount`, `status`, `notes`, `isVoided`, and `modifiers` (array of `OrderItemModifier`).
3. THE Order_Types SHALL define an `Order` interface with all fields from the backend response shape, including `lifecycle`, `fulfillmentStatus`, `paymentStatus`, `orderType`, `orderNumber`, `grandTotal`, `subtotal`, `taxTotal`, `discountTotal`, `serviceCharge`, `createdAt`, `updatedAt`, `closedAt`, `voidedAt`, `tableId`, `customerId`, and `orderItems`.
4. THE Order_Types SHALL define string literal union types for `OrderLifecycle`, `FulfillmentStatus`, `PaymentStatus`, and `OrderType` matching the backend enum values exactly.
5. THE Order_Types SHALL export all interfaces and union types so they can be imported by other modules in the feature.

---

### Requirement 2: Zod Validation Schemas

**User Story:** As a frontend developer, I want runtime validation of API responses using Zod schemas, so that unexpected backend shape changes are caught early and surfaced as clear errors rather than silent rendering bugs.

#### Acceptance Criteria

1. THE Order_Schemas SHALL define a Zod schema for `OrderItemModifier` that validates all required fields and their types.
2. THE Order_Schemas SHALL define a Zod schema for `OrderItem` that validates all required fields including the nested `modifiers` array.
3. THE Order_Schemas SHALL define a Zod schema for `Order` that validates all required fields including the nested `orderItems` array.
4. WHEN the `Order` Zod schema is applied to a valid backend response, THE Order_Schemas SHALL parse it without errors.
5. WHEN the `Order` Zod schema is applied to a response missing required fields, THE Order_Schemas SHALL return a descriptive `ZodError`.
6. THE Order_Schemas SHALL export a `parseOrder` helper function that accepts an unknown value and returns a typed `Order` or throws a `ZodError`.
7. FOR ALL valid `Order` objects, serializing to JSON and parsing back through the `Order` Zod schema SHALL produce an equivalent object (round-trip property).

---

### Requirement 3: Status Constants and Label Maps

**User Story:** As a frontend developer, I want centralized constants for all order status values, human-readable labels, and valid transition maps, so that status logic is not duplicated across components.

#### Acceptance Criteria

1. THE Order_Constants SHALL export `ORDER_LIFECYCLE` as a frozen object containing all four `Lifecycle` values: `ACTIVE`, `COMPLETED`, `VOIDED`, `CANCELLED`.
2. THE Order_Constants SHALL export `FULFILLMENT_STATUS` as a frozen object containing all eight `FulfillmentStatus` values.
3. THE Order_Constants SHALL export `PAYMENT_STATUS` as a frozen object containing all four `PaymentStatus` values.
4. THE Order_Constants SHALL export `ORDER_TYPE` as a frozen object containing all five `OrderType` values.
5. THE Order_Constants SHALL export a `FULFILLMENT_LABEL_MAP` that maps each `FulfillmentStatus` value to a human-readable English label string.
6. THE Order_Constants SHALL export a `LIFECYCLE_LABEL_MAP` that maps each `Lifecycle` value to a human-readable English label string.
7. THE Order_Constants SHALL export a `FULFILLMENT_STATUS_COLOR_MAP` that maps each `FulfillmentStatus` value to a CSS variable string for use in UI components.

---

### Requirement 4: API Module Alignment

**User Story:** As a frontend developer, I want the order API module to call the correct backend endpoints with the correct HTTP methods, so that order status updates are not silently dropped by the backend.

#### Acceptance Criteria

1. THE Order_API SHALL export a `getOrders` function that sends `GET /api/order` with optional query parameters.
2. THE Order_API SHALL export a `getOrderById` function that sends `GET /api/order/:id` with the order UUID.
3. THE Order_API SHALL export a `createOrder` function that sends `POST /api/order` with the order payload.
4. THE Order_API SHALL export an `updateFulfillmentStatus` function that sends `PATCH /api/order/:id/fulfillment` with a body of `{ status: FulfillmentStatus, notes?: string, reasonCode?: string }`.
5. THE Order_API SHALL export an `updateLifecycleStatus` function that sends `PATCH /api/order/:id/lifecycle` with a body of `{ status: OrderLifecycle, notes?: string, reasonCode?: string }`.
6. THE Order_API SHALL NOT export any function that calls `PUT /api/order/:id`, as that endpoint no longer exists on the backend.
7. WHEN the Order_API functions are called, THE Order_API SHALL use the shared `axiosWrapper` instance for all HTTP requests.

---

### Requirement 5: useOrders Custom Hook

**User Story:** As a frontend developer, I want a dedicated React Query hook for fetching orders, so that data fetching, caching, and loading state logic is not duplicated in page components.

#### Acceptance Criteria

1. THE useOrders hook SHALL accept an optional `params` object for query parameters (e.g., `posPointId`, `cashierId`, `startDate`).
2. WHEN called, THE useOrders hook SHALL use `useQuery` from `@tanstack/react-query` with the query key `["orders", params]`.
3. THE useOrders hook SHALL return `{ orders, isLoading, isError, isFetching }` from the underlying query result.
4. THE useOrders hook SHALL use `keepPreviousData` behavior so the UI does not flash empty state during filter changes.
5. WHEN the query returns data, THE useOrders hook SHALL return the data typed as `Order[]`.

---

### Requirement 6: OrderCard Component Refactor

**User Story:** As a cashier, I want the order card to display accurate status information from the backend, so that I can see the real fulfillment state of each order without confusion.

#### Acceptance Criteria

1. THE OrderCard SHALL accept an `order` prop typed as `Order` (from Order_Types), not `any`.
2. THE OrderCard SHALL display the order's `fulfillmentStatus` field (e.g., `PENDING`, `READY`, `SERVED`) using labels from `FULFILLMENT_LABEL_MAP` in Order_Constants.
3. THE OrderCard SHALL display the order's `orderNumber` field as the order identifier.
4. THE OrderCard SHALL display the order's `createdAt` field (formatted) instead of the removed `orderDate` field.
5. THE OrderCard SHALL display `(order.orderItems || []).length` as the item count instead of `order.items`.
6. THE OrderCard SHALL display `order.grandTotal` as the order total instead of `order.bills?.totalWithTax`.
7. WHEN the "Serve Order" button is clicked, THE OrderCard SHALL call `updateFulfillmentStatus` with `status: "SERVED"` via a mutation.
8. WHEN the fulfillment status mutation succeeds, THE OrderCard SHALL invalidate the `["orders"]` React Query cache.
9. THE OrderCard SHALL NOT reference `order.orderStatus`, `order.orderDate`, `order.bills`, `order.items`, or `order.customer?.totalOrders` as those fields do not exist on the backend response.
10. WHEN `order.tableId` is present and the serve mutation succeeds, THE OrderCard SHALL trigger a table status update using the `tableId` UUID directly.

---

### Requirement 7: Orders Page Loading and Error States

**User Story:** As a cashier, I want to see a loading skeleton while orders are being fetched and a clear error message when the fetch fails, so that I am not left staring at a blank screen.

#### Acceptance Criteria

1. WHILE the orders query is loading, THE Orders_Page SHALL render a skeleton placeholder grid in place of the order cards.
2. WHEN the orders query returns an error, THE Orders_Page SHALL display an error notification via `enqueueSnackbar`.
3. THE Orders_Page SHALL filter orders by `fulfillmentStatus` when the status tab is set to `progress`, `ready`, or `completed`, replacing the removed `orderStatus` field comparisons.
4. THE Orders_Page SHALL use the `useOrders` hook instead of calling `getOrders` directly inside `useQuery`.
5. WHEN no orders match the active filter, THE Orders_Page SHALL display the "No orders found" empty state message.

---

### Requirement 8: Invoice Component Field Alignment

**User Story:** As a cashier, I want the invoice/receipt to render correctly using the new backend field names, so that reprints do not show blank totals or missing item names.

#### Acceptance Criteria

1. THE Invoice SHALL read order items from `orderInfo.orderItems` (not `orderInfo.items`).
2. THE Invoice SHALL display `orderInfo.orderNumber` as the order reference number.
3. THE Invoice SHALL display `orderInfo.createdAt` as the order date (not `orderInfo.orderDate`).
4. THE Invoice SHALL display `orderInfo.grandTotal` as the payable total (not `orderInfo.bills?.totalWithTax`).
5. THE Invoice SHALL display `orderInfo.subtotal` and `orderInfo.taxTotal` in the summary section.
6. THE Invoice SHALL accept an `orderInfo` prop typed as `Order` (from Order_Types), not `any`.
7. WHEN an order item has modifiers, THE Invoice SHALL render each modifier's `name` field (falling back to `nameSnapshot` if present).

---

### Requirement 9: i18n Label Coverage for New Statuses

**User Story:** As a user of the POS system in English or Arabic, I want all new fulfillment and lifecycle status labels to be translated, so that the UI is consistent with the rest of the application.

#### Acceptance Criteria

1. THE Orders_Page i18n files SHALL include translation keys for all eight `FulfillmentStatus` values under `orders.fulfillment_status.*`.
2. THE Orders_Page i18n files SHALL include translation keys for all four `Lifecycle` values under `orders.lifecycle.*`.
3. THE Orders_Page i18n files SHALL include translation keys for all four `PaymentStatus` values under `orders.payment_status.*`.
4. WHEN a translation key is missing for a status value, THE OrderCard SHALL fall back to the English label from `FULFILLMENT_LABEL_MAP` rather than rendering an empty string.
