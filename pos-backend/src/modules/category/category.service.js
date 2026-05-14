import categoryRepository from "./category.repository.js";
import { fail } from "../../utils/errorHandler.js";

const categoryService = {
  async getAllCategories() {
    return await categoryRepository.findAll();
  },

  async searchCategories(query) {
    return await categoryRepository.search(query);
  },

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      fail("Category not found", 404);
    }
    return category;
  },

  async createCategory(categoryData) {
    const existing = await categoryRepository.findByName(categoryData.name);
    if (existing) {
      fail("Category name already exists", 409);
    }
    return await categoryRepository.create(categoryData);
  },

  async updateCategory(id, categoryData) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      fail("Category not found", 404);
    }
    return await categoryRepository.update(id, categoryData);
  },

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      fail("Category not found", 404);
    }

    const hasItems = await categoryRepository.hasItems(id);
    if (hasItems) {
      fail("Cannot delete category while it still contains dishes. Please delete or reassign all dishes first.", 400);
    }

    return await categoryRepository.delete(id);
  }
};

export default categoryService;
