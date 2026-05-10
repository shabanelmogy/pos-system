import { db, pool } from "../src/config/database.js";
import { users } from "../src/modules/user/user.schema.js";
import { tables } from "../src/modules/table/table.schema.js";
import { categories } from "../src/modules/category/category.schema.js";
import { items } from "../src/modules/item/item.schema.js";
import { orders } from "../src/modules/order/order.schema.js";
import { payments } from "../src/modules/payment/payment.schema.js";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import "dotenv/config";

const wipeDatabase = async () => {
  console.log("Wiping database...");
  await db.delete(payments);
  await db.delete(orders);
  await db.delete(items);
  await db.delete(categories);
  await db.delete(tables);
  await db.delete(users);
  console.log("Database wiped clean.");
};

const seedData = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_ROLE } = process.env;

  // 1. Seed Admin
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
    await db.insert(users).values({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE || "9999999999",
      password: hashedPassword,
      role: ADMIN_ROLE || "Admin",
    });
    console.log(`Admin user seeded: ${ADMIN_EMAIL}`);
  }

  // 2. Seed Tables (15 tables as per constants)
  for (let i = 1; i <= 15; i++) {
    await db.insert(tables).values({
      tableNo: i,
      seats: i % 2 === 0 ? 6 : 4,
      status: "Available"
    });
  }
  console.log("15 Tables seeded.");

  // 3. Seed Menu Categories and Items
  const menuData = [
    { name: "Starters", items: [
      { name: "Paneer Tikka", price: 250 },
      { name: "Chicken Tikka", price: 300 },
      { name: "Tandoori Chicken", price: 350 },
      { name: "Samosa", price: 100 },
      { name: "Aloo Tikki", price: 120 },
      { name: "Hara Bhara Kebab", price: 220 }
    ]},
    { name: "Main Course", items: [
      { name: "Butter Chicken", price: 400 },
      { name: "Paneer Butter Masala", price: 350 },
      { name: "Chicken Biryani", price: 450 },
      { name: "Dal Makhani", price: 180 },
      { name: "Kadai Paneer", price: 300 },
      { name: "Rogan Josh", price: 500 }
    ]},
    { name: "Beverages", items: [
      { name: "Masala Chai", price: 50 },
      { name: "Lemon Soda", price: 80 },
      { name: "Mango Lassi", price: 120 },
      { name: "Cold Coffee", price: 150 },
      { name: "Fresh Lime Water", price: 60 },
      { name: "Iced Tea", price: 100 }
    ]},
    { name: "Soups", items: [
      { name: "Tomato Soup", price: 120 },
      { name: "Sweet Corn Soup", price: 130 },
      { name: "Hot & Sour Soup", price: 140 },
      { name: "Chicken Clear Soup", price: 160 },
      { name: "Mushroom Soup", price: 150 },
      { name: "Lemon Coriander Soup", price: 110 }
    ]},
    { name: "Desserts", items: [
      { name: "Gulab Jamun", price: 100 },
      { name: "Kulfi", price: 150 },
      { name: "Chocolate Lava Cake", price: 250 },
      { name: "Ras Malai", price: 180 }
    ]},
    { name: "Pizzas", items: [
      { name: "Margherita Pizza", price: 350 },
      { name: "Veg Supreme Pizza", price: 400 },
      { name: "Pepperoni Pizza", price: 450 }
    ]},
    { name: "Alcoholic Drinks", items: [
      { name: "Beer", price: 200 },
      { name: "Whiskey", price: 500 },
      { name: "Vodka", price: 450 },
      { name: "Rum", price: 350 },
      { name: "Tequila", price: 600 },
      { name: "Cocktail", price: 400 }
    ]},
    { name: "Salads", items: [
      { name: "Caesar Salad", price: 200 },
      { name: "Greek Salad", price: 250 },
      { name: "Fruit Salad", price: 150 },
      { name: "Chicken Salad", price: 300 },
      { name: "Tuna Salad", price: 350 }
    ]}
  ];

  for (const cat of menuData) {
    const newCat = await db.insert(categories).values({ name: cat.name }).returning();
    const categoryId = newCat[0].id;

    for (const item of cat.items) {
      await db.insert(items).values({
        name: item.name,
        price: item.price.toString(),
        description: `${cat.name} dish`,
        categoryId: categoryId
      });
    }
    console.log(`Category ${cat.name} seeded with ${cat.items.length} items.`);
  }
};

const runMigration = async () => {
  try {
    await wipeDatabase();
    await seedData();
    console.log("Migration and seeding complete.");
  } catch (error) {
    console.error(`Migration failed: ${error.message}`);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

runMigration();
