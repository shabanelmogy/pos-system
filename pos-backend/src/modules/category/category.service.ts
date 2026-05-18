import categoryRepository from "./category.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { Category, NewCategory } from "./category.schema.js";

const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    return await categoryRepository.findAll();
  },

  async getCategoryById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      fail("category.not_found", 404);
    }
    return category!;
  },

  async createCategory(categoryData: NewCategory): Promise<Category> {
    const existing = await categoryRepository.findByName(categoryData.name.en);
    if (existing) {
      fail("Category name already exists", 409);
    }
    return await categoryRepository.create(categoryData);
  },

  async updateCategory(id: string, categoryData: Partial<NewCategory>): Promise<Category | undefined> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      fail("category.not_found", 404);
    }
    return await categoryRepository.update(id, categoryData);
  },

  async deleteCategory(id: string): Promise<Category | undefined> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      fail("category.not_found", 404);
    }

    const hasItems = await categoryRepository.hasItems(id);
    if (hasItems) {
      fail("Cannot delete category while it still contains dishes. Please delete or reassign all dishes first.", 400);
    }

    return await categoryRepository.delete(id);
  }
};

export default categoryService;
