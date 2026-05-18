import { z } from "zod";

/**
 * Enterprise Enums
 */
export const OrderType = z.enum(["DINE_IN", "TAKE_AWAY", "DELIVERY", "QR_SELF", "PHONE"]);

export const FulfillmentStatus = z.enum([
  "PENDING", "PREPARING", "PARTIALLY_READY", "READY", 
  "SERVED", "DISPATCHED", "DELIVERED", "PICKED_UP"
]);

export const LifecycleStatus = z.enum(["DRAFT", "ACTIVE", "COMPLETED", "VOIDED", "CANCELLED"]);

/**
 * Base Shared Schemas
 */
const orderItemModifierSchema = z.object({
  modifierId: z.string().uuid(),
  quantity: z.number().int().positive().default(1)
});

export const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().positive(),
  notes: z.string().optional(),
  modifiers: z.array(orderItemModifierSchema).optional(),
});

/**
 * Discriminator Specifics (Fix Bug 6)
 */
const dineInFields = z.object({
  tableId: z.string().uuid(),
  guestCount: z.number().int().positive().default(1),
  metadata: z.object({
    isQROrder: z.boolean().optional(),
    tableNo: z.string().optional()
  }).optional()
});

const deliveryFields = z.object({
  metadata: z.object({
    address: z.string().min(5, "Delivery address is required"),
    customerPhone: z.string().min(7, "Valid customer phone is required"),
    deliveryPartner: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  })
});

const takeawayFields = z.object({
  metadata: z.object({
    estimatedPickupTime: z.string().datetime().optional()
  }).optional()
});

/**
 * Consolidated Create Order Schema
 */
export const createOrderSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("DINE_IN"), ...dineInFields.shape }),
  z.object({ type: z.literal("QR_SELF"), ...dineInFields.shape }),
  z.object({ type: z.literal("DELIVERY"), ...deliveryFields.shape }),
  z.object({ type: z.literal("PHONE"), ...deliveryFields.shape }),
  z.object({ type: z.literal("TAKE_AWAY"), ...takeawayFields.shape })
]).and(z.object({
  customerId: z.string().uuid().optional(),
  customerDetails: z.object({
    name: z.string().optional(),
    phone: z.string().optional()
  }).optional(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional()
}));

/**
 * Status Update Schemas
 */
export const updateFulfillmentStatusSchema = z.object({
  status: FulfillmentStatus,
  notes: z.string().optional(),
  reasonCode: z.string().optional()
}).strict();

export const updateLifecycleSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "VOIDED", "CANCELLED"]),
  reasonCode: z.string().optional(),
  notes: z.string().optional(),
  // When completing an order with outstanding balance:
  // true  → record a cash payment for the remaining amount (explicit settlement)
  // false/omitted → block if not fully paid (prevents phantom revenue)
  settleWithCash: z.boolean().optional()
}).strict();

export const voidOrderSchema = z.object({
  reasonCode: z.string().min(1),
  notes: z.string().optional()
}).strict();

export const updateItemQuantitySchema = z.object({
  quantity: z.number().positive()
}).strict();

export const voidItemSchema = z.object({
  reason: z.string().min(1)
}).strict();

export const moveTableSchema = z.object({
  targetTableId: z.string().uuid()
}).strict();

export const mergeOrdersSchema = z.object({
  targetOrderId: z.string().uuid()
}).strict();

export const splitOrderSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1),
  targetTableId: z.string().uuid().optional()
}).strict();

export const applyCouponSchema = z.object({
  code: z.string().min(1).max(50)
}).strict();

export const addPaymentSchema = z.object({
  amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid decimal (e.g. \"10.50\")")
    .refine(
      (val) => parseFloat(val) > 0,
      { message: "Payment amount must be greater than zero" }
    ),
  method: z.enum(["Cash", "Card", "UPI", "Other"]),
  paymentId: z.string().optional(),
  email: z.string().email().optional(),
  contact: z.string().optional()
}).strict();

export const refundOrderSchema = z.object({
  reason: z.string().min(1).max(255)
}).strict();
