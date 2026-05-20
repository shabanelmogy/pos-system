import { EventEmitter } from 'events';
import logger from './logger.js';

class OrderEventEmitter extends EventEmitter {}

const orderEventEmitter = new OrderEventEmitter();

orderEventEmitter.on('error', (err) => {
  logger.error(`Error in OrderEventEmitter: ${err.message || err}`);
});

export const ORDER_EVENTS = {
  CREATED: 'order.created',
  CONFIRMED: 'order.confirmed',
  LIFECYCLE_CHANGED: 'order.lifecycle_changed',
  FULFILLMENT_CHANGED: 'order.fulfillment_changed',
  ITEM_ADDED: 'order.item_added',
  ITEM_VOIDED: 'order.item_voided',
  PAID: 'order.paid',
  REFUNDED: 'order.refunded',
  PAYMENT_CHANGED: 'order.payment_changed',
  TABLE_MOVED: 'order.table_moved'
};

export default orderEventEmitter;
