/**
 * @typedef {Object} InventoryAlertConfig
 * @property {string} itemId - Item ID that triggered the alert.
 * @property {number} currentQty - Quantity at time of alert.
 * @property {number} threshold - The threshold that was breached.
 * @property {string} status - PENDING, ACKNOWLEDGED, RESOLVED.
 */

class InventoryAlert {
  constructor(config) {
    this.id = `IA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.itemId = config.itemId;
    this.currentQty = config.currentQty;
    this.threshold = config.threshold;
    this.status = config.status || 'PENDING';
    this.timestamp = new Date().toISOString();
  }

  acknowledge() {
    this.status = 'ACKNOWLEDGED';
  }

  resolve() {
    this.status = 'RESOLVED';
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      currentQty: this.currentQty,
      threshold: this.threshold,
      status: this.status,
      timestamp: this.timestamp
    };
  }
}

export default InventoryAlert;
