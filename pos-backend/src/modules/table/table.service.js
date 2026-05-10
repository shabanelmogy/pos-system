import tableRepository from "./table.repository.js";
import { fail } from "../../utils/errorHandler.js";

const tableService = {
  async getAllTables() {
    return await tableRepository.findAll();
  },

  async createTable(tableData) {
    const existingTable = await tableRepository.findByTableNo(tableData.tableNo);
    if (existingTable) {
      fail(`Table number ${tableData.tableNo} already exists`, 409);
    }
    return await tableRepository.create(tableData);
  },

  async updateTable(id, tableData) {
    const table = await tableRepository.findById(id);
    if (!table) {
      fail("Table not found", 404);
    }
    return await tableRepository.update(id, tableData);
  },

  async getTableById(id) {
    const table = await tableRepository.findById(id);
    if (!table) {
      fail("Table not found", 404);
    }
    return table;
  }
};

export default tableService;
