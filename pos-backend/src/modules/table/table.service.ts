import tableRepository, { TableWithOrder } from "./table.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { Table, NewTable } from "./table.schema.js";

const tableService = {
  async getAllTables(): Promise<TableWithOrder[]> {
    return await tableRepository.findAll();
  },

  async createTable(tableData: NewTable): Promise<Table> {
    const existingTable = await tableRepository.findByTableNo(tableData.tableNo);
    if (existingTable) {
      fail(`Table number ${tableData.tableNo} already exists`, 409);
    }
    return await tableRepository.create(tableData);
  },

  async updateTable(id: string, tableData: Partial<NewTable>): Promise<Table | undefined> {
    const table = await tableRepository.findById(id);
    if (!table) {
      fail("table.not_found", 404);
    }
    return await tableRepository.update(id, tableData);
  },

  async getTableById(id: string): Promise<TableWithOrder> {
    const table = await tableRepository.findById(id);
    if (!table) {
      fail("table.not_found", 404);
    }
    return table!;
  },

  async deleteTable(id: string): Promise<Table | undefined> {
    const table = await tableRepository.findById(id);
    if (!table) {
      fail("table.not_found", 404);
    }

    const t = table!;
    if (t.currentOrderId || t.status !== "Available") {
      fail("Cannot delete table while it is occupied or has an active order. Please complete the order first.", 400);
    }

    return await tableRepository.delete(id);
  }
};

export default tableService;
