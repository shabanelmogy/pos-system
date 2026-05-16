import { eq } from "drizzle-orm";
import { kitchenStations } from "./kitchenStation.schema.js";
import { db } from "../../config/database.js";

const kitchenStationRepository = {
  async findAll(branchId) {
    if (branchId) {
      return await db.select().from(kitchenStations).where(eq(kitchenStations.branchId, branchId));
    }
    return await db.select().from(kitchenStations);
  },

  async findById(id) {
    const result = await db.select().from(kitchenStations).where(eq(kitchenStations.id, id)).limit(1);
    return result[0];
  },

  async create(stationData) {
    const result = await db.insert(kitchenStations).values(stationData).returning();
    return result[0];
  },

  async update(id, stationData) {
    const result = await db.update(kitchenStations)
      .set({ ...stationData, updatedAt: new Date() })
      .where(eq(kitchenStations.id, id))
      .returning();
    return result[0];
  },

  async delete(id) {
    const result = await db.delete(kitchenStations).where(eq(kitchenStations.id, id)).returning();
    return result[0];
  }
};

export default kitchenStationRepository;
