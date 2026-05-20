import { Decimal } from "decimal.js";
import branchRepository from "../modules/system/branch/branch.repository.js";

export interface OrderTotals {
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  serviceCharge: string;
  grandTotal: string;
}

const pricingService = {
  async getBranchRates(branchId: string, tx: any): Promise<{ taxRate: Decimal; serviceChargeRate: Decimal }> {
    const branch = await branchRepository.findById(branchId, tx);
    return {
      taxRate: new Decimal(branch?.taxRate ?? "0.00").div(100),
      serviceChargeRate: new Decimal(branch?.serviceChargeRate ?? "0.00").div(100)
    };
  },

  calcItemTax(subtotal: Decimal, taxRate: Decimal): string {
    return subtotal.mul(taxRate).toFixed(2);
  },

  calcOrderTotals(
    subtotal: Decimal,
    discountTotal: Decimal,
    taxRate: Decimal,
    serviceChargeRate: Decimal,
    couponDiscountAmount: string | null = null
  ): OrderTotals {
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
