import categoryRepository, { CategoryTreeNode } from "./category.repository.js";
import { fail } from "../../utils/errorHandler.js";
import { Category, NewCategory } from "./category.schema.js";

const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    return await categoryRepository.findAll();
  },

  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    return await categoryRepository.findTree();
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

    // Leaf-node rule: if assigning a parent, check parent has no items
    if (categoryData.parentId) {
      const parentHasItems = await categoryRepository.hasItems(categoryData.parentId);
      if (parentHasItems) {
        fail("Cannot add a subcategory to a category that already has items. Remove the items first.", 400);
      }
    }

    return await categoryRepository.create(categoryData);
  },

  async updateCategory(id: string, categoryData: Partial<NewCategory>): Promise<Category | undefined> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      fail("category.not_found", 404);
    }

    // If changing parentId, re-run the leaf-node check
    if (categoryData.parentId) {
      // Prevent circular reference
      if (categoryData.parentId === id) {
        fail("A category cannot be its own parent.", 400);
      }
      const parentHasItems = await categoryRepository.hasItems(categoryData.parentId);
      if (parentHasItems) {
        fail("Cannot move this category under a parent that already has items.", 400);
      }
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

    const hasChildren = await categoryRepository.hasChildren(id);
    if (hasChildren) {
      fail("Cannot delete category while it still has subcategories. Please delete the subcategories first.", 400);
    }

    return await categoryRepository.delete(id);
  }
};

export default categoryService;
