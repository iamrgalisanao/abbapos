import InventoryLog from '../../models/InventoryLog.js';
import InventoryAlert from '../../models/InventoryAlert.js';
import catalogEngine from '../catalog/index.js';
import auditEngine from '../audit/index.js';

class InventoryEngine {
  constructor() {
    this.stockLevels = new Map(); // itemId -> currentQty
    this.alerts = new Map();      // itemId -> InventoryAlert (active)
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

      this.checkThreshold(item.itemId, newQty);
    });
  }

  /**
   * Checks if stock level has breached the item threshold.
   * @param {string} itemId 
   * @param {number} currentQty 
   */
  checkThreshold(itemId, currentQty) {
    const item = catalogEngine.getItem(itemId);
    if (!item || !item.trackInventory) return;

    if (currentQty <= item.alertThreshold) {
      if (!this.alerts.has(itemId)) {
        const alert = new InventoryAlert({
          itemId,
          currentQty,
          threshold: item.alertThreshold
        });
        this.alerts.set(itemId, alert);

        auditEngine.log('ALERT_LOW_STOCK', `LOW STOCK ALERT: Item ${itemId} has reached ${currentQty} units (Threshold: ${item.alertThreshold})`, {
          itemId,
          currentQty,
          threshold: item.alertThreshold,
          alertId: alert.id
        });
      }
    } else {
      // If stock is replenished above threshold, resolve the alert
      if (this.alerts.has(itemId)) {
        const alert = this.alerts.get(itemId);
        alert.resolve();
        this.alerts.delete(itemId);
        
        auditEngine.log('ALERT_RESOLVED', `Low stock alert resolved for ${itemId}. New balance: ${currentQty}`, {
          itemId,
          currentQty,
          threshold: item.alertThreshold
        });
      }
    }
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

    this.checkThreshold(itemId, newQty);

    return { success: true, newQty };
  }

  /**
   * Returns current stock for an item.
   */
  getStock(itemId) {
    return this.stockLevels.get(itemId) || 0;
  }

  /**
   * Processes a received Purchase Order and reconciles stock.
   * @param {Object} po - The PurchaseOrder object.
   * @param {string} managerId - Manager authorizing the receipt.
   */
  receivePurchaseOrder(po, managerId) {
    if (po.status !== 'RECEIVED') {
      throw new Error(`Inventory Error: Cannot receive a PO with status ${po.status}. Must be RECEIVED.`);
    }

    po.items.forEach(item => {
      this.adjustStock(item.itemId, item.qty, 'RECEIVE', `PO Receipt: ${po.id}`, managerId);
    });

    auditEngine.log('INVENTORY_PO_RECONCILED', `Inventory reconciled for PO ${po.id}.`, {
      poId: po.id,
      managerId
    });
  }
}

export default new InventoryEngine();
