import { eq } from "drizzle-orm";
import { posPoints } from "./posPoint.schema.js";
import { db } from "../../config/database.js";

const posPointRepository = {
  async findAll(branchId) {
    if (branchId) {
      return await db.select().from(posPoints).where(eq(posPoints.branchId, branchId));
    }
    return await db.select().from(posPoints);
  },
  async create(data) {
    const result = await db.insert(posPoints).values(data).returning();
    return result[0];
  },
  async findById(id) {
    const result = await db.select().from(posPoints).where(eq(posPoints.id, id)).limit(1);
    return result[0];
  }
};

export default posPointRepository;
