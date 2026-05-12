import branchRepository from "./branch.repository.js";

const branchService = {
  async getAllBranches() {
    return await branchRepository.findAll();
  },

  async getBranchById(id) {
    const branch = await branchRepository.findById(id);
    if (!branch) throw new Error("Branch not found");
    return branch;
  },

  async createBranch(data) {
    return await branchRepository.create(data);
  },

  async updateBranch(id, data) {
    const branch = await branchRepository.update(id, data);
    if (!branch) throw new Error("Branch not found");
    return branch;
  },

  async deleteBranch(id) {
    return await branchRepository.delete(id);
  }
};

export default branchService;
