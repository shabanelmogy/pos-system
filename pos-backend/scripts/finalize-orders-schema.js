import { db } from "../src/config/database.js";
import { sql } from "drizzle-orm";

async function run() {
  console.log("🚀 Finalizing Orders Schema for Customer Module...");

  try {
    // 1. Rename customer_details to customer_snapshot if it exists
    try {
      await db.execute(sql`ALTER TABLE "orders" RENAME COLUMN "customer_details" TO "customer_snapshot";`);
      console.log("Renamed customer_details to customer_snapshot");
    } catch (e) {
      console.log("Column customer_details not found or already renamed.");
    }

    // 2. Drop legacy columns
    const columnsToDrop = ["order_date", "bills", "items"];
    for (const col of columnsToDrop) {
      try {
        await db.execute(sql`ALTER TABLE "orders" DROP COLUMN ${sql.identifier(col)};`);
        console.log(`Dropped legacy column: ${col}`);
      } catch (e) {
        console.log(`Column ${col} not found or already dropped.`);
      }
    }

    console.log("✅ Orders schema finalized!");
  } catch (error) {
    console.error("❌ Schema finalization failed:", error);
  } finally {
    process.exit();
  }
}

run();
