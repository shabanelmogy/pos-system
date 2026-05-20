import itemRepository, { ItemWithKitchenStation } from "./item.repository.js";
import categoryRepository from "../category/category.repository.js";
import { fail } from "../../../utils/errorHandler.js";
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
    // Leaf-node rule: cannot add an item to a category that has subcategories
    const categoryHasChildren = await categoryRepository.hasChildren(itemData.categoryId);
    if (categoryHasChildren) {
      fail("Cannot add items to a category that has subcategories. Add items to the subcategory instead.", 400);
    }
    return await itemRepository.create(itemData);
  },

  async updateItem(id: string, itemData: Partial<NewItem>): Promise<Item | undefined> {
    const item = await itemRepository.findById(id);
    if (!item) {
      fail("item.not_found", 404);
    }

    // If changing category, check the new category has no children
    if (itemData.categoryId && itemData.categoryId !== item!.categoryId) {
      const categoryHasChildren = await categoryRepository.hasChildren(itemData.categoryId);
      if (categoryHasChildren) {
        fail("Cannot move item to a category that has subcategories.", 400);
      }
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
