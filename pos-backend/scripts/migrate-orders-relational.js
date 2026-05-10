import { db } from "../src/config/database.js";
import { orders } from "../src/modules/order/order.schema.js";
import { orderItems } from "../src/modules/order/orderItem.schema.js";
import { eq } from "drizzle-orm";

const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

async function migrate() {
  console.log("🚀 Starting Order Data Migration...");

  try {
    const allOrders = await db.select().from(orders);
    console.log(`Found ${allOrders.length} orders to process.`);

    for (const order of allOrders) {
      // Check if already migrated
      if (parseFloat(order.subtotal) > 0 || !order.items || order.items.length === 0) {
        console.log(`Skipping order ${order.id} (already migrated or empty).`);
        continue;
      }

      console.log(`Migrating order ${order.id}...`);

      const legacyItems = order.items || [];
      const legacyBills = order.bills || { total: 0, tax: 0, totalWithTax: 0 };

      // 1. Prepare relational items
      const newItems = legacyItems.map(item => {
        const unitPrice = parseFloat(item.price || 0);
        const quantity = parseInt(item.quantity || 1);
        const totalPrice = unitPrice * quantity;

        // Ensure menuItemId is a valid UUID or null
        const menuItemId = isUUID(item.id) ? item.id : null;

        return {
          orderId: order.id,
          menuItemId: menuItemId,
          quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          itemSnapshot: {
            name: item.name,
            price: unitPrice.toFixed(2),
            legacyId: item.id // Keep legacy ID in snapshot for reference
          }
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
            tax: parseFloat(legacyBills.tax || 0).toFixed(2),
            total: parseFloat(legacyBills.totalWithTax || 0).toFixed(2),
          })
          .where(eq(orders.id, order.id));
      });

      console.log(`✅ Successfully migrated order ${order.id}`);
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    process.exit();
  }
}

migrate();
