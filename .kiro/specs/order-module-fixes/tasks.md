# Implementation Plan

- [ ] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Order Module Eight-Bug Suite
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: For deterministic bugs (1, 2, 3, 6, 7, 8), scope the property to the concrete failing case(s) to ensure reproducibility; for concurrent bugs (5), use `Promise.all` with 2–20 simultaneous calls
  - **Bug 1 — Import resolution**: Attempt to dynamically `import` `order.controller.js` in a plain Node.js ESM test environment; assert no `ERR_MODULE_NOT_FOUND` is thrown — expect FAILURE on unfixed code (isBugCondition: `import_extension = ".ts"`)
  - **Bug 2 — Branch leak**: Call `orderRepository.findAll({ branchId: "branch-A-uuid" })` when orders from Branch A and Branch B both exist; assert every returned order has `branchId = "branch-A-uuid"` — expect FAILURE (all orders returned) on unfixed code (isBugCondition: `request.user.role != "admin"`)
  - **Bug 3 — Modifier price trust**: Create an order item with modifier `{ modifierId: "<uuid>", quantity: 1 }` and client-supplied `unitPrice: 0` while the DB record has `price: 5.00`; assert stored modifier `unitPrice = 5.00` — expect FAILURE (stored as 0) on unfixed code (isBugCondition: `orderItem.modifiers.length > 0`)
  - **Bug 4a — Illegal fulfillment transition**: Call `updateFulfillmentStatus` with `from: "DELIVERED", to: "PENDING"`; assert HTTP 422 — expect FAILURE (200 accepted) on unfixed code (isBugCondition: `NOT isLegalFulfillmentTransition(from, to)`)
  - **Bug 4b — Illegal lifecycle transition**: Call `updateLifecycle` with `from: "COMPLETED", to: "ACTIVE"`; assert HTTP 422 — expect FAILURE (200 accepted) on unfixed code (isBugCondition: `NOT isLegalLifecycleTransition(from, to)`)
  - **Bug 5 — Concurrent orderNumber collision**: Use `Promise.all` to fire 5 simultaneous `createOrder` calls; assert all succeed and all `orderNumber` values are distinct — expect FAILURE (unique constraint violation) on unfixed code (isBugCondition: `concurrentOrders.count > 1 AND allCreatedAtSameMillisecond`)
  - **Bug 6 — Hardcoded tax**: Set `process.env.TAX_RATE = "0.10"`, create an order with `subtotal = 100`; assert `taxTotal = 10.00` — expect FAILURE (`taxTotal = 5.00`) on unfixed code (isBugCondition: always true)
  - **Bug 7 — Stale docs**: Parse the Swagger spec; assert `paths["/api/order/{id}"].put` is undefined AND `paths["/api/order/{id}/fulfillment"].patch` is defined — expect FAILURE on unfixed code (isBugCondition: `apiDoc.contains("PUT /{id}")`)
  - **Bug 8 — Unauthorized void**: Send `PATCH /:id/lifecycle` with `{ status: "VOIDED" }` as a cashier-role user; assert HTTP 403 — expect FAILURE (200 accepted) on unfixed code (isBugCondition: `status = "VOIDED" AND role != "manager"`)
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., `findAll` returns rows with foreign `branchId`, modifier stored at client price, illegal transitions accepted, duplicate `orderNumber`, tax always 5%, PUT /{id} present in docs, cashier void returns 200)
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [ ] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Non-Buggy Input Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all non-buggy inputs before writing assertions
  - **Observation 1 — Admin cross-branch query**: Call `orderRepository.findAll({})` as admin with no filter; observe all orders returned across all branches — write property: for all admin requests with no `branchId`, result contains orders from every branch
  - **Observation 2 — Legal fulfillment transitions**: Walk `PENDING → PREPARING`, `PREPARING → READY`, `READY → SERVED`; observe 200 responses and history records inserted — write property: for all `(from, to)` pairs in `FULFILLMENT_TRANSITIONS`, `updateFulfillmentStatus` returns 200 and inserts a history row
  - **Observation 3 — Legal lifecycle transitions**: Walk `ACTIVE → COMPLETED`, `ACTIVE → VOIDED` (as manager), `ACTIVE → CANCELLED`; observe 200 responses, `closedAt`/`voidedAt` set, history recorded — write property: for all `(from, to)` pairs in `LIFECYCLE_TRANSITIONS`, `updateLifecycle` returns 200 and sets the correct timestamp
  - **Observation 4 — Modifier-free order creation**: Create an order with no modifiers; observe order created, totals correct, bill created — write property: for all create-order requests with empty modifiers array, order is created atomically with correct subtotal/taxTotal/grandTotal
  - **Observation 5 — DINE_IN without tableId**: Submit a DINE_IN order with no `tableId`; observe 422 validation error — write property: for all DINE_IN requests missing `tableId`, response is 422
  - **Observation 6 — Non-void lifecycle update by cashier**: Cashier sends `ACTIVE → COMPLETED`; observe 200 — write property: for all lifecycle updates where `status != "VOIDED"`, any authenticated role is accepted
  - **Observation 7 — Manager void**: Manager sends `ACTIVE → VOIDED`; observe 200, `voidedAt` set, history recorded — write property: for all void requests from manager/admin role, response is 200 and `voidedAt` is set
  - **Observation 8 — Item prices from DB**: Create order with items; observe `unitPrice` in stored order items matches DB product price, not any client-supplied value — write property: for all order items, stored `unitPrice = DB.items.findById(menuItemId).price`
  - **Observation 9 — GET/POST Swagger docs**: Load Swagger spec; observe `GET /api/order` and `POST /api/order` are documented — write property: those two paths remain present and correct after any doc changes
  - Write property-based tests capturing all observed behavior patterns from Preservation Requirements (section 3 of bugfix.md)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 3. Fix all eight order module bugs

  - [ ] 3.1 Fix Bug 1 — Correct `.ts` import extension in `order.controller.js`
    - In `order.controller.js`, change `from "./order.validation.ts"` to `from "./order.validation.js"`
    - Verify `order.validation.js` exports `createOrderSchema`, `updateFulfillmentStatusSchema`, and `updateLifecycleSchema`
    - _Bug_Condition: `isBug1(module)` — `import_extension = ".ts"` in `order.controller.js`_
    - _Expected_Behavior: module loads without `ERR_MODULE_NOT_FOUND`; all three schemas resolve correctly_
    - _Preservation: all other imports and controller behavior unchanged_
    - _Requirements: 2.1_

  - [ ] 3.2 Fix Bug 2 — Apply branch filter in `order.repository.js::findAll`
    - Add `and` to the drizzle-orm imports (alongside the existing `eq`, `desc`)
    - Build a conditional `where` clause: if `filters.branchId` is present, apply `eq(orders.branchId, filters.branchId)`; otherwise no `where` clause (admin cross-branch query preserved)
    - Pass the constructed `where` clause to `db.query.orders.findMany`
    - _Bug_Condition: `isBug2(request)` — `request.user.role != "admin"` OR `request.query.branchId` is set_
    - _Expected_Behavior: result contains only orders with `branchId = filters.branchId` when filter is provided_
    - _Preservation: admin requests with no `branchId` filter continue to return all orders (Requirement 3.2)_
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ] 3.3 Fix Bug 3 — Fetch modifier prices from DB in `order.service.js::createOrder`
    - In the `createOrder` item loop, after resolving the product, iterate over `reqItem.modifiers`
    - For each modifier, call `itemRepository.findModifierById(modifier.modifierId)` (or equivalent) to fetch the authoritative price from the database
    - If the modifier ID is not found, call `fail(\`Modifier \${modifier.modifierId} not found\`, 404)`
    - Use the DB-sourced `unitPrice` when constructing the modifier insert payload; discard any client-supplied price
    - _Bug_Condition: `isBug3(orderItem)` — `orderItem.modifiers.length > 0`_
    - _Expected_Behavior: stored modifier `unitPrice = DB.modifiers.findById(modifierId).price` for all modifiers_
    - _Preservation: modifier-free orders continue to be created correctly; item prices continue to be sourced from DB (Requirement 3.7)_
    - _Requirements: 2.5_

  - [ ] 3.4 Fix Bug 4 — Add fulfillment state-machine guard in `order.service.js`
    - Define a `FULFILLMENT_TRANSITIONS` constant map at the top of `order.service.js`:
      ```
      PENDING        → [PREPARING, READY]
      PREPARING      → [PARTIALLY_READY, READY]
      PARTIALLY_READY → [READY]
      READY          → [SERVED, DISPATCHED, PICKED_UP]
      DISPATCHED     → [DELIVERED]
      SERVED         → []  (terminal)
      DELIVERED      → []  (terminal)
      PICKED_UP      → []  (terminal)
      ```
    - In `updateFulfillmentStatus`, after fetching the order, check `FULFILLMENT_TRANSITIONS[order.fulfillmentStatus]?.includes(toStatus)`
    - If the check fails, call `fail(\`Illegal fulfillment transition: \${order.fulfillmentStatus} → \${toStatus}\`, 422)`
    - _Bug_Condition: `isBug4Fulfillment(transition)` — `NOT isLegalFulfillmentTransition(from, to)`_
    - _Expected_Behavior: HTTP 422 returned; `fulfillmentStatus` unchanged; no history row inserted_
    - _Preservation: all legal fulfillment transitions continue to be applied and recorded (Requirement 3.3)_
    - _Requirements: 2.6_

  - [ ] 3.5 Fix Bug 4 — Add lifecycle state-machine guard in `order.service.js`
    - Define a `LIFECYCLE_TRANSITIONS` constant map at the top of `order.service.js`:
      ```
      ACTIVE    → [COMPLETED, VOIDED, CANCELLED]
      COMPLETED → []  (terminal)
      VOIDED    → []  (terminal)
      CANCELLED → []  (terminal)
      ```
    - In `updateLifecycle`, after fetching the order, check `LIFECYCLE_TRANSITIONS[order.lifecycle]?.includes(toStatus)`
    - If the check fails, call `fail(\`Illegal lifecycle transition: \${order.lifecycle} → \${toStatus}\`, 422)`
    - _Bug_Condition: `isBug4Lifecycle(transition)` — `NOT isLegalLifecycleTransition(from, to)`_
    - _Expected_Behavior: HTTP 422 returned; `lifecycle` unchanged; no history row inserted_
    - _Preservation: all legal lifecycle transitions continue to be applied, with `closedAt`/`voidedAt` set correctly (Requirement 3.4)_
    - _Requirements: 2.7_

  - [ ] 3.6 Fix Bug 5 — Collision-safe `orderNumber` in `order.service.js::createOrder`
    - Add `import { randomBytes } from "crypto";` at the top of `order.service.js`
    - Replace `` `ORD-${Date.now()}` `` with `` `ORD-${Date.now()}-${randomBytes(4).toString('hex')}` ``
    - This produces values like `ORD-1700000000000-a3f2c1b0`, safe under concurrent load without a schema change
    - _Bug_Condition: `isBug5(concurrentBatch)` — `concurrentBatch.count > 1 AND allCreatedAtSameMillisecond`_
    - _Expected_Behavior: all concurrent `createOrder` calls succeed; all `orderNumber` values are distinct_
    - _Preservation: single-threaded order creation continues to produce a valid, unique `orderNumber` (Requirement 3.1)_
    - _Requirements: 2.8_

  - [ ] 3.7 Fix Bug 6 — Read tax rate from configuration in `order.service.js`
    - Add `const TAX_RATE = parseFloat(process.env.TAX_RATE ?? "0.05");` near the top of `order.service.js` (module-level constant, evaluated once at load time)
    - Replace both occurrences of the literal `0.05` in `createOrder` with `TAX_RATE`:
      - Per-item: `taxAmount: (itemSubtotal * TAX_RATE).toFixed(2)`
      - Order-level: `const taxTotal = subtotal * TAX_RATE;`
    - _Bug_Condition: `isBug6(order)` — always true; every order creation uses the hardcoded rate_
    - _Expected_Behavior: `taxTotal = subtotal * parseFloat(process.env.TAX_RATE ?? "0.05")` for all orders_
    - _Preservation: when `TAX_RATE` env var is unset, behavior is identical to before (defaults to 0.05); order creation flow unchanged (Requirement 3.1)_
    - _Requirements: 2.9_

  - [ ] 3.8 Fix Bug 7 — Update Swagger documentation in `order.docs.js`
    - Remove the entire `put:` block under `/api/order/{id}` (the obsolete `PUT /{id}` endpoint)
    - Add a `patch:` block under `/api/order/{id}/fulfillment` documenting the `updateFulfillmentStatus` endpoint with request body schema: `status` (enum: PREPARING, PARTIALLY_READY, READY, SERVED, DISPATCHED, PICKED_UP, DELIVERED), optional `notes` (string), optional `reasonCode` (string)
    - Add a `patch:` block under `/api/order/{id}/lifecycle` documenting the `updateLifecycle` endpoint with request body schema: `status` (enum: COMPLETED, VOIDED, CANCELLED), optional `reasonCode` (string), optional `notes` (string)
    - _Bug_Condition: `isBug7(apiDoc)` — `apiDoc.contains("PUT /{id}")`_
    - _Expected_Behavior: `PUT /{id}` absent; `PATCH /{id}/fulfillment` and `PATCH /{id}/lifecycle` present with correct schemas_
    - _Preservation: `GET /api/order` and `POST /api/order` docs remain correct and unchanged (Requirement 3.9)_
    - _Requirements: 2.10_

  - [ ] 3.9 Fix Bug 8 — Add manager role check for void in `order.routes.js`
    - Create a `requireManagerForVoid` inline middleware (or import an existing `authorize` middleware from the project):
      ```js
      const requireManagerForVoid = (req, res, next) => {
        if (req.body.status === "VOIDED" && !["manager", "admin"].includes(req.user.role)) {
          return res.status(403).json({ success: false, message: "Forbidden: manager role required to void orders" });
        }
        next();
      };
      ```
    - Apply it to the lifecycle route: `router.patch("/:id/lifecycle", requireManagerForVoid, orderController.updateLifecycle)`
    - _Bug_Condition: `isBug8(request)` — `status = "VOIDED" AND role NOT IN ["manager", "admin"]`_
    - _Expected_Behavior: HTTP 403 returned before reaching the service layer; order unchanged_
    - _Preservation: non-void lifecycle updates by any authenticated role continue to be accepted (Requirement 3.4); manager/admin voids continue to succeed with `voidedAt` set (Requirement 3.8)_
    - _Requirements: 2.11, 2.12_

  - [ ] 3.10 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Order Module Eight-Bug Suite
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior for all eight bug conditions
    - When these tests pass, it confirms the expected behavior is satisfied for each fix
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms all eight bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11_

  - [ ] 3.11 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Input Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions introduced by any of the eight fixes)
    - Confirm admin cross-branch queries, legal transitions, modifier-free orders, DINE_IN validation, non-void cashier updates, manager voids, and GET/POST Swagger docs all behave identically to before

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite for the order module
  - Ensure all bug condition exploration tests pass (bugs fixed)
  - Ensure all preservation property tests pass (no regressions)
  - Ensure all unit tests pass (transition maps, tax rate, orderNumber uniqueness, Swagger spec)
  - Ask the user if any questions arise before closing the spec
