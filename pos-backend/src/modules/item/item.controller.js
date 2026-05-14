import itemService from "./item.service.js";
import { handleError } from "../../utils/errorHandler.js";
import { createItemSchema, updateItemSchema } from "./item.validation.js";

const itemController = {
  async getAll(req, res) {
    try {
      const { categoryId, q } = req.query;
      
      let items;
      if (q) {
        items = await itemService.searchItems(q);
      } else if (categoryId) {
        items = await itemService.getItemsByCategory(categoryId);
      } else {
        items = await itemService.getAllItems();
      }
      
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      handleError(res, error, "itemController.getAll");
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await itemService.getItemById(id);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      handleError(res, error, "itemController.getById");
    }
  },

  async create(req, res) {
    try {
      const validatedData = createItemSchema.parse(req.body);
      const newItem = await itemService.createItem(validatedData);
      res.status(201).json({ success: true, message: "Item created successfully", data: newItem });
    } catch (error) {
      handleError(res, error, "itemController.create");
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = updateItemSchema.parse(req.body);
      const updatedItem = await itemService.updateItem(id, validatedData);
      res.status(200).json({ success: true, message: "Item updated successfully", data: updatedItem });
    } catch (error) {
      handleError(res, error, "itemController.update");
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await itemService.deleteItem(id);
      res.status(200).json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
      handleError(res, error, "itemController.delete");
    }
  }
};

export default itemController;
