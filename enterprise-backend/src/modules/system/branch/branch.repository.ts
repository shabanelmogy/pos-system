import { eq } from "drizzle-orm";
import { branches, Branch, NewBranch } from "./branch.schema.js";
import { db } from "../../../config/database.js";

const branchRepository = {
  async findAll(): Promise<Branch[]> {
    return await db.select().from(branches);
  },
  async create(data: NewBranch): Promise<Branch> {
    const result = await db.insert(branches).values(data).returning();
    return result[0];
  },
  async findById(id: string, externalTx: any = null): Promise<Branch | undefined> {
    const tx = externalTx || db;
    const result = await tx.select().from(branches).where(eq(branches.id, id)).limit(1);
    return result[0];
  },
  async update(id: string, data: Partial<NewBranch>): Promise<Branch | undefined> {
    const result = await db.update(branches).set(data).where(eq(branches.id, id)).returning();
    return result[0];
  },
  async delete(id: string): Promise<any> {
    return await db.delete(branches).where(eq(branches.id, id));
  }
};

export default branchRepository;
