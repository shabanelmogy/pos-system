import shiftRepository from "./shift.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { Shift } from "./shift.schema.js";

const shiftService = {
  async openShift(
    cashierId: string,
    branchId: string,
    posPointId: string,
    openingBalance: string | number
  ): Promise<Shift> {
    const activeShift = await shiftRepository.findActiveShift(posPointId);
    if (activeShift) {
      fail("This terminal already has an active open shift.", 400);
    }

    // First create the shift to get the ID
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

    // Fetch cashier name for the slug
    const cashier = await shiftRepository.findCashierById(cashierId);
    const cashierName = cashier?.name
      ? cashier.name.split(" ")[0].toUpperCase().slice(0, 8) // First name, max 8 chars
      : cashierId.slice(0, 4).toUpperCase();

    // Create the shift first to get the UUID
    const newShift = await shiftRepository.create({
      cashierId,
      branchId,
      posPointId,
      slug: `SFT-PENDING`, // temporary
      openingBalance: openingBalance.toString(),
      status: "open",
    });

    // Now build the final meaningful slug: SFT-{NAME}-{DATE}-{SHIFT_ID_SHORT}
    const shiftShortId = newShift.id.split("-")[0].toUpperCase(); // e.g. EFAD75DA
    const slug = `SFT-${cashierName}-${date}-${shiftShortId}`;

    // Update with proper slug
    const updated = await shiftRepository.update(newShift.id, { slug });
    return updated!;
  },

  async closeShift(shiftId: string, closingBalance: number): Promise<Shift> {
    const shift = await shiftRepository.findById(shiftId);
    if (!shift || shift.status !== "open") {
      fail("Active shift not found.", 404);
    }

    const sh = shift!;
    const salesSummary = await shiftRepository.getShiftSalesSummary(shiftId);
    const expectedBalance = parseFloat(sh.openingBalance) + salesSummary.cashTotal;
    const variance = closingBalance - expectedBalance;

    const updated = await shiftRepository.update(shiftId, {
      closingBalance: closingBalance.toString(),
      expectedBalance: expectedBalance.toString(),
      totalSales: salesSummary.total.toString(),
      cashSales: salesSummary.cashTotal.toString(),
      cardSales: salesSummary.cardTotal.toString(),
      variance: variance.toString(),
      status: "closed",
      closedAt: new Date(),
    });
    return updated!;
  },

  async getActiveShift(posPointId: string): Promise<any | null> {
    return await shiftRepository.findActiveShift(posPointId);
  },

  async getAllShifts(filters: any = {}): Promise<any[]> {
    return await shiftRepository.findAll(filters);
  },

  async getReconciliation(shiftId: string): Promise<any> {
    const shift = await shiftRepository.findById(shiftId);
    if (!shift) fail("Shift not found", 404);

    const sh = shift!;
    const salesSummary = await shiftRepository.getShiftSalesSummary(shiftId);
    const voidedItems = await shiftRepository.getShiftVoidedItems(shiftId);

    return {
      shiftId: sh.id,
      slug: sh.slug,
      openedAt: sh.openedAt,
      closedAt: sh.closedAt,
      openingBalance: parseFloat(sh.openingBalance),
      closingBalance: parseFloat(sh.closingBalance || 0),
      expectedBalance: parseFloat(sh.expectedBalance || 0),
      variance: parseFloat(sh.variance || 0),
      sales: salesSummary,
      voidedItems: voidedItems.rows || voidedItems
    };
  }
};

export default shiftService;
