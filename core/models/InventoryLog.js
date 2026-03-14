/**
 * @typedef {Object} InventoryLogConfig
 * @property {string} itemId - Item ID.
 * @property {number} qty - Quantity changed (positive for receive, negative for sale/loss).
 * @property {string} type - SALE, RECEIVE, ADJUST, RETURN.
 * @property {string} [reason] - Mandatory for ADJUST.
 * @property {string} [referenceId] - e.g., Order ID or Receipt Number.
 * @property {string} [managerId] - Authorization for adjustments.
 */

class InventoryLog {
  constructor(config) {
    this.id = `IL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.itemId = config.itemId;
    this.qty = config.qty;
    this.type = config.type;
    this.reason = config.reason || '';
    this.referenceId = config.referenceId || '';
    this.managerId = config.managerId || '';
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      qty: this.qty,
      type: this.type,
      reason: this.reason,
      referenceId: this.referenceId,
      managerId: this.managerId,
      timestamp: this.timestamp
    };
  }
}

export default InventoryLog;
