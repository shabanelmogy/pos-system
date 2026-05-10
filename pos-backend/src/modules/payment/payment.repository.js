import { eq } from "drizzle-orm";
import { payments } from "./payment.schema.js";
import { db } from "../../config/database.js";

const paymentRepository = {
  async create(paymentData) {
    const result = await db.insert(payments).values(paymentData).returning();
    return result[0];
  },

  async findByPaymentId(paymentId) {
    const result = await db.select().from(payments).where(eq(payments.paymentId, paymentId)).limit(1);
    return result[0];
  }
};

export default paymentRepository;
