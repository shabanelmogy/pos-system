import { db } from "../../config/database.js";
import { posSettings } from "./posSettings.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { eq } from "drizzle-orm";

const posSettingsRepository = {
  async findAllWithSettings() {
    const points = await db.select().from(posPoints);
    const settings = await db.select().from(posSettings);
    
    // Map settings to points for easy consumption
    return points.map(point => ({
      ...point,
      settings: settings.find(s => s.posPointId === point.id) || null
    }));
  },

  async findByPosId(posPointId) {
    try {
      console.log(`[DB] Finding settings for POS: ${posPointId}`);
      const results = await db.select().from(posSettings).where(eq(posSettings.posPointId, posPointId));
      return results[0] || null;
    } catch (error) {
      console.error(`[DB ERROR] findByPosId failed:`, error.message);
      throw error;
    }
  },

  async upsert(posPointId, data) {
    // Sanitize data to prevent updating read-only or primary key fields
    const { id, createdAt, updatedAt, posPointId: _, ...safeData } = data;

    // Check if exists first using the local method
    const results = await db.select().from(posSettings).where(eq(posSettings.posPointId, posPointId));
    const existing = results[0];
    
    if (existing) {
      console.log(`[DB] Updating existing settings for POS: ${posPointId}`);
      const updated = await db.update(posSettings)
        .set({ ...safeData, updatedAt: new Date() })
        .where(eq(posSettings.posPointId, posPointId))
        .returning();
      return updated[0];
    } else {
      console.log(`[DB] Creating new default settings for POS: ${posPointId}`);
      const inserted = await db.insert(posSettings)
        .values({ ...safeData, posPointId })
        .returning();
      return inserted[0];
    }
  }
};

export default posSettingsRepository;
