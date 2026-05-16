import kitchenStationService from "./kitchenStation.service.js";

const kitchenStationController = {
  async getAll(req, res) {
    try {
      const { branchId } = req.query;
      const stations = await kitchenStationService.getAllStations(branchId);
      res.json(stations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const station = await kitchenStationService.getStationById(req.params.id);
      if (!station) return res.status(404).json({ error: "Kitchen station not found" });
      res.json(station);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const station = await kitchenStationService.createStation(req.body);
      res.status(201).json(station);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const station = await kitchenStationService.updateStation(req.params.id, req.body);
      if (!station) return res.status(404).json({ error: "Kitchen station not found" });
      res.json(station);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const station = await kitchenStationService.deleteStation(req.params.id);
      if (!station) return res.status(404).json({ error: "Kitchen station not found" });
      res.json({ message: "Kitchen station deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default kitchenStationController;
