import { db } from "../src/config/database.js";
import { coupons } from "../src/modules/coupon/coupon.schema.js";

async function check() {
  try {
    const all = await db.select().from(coupons);
    console.log("Coupons in DB:", all);
  } catch (err) {
    console.error("Error checking coupons:", err);
  } finally {
    process.exit();
  }
}

check();
