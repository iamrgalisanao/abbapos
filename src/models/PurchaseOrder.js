/**
 * @typedef {Object} PurchaseOrderItem
 * @property {string} itemId - Reference to Catalog Item ID.
 * @property {number} qty - Quantity ordered.
 * @property {number} costPrice - Unit cost at time of order.
 */

/**
 * @typedef {Object} PurchaseOrderConfig
 * @property {string} id - Unique PO number.
 * @property {string} supplierId - Reference to Supplier ID.
 * @property {Array<PurchaseOrderItem>} items - List of items in the PO.
 * @property {string} status - DRAFT|SENT|RECEIVED|CANCELLED.
 * @property {string} createdBy - User ID of the creator.
 */

class PurchaseOrder {
  constructor(config) {
    this.id = config.id || `PO-${Date.now()}`;
    this.supplierId = config.supplierId;
    this.items = config.items || [];
    this.status = config.status || 'DRAFT';
    this.createdBy = config.createdBy;
    this.createdAt = config.createdAt || new Date().toISOString();
    this.receivedAt = config.receivedAt || null;
    this.receivedBy = config.receivedBy || null;
  }

  setStatus(status, userId) {
    this.status = status;
    if (status === 'RECEIVED') {
      this.receivedAt = new Date().toISOString();
      this.receivedBy = userId;
    }
  }

  toJSON() {
    return { ...this };
  }
}

export default PurchaseOrder;
