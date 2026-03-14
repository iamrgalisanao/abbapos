import Order from '../../models/Order.js';
import OrderLineItem from '../../models/OrderLineItem.js';
import catalogEngine from '../catalog/index.js';
import identityEngine from '../identity.js';
import authEngine from '../auth.js';
import auditEngine from '../audit/index.js';

class OrderEngine {
  constructor() {
    this.activeOrders = new Map(); // Store orders by ID
  }

  /**
   * Creates a new order.
   * @param {string} serviceType 
   * @param {string} [tableNumber]
   */
  createOrder(serviceType = 'DINE_IN', tableNumber = null) {
    const status = identityEngine.getStatus();
    const user = authEngine.getCurrentUser();

    if (!status.initialized || !user) {
      throw new Error('Order Engine Error: System not initialized or user not logged in.');
    }

    const order = new Order({
      terminalId: status.terminal.terminalId,
      cashierId: user.id,
      serviceType,
      tableNumber,
    });

    this.activeOrders.set(order.id, order);
    return order;
  }

  /**
   * Adds an item to an order.
   * @param {string} orderId 
   * @param {string} itemId 
   * @param {number} qty 
   * @param {Object} modifierSelection - { groupId: [modifierId] }
   */
  addItem(orderId, itemId, qty, modifierSelection = {}) {
    const order = this.activeOrders.get(orderId);
    if (!order) throw new Error('Order not found.');

    const catalogItem = catalogEngine.getItem(itemId);
    if (!catalogItem) throw new Error('Catalog item not found.');

    // Validate modifiers
    if (!catalogEngine.validateSelection(itemId, modifierSelection)) {
      throw new Error('Invalid modifier selection.');
    }

    // Resolve modifiers to objects
    const resolvedModifiers = [];
    for (const [groupId, modIds] of Object.entries(modifierSelection)) {
      const group = catalogItem.modifierGroups.find(g => g.id === groupId);
      modIds.forEach(mId => {
        const mod = group.modifiers.find(m => m.id === mId);
        resolvedModifiers.push({ id: mod.id, name: mod.name, price: mod.price });
      });
    }

    const lineItem = new OrderLineItem({
      itemId: catalogItem.id,
      name: catalogItem.name,
      qty,
      basePrice: catalogItem.basePrice,
      modifiers: resolvedModifiers,
    });

    order.addItem(lineItem);
    return order;
  }

  /**
   * Holds an order (e.g., table still eating).
   * @param {string} orderId 
   */
  holdOrder(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) throw new Error('Order not found.');
    
    order.setStatus('HELD');
    auditEngine.log('ORDER_HOLD', `Order ${orderId} held.`, { orderId, table: order.tableNumber });
    return order;
  }

  /**
   * Resumes a held order.
   * @param {string} orderId 
   */
  resumeOrder(orderId) {
    const order = this.activeOrders.get(orderId);
    if (!order) throw new Error('Order not found.');
    
    order.setStatus('DRAFT');
    return order;
  }

  /**
   * Splits an order by moving specific items to a new order.
   * @param {string} sourceOrderId 
   * @param {Array<number>} itemIndices - Indices of items to move.
   * @returns {Order} The new order.
   */
  splitOrder(sourceOrderId, itemIndices) {
    const sourceOrder = this.activeOrders.get(sourceOrderId);
    if (!sourceOrder) throw new Error('Source order not found.');

    const newOrder = this.createOrder(sourceOrder.serviceType, sourceOrder.tableNumber);
    
    // Sort indices descending to remove from array without index shift issues
    const sortedIndices = [...itemIndices].sort((a, b) => b - a);
    
    sortedIndices.forEach(index => {
      const [item] = sourceOrder.items.splice(index, 1);
      if (item) {
        newOrder.addItem(item);
      }
    });

    sourceOrder.calculateOverview();
    newOrder.calculateOverview();

    auditEngine.log('ORDER_SPLIT', `Order ${sourceOrderId} split into ${newOrder.id}`, { 
      sourceId: sourceOrderId, 
      newId: newOrder.id,
      itemCount: itemIndices.length 
    });

    return newOrder;
  }

  /**
   * Merges a source order into a target order.
   * @param {string} targetOrderId 
   * @param {string} sourceOrderId 
   */
  mergeOrders(targetOrderId, sourceOrderId) {
    const target = this.activeOrders.get(targetOrderId);
    const source = this.activeOrders.get(sourceOrderId);

    if (!target || !source) throw new Error('Order(s) not found.');

    source.items.forEach(item => target.addItem(item));
    
    this.activeOrders.delete(sourceOrderId);
    
    auditEngine.log('ORDER_MERGE', `Order ${sourceOrderId} merged into ${targetOrderId}`, {
      targetId: targetOrderId,
      sourceId: sourceOrderId
    });

    return target;
  }

  getOrder(orderId) {
    return this.activeOrders.get(orderId);
  }

  getAllActive() {
    return Array.from(this.activeOrders.values()).map(o => o.toJSON());
  }
}

export default new OrderEngine();
