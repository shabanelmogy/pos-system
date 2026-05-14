import { eq, and, sql, desc } from "drizzle-orm";
import { shifts } from "./shift.schema.js";
import { orders } from "../order/order.schema.js";
import { branches } from "../branch/branch.schema.js";
import { posPoints } from "../posPoint/posPoint.schema.js";
import { posSettings } from "../posSettings/posSettings.schema.js";
import { users } from "../user/user.schema.js";
import { db } from "../../config/database.js";

const shiftRepository = {
  async findActiveShift(posPointId) {
    try {
      console.log(`[DEBUG] Querying active shift for POS: ${posPointId}`);
      
      const result = await db.select()
        .from(shifts)
        .where(eq(shifts.posPointId, posPointId)) // Check all shifts for this POS first
        .orderBy(sql`${shifts.openedAt} DESC`);
      
      console.log(`[DEBUG] Found ${result.length} total shifts for this POS.`);
      
      const activeShift = result.find(s => s.status === 'open' || s.status === 'Open');
      
      if (!activeShift) {
        console.log("[DEBUG] No shift with 'open' status found for POS:", posPointId);
        return null;
      }

      const shift = activeShift;
      console.log(`[DEBUG] Active shift identified: ${shift.id} Status: ${shift.status}`);

      const bId = shift.branchId || shift.branch_id;
      const pId = shift.posPointId || shift.pos_point_id;
      const cId = shift.cashierId || shift.cashier_id;

      const branchRes = bId ? await db.select().from(branches).where(eq(branches.id, bId)).limit(1) : [];
      const posRes = pId ? await db.select().from(posPoints).where(eq(posPoints.id, pId)).limit(1) : [];
      const cashierRes = cId ? await db.select().from(users).where(eq(users.id, cId)).limit(1) : [];
      
      const pointData = posRes[0] || null;
      if (pointData) {
          const setRes = await db.select().from(posSettings).where(eq(posSettings.posPointId, pointData.id)).limit(1);
          pointData.settings = setRes[0] || null;
      }

      return { 
        ...shift, 
        branch: branchRes[0] || null, 
        posPoint: pointData, 
        cashier: cashierRes[0] || null 
      };
    } catch (error) {
      console.error("[CRITICAL ERROR] findActiveShift failed:", error);
      throw error;
    }
  },

  async create(shiftData) {
    try {
      const result = await db.insert(shifts).values(shiftData).returning();
      return result[0];
    } catch (error) {
      console.error("[CRITICAL ERROR] shiftRepository.create failed:", error);
      throw error;
    }
  },

  async update(id, shiftData) {
    const result = await db.update(shifts)
      .set(shiftData)
      .where(eq(shifts.id, id))
      .returning();
    return result[0];
  },

  async findById(id) {
    const result = await db.select().from(shifts).where(eq(shifts.id, id)).limit(1);
    if (!result[0]) return null;

    const shift = result[0];
    const bId = shift.branchId || shift.branch_id;
    const pId = shift.posPointId || shift.pos_point_id;
    const cId = shift.cashierId || shift.cashier_id;

    const branchRes = bId ? await db.select().from(branches).where(eq(branches.id, bId)).limit(1) : [];
    const posRes = pId ? await db.select().from(posPoints).where(eq(posPoints.id, pId)).limit(1) : [];
    const cashierRes = cId ? await db.select().from(users).where(eq(users.id, cId)).limit(1) : [];
    
    const pointData = posRes[0] || null;
    if (pointData) {
        const setRes = await db.select().from(posSettings).where(eq(posSettings.posPointId, pointData.id)).limit(1);
        pointData.settings = setRes[0] || null;
    }

    return { 
      ...shift, 
      branch: branchRes[0] || null, 
      posPoint: pointData, 
      cashier: cashierRes[0] || null 
    };
  },

  async findCashierById(cashierId) {
    const result = await db.select().from(users).where(eq(users.id, cashierId)).limit(1);
    return result[0] || null;
  },

  async getShiftSalesSummary(shiftId) {
    const result = await db.select({
      total: sql`SUM(total)`,
      cashTotal: sql`SUM(CASE WHEN payment_method = 'Cash' THEN total ELSE 0 END)`,
      cardTotal: sql`SUM(CASE WHEN payment_method = 'Card' OR payment_method = 'Razorpay' THEN total ELSE 0 END)`
    })
    .from(orders)
    .where(and(
      eq(orders.shiftId, shiftId),
      eq(orders.orderStatus, "Completed")
    ));

    return {
      total: parseFloat(result[0]?.total || 0),
      cashTotal: parseFloat(result[0]?.cashTotal || 0),
      cardTotal: parseFloat(result[0]?.cardTotal || 0)
    };
  },

  async findAll(filters = {}) {
    const { branchId, posPointId, cashierId, startDate, endDate, status } = filters;
    
    const query = db.select({
      shift: shifts,
      branch: branches,
      posPoint: posPoints,
      cashier: users
    })
    .from(shifts)
    .leftJoin(branches, eq(shifts.branchId, branches.id))
    .leftJoin(posPoints, eq(shifts.posPointId, posPoints.id))
    .leftJoin(users, eq(shifts.cashierId, users.id));

    const conditions = [];
    if (branchId) conditions.push(eq(shifts.branchId, branchId));
    if (posPointId) conditions.push(eq(shifts.posPointId, posPointId));
    if (cashierId) conditions.push(eq(shifts.cashierId, cashierId));
    if (status) conditions.push(eq(shifts.status, status));
    
    if (startDate) conditions.push(sql`${shifts.openedAt} >= ${new Date(startDate)}`);
    if (endDate) conditions.push(sql`${shifts.openedAt} <= ${new Date(endDate)}`);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const rows = await query.orderBy(desc(shifts.openedAt));

    return rows.map(r => ({
      ...r.shift,
      branch: r.branch,
      posPoint: r.posPoint,
      cashier: r.cashier
    }));
  }
};

export default shiftRepository;
