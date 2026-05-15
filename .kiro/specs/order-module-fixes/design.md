# Order Module Fixes — Bugfix Design

## Overview

The order module (`pos-backend/src/modules/order/`) contains eight defects identified during code review. Two are critical: a broken `.ts` import in a `.js` controller that prevents the module from loading under Node.js ESM, and a missing branch filter in `findAll` that leaks cross-tenant order data. The remaining six range from high to low severity and cover client-price trust for modifiers, missing state-machine transition guards, an `orderNumber` collision risk, a hardcoded tax rate, stale Swagger documentation, and an unguarded void endpoint.

The fix strategy is surgical: each change targets only the defective code path, and the preservation requirement ensures that all currently-working behavior (order creation, legal status transitions, admin cross-branch queries, etc.) continues to work identically after the fixes are applied.

---

## Glossary

- **Bug_Condition (C)**: A predicate over an input or system state that identifies when a defect is triggered.
- **Property (P)**: The desired, correct behavior that must hold for every input where C is true.
- **Preservation**: The guarantee that for every input where C is false, the fixed code produces the same result as the original code.
- **isBugCondition**: Pseudocode function that returns `true` when a given input triggers the specific bug.
- **expectedBehavior**: Pseudocode function that returns `true` when the fixed function's output is correct.
- **F**: The original (unfixed) function.
- **F'**: The fixed function.
- **Fulfillment State Machine**: The set of legal transitions between `fulfillmentStatus` values (PENDING → PREPARING → … → DELIVERED/PICKED_UP/SERVED).
- **Lifecycle State Machine**: The set of legal transitions between `lifecycle` values (ACTIVE → COMPLETED | VOIDED | CANCELLED).
- **Multi-tenant isolation**: The guarantee that a non-admin user can only read/write data belonging to their own `branchId`.
- **orderRepository.findAll**: The function in `order.repository.js` that queries all orders, currently ignoring the `filters` argument.
- **orderService.createOrder**: The function in `order.service.js` responsible for the atomic order creation transaction.
- **orderService.updateFulfillmentStatus**: The function in `order.service.js` that transitions `fulfillmentStatus`.
- **orderService.updateLifecycle**: The function in `order.service.js` that transitions `lifecycle`.

---

## Bug Details

### Bug 1 — `.ts` Import in `.js` Controller

`order.controller.js` imports from `./order.validation.ts` using the `.ts` extension. Node.js ESM does not resolve `.ts` extensions natively; this causes a module-not-found error at startup.

**Formal Specification:**
```
FUNCTION isBug1(importStatement)
  INPUT: importStatement — a static import declaration in order.controller.js
  OUTPUT: boolean

  RETURN importStatement.specifier ENDS_WITH ".ts"
END FUNCTION
```

**Examples:**
- `import { createOrderSchema } from "./order.validation.ts"` → bug triggers, module fails to load.
- `import { createOrderSchema } from "./order.validation.js"` → no bug, module loads correctly.

---

### Bug 2 — `findAll` Ignores Branch Filter

`orderRepository.findAll(filters)` accepts a `filters` argument but never applies it to the Drizzle query. Every caller receives all rows from every branch.

**Formal Specification:**
```
FUNCTION isBug2(request)
  INPUT: request — an HTTP GET /api/order request with an authenticated user
  OUTPUT: boolean

  RETURN request.user.role != "admin"
         OR request.query.branchId IS NOT NULL
END FUNCTION
```

**Examples:**
- Cashier at Branch A calls `GET /api/order` → receives orders from Branch B and C (bug).
- Admin calls `GET /api/order?branchId=<uuid>` → receives orders from all branches (bug).
- Admin calls `GET /api/order` with no filter → receives all orders (correct, no bug).

---

### Bug 3 — Modifier Prices Trusted from Client

In `orderService.createOrder`, the `modifiers` array from the request body is passed directly to `orderItemModifiers` insert without fetching authoritative prices from the database. A client can supply any `unitPrice` for a modifier.

**Formal Specification:**
```
FUNCTION isBug3(orderItem)
  INPUT: orderItem — a single item in the create-order request body
  OUTPUT: boolean

  RETURN orderItem.modifiers IS NOT NULL
         AND orderItem.modifiers.length > 0
END FUNCTION
```

**Examples:**
- Order item with modifier `{ modifierId: "uuid-1", quantity: 1 }` and client sends `unitPrice: 0` → modifier stored at $0 (bug).
- Order item with no modifiers → no bug.

---

### Bug 4 — No State-Machine Transition Guards

`updateFulfillmentStatus` and `updateLifecycle` apply any requested status change without checking whether the transition is legal from the current state.

**Formal Specification:**
```
FUNCTION isBug4Fulfillment(transition)
  INPUT: transition — { orderId, from: currentFulfillmentStatus, to: requestedStatus }
  OUTPUT: boolean

  RETURN NOT isLegalFulfillmentTransition(transition.from, transition.to)
END FUNCTION

FUNCTION isBug4Lifecycle(transition)
  INPUT: transition — { orderId, from: currentLifecycle, to: requestedStatus }
  OUTPUT: boolean

  RETURN NOT isLegalLifecycleTransition(transition.from, transition.to)
END FUNCTION
```

**Legal Fulfillment Transitions:**
```
PENDING        → PREPARING, READY
PREPARING      → PARTIALLY_READY, READY
PARTIALLY_READY → READY
READY          → SERVED, DISPATCHED, PICKED_UP
SERVED         → (terminal)
DISPATCHED     → DELIVERED
DELIVERED      → (terminal)
PICKED_UP      → (terminal)
```

**Legal Lifecycle Transitions:**
```
ACTIVE    → COMPLETED, VOIDED, CANCELLED
COMPLETED → (terminal)
VOIDED    → (terminal)
CANCELLED → (terminal)
```

**Examples:**
- `DELIVERED → PENDING` fulfillment update → accepted without error (bug).
- `COMPLETED → ACTIVE` lifecycle update → accepted without error (bug).
- `PENDING → PREPARING` fulfillment update → legal, should be accepted (no bug).
- `ACTIVE → VOIDED` lifecycle update → legal, should be accepted (no bug).

---

### Bug 5 — `orderNumber` Collision Risk

`orderNumber` is generated as `` `ORD-${Date.now()}` ``. Two concurrent requests within the same millisecond produce identical values, violating the `UNIQUE` constraint on `orders.order_number`.

**Formal Specification:**
```
FUNCTION isBug5(concurrentBatch)
  INPUT: concurrentBatch — a set of simultaneous createOrder calls
  OUTPUT: boolean

  RETURN concurrentBatch.size > 1
         AND EXISTS o1, o2 IN concurrentBatch:
               o1 != o2 AND Date.now_at(o1) = Date.now_at(o2)
END FUNCTION
```

**Examples:**
- Two orders created at timestamp `1700000000000` → both get `ORD-1700000000000` → DB unique constraint violation (bug).
- Orders created 10 ms apart → different timestamps → no collision (no bug, but still fragile).

---

### Bug 6 — Hardcoded 5% Tax Rate

`orderService.createOrder` uses the literal `0.05` in two places: per-item `taxAmount` and order-level `taxTotal`. The rate cannot be changed without modifying source code.

**Formal Specification:**
```
FUNCTION isBug6(order)
  INPUT: order — any createOrder invocation
  OUTPUT: boolean

  RETURN true  // Always triggers; every order creation uses the hardcoded rate
END FUNCTION
```

**Examples:**
- Branch configured for 10% VAT → system still charges 5% (bug).
- Any order creation → tax computed at exactly 5% regardless of configuration (bug).

---

### Bug 7 — Stale Swagger Documentation

`order.docs.js` documents a `PUT /api/order/{id}` endpoint that no longer exists in `order.routes.js`. The actual `PATCH /:id/fulfillment` and `PATCH /:id/lifecycle` endpoints are absent from the docs.

**Formal Specification:**
```
FUNCTION isBug7(apiDoc)
  INPUT: apiDoc — the parsed Swagger/OpenAPI spec for the order module
  OUTPUT: boolean

  RETURN apiDoc.paths["/api/order/{id}"].put IS DEFINED
         OR apiDoc.paths["/api/order/{id}/fulfillment"].patch IS NOT DEFINED
         OR apiDoc.paths["/api/order/{id}/lifecycle"].patch IS NOT DEFINED
END FUNCTION
```

**Examples:**
- Developer reads docs and calls `PUT /api/order/{id}` → 404 (bug).
- Developer looks for `PATCH /:id/fulfillment` in docs → not found (bug).

---

### Bug 8 — No Role Check Before Void

`order.routes.js` applies only `authenticate` middleware to `PATCH /:id/lifecycle`. Any authenticated user (cashier, waiter) can void an order by sending `{ "status": "VOIDED" }`.

**Formal Specification:**
```
FUNCTION isBug8(request)
  INPUT: request — an HTTP PATCH /:id/lifecycle request
  OUTPUT: boolean

  RETURN request.body.status = "VOIDED"
         AND request.user.role NOT IN ["manager", "admin"]
END FUNCTION
```

**Examples:**
- Cashier sends `PATCH /api/order/uuid/lifecycle` with `{ "status": "VOIDED" }` → void accepted (bug).
- Manager sends same request → void accepted (correct, no bug).

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Valid order creation (items + modifiers with correct IDs) continues to succeed atomically within a single DB transaction.
- Admin users fetching orders without a `branchId` filter continue to receive all orders across all branches.
- Legal fulfillment transitions (e.g., `PENDING → PREPARING`) continue to be applied and recorded in `order_status_history`.
- Legal lifecycle transitions (e.g., `ACTIVE → COMPLETED`) continue to be applied, with `closedAt`/`voidedAt` timestamps set correctly.
- DINE_IN orders without a `tableId` continue to be rejected with a validation error.
- Non-admin users creating orders continue to have `branchId` injected from the auth context, not the request body.
- Item prices for order items continue to be sourced from the database, not the client request.
- Manager-initiated voids continue to set `voidedAt` and record the actor and reason in status history.
- `GET /api/order` and `POST /api/order` Swagger docs continue to be documented correctly.

**Scope:**
All inputs that do NOT satisfy any of the eight bug conditions above must be completely unaffected by these fixes. This includes:
- Mouse/API interactions that do not involve the `.ts` import path (resolved at load time).
- Admin requests with no branch filter.
- Order creation requests with no modifiers.
- Legal state-machine transitions.
- Single-threaded order creation (no concurrency).
- Non-void lifecycle updates by any role.

---

## Hypothesized Root Cause

**Bug 1 — `.ts` import:**
The developer wrote the import targeting the TypeScript source file directly, likely intending to use ts-node or a bundler. The project runs plain Node.js ESM without a TypeScript transpilation step at runtime, so the `.ts` extension is unresolvable. The `.js` equivalent (`order.validation.js`) already exists and exports the same schemas.

**Bug 2 — Missing branch filter:**
The `findAll` function was written with a `filters` parameter signature but the Drizzle query was never updated to consume it. The `where` clause was simply omitted, making the filter argument a no-op. The controller correctly builds the `filters` object; the repository just ignores it.

**Bug 3 — Client modifier prices:**
The `modifiers` array from the request is spread directly into the insert payload (`...m`). The TypeScript schema in `order.validation.ts` accepts `unitPrice` on modifiers, and the JS schema in `order.validation.js` does not — but neither schema is enforced at the repository layer. The service never calls `itemRepository` for modifier pricing.

**Bug 4 — No transition guards:**
`updateFulfillmentStatus` and `updateLifecycle` in `order.service.js` call `orderRepository.recordStatusChange` immediately after fetching the order, with no validation of the `from → to` pair. The state machine is defined implicitly by the enum values in `order.schema.js` but never enforced in code.

**Bug 5 — `Date.now()` collision:**
`Date.now()` has millisecond resolution. Under concurrent load (e.g., two POS terminals submitting orders simultaneously), the same millisecond timestamp is used, producing duplicate `orderNumber` values that violate the `UNIQUE` constraint on `orders.order_number`.

**Bug 6 — Hardcoded tax rate:**
The literal `0.05` was used as a placeholder during initial development. No configuration lookup was ever wired in. The comment `// Enterprise pricing engine would go here` confirms this was known technical debt.

**Bug 7 — Stale docs:**
The `PUT /{id}` endpoint was removed from `order.routes.js` (replaced by the two `PATCH` endpoints) but `order.docs.js` was never updated to reflect the change.

**Bug 8 — Missing role middleware:**
The `authenticate` middleware verifies that a JWT is present and valid, but does not check the user's role. A separate `authorize` (or `requireRole`) middleware exists in the project (used in other modules) but was not applied to the lifecycle route.

---

## Correctness Properties

Property 1: Bug Condition — Module Loads Without Error

_For any_ Node.js ESM environment loading `order.controller.js`, the fixed module SHALL resolve all imports successfully, with no `ERR_MODULE_NOT_FOUND` or similar errors caused by a `.ts` extension specifier.

**Validates: Requirements 2.1**

---

Property 2: Bug Condition — Branch Isolation in `findAll`

_For any_ request where `isBug2(request)` is true (non-admin user, or admin with explicit `branchId` filter), the fixed `orderRepository.findAll` SHALL return only orders whose `branchId` matches the filter value, and SHALL NOT return orders from other branches.

**Validates: Requirements 2.2, 2.3**

---

Property 3: Bug Condition — Modifier Prices Sourced from DB

_For any_ order creation request where `isBug3(orderItem)` is true (at least one modifier present), the fixed `orderService.createOrder` SHALL store each modifier's `unitPrice` as fetched from the database record identified by `modifierId`, ignoring any `unitPrice` value supplied in the client request.

**Validates: Requirements 2.5**

---

Property 4: Bug Condition — Illegal Fulfillment Transitions Rejected

_For any_ `updateFulfillmentStatus` call where `isBug4Fulfillment(transition)` is true (the `from → to` pair is not in the legal transition set), the fixed `orderService.updateFulfillmentStatus` SHALL reject the request with HTTP 422 and SHALL NOT modify the order's `fulfillmentStatus` or insert a history record.

**Validates: Requirements 2.6**

---

Property 5: Bug Condition — Illegal Lifecycle Transitions Rejected

_For any_ `updateLifecycle` call where `isBug4Lifecycle(transition)` is true (the `from → to` pair is not in the legal transition set), the fixed `orderService.updateLifecycle` SHALL reject the request with HTTP 422 and SHALL NOT modify the order's `lifecycle` or insert a history record.

**Validates: Requirements 2.7**

---

Property 6: Bug Condition — Unique `orderNumber` Under Concurrency

_For any_ batch of concurrent `createOrder` calls where `isBug5(concurrentBatch)` is true (multiple calls within the same millisecond), the fixed system SHALL assign a distinct `orderNumber` to each order and SHALL NOT produce a unique constraint violation.

**Validates: Requirements 2.8**

---

Property 7: Bug Condition — Tax Rate Read from Configuration

_For any_ order creation (isBug6 is always true), the fixed `orderService.createOrder` SHALL compute `taxAmount` and `taxTotal` using a rate read from `process.env.TAX_RATE` (or a branch/item record), and SHALL NOT use the literal `0.05`.

**Validates: Requirements 2.9**

---

Property 8: Bug Condition — Accurate Swagger Documentation

_For any_ reading of the order module's Swagger spec, the fixed `order.docs.js` SHALL document `PATCH /:id/fulfillment` and `PATCH /:id/lifecycle` with correct schemas, and SHALL NOT document the obsolete `PUT /{id}` endpoint.

**Validates: Requirements 2.10**

---

Property 9: Bug Condition — Void Requires Manager Role

_For any_ lifecycle update request where `isBug8(request)` is true (`status: "VOIDED"` from a non-manager/non-admin user), the fixed route SHALL reject the request with HTTP 403 Forbidden before reaching the service layer.

**Validates: Requirements 2.11**

---

Property 10: Preservation — Legal Transitions and Non-Buggy Inputs Unchanged

_For any_ input where none of the bug conditions hold (legal transitions, admin queries, modifier-free orders, single-threaded creation, non-void lifecycle updates by authorized users), the fixed code SHALL produce exactly the same result as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**

---

## Fix Implementation

### Changes Required

**File: `pos-backend/src/modules/order/order.controller.js`**

**Fix 1 — Correct the import extension:**
- Change `from "./order.validation.ts"` to `from "./order.validation.js"`.
- The `.js` file exports `createOrderSchema`, `updateFulfillmentStatusSchema`, and `updateLifecycleSchema` — all symbols the controller already uses.

---

**File: `pos-backend/src/modules/order/order.repository.js`**

**Fix 2 — Apply branch filter in `findAll`:**
- Import `and`, `eq` from `drizzle-orm` (already imports `eq`; add `and` and `inArray` as needed).
- Build a `where` clause from the `filters` argument:
  - If `filters.branchId` is present, add `eq(orders.branchId, filters.branchId)`.
- Pass the constructed `where` clause to `db.query.orders.findMany`.

---

**File: `pos-backend/src/modules/order/order.service.js`**

**Fix 3 — Fetch modifier prices from DB:**
- In the `createOrder` loop, after resolving the item, iterate over `reqItem.modifiers`.
- For each modifier, call `itemRepository.findModifierById(modifier.modifierId)` (or equivalent) to fetch the authoritative price.
- Use the DB-sourced `unitPrice` when constructing the modifier insert payload; discard any client-supplied price.
- If a modifier ID is not found in the DB, call `fail(...)` with a 404.

**Fix 4 — Add fulfillment state-machine guard:**
- Define a `FULFILLMENT_TRANSITIONS` map (constant) listing legal `from → [to, ...]` pairs.
- In `updateFulfillmentStatus`, after fetching the order, check whether `toStatus` is in `FULFILLMENT_TRANSITIONS[order.fulfillmentStatus]`.
- If not, call `fail("Illegal fulfillment transition: ...", 422)`.

**Fix 5 — Add lifecycle state-machine guard:**
- Define a `LIFECYCLE_TRANSITIONS` map listing legal `from → [to, ...]` pairs.
- In `updateLifecycle`, after fetching the order, check whether `toStatus` is in `LIFECYCLE_TRANSITIONS[order.lifecycle]`.
- If not, call `fail("Illegal lifecycle transition: ...", 422)`.

**Fix 6 — Collision-safe `orderNumber`:**
- Replace `` `ORD-${Date.now()}` `` with a strategy that is safe under concurrency.
- Recommended approach: combine a timestamp with a cryptographically random suffix using `crypto.randomBytes(4).toString('hex')`, producing e.g. `ORD-1700000000000-a3f2c1b0`.
- Alternative: use a DB sequence or `uuid` slice. The random-suffix approach requires no schema change and is safe without a retry loop.

**Fix 7 — Read tax rate from configuration:**
- Add `const TAX_RATE = parseFloat(process.env.TAX_RATE ?? "0.05");` near the top of `order.service.js` (or in a shared config module).
- Replace both occurrences of `0.05` in `createOrder` with `TAX_RATE`.

---

**File: `pos-backend/src/modules/order/order.docs.js`**

**Fix 8 — Update Swagger documentation:**
- Remove the `put` block under `/api/order/{id}`.
- Add a `patch` block for `/api/order/{id}/fulfillment` with the `updateFulfillmentStatus` request body schema (`status` enum, optional `notes`, optional `reasonCode`).
- Add a `patch` block for `/api/order/{id}/lifecycle` with the `updateLifecycle` request body schema (`status` enum, optional `reasonCode`, optional `notes`).

---

**File: `pos-backend/src/modules/order/order.routes.js`**

**Fix 9 — Require manager role for void:**
- Import (or create) an `authorize` / `requireRole` middleware that checks `req.user.role`.
- Apply inline role-checking middleware to `router.patch("/:id/lifecycle", ...)`:
  - If `req.body.status === "VOIDED"` and `req.user.role` is not `"manager"` or `"admin"`, respond with 403.
  - Alternatively, apply a dedicated `requireManagerForVoid` middleware before `orderController.updateLifecycle`.

---

## Testing Strategy

### Validation Approach

Testing follows a two-phase approach:
1. **Exploratory / Bug Condition Checking** — run tests against the *unfixed* code to confirm the bug manifests as described and to surface counterexamples.
2. **Fix Checking + Preservation Checking** — run tests against the *fixed* code to verify each property holds and that no regression was introduced.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug on the unfixed code. Confirm or refute the root cause hypotheses.

**Test Plan**: Write unit and integration tests that exercise each bug condition. Run them on the unfixed code and observe failures.

**Test Cases:**

1. **Bug 1 — Import resolution**: Attempt to `import` `order.controller.js` in a plain Node.js ESM test environment. Expect `ERR_MODULE_NOT_FOUND` on unfixed code.

2. **Bug 2 — Branch leak**: Call `orderRepository.findAll({ branchId: "branch-A-uuid" })` when orders from both Branch A and Branch B exist. Assert that the result contains only Branch A orders. Expect failure (all orders returned) on unfixed code.

3. **Bug 3 — Modifier price trust**: Create an order with a modifier, supplying `unitPrice: 0` in the request while the DB record has `price: 5.00`. Assert that the stored modifier `unitPrice` equals `5.00`. Expect failure (stored as `0`) on unfixed code.

4. **Bug 4 — Illegal fulfillment transition**: Call `updateFulfillmentStatus` with `from: "DELIVERED", to: "PENDING"`. Assert HTTP 422. Expect failure (200 accepted) on unfixed code.

5. **Bug 4 — Illegal lifecycle transition**: Call `updateLifecycle` with `from: "COMPLETED", to: "ACTIVE"`. Assert HTTP 422. Expect failure (200 accepted) on unfixed code.

6. **Bug 5 — Concurrent orderNumber collision**: Simulate two simultaneous `createOrder` calls using `Promise.all`. Assert both succeed with distinct `orderNumber` values. Expect a unique constraint error on unfixed code.

7. **Bug 6 — Hardcoded tax**: Set `process.env.TAX_RATE = "0.10"` and create an order with subtotal `100`. Assert `taxTotal` equals `10.00`. Expect `5.00` on unfixed code.

8. **Bug 7 — Stale docs**: Parse the Swagger spec and assert `paths["/api/order/{id}"].put` is undefined and `paths["/api/order/{id}/fulfillment"].patch` is defined. Expect failure on unfixed code.

9. **Bug 8 — Unauthorized void**: Send `PATCH /:id/lifecycle` with `{ status: "VOIDED" }` as a cashier. Assert HTTP 403. Expect 200 on unfixed code.

**Expected Counterexamples:**
- `findAll` returns rows with `branchId` values different from the filter.
- Modifier `unitPrice` in the DB matches the client-supplied value, not the DB record.
- `recordStatusChange` is called with an illegal `from → to` pair without error.
- Two orders share the same `orderNumber`.
- Tax total is `subtotal * 0.05` regardless of `TAX_RATE` env var.

---

### Fix Checking

**Goal**: Verify that for all inputs where a bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL request WHERE isBug2(request) DO
  result := orderRepository.findAll_fixed(request.filters)
  ASSERT ALL order IN result: order.branchId = request.filters.branchId
END FOR

FOR ALL orderItem WHERE isBug3(orderItem) DO
  result := orderService.createOrder_fixed(orderItem)
  ASSERT ALL modifier IN result.modifiers:
    modifier.unitPrice = DB.findModifierById(modifier.modifierId).price
END FOR

FOR ALL transition WHERE isBug4Fulfillment(transition) DO
  result := orderService.updateFulfillmentStatus_fixed(transition)
  ASSERT result.statusCode = 422
END FOR

FOR ALL transition WHERE isBug4Lifecycle(transition) DO
  result := orderService.updateLifecycle_fixed(transition)
  ASSERT result.statusCode = 422
END FOR

FOR ALL concurrentBatch WHERE isBug5(concurrentBatch) DO
  results := Promise.all(concurrentBatch.map(createOrder_fixed))
  ASSERT ALL results succeed
  ASSERT orderNumbers(results) are all distinct
END FOR

FOR ALL order WHERE isBug6(order) DO
  result := orderService.createOrder_fixed(order, env.TAX_RATE = X)
  ASSERT result.taxTotal = result.subtotal * X
END FOR

FOR ALL request WHERE isBug8(request) DO
  result := PATCH_lifecycle_fixed(request)
  ASSERT result.statusCode = 403
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where no bug condition holds, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBug1(X) AND NOT isBug2(X) AND NOT isBug3(X)
              AND NOT isBug4Fulfillment(X) AND NOT isBug4Lifecycle(X)
              AND NOT isBug5(X) AND NOT isBug6(X) AND NOT isBug8(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it generates many test cases automatically across the input domain, catches edge cases that manual unit tests might miss, and provides strong guarantees that behavior is unchanged for all non-buggy inputs.

**Test Cases:**

1. **Admin cross-branch query preservation**: Admin calls `GET /api/order` with no filter → assert all orders returned (same as before fix).
2. **Legal fulfillment transition preservation**: `PENDING → PREPARING` → assert 200, status updated, history recorded.
3. **Legal lifecycle transition preservation**: `ACTIVE → COMPLETED` → assert 200, `closedAt` set, history recorded.
4. **Modifier-free order creation preservation**: Create order with no modifiers → assert order created correctly, totals correct.
5. **DINE_IN without tableId preservation**: Assert 422 validation error still returned.
6. **Non-void lifecycle update by cashier**: Cashier sends `ACTIVE → COMPLETED` → assert 200 (no role restriction on non-void transitions).
7. **Manager void preservation**: Manager sends `ACTIVE → VOIDED` → assert 200, `voidedAt` set, history recorded.

---

### Unit Tests

- Test `orderRepository.findAll` with `{ branchId: X }` filter — assert only branch X orders returned.
- Test `orderRepository.findAll` with `{}` filter — assert all orders returned.
- Test `FULFILLMENT_TRANSITIONS` map covers all enum values and has no missing entries.
- Test `LIFECYCLE_TRANSITIONS` map covers all enum values.
- Test each legal fulfillment transition is accepted.
- Test each illegal fulfillment transition is rejected with 422.
- Test each legal lifecycle transition is accepted.
- Test each illegal lifecycle transition is rejected with 422.
- Test `orderNumber` generator produces distinct values across 1000 rapid calls.
- Test tax rate reads from `process.env.TAX_RATE` and falls back to `0.05` when unset.
- Test Swagger spec: `PUT /{id}` absent, `PATCH /{id}/fulfillment` and `PATCH /{id}/lifecycle` present.
- Test void route returns 403 for cashier role and 200 for manager role.

### Property-Based Tests

- Generate random `branchId` values and random order sets; assert `findAll({ branchId })` always returns only matching orders.
- Generate random legal transition sequences; assert all are accepted and history is recorded for each.
- Generate random illegal transition pairs; assert all are rejected with 422 and no state change occurs.
- Generate random modifier lists with arbitrary client-supplied prices; assert stored prices always match DB values.
- Generate random concurrent order batches (2–20 simultaneous); assert all `orderNumber` values are distinct.
- Generate random tax rates via env var; assert `taxTotal = subtotal * TAX_RATE` for all orders.

### Integration Tests

- Full order creation flow: create order with modifiers → verify modifier prices from DB, correct tax, unique `orderNumber`, bill created.
- Branch isolation end-to-end: seed two branches, authenticate as Branch A cashier, call `GET /api/order` → assert only Branch A orders returned.
- State machine end-to-end: walk a DINE_IN order through `PENDING → PREPARING → READY → SERVED` → assert each step succeeds and history is complete.
- Void authorization end-to-end: cashier attempts void → 403; manager attempts void → 200, `voidedAt` set.
- Swagger spec integration: load the Express app and call `GET /api-docs` → assert correct endpoints documented.
