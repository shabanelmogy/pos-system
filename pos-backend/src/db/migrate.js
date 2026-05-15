import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../config/database.js";

const runMigrations = async () => {
    console.log("Running migrations...");
    try {
        // Manually handle the enum addition outside of the main migration transaction
        // because ALTER TYPE ... ADD VALUE cannot be committed and used in the same transaction
        // for setting defaults or column types.
        try {
            await db.execute('ALTER TYPE "order_lifecycle" ADD VALUE \'DRAFT\' BEFORE \'ACTIVE\'');
            console.log("Added 'DRAFT' to order_lifecycle enum.");
        } catch (e) {
            // Ignore if it already exists or if type doesn't exist yet
            if (!e.message.includes('already exists') && !e.message.includes('does not exist')) {
                console.warn("Enum update warning:", e.message);
            }
        }

        await migrate(db, { migrationsFolder: "src/db/migrations" });
        console.log("Migrations completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await pool.end();
    }
};

runMigrations();
