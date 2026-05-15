# Bugfix Requirements Document

## Introduction

Seven production-blocking bugs were identified in the POS order module during an enterprise architecture audit. These defects span security (IDOR, missing ownership checks), data integrity (race conditions, stale shift references, floating-point arithmetic), correctness (payment status never updated, divergent validation schemas), and scalability (unbounded query results). Left unaddressed, they expose the system to data corruption, unauthorized cross-branch data access, financial rounding errors, and potential denial-of-service from memory exhaustion. This document captures the current defective behavior, the required correct behavior, and the existing behavior that must be preserved without regression.

---

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — Race Condition on Status Transitions**

1.1 WHEN two concurrent requests call `updateFulfillmentStatus` for the same order simultaneously THEN the system reads the order state outside the transaction, allowing both requests to pass the state guard and write conflicting fulfillment transitions to the database.

1.2 WHEN two concurrent requests call `updateLifecycle` for the same order simultaneously THEN the system reads the order state outside the transaction, allowing both requests to pass the state guard and write conflicting lifecycle transitions to the database.

**Bug 2 — No Branch Ownership Validation on `getById`, `updateFulfillment`, `updateLifecycle`**

1.3 WHEN a non-admin user calls `GET /orders/:id` with the UUID of an order belonging to a different branch THEN the system returns the order without asserting branch ownership, exposing an Insecure Direct Object Reference (IDOR) vulnerability.

1.4 WHEN a non-admin user calls `PATCH /orders/:id/fulfillment` with the UUID of an order belonging to a different branch THEN the system mutates the order's fulfillment status without asserting branch ownership.

1.5 WHEN a non-admin user calls `PATCH /orders/:id/lifecycle` with the UUID of an order belonging to a different branch THEN the system mutates the order's lifecycle status without asserting branch ownership.

**Bug 3 — No Shift Validation on Order Creation**

1.6 WHEN `createOrder` is called and `req.user.activeShiftId` references a shift that is no longer `OPEN` THEN the system attaches the new order to the closed shift without any validation error.

1.7 WHEN `createOrder` is called and `req.user.activeShiftId` references a shift belonging to a different branch or POS point THEN the system attaches the new order to the mismatched shift without any validation error.

**Bug 4 — Payment Status Never Updated**

1.8 WHEN a Razorpay `payment.captured` webhook is received and `paymentRepository.create` records the payment THEN the system does not update `orders.paymentStatus`, leaving it permanently as `UNPAID` even after successful payment capture.

1.9 WHEN an order reaches `lifecycle: COMPLETED` after a successful payment THEN the system allows `paymentStatus` to remain `UNPAID` indefinitely, producing an inconsistent financial state.

**Bug 5 — Floating Point Arithmetic on Financial Totals**

1.10 WHEN an order is created with multiple items THEN the system accumulates `subtotal` using native JavaScript IEEE 754 float addition (`subtotal += itemSubtotal`), causing rounding errors that compound across line items.

1.11 WHEN tax is calculated THEN the system multiplies the float-accumulated subtotal by `TAX_RATE` using native float multiplication, propagating and amplifying intermediate precision loss before the final `.toFixed(2)` call.

**Bug 6 — Two Divergent Validation Files, Both Active**

1.12 WHEN `order.controller.js` imports validation schemas THEN the system uses `order.validation.js`, which has a flat `createOrderSchema` missing delivery address validation and `guestCount` for dine-in orders, allowing structurally invalid orders to pass validation.

1.13 WHEN `order.validation.ts` is present alongside `order.validation.js` THEN the system has two active, divergent schemas with conflicting definitions — `order.validation.ts` contains TypeScript errors (`'type' is specified more than once` due to object spread) and cannot be compiled, creating a maintenance and correctness hazard.

**Bug 7 — No Pagination on `findAll`**

1.14 WHEN `GET /orders` is called for a branch with a large number of orders THEN the system executes `orderRepository.findAll` with no `limit`, `offset`, or cursor, returning all matching rows in a single query and causing memory exhaustion and request timeouts.

---

### Expected Behavior (Correct)

**Bug 1 — Race Condition on Status Transitions**

2.1 WHEN two concurrent requests call `updateFulfillmentStatus` for the same order simultaneously THEN the system SHALL acquire a row-level lock (`SELECT ... FOR UPDATE`) on the order row inside the transaction before reading its state, ensuring only one transition succeeds and the other receives a conflict error.

2.2 WHEN two concurrent requests call `updateLifecycle` for the same order simultaneously THEN the system SHALL acquire a row-level lock on the order row inside the transaction before reading its state, ensuring only one transition succeeds and the other receives a conflict error.

**Bug 2 — No Branch Ownership Validation**

2.3 WHEN a non-admin user calls `GET /orders/:id` THEN the system SHALL assert that `order.branchId === req.user.branchId` after fetching the order, and return a 403 Forbidden error if the assertion fails.

2.4 WHEN a non-admin user calls `PATCH /orders/:id/fulfillment` THEN the system SHALL assert that `order.branchId === req.user.branchId` before performing any mutation, and return a 403 Forbidden error if the assertion fails.

2.5 WHEN a non-admin user calls `PATCH /orders/:id/lifecycle` THEN the system SHALL assert that `order.branchId === req.user.branchId` before performing any mutation, and return a 403 Forbidden error if the assertion fails.

**Bug 3 — No Shift Validation on Order Creation**

2.6 WHEN `createOrder` is called THEN the system SHALL fetch the shift record from the database by `activeShiftId`, verify that `shift.status === "OPEN"`, and return a 422 error if the shift is not open.

2.7 WHEN `createOrder` is called THEN the system SHALL verify that `shift.branchId === branchId` and that `shift.posPointId === posPointId`, and return a 422 error if either assertion fails.

**Bug 4 — Payment Status Never Updated**

2.8 WHEN a Razorpay `payment.captured` webhook is received and the payment record is created THEN the system SHALL call `orderService.updatePaymentStatus` (or equivalent) to set `orders.paymentStatus` to `PAID` for the associated order.

2.9 WHEN `updatePaymentStatus` is called THEN the system SHALL update `orders.paymentStatus` via `orderRepository` and record a `PAYMENT` change type entry in `order_status_history`.

**Bug 5 — Floating Point Arithmetic on Financial Totals**

2.10 WHEN an order is created with multiple items THEN the system SHALL accumulate all monetary values (unit prices, quantities, subtotals, modifiers, tax) using `decimal.js` exact decimal arithmetic instead of native JavaScript float operations.

2.11 WHEN financial totals are persisted THEN the system SHALL convert `Decimal` instances to strings via `.toFixed(2)` only at the final persistence boundary, ensuring no intermediate precision loss.

**Bug 6 — Two Divergent Validation Files**

2.12 WHEN `createOrder` is called with `type: "DINE_IN"` THEN the system SHALL validate that `tableId` (UUID) and `guestCount` (positive integer) are present, returning a 400 error if either is missing.

2.13 WHEN `createOrder` is called with `type: "DELIVERY"` THEN the system SHALL validate that `metadata.address`, `metadata.customerPhone`, and optionally `metadata.deliveryPartner` are present, returning a 400 error if required delivery fields are missing.

2.14 WHEN the order module is loaded THEN the system SHALL import validation schemas from a single consolidated `order.validation.js` file using a proper discriminated union, and `order.validation.ts` SHALL be deleted.

**Bug 7 — No Pagination on `findAll`**

2.15 WHEN `GET /orders` is called THEN the system SHALL accept `page` and `pageSize` query parameters (defaulting to `page=1`, `pageSize=20`) and apply `limit` and `offset` to the database query, returning only the requested page of results along with pagination metadata (`total`, `page`, `pageSize`, `totalPages`).

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid order creation request is submitted with correct shift context and branch ownership THEN the system SHALL CONTINUE TO create the order, its items, modifiers, and initial bill atomically within a single transaction.

3.2 WHEN `updateFulfillmentStatus` is called with a valid, allowed transition for an order owned by the caller's branch THEN the system SHALL CONTINUE TO apply the transition and record it in `order_status_history`.

3.3 WHEN `updateLifecycle` is called with a valid, allowed transition for an order owned by the caller's branch THEN the system SHALL CONTINUE TO apply the transition and record it in `order_status_history`.

3.4 WHEN `GET /orders` is called by a non-admin user THEN the system SHALL CONTINUE TO filter results to the caller's `branchId` only.

3.5 WHEN `GET /orders` is called by an admin user THEN the system SHALL CONTINUE TO support filtering by an explicit `branchId` query parameter.

3.6 WHEN an illegal fulfillment state transition is attempted (e.g., `PENDING → DELIVERED`) THEN the system SHALL CONTINUE TO reject it with a 422 error.

3.7 WHEN an illegal lifecycle state transition is attempted (e.g., `COMPLETED → ACTIVE`) THEN the system SHALL CONTINUE TO reject it with a 422 error.

3.8 WHEN a `VOIDED` lifecycle transition is attempted by a non-manager, non-admin user THEN the system SHALL CONTINUE TO reject it with a 403 Forbidden error.

3.9 WHEN `createOrder` is called with `type: "DINE_IN"` and no `tableId` THEN the system SHALL CONTINUE TO reject the request with a validation error.

3.10 WHEN item prices or modifier prices are submitted by the client THEN the system SHALL CONTINUE TO ignore client-supplied prices and fetch authoritative prices from the database.

3.11 WHEN a Razorpay webhook is received with an invalid signature THEN the system SHALL CONTINUE TO reject it with a 400 error without processing the payload.

3.12 WHEN `GET /orders/:id` is called by an admin user for any order UUID THEN the system SHALL CONTINUE TO return the order regardless of branch.
