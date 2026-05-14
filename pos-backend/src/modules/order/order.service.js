import orderRepository from "./order.repository.js";
import customerService from "../customer/customer.service.js";
import customerRepository from "../customer/customer.repository.js";
import billRepository from "../bill/bill.repository.js";
import shiftRepository from "../shift/shift.repository.js";
import userRepository from "../user/user.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { db } from "../../config/database.js";

const formatOrder = (order) => {
  if (!order) return null;
  return {
    ...order,
    items: (order.orderItems || []).map(oi => ({
      ...oi,
      name: oi.itemSnapshot?.name || "Unknown Item",
      price: oi.unitPrice,
    })),
    branch: order.branch,
    posPoint: order.posPoint,
    shift: order.shift,
    orderDate: order.createdAt || order.created_at || new Date(),
    customerDetails: order.customerSnapshot || order.customer_snapshot,
    bills: {
      total: order.subtotal,
      tax: order.tax,
      totalWithTax: order.total
    }
  };
};

const orderService = {
  async getAllOrders(filters = {}) {
    const orders = await orderRepository.findAll(filters);
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
    const { items, customerDetails, branchId, posPointId, shiftId, cashierId, ...orderHeader } = data;

    // 1. Role-Based Validation
    const user = await userRepository.findById(cashierId);
    const isAdmin = user?.role?.toLowerCase() === "admin";

    // Shift check is mandatory for Cashiers/Waiters, optional for Admins
    if (!isAdmin) {
      if (!shiftId) {
        fail("An active shift is required to create an order.", 400);
      }
      const activeShift = await shiftRepository.findById(shiftId);
      if (!activeShift || activeShift.status !== "open") {
        fail("The current shift is not open or does not exist.", 400);
      }
    }

    // 2. Start Transaction
    return await db.transaction(async (tx) => {
      // Handle Customer — use Guest fallback when customer is not required / not provided
      const resolvedName  = customerDetails?.name?.trim()  || "Guest";
      const resolvedPhone = customerDetails?.phone?.trim() || "0000000000";

      let currentCustomerId = orderHeader.customerId;
      if (!currentCustomerId) {
        const customer = await customerService.findOrCreateByPhone(resolvedName, resolvedPhone);
        currentCustomerId = customer.id;
      }

      // Prepare Order Items & Totals
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

      // Build a guaranteed snapshot (never null) for display in orders/invoices
      const resolvedSnapshot = {
        name:   resolvedName,
        phone:  resolvedPhone,
        guests: customerDetails?.guests || 1,
      };

      const finalOrderData = {
        ...orderHeader,
        branchId: branchId || null,
        posPointId: posPointId || null,
        shiftId: shiftId || null,
        cashierId,
        customerId: currentCustomerId,
        customerSnapshot: resolvedSnapshot,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      };

      // 3. Create Order & Items
      const newOrder = await orderRepository.create(finalOrderData, orderItemsData, tx);

      // 4. Generate Bill
      const totalAmountNum = parseFloat(subtotal.toFixed(2));
      const taxAmountNum = parseFloat(tax.toFixed(2));
      const payableAmount = (totalAmountNum + taxAmountNum).toFixed(2);

      await billRepository.create({
        orderId: newOrder.id,
        billNo: `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        totalAmount: subtotal.toFixed(2),
        taxAmount: tax.toFixed(2),
        payableAmount: payableAmount,
        status: "Unpaid"
      }, tx);
      
      return formatOrder(newOrder);
    });
  },

  async updateOrderStatus(id, status) {
    return await db.transaction(async (tx) => {
      const order = await orderRepository.findById(id);
      if (!order) {
        fail("Order not found", 404);
      }

      const updatedOrder = await orderRepository.update(id, { orderStatus: status }, tx);

      if (status === "Completed" && order.customerId) {
        await customerRepository.updateStats(order.customerId, order.total, tx);
      }

      return updatedOrder;
    });
  }
};

export default orderService;
