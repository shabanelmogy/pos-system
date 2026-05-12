import posPointRepository from "./posPoint.repository.js";

const posPointService = {
  async getAllPOSPoints(branchId) {
    return await posPointRepository.findAll(branchId);
  },

  async getPOSPointById(id) {
    const point = await posPointRepository.findById(id);
    if (!point) throw new Error("POS Point not found");
    return point;
  },

  async createPOSPoint(data) {
    return await posPointRepository.create(data);
  },

  async updatePOSPoint(id, data) {
    const point = await posPointRepository.update(id, data);
    if (!point) throw new Error("POS Point not found");
    return point;
  },

  async deletePOSPoint(id) {
    return await posPointRepository.delete(id);
  }
};

export default posPointService;
