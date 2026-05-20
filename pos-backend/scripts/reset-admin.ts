import { db } from "../src/config/database.js";
import { users } from "../src/modules/system/user/user.schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function reset(): Promise<void> {
  try {
    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, "admin@example.com"))
      .returning();

    if (result.length > 0) {
      await db.update(users).set({ role: 'admin' }).where(eq(users.email, "admin@example.com"));
      console.log("Admin password reset and role set to 'admin' successfully!");
    } else {
      console.log("Admin user not found. Creating a new one...");
      await db.insert(users).values({
        email: "admin@example.com",
        password: hashedPassword,
        name: "Admin",
        role: "admin",
        phone: "0000000000" // Added phone as it's notNull in schema
      });
      console.log("Admin user created successfully!");
    }
  } catch (err: any) {
    console.error("Error resetting password:", err);
  } finally {
    process.exit();
  }
}

reset();
