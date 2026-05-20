import branchRepository from "./branch.repository.js";
import { Branch, NewBranch } from "./branch.schema.js";

const branchService = {
  async getAllBranches(): Promise<Branch[]> {
    return await branchRepository.findAll();
  },

  async getBranchById(id: string): Promise<Branch> {
    const branch = await branchRepository.findById(id);
    if (!branch) throw new Error("branch.not_found");
    return branch!;
  },

  async createBranch(data: NewBranch): Promise<Branch> {
    return await branchRepository.create(data);
  },

  async updateBranch(id: string, data: Partial<NewBranch>): Promise<Branch> {
    const branch = await branchRepository.update(id, data);
    if (!branch) throw new Error("branch.not_found");
    return branch!;
  },

  async deleteBranch(id: string): Promise<any> {
    return await branchRepository.delete(id);
  }
};

export default branchService;
