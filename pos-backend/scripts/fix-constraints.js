import { db } from "../src/config/database.js";
import { sql } from "drizzle-orm";

async function run() {
  console.log("🚀 Fixing Foreign Key Constraints for Customers...");

  try {
    // 1. Drop the old FK constraint pointing to users
    try {
      await db.execute(sql`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_customer_id_users_id_fk";`);
      console.log("Dropped legacy orders_customer_id_users_id_fk");
    } catch (e) {
      console.log("Legacy constraint not found.");
    }

    // 2. Add the new FK constraint pointing to customers
    try {
      await db.execute(sql`
        ALTER TABLE "orders" 
        ADD CONSTRAINT "orders_customer_id_customers_id_fk" 
        FOREIGN KEY ("customer_id") REFERENCES "customers"("id") 
        ON DELETE NO ACTION ON UPDATE NO ACTION;
      `);
      console.log("Added new orders_customer_id_customers_id_fk");
    } catch (e) {
      console.log("New constraint already exists or error adding it.");
    }

    console.log("✅ Constraints fixed!");
  } catch (error) {
    console.error("❌ Constraint fix failed:", error);
  } finally {
    process.exit();
  }
}

run();
