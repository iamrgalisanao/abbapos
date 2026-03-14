import orderEngine from './order/index.js';
import taxEngine from './tax/index.js';
import receiptEngine from './receipt/index.js';
import auditEngine from './audit/index.js';

class SettlementEngine {
  /**
   * Settles an order.
   * @param {string} orderId 
   * @param {Object} paymentData - { method, amountPaid }
   */
  settleOrder(orderId, paymentData) {
    const order = orderEngine.getOrder(orderId);
    if (!order) throw new Error('Order not found.');
    if (order.status === 'PAID') throw new Error('Order already paid.');

    const subtotal = order.subtotal;

    // 1. Calculate Taxes (Assuming subtotal is VAT-inclusive)
    const taxBreakdown = taxEngine.fromVatInclusive(subtotal);
    
    // 2. Prepare Order Data for Receipt (Map keys to match ReceiptEngine expectations)
    const orderDataForReceipt = {
      subtotal: subtotal,
      items: order.items.map(i => ({
        qty: i.qty,
        description: i.name, // ReceiptEngine expects 'description'
        amount: i.totalAmount // ReceiptEngine expects 'amount'
      }))
    };

    // 3. Compose Receipt Data
    const receiptObj = receiptEngine.composeReceipt(orderDataForReceipt, taxBreakdown);
    
    // 4. Render Receipt Content
    const receiptContent = receiptEngine.renderText(receiptObj);

    // 5. Build Final Receipt Object
    const finalReceipt = {
      ...receiptObj,
      content: receiptContent,
      paymentMethod: paymentData.method,
      amountPaid: paymentData.amountPaid,
      change: paymentData.amountPaid - taxBreakdown.total
    };

    // 6. Update Order Status
    order.setStatus('PAID');
    
    // 7. Log Audit
    auditEngine.log('ORDER_SETTLED', `Order ${orderId} settled. Receipt: ${finalReceipt.receiptNumber}`, {
      orderId,
      receiptNumber: finalReceipt.receiptNumber,
      total: taxBreakdown.total
    });

    return {
      receipt: finalReceipt,
      order: order.toJSON()
    };
  }
}

export default new SettlementEngine();
