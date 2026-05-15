import { db, pool } from "../src/config/database.js";
import { users } from "../src/modules/user/user.schema.js";
import { tables } from "../src/modules/table/table.schema.js";
import { categories } from "../src/modules/category/category.schema.js";
import { items } from "../src/modules/item/item.schema.js";
import { branches } from "../src/modules/branch/branch.schema.js";
import { posPoints } from "../src/modules/posPoint/posPoint.schema.js";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import "dotenv/config";

const seedEnterpriseData = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_ROLE } = process.env;

  console.log("🏙️ Seeding Branch...");
  const mainBranch = await db.insert(branches).values({
    name: "Main Branch",
    code: "BR-MAIN-01",
    city: "New Delhi",
    address: "123 Business Hub",
  }).returning();
  const branchId = mainBranch[0].id;

  console.log("🖥️ Seeding POS Terminal...");
  await db.insert(posPoints).values({
    name: "Main Counter",
    code: "POS-MAIN-01",
    branchId: branchId,
  });

  // 1. Seed Admin
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    await db.insert(users).values({
      name: ADMIN_NAME || "System Admin",
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE || "9999999999",
      password: hashedPassword,
      role: ADMIN_ROLE || "Admin",
      branchId: branchId, // Assign admin to main branch
    });
    console.log(`✅ Admin seeded: ${ADMIN_EMAIL}`);
  }

  // 2. Seed Tables
  console.log("🪑 Seeding Tables...");
  for (let i = 1; i <= 12; i++) {
    await db.insert(tables).values({
      tableNo: i,
      seats: i % 2 === 0 ? 6 : 4,
      status: "Available",
      branchId: branchId,
    });
  }

  // 3. Seed Menu Categories and Items
  console.log("🍽️ Seeding Menu...");
  const menuData = [
    { name: "Starters", items: [
      { name: "Paneer Tikka", price: 250 },
      { name: "Chicken Tikka", price: 300 },
      { name: "Crispy Corn", price: 180 },
    ]},
    { name: "Main Course", items: [
      { name: "Butter Chicken", price: 400 },
      { name: "Dal Makhani", price: 220 },
      { name: "Paneer Lababdar", price: 350 },
    ]},
    { name: "Beverages", items: [
      { name: "Masala Chai", price: 40 },
      { name: "Cold Coffee", price: 120 },
      { name: "Virgin Mojito", price: 150 },
    ]},
    { name: "Desserts", items: [
      { name: "Gulab Jamun", price: 80 },
      { name: "Brownie with Ice Cream", price: 180 },
    ]}
  ];

  for (const cat of menuData) {
    const newCat = await db.insert(categories).values({ name: cat.name }).returning();
    const categoryId = newCat[0].id;

    for (const item of cat.items) {
      await db.insert(items).values({
        name: item.name,
        price: item.price.toString(),
        description: `Delicious ${item.name} from our ${cat.name} selection.`,
        categoryId: categoryId,
        branchId: branchId, // Ensure items are linked to branch for future scaling
      });
    }
  }
};

const runSeeder = async () => {
  try {
    console.log("🚀 Starting Enterprise Seed...");
    await seedEnterpriseData();
    console.log("✨ Seeding complete.");
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

runSeeder();
