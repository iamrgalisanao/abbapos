/**
 * @typedef {Object} OrderLineItemConfig
 * @property {string} itemId - Reference to Catalog Item ID.
 * @property {string} name - Captured item name.
 * @property {number} qty - Quantity.
 * @property {number} basePrice - Captured base price.
 * @property {Array<Object>} modifiers - Selected modifiers [{ id, name, price }].
 * @property {number} totalAmount - Calculated total for this line.
 */

class OrderLineItem {
  constructor(config) {
    this.itemId = config.itemId;
    this.name = config.name;
    this.qty = config.qty || 1;
    this.basePrice = config.basePrice;
    this.modifiers = config.modifiers || [];
    this.totalAmount = this.calculateTotal();
  }

  calculateTotal() {
    const modifierTotal = this.modifiers.reduce((sum, m) => sum + (m.price || 0), 0);
    return (this.basePrice + modifierTotal) * this.qty;
  }

  toJSON() {
    return {
      itemId: this.itemId,
      name: this.name,
      qty: this.qty,
      basePrice: this.basePrice,
      modifiers: this.modifiers,
      totalAmount: this.totalAmount,
    };
  }
}

export default OrderLineItem;
