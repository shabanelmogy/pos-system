import itemRepository, { ItemWithKitchenStation } from "./item.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { Item, NewItem } from "./item.schema.js";

const itemService = {
  async getAllItems(): Promise<Item[]> {
    return await itemRepository.findAll();
  },

  async getItemsByCategory(categoryId: string): Promise<Item[]> {
    return await itemRepository.findByCategoryId(categoryId);
  },

  async getItemById(id: string): Promise<ItemWithKitchenStation> {
    const item = await itemRepository.findById(id);
    if (!item) {
      fail("item.not_found", 404);
    }
    return item!;
  },

  async createItem(itemData: NewItem): Promise<Item> {
    return await itemRepository.create(itemData);
  },

  async updateItem(id: string, itemData: Partial<NewItem>): Promise<Item | undefined> {
    const item = await itemRepository.findById(id);
    if (!item) {
      fail("item.not_found", 404);
    }
    return await itemRepository.update(id, itemData);
  },

  async deleteItem(id: string): Promise<Item | undefined> {
    const item = await itemRepository.findById(id);
    if (!item) {
      fail("item.not_found", 404);
    }

    const hasRelations = await itemRepository.hasRelations(id);
    if (hasRelations) {
      fail("Cannot delete item as it is linked to existing orders. Consider making it inactive instead.", 400);
    }

    return await itemRepository.delete(id);
  }
};

export default itemService;
