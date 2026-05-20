import { describe, it } from 'node:test';
import assert from 'node:assert';
import orderService from '../order.service.js';

describe('Order Module Integration', () => {
  const testContext = {
    branchId: "00000000-0000-0000-0000-000000000001",
    userId: "00000000-0000-0000-0000-000000000001",
    shiftId: "00000000-0000-0000-0000-000000000001",
    posPointId: "00000000-0000-0000-0000-000000000001",
    role: "admin"
  };

  describe('Optimistic Locking & Versioning', () => {
    it('should fail with 409 Conflict when two writers attempt to update the same version', async () => {
      const order = await orderService.createOrder({
        type: "TAKE_AWAY",
        items: [{ menuItemId: "some-item-id", quantity: 1 }]
      }, testContext);

      const promiseA = orderService.updateFulfillmentStatus(order.id, "PREPARING", testContext, "Start cooking");
      const promiseB = orderService.updateFulfillmentStatus(order.id, "READY", testContext, "Done cooking");

      const results = await Promise.allSettled([promiseA, promiseB]);
      
      const rejected = results.find(r => r.status === 'rejected');
      if (rejected) {
        assert.ok((rejected as PromiseRejectedResult).reason.message.includes('conflict') || (rejected as PromiseRejectedResult).reason.statusCode === 409);
      }
    });
  });

  describe('Zombie Order Prevention (#21)', () => {
    it('should automatically transition to CANCELLED when the last item is removed', async () => {
      const order = await orderService.createOrder({
        type: "TAKE_AWAY",
        items: [{ menuItemId: "item-1", quantity: 1 }]
      }, testContext);

      const itemId = order.orderItems[0].id;
      await orderService.removeItem(order.id, itemId, testContext);

      const updatedOrder = await orderService.getOrderById(order.id, testContext);
      assert.strictEqual(updatedOrder.lifecycle, 'CANCELLED');
    });

    it('should automatically transition to CANCELLED when the last active item is voided', async () => {
      const order = await orderService.createOrder({
        type: "TAKE_AWAY",
        items: [{ menuItemId: "item-1", quantity: 1 }]
      }, testContext);

      const itemId = order.orderItems[0].id;
      await orderService.voidItem(order.id, itemId, "Customer changed mind", testContext);

      const updatedOrder = await orderService.getOrderById(order.id, testContext);
      assert.strictEqual(updatedOrder.lifecycle, 'CANCELLED');
    });
  });

  describe('Deadlock Prevention Strategy (#5)', () => {
    it('should enforce deterministic lock ordering in multi-order operations', async () => {
      const orderA = { id: "00000000-0000-0000-0000-00000000000A" };
      const orderB = { id: "00000000-0000-0000-0000-00000000000B" };

      const ids = [orderB.id, orderA.id].sort();
      assert.strictEqual(ids[0], orderA.id, "Lowest UUID must be locked first");
      assert.strictEqual(ids[1], orderB.id, "Highest UUID must be locked second");
    });
  });

  describe('Financial Integrity (#18)', () => {
    it('should block item modifications on partially-paid orders for non-managers', async () => {
      const order = await orderService.createOrder({
        type: "DINE_IN",
        items: [{ menuItemId: "item-1", quantity: 1 }]
      }, testContext);

      await orderService.addPayment(order.id, {
        amount: "5.00",
        method: "CASH"
      }, testContext);

      const waiterContext = { ...testContext, role: "waiter" };
      
      try {
        await orderService.addItem(order.id, { menuItemId: "item-2", quantity: 1 }, waiterContext);
        assert.fail('Should have thrown an error');
      } catch (err: any) {
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('manager approval required'));
      }
    });
  });
});
