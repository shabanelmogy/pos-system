import { db, pool } from "../src/config/database.js";
import { 
  configProfiles, 
  configComponents, 
  configOptions, 
  configPriceRules, 
  configAssignments 
} from "../src/modules/config/config.schema.js";
import { categories, items } from "../src/modules/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

async function seed() {
  console.log("🍕 Seeding Enterprise Pizza Configuration...");
  const tenantId = "00000000-0000-0000-0000-000000000000";
  const userId = "00000000-0000-0000-0000-000000000000";

  try {
    // 1. Find the 'Pizzas' category
    const pizzaCat = await db.query.categories.findFirst({
      where: eq(categories.name, "Pizzas")
    });

    if (!pizzaCat) {
      console.error("❌ 'Pizzas' category not found. Please run basic seed first.");
      return;
    }

    // 2. Create Pizza Config Profile
    const [profile] = await db.insert(configProfiles).values({
      tenantId,
      name: { en: "Pizza Customization", ar: "تخصيص البيتزا" },
      description: { en: "Configure your size and toppings", ar: "اختر الحجم والإضافات" },
      status: "PUBLISHED",
      isCurrentPublished: true,
      createdBy: userId,
      internalCode: "PIZZA_CONFIG_01"
    }).returning();

    // 3. Create Components (Size, Toppings, Notes)
    const [sizeComp] = await db.insert(configComponents).values({
      profileId: profile.id,
      name: { en: "Choose Size", ar: "اختر الحجم" },
      internalCode: "SIZE",
      type: "SINGLE_SELECT",
      isRequired: true,
      sortOrder: 1
    }).returning();

    const [toppingComp] = await db.insert(configComponents).values({
      profileId: profile.id,
      name: { en: "Add Toppings", ar: "إضافة إضافات" },
      internalCode: "TOPPINGS",
      type: "MULTI_SELECT",
      isRequired: false,
      sortOrder: 2
    }).returning();

    // 4. Create Options for Size
    const [smallOpt] = await db.insert(configOptions).values({
      componentId: sizeComp.id,
      name: { en: "Small", ar: "صغير" },
      internalCode: "SMALL",
      isDefault: true,
      sortOrder: 1
    }).returning();

    const [largeOpt] = await db.insert(configOptions).values({
      componentId: sizeComp.id,
      name: { en: "Large", ar: "كبير" },
      internalCode: "LARGE",
      sortOrder: 2
    }).returning();

    // 5. Create Options for Toppings
    const [cheeseOpt] = await db.insert(configOptions).values({
      componentId: toppingComp.id,
      name: { en: "Extra Cheese", ar: "جبنة إضافية" },
      internalCode: "CHEESE",
      sortOrder: 1
    }).returning();

    const [mushroomOpt] = await db.insert(configOptions).values({
      componentId: toppingComp.id,
      name: { en: "Mushrooms", ar: "فطر" },
      internalCode: "MUSHROOMS",
      sortOrder: 2
    }).returning();

    // 6. Create Price Rules
    await db.insert(configPriceRules).values([
      {
        profileId: profile.id,
        targetType: "OPTION",
        targetId: largeOpt.id,
        strategy: "FIXED",
        amount: "50.00",
        name: "Large Size Upcharge"
      },
      {
        profileId: profile.id,
        targetType: "OPTION",
        targetId: cheeseOpt.id,
        strategy: "FIXED",
        amount: "20.00",
        name: "Extra Cheese Charge"
      },
      {
        profileId: profile.id,
        targetType: "OPTION",
        targetId: mushroomOpt.id,
        strategy: "FIXED",
        amount: "15.00",
        name: "Mushroom Charge"
      }
    ]);

    // 7. Assign Profile to 'Pizzas' Category (Polymorphic)
    await db.insert(configAssignments).values({
      tenantId,
      profileId: profile.id,
      targetType: "CATEGORY",
      targetId: pizzaCat.id
    });

    console.log("✅ Enterprise Pizza Configuration seeded successfully!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

seed();
