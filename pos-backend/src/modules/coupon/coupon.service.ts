import { Decimal } from "decimal.js";
import couponRepository from "./coupon.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { Coupon, NewCoupon } from "./coupon.schema.js";

const couponService = {
  async getAllCoupons(): Promise<Coupon[]> {
    return await couponRepository.findAll();
  },

  async getCouponById(id: string): Promise<Coupon> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) fail("Coupon not found", 404);
    return coupon!;
  },

  async createCoupon(data: NewCoupon): Promise<Coupon> {
    const existing = await couponRepository.findByCode(data.code);
    if (existing) fail("Coupon code already exists", 400);
    return await couponRepository.create(data);
  },

  async updateCoupon(id: string, data: Partial<NewCoupon>): Promise<Coupon | undefined> {
    const coupon = await couponRepository.findById(id);
    if (!coupon) fail("Coupon not found", 404);
    
    if (data.code && data.code !== coupon!.code) {
      const existing = await couponRepository.findByCode(data.code);
      if (existing) fail("New coupon code already exists", 400);
    }
    
    return await couponRepository.update(id, data);
  },

  /**
   * VALIDATE COUPON
   * Centralized validation logic for promotions.
   * Checks for existence, activity, expiry, min amount, and usage limits.
   */
  async validateCoupon(code: string, orderAmount: string | number): Promise<Coupon> {
    const coupon = await couponRepository.findActiveByCode(code);
    if (!coupon) fail("Invalid or inactive coupon", 422);

    // 1. Minimum Order Amount Check
    if (new Decimal(orderAmount).lt(new Decimal(coupon!.minOrderAmount))) {
      fail(`Minimum order amount of ${coupon!.minOrderAmount} required for this coupon`, 422);
    }

    // 2. Expiry Check
    if (coupon!.validUntil && new Date(coupon!.validUntil) < new Date()) {
      fail("Coupon has expired", 422);
    }

    // 3. Global Usage Limit Check
    if (coupon!.totalUsageLimit && coupon!.usageCount >= coupon!.totalUsageLimit) {
      fail("Coupon usage limit reached", 422);
    }

    return coupon!;
  }
};

export default couponService;
