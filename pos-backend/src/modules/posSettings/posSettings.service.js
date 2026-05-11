import posSettingsRepository from "./posSettings.repository.js";

const posSettingsService = {
  async getAllAndSync() {
    const list = await posSettingsRepository.findAllWithSettings();
    
    // Sync missing settings
    const syncedList = await Promise.all(list.map(async (item) => {
      if (!item.settings) {
        console.log(`[SYNC] Initializing settings for ${item.name}`);
        const defaultSettings = await posSettingsRepository.upsert(item.id, {
          autoPrintReceipt: true,
          allowDiscounts: false,
          enableTables: true,
          requireCustomerOnOrder: false,
          openOnMenu: false,
          receiptPrinterName: "Default",
          kitchenPrinterName: "Kitchen"
        });
        return { ...item, settings: defaultSettings };
      }
      return item;
    }));
    
    return syncedList;
  },

  async getSettings(posPointId) {
    let settings = await posSettingsRepository.findByPosId(posPointId);
    
    // If no settings exist for this POS, create default ones
    if (!settings) {
      settings = await posSettingsRepository.upsert(posPointId, {
        autoPrintReceipt: true,
        allowDiscounts: false,
        enableTables: true,
        requireCustomerOnOrder: false,
        openOnMenu: false,
        receiptPrinterName: "Default",
        kitchenPrinterName: "Kitchen"
      });
    }
    
    return settings;
  },

  async updateSettings(posPointId, data) {
    return await posSettingsRepository.upsert(posPointId, data);
  }
};

export default posSettingsService;
