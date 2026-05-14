/**
 * ConfigInventoryService integrates the configuration engine with the main inventory system.
 */
export class ConfigInventoryService {
  /**
   * Checks availability for all selected options in a configuration.
   * @param {Array} selections - [{ optionId, quantity }]
   * @param {Array} inventoryMappings - From config_inventory_mappings
   * @returns {Promise<Object>} { isAvailable: boolean, unavailableItems: Array }
   */
  async checkAvailability(selections, inventoryMappings) {
    const unavailableItems = [];

    for (const selection of selections) {
      const mapping = inventoryMappings.find(m => m.optionId === selection.optionId);
      if (!mapping) continue;

      const requiredQty = parseFloat(mapping.quantity) * (selection.quantity || 1);
      
      // CALL EXTERNAL INVENTORY SYSTEM HERE
      // const stock = await InventoryRepo.getStock(mapping.inventoryItemId);
      const stock = 100; // Mocked for design

      if (stock < requiredQty) {
        unavailableItems.push({ 
          optionId: selection.optionId, 
          inventoryItemId: mapping.inventoryItemId,
          required: requiredQty,
          available: stock 
        });
      }
    }

    return {
      isAvailable: unavailableItems.length === 0,
      unavailableItems
    };
  }

  /**
   * Reserves or deducts stock based on configuration choices.
   * @param {string} orderId
   * @param {Array} snapshot - The configuration snapshot from the order
   */
  async processInventoryImpact(orderId, snapshot) {
    // Logic to iterate through selections and call InventoryRepo.deductStock()
    // This should be part of a database transaction.
    console.log(`Processing inventory impact for Order: ${orderId}`);
  }
}
