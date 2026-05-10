import { db } from "./src/config/database.js";
import { posPoints } from "./src/modules/posPoint/posPoint.schema.js";
import { posSettings } from "./src/modules/posSettings/posSettings.schema.js";
import { sql } from "drizzle-orm";

async function populateSettings() {
    try {
        console.log("Fetching all POS terminals...");
        const allPOS = await db.select().from(posPoints);
        console.log(`Found ${allPOS.length} terminals.`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const pos of allPOS) {
            // Check if settings already exist
            const existing = await db.select()
                .from(posSettings)
                .where(sql`${posSettings.posPointId} = ${pos.id}`);

            if (existing.length === 0) {
                console.log(`Creating default settings for: ${pos.name} (${pos.id})`);
                await db.insert(posSettings).values({
                    posPointId: pos.id,
                    autoPrintReceipt: true,
                    allowDiscounts: false,
                    requireCustomerOnOrder: false,
                    receiptPrinterName: "Default",
                    kitchenPrinterName: "Kitchen"
                });
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log("\n--- Population Complete ---");
        console.log(`Created: ${createdCount}`);
        console.log(`Skipped (already existed): ${skippedCount}`);
        process.exit(0);
    } catch (error) {
        console.error("Critical Error during population:", error);
        process.exit(1);
    }
}

populateSettings();
