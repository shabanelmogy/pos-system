import { db } from "../src/config/database.js";
import { orders } from "../src/modules/pos/order/order.schema.js";
import { orderItems } from "../src/modules/pos/order/orderItem.schema.js";
import { eq } from "drizzle-orm";

const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

async function migrate(): Promise<void> {
  console.log("🚀 Starting Order Data Migration...");

  try {
    const allOrders = await db.select().from(orders);
    console.log(`Found ${allOrders.length} orders to process.`);

    for (const order of allOrders) {
      // Check if already migrated
      const itemsList = (order as any).items as any[] | null;
      if (parseFloat((order.subtotal as string) || "0") > 0 || !itemsList || itemsList.length === 0) {
        console.log(`Skipping order ${order.id} (already migrated or empty).`);
        continue;
      }

      console.log(`Migrating order ${order.id}...`);

      const legacyItems = itemsList || [];
      const legacyBills = ((order as any).bills as any) || { total: 0, tax: 0, totalWithTax: 0 };

      // 1. Prepare relational items
      const newItems = legacyItems.map((item: any) => {
        const unitPrice = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        const totalPrice = unitPrice * quantity;

        // Ensure menuItemId is a valid UUID or null
        const menuItemId = isUUID(item.id) ? item.id : null;

        return {
          orderId: order.id,
          menuItemId: menuItemId,
          quantity: quantity.toString(),
          unitPrice: unitPrice.toFixed(2),
          subtotal: totalPrice.toFixed(2),
          nameSnapshot: item.name || "Unknown"
        };
      });

      // 2. Perform Migration in Transaction
      await db.transaction(async (tx) => {
        if (newItems.length > 0) {
          await tx.insert(orderItems).values(newItems);
        }

        await tx.update(orders)
          .set({
            subtotal: parseFloat(legacyBills.total || 0).toFixed(2),
            taxTotal: parseFloat(legacyBills.tax || 0).toFixed(2),
            grandTotal: parseFloat(legacyBills.totalWithTax || 0).toFixed(2),
          })
          .where(eq(orders.id, order.id));
      });

      console.log(`✅ Successfully migrated order ${order.id}`);
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error);
  } finally {
    process.exit();
  }
}

migrate();
