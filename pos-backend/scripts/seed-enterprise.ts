import { db } from "../src/config/database.js";
import { branches } from "../src/modules/branch/branch.schema.js";
import { posPoints } from "../src/modules/posPoint/posPoint.schema.js";

async function seed(): Promise<void> {
  try {
    console.log("Seeding default enterprise data...");
    
    // 1. Create Default Branch
    const [branch] = await db.insert(branches).values({
      name: "Main Headquarters",
      code: "BR-MAIN-01",
      city: "Port Said",
      country: "Egypt"
    }).onConflictDoNothing().returning();

    const targetBranchId: string | undefined = branch?.id || (await db.select().from(branches).limit(1))[0]?.id;

    if (targetBranchId) {
      // 2. Create Default POS Point
      await db.insert(posPoints).values({
        branchId: targetBranchId,
        name: "Main Register",
        code: "POS-MAIN-01"
      }).onConflictDoNothing();
      
      console.log("Seeding complete! You can now log in and select the 'Main Headquarters' branch.");
    } else {
      console.log("Branch creation failed or already exists.");
    }
  } catch (error: any) {
    console.error("Seeding failed:", error);
  } finally {
    process.exit();
  }
}

seed();
