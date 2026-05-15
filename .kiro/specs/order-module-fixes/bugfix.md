# Bugfix Requirements Document

## Introduction

The order module (`pos-backend/src/modules/order/`) contains eight defects identified during code review, ranging in severity from critical to low. Two critical issues — a broken TypeScript import in a JavaScript file and a missing branch filter that leaks cross-tenant order data — must be resolved immediately. The remaining issues cover a client-price trust vulnerability, missing state-machine transition guards, an `orderNumber` collision risk under concurrent load, a hardcoded tax rate, stale Swagger documentation, and an unguarded void endpoint. This document captures the current defective behavior, the expected correct behavior, and the existing behavior that must be preserved after the fixes are applied.

---

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — `.ts` import in `.js` file (CRITICAL)**

1.1 WHEN `order.controller.js` is loaded by Node.js ESM THEN the system fails to resolve the import `./order.validation.ts` because Node.js ESM does not natively resolve `.ts` extensions without a bundler or ts-node.

**Bug 2 — `findAll` ignores branch filter (CRITICAL)**

1.2 WHEN a non-admin user requests their branch's orders THEN the system returns all orders from every branch because `order.repository.js::findAll` ignores the `filters` argument entirely and issues an unfiltered `db.query.orders.findMany` query.

**Bug 3 — Modifier prices not fetched from DB (HIGH)**

1.3 WHEN an order is created with modifiers THEN the system uses the `unitPrice` values supplied by the client request instead of fetching authoritative prices from the database, violating the "never trust client prices" security rule.

**Bug 4 — No state-machine transition guards (MEDIUM)**

1.4 WHEN `updateFulfillmentStatus` is called with any target status THEN the system applies the transition without checking whether it is a legal move from the current state (e.g., `DELIVERED → PENDING` is accepted).

1.5 WHEN `updateLifecycle` is called with any target status THEN the system applies the transition without checking whether it is a legal move from the current state (e.g., `COMPLETED → ACTIVE` is accepted).

**Bug 5 — `orderNumber` collision risk (MEDIUM)**

1.6 WHEN two or more orders are created concurrently within the same millisecond THEN the system generates identical `orderNumber` values using `Date.now()`, causing a unique constraint violation and a failed transaction.

**Bug 6 — Hardcoded 5% tax rate (MEDIUM)**

1.7 WHEN an order is created THEN the system applies a hardcoded 5% tax rate for both per-item `taxAmount` and the order-level `taxTotal` instead of reading the rate from configuration or branch/item records.

**Bug 7 — Stale Swagger documentation (LOW)**

1.8 WHEN a developer or API consumer reads the Swagger docs for the order module THEN the system presents a `PUT /{id}` endpoint that no longer exists, while the actual `PATCH /:id/fulfillment` and `PATCH /:id/lifecycle` endpoints are absent from the documentation.

**Bug 8 — No role check on void (LOW)**

1.9 WHEN any authenticated user sends a lifecycle update with `status: "VOIDED"` THEN the system accepts the void without verifying that the actor holds a manager role.

---

### Expected Behavior (Correct)

**Bug 1 — `.ts` import fix**

2.1 WHEN `order.controller.js` is loaded by Node.js ESM THEN the system SHALL resolve validation schemas from `./order.validation.js` (the compiled or native JS equivalent) so that the module loads without errors in a standard Node.js environment.

**Bug 2 — Branch filter applied**

2.2 WHEN a non-admin user requests orders THEN the system SHALL return only orders whose `branchId` matches the user's assigned branch, enforcing multi-tenant data isolation at the query level.

2.3 WHEN an admin user requests orders with an explicit `branchId` query parameter THEN the system SHALL filter results to that branch.

2.4 WHEN an admin user requests orders without a `branchId` query parameter THEN the system SHALL return orders across all branches.

**Bug 3 — Modifier prices from DB**

2.5 WHEN an order is created with modifiers THEN the system SHALL fetch each modifier's authoritative price from the database and use that value for `unitPrice` in `order_item_modifiers`, ignoring any price supplied by the client.

**Bug 4 — State-machine transition guards**

2.6 WHEN `updateFulfillmentStatus` is called with a target status THEN the system SHALL validate that the transition from the current `fulfillmentStatus` to the target status is permitted by the defined fulfillment state machine, and SHALL reject illegal transitions with a 422 error.

2.7 WHEN `updateLifecycle` is called with a target status THEN the system SHALL validate that the transition from the current `lifecycle` to the target status is permitted by the defined lifecycle state machine, and SHALL reject illegal transitions with a 422 error.

**Bug 5 — Collision-safe `orderNumber`**

2.8 WHEN an order is created THEN the system SHALL generate a unique `orderNumber` using a mechanism that is safe under concurrent load (e.g., a database sequence, UUID-derived suffix, or a retry-on-conflict strategy), eliminating unique constraint violations caused by timestamp collisions.

**Bug 6 — Configurable tax rate**

2.9 WHEN an order is created THEN the system SHALL read the applicable tax rate from a configuration source (e.g., environment variable, branch record, or item record) rather than using a hardcoded literal, so that the rate can be changed without modifying source code.

**Bug 7 — Accurate Swagger docs**

2.10 WHEN a developer reads the Swagger docs for the order module THEN the system SHALL document `PATCH /:id/fulfillment` and `PATCH /:id/lifecycle` with their correct request/response schemas, and SHALL NOT document the obsolete `PUT /{id}` endpoint.

**Bug 8 — Manager role required for void**

2.11 WHEN a user without a manager role sends a lifecycle update with `status: "VOIDED"` THEN the system SHALL reject the request with a 403 Forbidden response.

2.12 WHEN a user with a manager role sends a lifecycle update with `status: "VOIDED"` THEN the system SHALL process the void normally.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid order creation request is submitted with correct item IDs and quantities THEN the system SHALL CONTINUE TO create the order, its items, and the initial bill atomically within a single database transaction.

3.2 WHEN an admin user fetches orders without any branch filter THEN the system SHALL CONTINUE TO return all orders across all branches.

3.3 WHEN `updateFulfillmentStatus` is called with a legal transition (e.g., `PENDING → PREPARING`) THEN the system SHALL CONTINUE TO apply the status change and record it in `order_status_history`.

3.4 WHEN `updateLifecycle` is called with a legal transition (e.g., `ACTIVE → COMPLETED`) THEN the system SHALL CONTINUE TO apply the status change, set the appropriate timestamp (`closedAt` or `voidedAt`), and record it in `order_status_history`.

3.5 WHEN an order is created for a DINE_IN type without a `tableId` THEN the system SHALL CONTINUE TO reject the request with a validation error.

3.6 WHEN a non-admin user creates an order THEN the system SHALL CONTINUE TO associate the order with the user's `branchId` from the authentication context, not from the request body.

3.7 WHEN item prices are fetched from the database during order creation THEN the system SHALL CONTINUE TO use the DB-sourced price for order items, ignoring any price in the client request.

3.8 WHEN a manager voids an order THEN the system SHALL CONTINUE TO set `voidedAt` and record the void actor and reason in the status history.

3.9 WHEN the Swagger docs are read for `GET /api/order` and `POST /api/order` THEN the system SHALL CONTINUE TO document those endpoints correctly.

---

## Bug Condition Summary

### Bug Condition Functions

```pascal
FUNCTION isBug1(module)
  // Triggers when the JS controller imports a .ts file
  RETURN module = "order.controller.js" AND import_extension = ".ts"
END FUNCTION

FUNCTION isBug2(request)
  // Triggers when a non-admin user fetches orders
  RETURN request.user.role != "admin"
END FUNCTION

FUNCTION isBug3(orderItem)
  // Triggers when an order item has modifiers with client-supplied prices
  RETURN orderItem.modifiers.length > 0
END FUNCTION

FUNCTION isBug4Fulfillment(transition)
  // Triggers when the target fulfillment status is not reachable from current
  RETURN NOT isLegalFulfillmentTransition(transition.from, transition.to)
END FUNCTION

FUNCTION isBug4Lifecycle(transition)
  // Triggers when the target lifecycle status is not reachable from current
  RETURN NOT isLegalLifecycleTransition(transition.from, transition.to)
END FUNCTION

FUNCTION isBug5(concurrentOrders)
  // Triggers when two orders are created within the same millisecond
  RETURN concurrentOrders.count > 1 AND allCreatedAtSameMillisecond(concurrentOrders)
END FUNCTION

FUNCTION isBug6(order)
  // Triggers on every order creation (tax rate is always hardcoded)
  RETURN true
END FUNCTION

FUNCTION isBug7(apiDoc)
  // Triggers when the stale PUT /{id} endpoint is present in docs
  RETURN apiDoc.contains("PUT /{id}")
END FUNCTION

FUNCTION isBug8(request)
  // Triggers when a non-manager user attempts to void an order
  RETURN request.body.status = "VOIDED" AND request.user.role != "manager"
END FUNCTION
```

### Fix-Checking Properties

```pascal
// Bug 2: Branch isolation
FOR ALL request WHERE isBug2(request) DO
  result ← getAllOrders'(request)
  ASSERT ALL order IN result: order.branchId = request.user.branchId
END FOR

// Bug 3: Modifier price integrity
FOR ALL orderItem WHERE isBug3(orderItem) DO
  result ← createOrder'(orderItem)
  ASSERT ALL modifier IN result.modifiers:
    modifier.unitPrice = DB.modifiers.findById(modifier.modifierId).price
END FOR

// Bug 4: Transition guard
FOR ALL transition WHERE isBug4Fulfillment(transition) DO
  result ← updateFulfillmentStatus'(transition)
  ASSERT result.statusCode = 422
END FOR

// Bug 8: Void authorization
FOR ALL request WHERE isBug8(request) DO
  result ← updateLifecycle'(request)
  ASSERT result.statusCode = 403
END FOR
```

### Preservation Property

```pascal
// For all non-buggy inputs, fixed behavior must equal original behavior
FOR ALL X WHERE NOT isBug2(X) AND NOT isBug3(X) AND NOT isBug4Fulfillment(X)
              AND NOT isBug4Lifecycle(X) AND NOT isBug5(X) AND NOT isBug8(X) DO
  ASSERT F(X) = F'(X)
END FOR
```
