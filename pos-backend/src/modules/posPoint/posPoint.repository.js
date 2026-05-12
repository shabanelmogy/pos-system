import { eq } from "drizzle-orm";
import { posPoints } from "./posPoint.schema.js";
import { posSettings } from "../posSettings/posSettings.schema.js";
import { db } from "../../config/database.js";

const posPointRepository = {
  async findAll(branchId) {
    let points;
    if (branchId) {
      points = await db.select().from(posPoints).where(eq(posPoints.branchId, branchId));
    } else {
      points = await db.select().from(posPoints);
    }

    // Attach settings to each point
    return await Promise.all(points.map(async (point) => {
      const settings = await db.select().from(posSettings).where(eq(posSettings.posPointId, point.id)).limit(1);
      return { ...point, settings: settings[0] || null };
    }));
  },
  async create(data) {
    const result = await db.insert(posPoints).values(data).returning();
    return result[0];
  },
  async findById(id) {
    const result = await db.select().from(posPoints).where(eq(posPoints.id, id)).limit(1);
    return result[0];
  },
  async update(id, data) {
    const result = await db.update(posPoints).set(data).where(eq(posPoints.id, id)).returning();
    return result[0];
  },
  async delete(id) {
    return await db.delete(posPoints).where(eq(posPoints.id, id));
  }
};

export default posPointRepository;
