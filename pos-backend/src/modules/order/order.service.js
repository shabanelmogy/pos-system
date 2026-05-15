import { orderLifecycleService } from "./services/order-lifecycle.service.js";
import { orderItemService } from "./services/order-item.service.js";
import { orderPaymentService } from "./services/order-payment.service.js";
import { orderOpsService } from "./services/order-ops.service.js";

/**
 * POS ORDER SERVICE (Facade)
 * 
 * This service acts as the central entry point for all order-related business logic.
 * To maintain maintainability and stay under the ~300 lines-per-file enterprise limit,
 * the implementation is decomposed into specialized sub-services:
 * 
 * - orderLifecycleService: Creation, confirmation, fulfillment, and core lifecycle.
 * - orderItemService: Line item CRUD (add, update quantity, remove, void).
 * - orderPaymentService: Financial transitions (add payment, refund, status updates).
 * - orderOpsService: Structural operations (merge, split, table moves, coupons).
 * 
 * All sub-services share core logic (state machines, totals recalculation) via
 * orderBaseService to prevent duplication and circular dependencies.
 */
const _subServices = [orderLifecycleService, orderItemService, orderPaymentService, orderOpsService];

// Run unconditionally on startup — it's O(n) on a tiny array and catches silent
// method collisions from the spread facade before they reach production.
const _allKeys = _subServices.flatMap(Object.keys);
const _dupes = _allKeys.filter((k, i) => _allKeys.indexOf(k) !== i);
if (_dupes.length) throw new Error(`Duplicate order service methods detected: ${_dupes.join(", ")}`);

const orderService = {
  ...orderLifecycleService,
  ...orderItemService,
  ...orderPaymentService,
  ...orderOpsService
};

export default orderService;