import orderEngine from './order/index.js';
import pricingEngine from './pricing/index.js';
import taxEngine from './tax/index.js';
import receiptEngine from './receipt/index.js';
import inventoryEngine from './inventory/index.js';
import auditEngine from './audit/index.js';
import authEngine from './auth.js';
import rbacEngine from './rbac.js';

class SettlementEngine {
  /**
   * Settles an order.
   * @param {string} orderId 
   * @param {Object} paymentData - { method, amountPaid, discounts }
   */
  settleOrder(orderId, paymentData) {
    const order = orderEngine.getOrder(orderId);
    if (!order) throw new Error('Order not found.');
    if (order.status === 'PAID') throw new Error('Order already paid.');

    const { discounts = [] } = paymentData;
    const isVatExempt = discounts.some(d => d.type === 'SC' || d.type === 'PWD');

    // 1. Calculate Discounts
    let totalDiscount = 0;
    const itemsWithDiscounts = order.items.map(item => {
      const itemDiscounts = discounts.filter(d => d.itemId === item.itemId);
      const { netPrice, totalDiscount: itemDisc } = pricingEngine.calculateItemPrice(item, itemDiscounts);
      
      // If order is VAT-exempt (SC/PWD), we need to back out the VAT first for the discount calculation
      // But for simplicity in this baseline, we'll let pricingEngine handle the arithmetic
      
      totalDiscount += itemDisc;
      return { ...item, netPrice, itemDisc };
    });

    // 2. Handle SC/PWD Special Logic (Bill-level for this baseline)
    const scDiscount = discounts.find(d => d.type === 'SC' || d.type === 'PWD');
    let finalTaxBasis = order.subtotal - totalDiscount;

    if (scDiscount) {
      const { netPrice, discountAmount, totalReduction } = pricingEngine.applySCDiscount(order.subtotal);
      finalTaxBasis = netPrice;
      totalDiscount = totalReduction;
    }

    // 3. Calculate Taxes
    const taxBreakdown = taxEngine.fromVatInclusive(finalTaxBasis, { isVatExempt });
    
    // 4. Prepare Order Data for Receipt
    const orderDataForReceipt = {
      subtotal: order.subtotal,
      discount: totalDiscount,
      items: order.items.map(i => ({
        qty: i.qty,
        description: i.name,
        amount: i.totalAmount
      }))
    };

    // 5. Compose Receipt Data
    const receiptObj = receiptEngine.composeReceipt(orderDataForReceipt, taxBreakdown);
    
    // 6. Render Receipt Content
    const receiptContent = receiptEngine.renderText(receiptObj);

    // 7. Validate Payment & Build Final Receipt Object
    if (paymentData.amountPaid < taxBreakdown.total) {
      throw new Error(`Settlement Error: Insufficient payment. Required: ${taxBreakdown.total.toFixed(2)}, Provided: ${paymentData.amountPaid.toFixed(2)}`);
    }

    const finalReceipt = {
      ...receiptObj,
      content: receiptContent,
      paymentMethod: paymentData.method,
      amountPaid: paymentData.amountPaid,
      change: paymentData.amountPaid - taxBreakdown.total
    };

    // 8. Update Order Status
    order.setStatus('PAID');

    // 9. Deduct Inventory
    inventoryEngine.deductFromOrder(order);
    
    // 10. Log Audit
    auditEngine.log('ORDER_SETTLED', `Order ${orderId} settled. Receipt: ${finalReceipt.receiptNumber}`, {
      orderId,
      receiptNumber: finalReceipt.receiptNumber,
      total: taxBreakdown.total,
      discount: totalDiscount
    });

    return {
      receipt: finalReceipt,
      order: order.toJSON()
    };
  }

  /**
   * Voids a completed transaction.
   * @param {string} receiptNumber 
   * @param {string} supervisorId 
   * @param {string} reason 
   */
  voidTransaction(receiptNumber, supervisorId, reason) {
    if (!supervisorId) throw new Error('Void Error: Supervisor approval required.');
    
    // Security Fix: Verify supervisorId exists and has VOID_SALES permission
    const supervisor = authEngine.users.find(u => u.id === supervisorId);
    if (!supervisor || !rbacEngine.can(supervisor.role, 'VOID_SALES')) {
      throw new Error('Void Error: Unauthorized. Valid supervisor credentials required.');
    }
    
    // In a real system, we'd look up the transaction by receipt number.
    // For this engine, we'll assume the audit log or a data store has it.
    
    auditEngine.log('VOID_TRANSACTION', `Receipt ${receiptNumber} voided by ${supervisorId}. Reason: ${reason}`, {
      receiptNumber,
      supervisorId,
      reason
    });

    return {
      success: true,
      status: 'VOIDED',
      receiptNumber
    };
  }

  /**
   * Refunds a transaction or specific items.
   * @param {string} receiptNumber 
   * @param {string} supervisorId 
   * @param {string} reason 
   * @param {Array} items - Optional list of items to refund. Full refund if empty.
   */
  refundTransaction(receiptNumber, supervisorId, reason, items = []) {
    if (!supervisorId) throw new Error('Refund Error: Supervisor approval required.');

    // Security Fix: Verify supervisorId exists and has REFUND permission
    const supervisor = authEngine.users.find(u => u.id === supervisorId);
    if (!supervisor || !rbacEngine.can(supervisor.role, 'REFUND')) {
      throw new Error('Refund Error: Unauthorized. Valid manager/admin credentials required.');
    }

    const refundType = items.length > 0 ? 'PARTIAL_REFUND' : 'FULL_REFUND';
    
    auditEngine.log(refundType, `Receipt ${receiptNumber} refunded by ${supervisorId}. Reason: ${reason}`, {
      receiptNumber,
      supervisorId,
      reason,
      items
    });

    return {
      success: true,
      status: 'REFUNDED',
      type: refundType,
      receiptNumber
    };
  }
}

export default new SettlementEngine();
