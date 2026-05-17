import { db } from "../src/config/database.js";
import { users } from "../src/modules/user/user.schema.js";

async function check() {
  try {
    const allUsers = await db.select().from(users);
    console.log("Users in DB:", allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
  } catch (err) {
    console.error("Error checking users:", err);
  } finally {
    process.exit();
  }
}

check();
