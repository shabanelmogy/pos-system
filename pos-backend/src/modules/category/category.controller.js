import categoryService from "./category.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

const categoryController = {
  async getAll(req, res) {
    try {
      const { q } = req.query;
      const categories = q 
        ? await categoryService.searchCategories(q)
        : await categoryService.getAllCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      handleError(res, error, "categoryController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      handleError(res, error, "categoryController.getById");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const newCategory = await categoryService.createCategory(validatedData);
      res.status(201).json({ success: true, message: "Category created successfully", data: newCategory });
    } catch (error) {
      handleError(res, error, "categoryController.create");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateCategorySchema.parse(req.body);
      const updatedCategory = await categoryService.updateCategory(id, validatedData);
      res.status(200).json({ success: true, message: "Category updated successfully", data: updatedCategory });
    } catch (error) {
      handleError(res, error, "categoryController.update");
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);
      res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      handleError(res, error, "categoryController.delete");
    }
  }
};

export default categoryController;
