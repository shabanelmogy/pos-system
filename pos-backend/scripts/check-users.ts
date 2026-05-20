import { db } from "../src/config/database.js";
import { users } from "../src/modules/system/user/user.schema.js";

async function check(): Promise<void> {
  try {
    const allUsers = await db.select().from(users);
    console.log("Users in DB:", allUsers.map((u: any) => ({ id: u.id, email: u.email, role: u.role })));
  } catch (err: any) {
    console.error("Error checking users:", err);
  } finally {
    process.exit();
  }
}

check();
