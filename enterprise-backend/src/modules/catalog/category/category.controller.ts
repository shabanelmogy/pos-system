import { Request, Response } from "express";
import categoryService from "./category.service.js";
import { handleError } from "../../../utils/errorHandler.js";
import { createCategorySchema, updateCategorySchema } from "./category.validation.js";

const categoryController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      handleError(res, error as any, "categoryController.getAll");
    }
  },

  async getTree(req: Request, res: Response): Promise<void> {
    try {
      const tree = await categoryService.getCategoryTree();
      res.status(200).json({ success: true, data: tree });
    } catch (error) {
      handleError(res, error as any, "categoryController.getTree");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const category = await categoryService.getCategoryById(id);
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      handleError(res, error as any, "categoryController.getById");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const newCategory = await categoryService.createCategory(validatedData);
      res.status(201).json({ success: true, message: req.t("category.created"), data: newCategory });
    } catch (error) {
      handleError(res, error as any, "categoryController.create");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = updateCategorySchema.parse(req.body);
      const updatedCategory = await categoryService.updateCategory(id, validatedData);
      res.status(200).json({ success: true, message: req.t("category.updated"), data: updatedCategory });
    } catch (error) {
      handleError(res, error as any, "categoryController.update");
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await categoryService.deleteCategory(id);
      res.status(200).json({ success: true, message: req.t("category.deleted") });
    } catch (error) {
      handleError(res, error as any, "categoryController.delete");
    }
  }
};

export default categoryController;
