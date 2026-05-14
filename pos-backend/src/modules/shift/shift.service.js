import shiftRepository from "./shift.repository.js";
import { fail } from "../../utils/errorHandler.js";

const shiftService = {
  async openShift(cashierId, branchId, posPointId, openingBalance) {
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
    return await shiftRepository.update(newShift.id, { slug });
  },

  async closeShift(shiftId, closingBalance) {
    const shift = await shiftRepository.findById(shiftId);
    if (!shift || shift.status !== "open") {
      fail("Active shift not found.", 404);
    }

    const salesSummary = await shiftRepository.getShiftSalesSummary(shiftId);
    const expectedBalance = parseFloat(shift.openingBalance) + salesSummary.cashTotal;
    const variance = closingBalance - expectedBalance;

    return await shiftRepository.update(shiftId, {
      closingBalance: closingBalance.toString(),
      expectedBalance: expectedBalance.toString(),
      totalSales: salesSummary.total.toString(),
      cashSales: salesSummary.cashTotal.toString(),
      cardSales: salesSummary.cardTotal.toString(),
      variance: variance.toString(),
      status: "closed",
      closedAt: new Date(),
    });
  },

  async getActiveShift(posPointId) {
    return await shiftRepository.findActiveShift(posPointId);
  },

  async getAllShifts(filters = {}) {
    return await shiftRepository.findAll(filters);
  }
};

export default shiftService;
