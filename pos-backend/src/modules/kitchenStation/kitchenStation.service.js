import kitchenStationRepository from "./kitchenStation.repository.js";

const kitchenStationService = {
  async getAllStations(branchId) {
    return await kitchenStationRepository.findAll(branchId);
  },

  async getStationById(id) {
    return await kitchenStationRepository.findById(id);
  },

  async createStation(stationData) {
    return await kitchenStationRepository.create(stationData);
  },

  async updateStation(id, stationData) {
    return await kitchenStationRepository.update(id, stationData);
  },

  async deleteStation(id) {
    return await kitchenStationRepository.delete(id);
  }
};

export default kitchenStationService;
