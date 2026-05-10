import orderRepository from "./order.repository.js";
import customerService from "../customer/customer.service.js";
import customerRepository from "../customer/customer.repository.js";
import billService from "../bill/bill.service.js";
import { fail } from "../../utils/errorHandler.js";

const formatOrder = (order) => {
  if (!order) return null;
  return {
    ...order,
    items: (order.orderItems || []).map(oi => ({
      ...oi,
      name: oi.itemSnapshot?.name || "Unknown Item",
      price: oi.unitPrice,
    })),
    bills: {
      total: order.subtotal,
      tax: order.tax,
      totalWithTax: order.total
    }
  };
};

const orderService = {
  async getAllOrders() {
    const orders = await orderRepository.findAll();
    return orders.map(formatOrder);
  },

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      fail("Order not found", 404);
    }
    return formatOrder(order);
  },

  async createOrder(data) {
    const { items, customerDetails, ...orderHeader } = data;

    // 1. Handle Customer
    let customerId = orderHeader.customerId;
    if (!customerId && customerDetails?.phone) {
      const customer = await customerService.findOrCreateByPhone(
        customerDetails.name,
        customerDetails.phone
      );
      customerId = customer.id;
    }

    // 2. Prepare Order Items
    let subtotal = 0;
    const orderItemsData = items.map(item => {
      const unitPrice = parseFloat(item.unitPrice);
      const quantity = parseInt(item.quantity);
      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      return {
        menuItemId: item.menuItemId,
        quantity,
        unitPrice: unitPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        notes: item.notes,
        itemSnapshot: {
          name: item.name,
          price: unitPrice.toFixed(2)
        }
      };
    });

    const tax = subtotal * 0.05; 
    const total = subtotal + tax;

    const finalOrderData = {
      ...orderHeader,
      customerId,
      customerSnapshot: customerDetails,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };

    // 3. Create Order
    const newOrder = await orderRepository.create(finalOrderData, orderItemsData);

    // 4. Auto-generate Bill
    try {
      await billService.createBill({
        orderId: newOrder.id,
        totalAmount: subtotal,
        taxAmount: tax,
        status: "Unpaid"
      });
    } catch (billError) {
      console.error("Failed to auto-generate bill:", billError);
      // We don't fail the order if the bill fails, but we should log it
    }
    
    return formatOrder(newOrder);
  },

  async updateOrderStatus(id, status) {
    const order = await orderRepository.findById(id);
    if (!order) {
      fail("Order not found", 404);
    }

    const updatedOrder = await orderRepository.update(id, { orderStatus: status });

    if (status === "Completed" && order.customerId) {
      await customerRepository.updateStats(order.customerId, order.total);
    }

    return updatedOrder;
  }
};

export default orderService;
