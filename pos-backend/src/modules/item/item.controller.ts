import { Request, Response } from "express";
import itemService from "./item.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createItemSchema, updateItemSchema } from "./item.validation.js";

const itemController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const items = categoryId 
        ? await itemService.getItemsByCategory(categoryId)
        : await itemService.getAllItems();
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      handleError(res, error as any, "itemController.getAll");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const item = await itemService.getItemById(id);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      handleError(res, error as any, "itemController.getById");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createItemSchema.parse(req.body);
      const newItem = await itemService.createItem(validatedData as any);
      res.status(201).json({ success: true, message: req.t("item.created"), data: newItem });
    } catch (error) {
      handleError(res, error as any, "itemController.create");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validatedData = updateItemSchema.parse(req.body);
      const updatedItem = await itemService.updateItem(id, validatedData as any);
      res.status(200).json({ success: true, message: req.t("item.updated"), data: updatedItem });
    } catch (error) {
      handleError(res, error as any, "itemController.update");
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await itemService.deleteItem(id);
      res.status(200).json({ success: true, message: req.t("item.deleted") });
    } catch (error) {
      handleError(res, error as any, "itemController.delete");
    }
  }
};

export default itemController;
