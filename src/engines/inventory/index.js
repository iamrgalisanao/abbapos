import InventoryLog from '../../models/InventoryLog.js';
import auditEngine from '../audit/index.js';

class InventoryEngine {
  constructor() {
    this.stockLevels = new Map(); // itemId -> currentQty
    this.logs = [];
  }

  /**
   * Initializes stock for an item.
   * @param {string} itemId 
   * @param {number} qty 
   */
  initStock(itemId, qty) {
    this.stockLevels.set(itemId, qty);
  }

  /**
   * Deducts inventory based on items in a PAID order.
   * @param {Object} order - Order object with items.
   */
  deductFromOrder(order) {
    order.items.forEach(item => {
      const current = this.stockLevels.get(item.itemId) || 0;
      const newQty = current - (item.qty || 1);
      
      this.stockLevels.set(item.itemId, newQty);
      
      const log = new InventoryLog({
        itemId: item.itemId,
        qty: -(item.qty || 1),
        type: 'SALE',
        referenceId: order.id
      });
      
      this.logs.push(log);
      
      auditEngine.log('INVENTORY_DEDUCT', `Stock deducted for ${item.itemId}: ${item.qty} units. New balance: ${newQty}`, {
        itemId: item.itemId,
        qty: item.qty,
        orderId: order.id
      });
    });
  }

  /**
   * Manually adjusts stock.
   * @param {string} itemId 
   * @param {number} qty - Change in quantity.
   * @param {string} type - ADJUST, RECEIVE, etc.
   * @param {string} reason 
   * @param {string} managerId 
   */
  adjustStock(itemId, qty, type, reason, managerId) {
    if (!managerId) throw new Error('Inventory Error: Manager authorization required for adjustments.');
    
    const current = this.stockLevels.get(itemId) || 0;
    const newQty = current + qty;
    
    this.stockLevels.set(itemId, newQty);
    
    const log = new InventoryLog({
      itemId,
      qty,
      type,
      reason,
      managerId
    });
    
    this.logs.push(log);
    
    auditEngine.log('INVENTORY_ADJUST', `Stock adjusted for ${itemId} by ${managerId} (${type}). Reason: ${reason}. New balance: ${newQty}`, {
      itemId,
      qty,
      type,
      managerId
    });

    return { success: true, newQty };
  }

  /**
   * Returns current stock for an item.
   */
  getStock(itemId) {
    return this.stockLevels.get(itemId) || 0;
  }
}

export default new InventoryEngine();
