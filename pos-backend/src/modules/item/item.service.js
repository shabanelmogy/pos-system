import itemRepository from "./item.repository.js";
import { fail } from "../../utils/errorHandler.js";

const itemService = {
  async getAllItems() {
    return await itemRepository.findAll();
  },

  async getItemsByCategory(categoryId) {
    return await itemRepository.findByCategoryId(categoryId);
  },

  async getItemById(id) {
    const item = await itemRepository.findById(id);
    if (!item) {
      fail("Item not found", 404);
    }
    return item;
  },

  async createItem(itemData) {
    return await itemRepository.create(itemData);
  },

  async updateItem(id, itemData) {
    const item = await itemRepository.findById(id);
    if (!item) {
      fail("Item not found", 404);
    }
    return await itemRepository.update(id, itemData);
  },

  async deleteItem(id) {
    const item = await itemRepository.findById(id);
    if (!item) {
      fail("Item not found", 404);
    }
    return await itemRepository.delete(id);
  }
};

export default itemService;
