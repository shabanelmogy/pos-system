import { Decimal } from "decimal.js";
import branchRepository from "../modules/branch/branch.repository.js";

/**
 * PricingService — Single source of truth for all tax/rate calculations.
 *
 * Centralises branch-rate resolution so that createOrder, addItem,
 * updateItemQuantity, and _recalculateTotals all use identical logic.
 * Eliminates the TAX_RATE env-var leakage that caused accounting mismatches.
 */
const pricingService = {
  /**
   * Fetch branch-specific tax and service-charge rates.
   * Returns Decimal instances ready for multiplication.
   *
   * @param {string} branchId
   * @param {object} tx  - Drizzle transaction (or db fallback)
   * @returns {{ taxRate: Decimal, serviceChargeRate: Decimal }}
   */
  async getBranchRates(branchId, tx) {
    const branch = await branchRepository.findById(branchId, tx);
    return {
      taxRate: new Decimal(branch?.taxRate ?? "0.00").div(100),
      serviceChargeRate: new Decimal(branch?.serviceChargeRate ?? "0.00").div(100)
    };
  },

  /**
   * Calculate the taxAmount snapshot for a single line-item subtotal.
   *
   * @param {Decimal} subtotal    - Item subtotal (after modifiers, before tax)
   * @param {Decimal} taxRate     - Branch tax rate as a decimal fraction (e.g. 0.05)
   * @returns {string}            - Rounded to 2 d.p., ready for DB insert
   */
  calcItemTax(subtotal, taxRate) {
    return subtotal.mul(taxRate).toFixed(2);
  },

  /**
   * Calculate order-level totals from a list of non-voided item subtotals.
   *
   * @param {Decimal}   subtotal          - Sum of item subtotals
   * @param {Decimal}   discountTotal     - Sum of item-level discounts
   * @param {Decimal}   taxRate
   * @param {Decimal}   serviceChargeRate
   * @param {string|null} couponDiscountAmount - Order-level coupon discount (string|null)
   * @returns {{ taxTotal, serviceCharge, grandTotal, discountTotal }}
   */
  calcOrderTotals(subtotal, discountTotal, taxRate, serviceChargeRate, couponDiscountAmount = null) {
    let effectiveSubtotal = subtotal;

    // Apply order-level coupon discount if present
    if (couponDiscountAmount) {
      const couponDiscount = new Decimal(couponDiscountAmount);
      effectiveSubtotal = Decimal.max(effectiveSubtotal.minus(couponDiscount), 0);
      discountTotal = discountTotal.add(couponDiscount);
    }

    const taxTotal = effectiveSubtotal.mul(taxRate);
    const serviceCharge = effectiveSubtotal.mul(serviceChargeRate);
    const grandTotal = effectiveSubtotal.add(taxTotal).add(serviceCharge);

    return {
      subtotal: subtotal.toFixed(2),
      discountTotal: discountTotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  }
};

export default pricingService;
