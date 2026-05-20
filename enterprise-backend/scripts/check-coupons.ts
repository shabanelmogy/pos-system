import { db } from "../src/config/database.js";
import { coupons } from "../src/modules/catalog/coupon/coupon.schema.js";

async function check(): Promise<void> {
  try {
    const all = await db.select().from(coupons);
    console.log("Coupons in DB:", all);
  } catch (err: any) {
    console.error("Error checking coupons:", err);
  } finally {
    process.exit();
  }
}

check();
