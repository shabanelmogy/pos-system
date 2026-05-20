import { eq } from "drizzle-orm";
import { kitchenStations, KitchenStation, NewKitchenStation } from "./kitchenStation.schema.js";
import { db } from "../../../config/database.js";

const kitchenStationRepository = {
  async findAll(branchId?: string): Promise<KitchenStation[]> {
    if (branchId) {
      return await db.select().from(kitchenStations).where(eq(kitchenStations.branchId, branchId));
    }
    return await db.select().from(kitchenStations);
  },

  async findById(id: string): Promise<KitchenStation | undefined> {
    const result = await db.select().from(kitchenStations).where(eq(kitchenStations.id, id)).limit(1);
    return result[0];
  },

  async create(stationData: NewKitchenStation): Promise<KitchenStation> {
    const result = await db.insert(kitchenStations).values(stationData).returning();
    return result[0];
  },

  async update(id: string, stationData: Partial<NewKitchenStation>): Promise<KitchenStation | undefined> {
    const result = await db.update(kitchenStations)
      .set({ ...stationData, updatedAt: new Date() })
      .where(eq(kitchenStations.id, id))
      .returning();
    return result[0];
  },

  async delete(id: string): Promise<KitchenStation | undefined> {
    const result = await db.delete(kitchenStations).where(eq(kitchenStations.id, id)).returning();
    return result[0];
  }
};

export default kitchenStationRepository;
