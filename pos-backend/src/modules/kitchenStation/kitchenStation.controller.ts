import { Request, Response } from "express";
import kitchenStationService from "./kitchenStation.service.js";

const kitchenStationController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const branchId = req.query.branchId as string | undefined;
      const stations = await kitchenStationService.getAllStations(branchId);
      res.json(stations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const station = await kitchenStationService.getStationById(id);
      if (!station) {
        res.status(404).json({ error: "Kitchen station not found" });
        return;
      }
      res.json(station);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const station = await kitchenStationService.createStation(req.body);
      res.status(201).json(station);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const station = await kitchenStationService.updateStation(id, req.body);
      if (!station) {
        res.status(404).json({ error: "Kitchen station not found" });
        return;
      }
      res.json(station);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const station = await kitchenStationService.deleteStation(id);
      if (!station) {
        res.status(404).json({ error: "Kitchen station not found" });
        return;
      }
      res.json({ message: "Kitchen station deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default kitchenStationController;
