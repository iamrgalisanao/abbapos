/**
 * @typedef {Object} OrderConfig
 * @property {string} id - Unique Order ID.
 * @property {string} terminalId - Origin terminal.
 * @property {string} cashierId - Origin cashier.
 * @property {string} serviceType - DINE_IN, TAKEOUT, DELIVERY, WEB_ORDER, APP_DELIVERY.
 * @property {string} [tableNumber] - Table associated (for DINE_IN).
 * @property {string} [externalSource] - WEB, FOODPANDA, GRAB, etc.
 * @property {string} [externalReferenceId] - Reference ID from external system.
 * @property {string} status - DRAFT, HELD, PAID, VOIDED, REFUNDED.
 * @property {Array<import('./OrderLineItem.js').default>} items - List of items.
 */

class Order {
  constructor(config) {
    this.id = config.id || `ORD-${Date.now()}`;
    this.terminalId = config.terminalId;
    this.cashierId = config.cashierId;
    this.serviceType = config.serviceType || 'DINE_IN';
    this.tableNumber = config.tableNumber || null;
    this.externalSource = config.externalSource || null;
    this.externalReferenceId = config.externalReferenceId || null;
    this.status = config.status || 'DRAFT';
    this.items = config.items || [];
    this.createdAt = config.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    
    this.subtotal = 0;
    this.calculateOverview();
  }

  calculateOverview() {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalAmount, 0);
  }

  addItem(lineItem) {
    this.items.push(lineItem);
    this.calculateOverview();
    this.updatedAt = new Date().toISOString();
  }

  setStatus(status) {
    this.status = status;
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      terminalId: this.terminalId,
      cashierId: this.cashierId,
      serviceType: this.serviceType,
      tableNumber: this.tableNumber,
      externalSource: this.externalSource,
      externalReferenceId: this.externalReferenceId,
      status: this.status,
      items: this.items.map(item => item.toJSON()),
      subtotal: this.subtotal,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Order;
