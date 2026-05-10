import { db } from "../src/config/database.js";
import orderService from "../src/modules/order/order.service.js";

async function test() {
  console.log("🧪 Testing Order Creation...");

  const testOrder = {
    customerDetails: {
      name: "Test User",
      phone: "1234567890",
      guests: 2
    },
    orderStatus: "In Progress",
    items: [
      {
        menuItemId: "f95e8cce-8c85-42f5-a391-3ee611c5a2c4", // A valid UUID from items table
        quantity: 2,
        unitPrice: 150,
        name: "Test Item"
      }
    ],
    tableId: null,
    paymentMethod: "Cash"
  };

  try {
    const result = await orderService.createOrder(testOrder);
    console.log("✅ Order created successfully:", result.id);
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    if (error.cause) console.error("Cause:", error.cause);
  } finally {
    process.exit();
  }
}

test();
