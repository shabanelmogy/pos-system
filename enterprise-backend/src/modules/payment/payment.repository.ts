import { eq } from "drizzle-orm";
import { payments, Payment, NewPayment } from "./payment.schema.js";
import { db } from "../../config/database.js";

const paymentRepository = {
  async create(paymentData: NewPayment, externalTx: any = null): Promise<Payment> {
    const tx = externalTx || db;
    const result = await tx.insert(payments).values(paymentData).returning();
    return result[0];
  },

  async update(id: string, data: Partial<NewPayment>, externalTx: any = null): Promise<Payment | undefined> {
    const tx = externalTx || db;
    const result = await tx.update(payments).set(data).where(eq(payments.id, id)).returning();
    return result[0];
  },

  async findByOrderId(orderId: string, externalTx: any = null): Promise<Payment[]> {
    const tx = externalTx || db;
    return await tx.select().from(payments).where(eq(payments.orderId, orderId));
  },

  async findByPaymentId(paymentId: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.paymentId, paymentId)).limit(1);
    return result[0];
  }
};

export default paymentRepository;
