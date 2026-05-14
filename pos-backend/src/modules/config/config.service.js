import configRepository from "./config.repository.js";

const configService = {
  async getAllProfiles() {
    return await configRepository.findAdminProfiles();
  },

  async getProfileById(id) {
    const profile = await configRepository.findById(id);
    if (!profile) throw new Error("Configuration Profile not found");
    return profile;
  },

  async createProfile(data) {
    return await configRepository.create(data);
  },

  async updateProfile(id, data) {
    const profile = await configRepository.update(id, data);
    if (!profile) throw new Error("Configuration Profile not found");
    return profile;
  },

  async deleteProfile(id) {
    return await configRepository.delete(id);
  },

  // --- Assignments ---
  async getAssignments(profileId) {
    return await configRepository.getAssignments(profileId);
  },

  async createAssignment(data) {
    return await configRepository.createAssignment(data);
  },

  async deleteAssignment(id) {
    return await configRepository.deleteAssignment(id);
  }
};

export default configService;
