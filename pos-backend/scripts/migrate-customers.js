import { db } from "../src/config/database.js";
import { orders } from "../src/modules/order/order.schema.js";
import { customers } from "../src/modules/customer/customer.schema.js";
import { eq, isNotNull } from "drizzle-orm";

async function migrate() {
  console.log("🚀 Migrating Customer profiles from existing orders...");

  try {
    // 1. Get all orders that have a customer snapshot but no customerId
    const allOrders = await db.select().from(orders).where(isNotNull(orders.customerSnapshot));
    console.log(`Analyzing ${allOrders.length} orders for customer data.`);

    const customerMap = new Map(); // phone -> { name, spent, count, lastDate, id }

    for (const order of allOrders) {
      const snap = order.customerSnapshot;
      if (!snap || !snap.phone) continue;

      const phone = snap.phone;
      const amount = parseFloat(order.total || 0);
      const orderDate = order.createdAt;

      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          name: snap.name || "Unknown",
          spent: 0,
          count: 0,
          lastDate: orderDate,
          orderIds: []
        });
      }

      const entry = customerMap.get(phone);
      entry.spent += amount;
      entry.count += 1;
      if (orderDate > entry.lastDate) entry.lastDate = orderDate;
      entry.orderIds.push(order.id);
    }

    console.log(`Found ${customerMap.size} unique customers to create.`);

    for (const [phone, data] of customerMap.entries()) {
      console.log(`Processing customer: ${data.name} (${phone})`);

      // Create or Find Customer
      let customer;
      const existing = await db.select().from(customers).where(eq(customers.phone, phone));
      
      if (existing.length === 0) {
        [customer] = await db.insert(customers).values({
          name: data.name,
          phone: phone,
          totalOrders: data.count,
          totalSpent: data.spent.toFixed(2),
          lastOrderAt: data.lastDate,
        }).returning();
        console.log(`Created new profile for ${data.name}`);
      } else {
        customer = existing[0];
        console.log(`Linked to existing profile for ${data.name}`);
      }

      // Link orders to this customer
      for (const orderId of data.orderIds) {
        await db.update(orders)
          .set({ customerId: customer.id })
          .where(eq(orders.id, orderId));
      }
    }

    console.log("🎉 Customer migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    process.exit();
  }
}

migrate();
