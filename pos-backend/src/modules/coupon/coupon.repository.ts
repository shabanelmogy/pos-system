import { eq, and } from "drizzle-orm";
import { coupons, Coupon, NewCoupon } from "./coupon.schema.js";
import { db } from "../../config/database.js";

const couponRepository = {
  async findAll(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  },

  async findById(id: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    return result[0];
  },

  async findByCode(code: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
    return result[0];
  },

  async findByCodeWithLock(code: string, tx: any): Promise<Coupon | undefined> {
    const result = await tx.select().from(coupons).where(eq(coupons.code, code)).limit(1).forUpdate();
    return result[0];
  },

  async findActiveByCode(code: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons)
      .where(and(
        eq(coupons.code, code),
        eq(coupons.isActive, true)
      ))
      .limit(1);
    return result[0];
  },

  async create(data: NewCoupon): Promise<Coupon> {
    const result = await db.insert(coupons).values(data).returning();
    return result[0];
  },

  async update(id: string, data: Partial<NewCoupon>): Promise<Coupon | undefined> {
    const result = await db.update(coupons).set(data).where(eq(coupons.id, id)).returning();
    return result[0];
  }
};

export default couponRepository;
