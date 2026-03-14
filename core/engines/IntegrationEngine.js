import orderEngine from './order/index.js';
import auditEngine from './audit/index.js';
import catalogEngine from './catalog/index.js';

/**
 * IntegrationEngine handles incoming payloads from external systems (Web, Delivery Apps).
 * It validates the payload and translates it into internal Order models.
 */
class IntegrationEngine {
  /**
   * Processes an external order payload.
   * @param {Object} payload 
   * @param {string} source - WEB, FOODPANDA, GRAB, etc.
   * @returns {import('../models/Order.js').default}
   */
  receiveOrder(payload, source) {
    console.log(`[INTEGRATION] Receiving order from ${source}: ${payload.refId}`);

    // 1. Basic Validation
    this.validatePayload(payload);

    // 2. Create Order in OrderEngine
    // Note: External orders might not have a table, but have a service type
    const serviceType = source === 'WEB' ? 'WEB_ORDER' : 'APP_DELIVERY';
    const order = orderEngine.createOrder(serviceType, null, source, payload.refId);

    // 3. Add Items
    for (const item of payload.items) {
      const catalogItem = catalogEngine.getItem(item.id);
      if (!catalogItem) {
        throw new Error(`Integration Error: Item ${item.id} not found in catalog.`);
      }

      // Modifier mapping would go here if payload structure is standardized
      orderEngine.addItem(order.id, item.id, item.qty, item.modifiers || {});
    }

    // 4. Audit Log
    auditEngine.log('EXTERNAL_ORDER_RECEIVED', `Order received from ${source} (Ref: ${payload.refId})`, {
      orderId: order.id,
      externalRef: payload.refId,
      source
    });

    return order;
  }

  /**
   * Validates the external payload structure.
   * @param {Object} payload 
   */
  validatePayload(payload) {
    if (!payload.refId) throw new Error('Integration Error: refId is required.');
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error('Integration Error: items are required.');
    }

    for (const item of payload.items) {
      if (!item.id || !item.qty) {
        throw new Error('Integration Error: item id and qty are required.');
      }
    }
  }
}

export default new IntegrationEngine();
