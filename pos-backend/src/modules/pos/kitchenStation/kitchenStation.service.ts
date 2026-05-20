import kitchenStationRepository from "./kitchenStation.repository.js";
import { KitchenStation, NewKitchenStation } from "./kitchenStation.schema.js";

const kitchenStationService = {
  async getAllStations(branchId?: string): Promise<KitchenStation[]> {
    return await kitchenStationRepository.findAll(branchId);
  },

  async getStationById(id: string): Promise<KitchenStation | undefined> {
    return await kitchenStationRepository.findById(id);
  },

  async createStation(stationData: NewKitchenStation): Promise<KitchenStation> {
    return await kitchenStationRepository.create(stationData);
  },

  async updateStation(id: string, stationData: Partial<NewKitchenStation>): Promise<KitchenStation | undefined> {
    return await kitchenStationRepository.update(id, stationData);
  },

  async deleteStation(id: string): Promise<KitchenStation | undefined> {
    return await kitchenStationRepository.delete(id);
  }
};

export default kitchenStationService;
