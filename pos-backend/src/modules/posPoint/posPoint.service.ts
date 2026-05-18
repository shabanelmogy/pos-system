import posPointRepository from "./posPoint.repository.js";
import { PosPoint, NewPosPoint } from "./posPoint.schema.js";

const posPointService = {
  async getAllPOSPoints(branchId?: string): Promise<any[]> {
    return await posPointRepository.findAll(branchId);
  },

  async getPOSPointById(id: string): Promise<PosPoint> {
    const point = await posPointRepository.findById(id);
    if (!point) throw new Error("POS Point not found");
    return point!;
  },

  async createPOSPoint(data: NewPosPoint): Promise<PosPoint> {
    return await posPointRepository.create(data);
  },

  async updatePOSPoint(id: string, data: Partial<NewPosPoint>): Promise<PosPoint> {
    const point = await posPointRepository.update(id, data);
    if (!point) throw new Error("POS Point not found");
    return point!;
  },

  async deletePOSPoint(id: string): Promise<any> {
    return await posPointRepository.delete(id);
  }
};

export default posPointService;
