import Supplier from '../../models/Supplier.js';
import PurchaseOrder from '../../models/PurchaseOrder.js';
import auditEngine from '../audit/index.js';

class SupplierEngine {
  constructor() {
    this.suppliers = new Map(); // supplierId -> Supplier
    this.purchaseOrders = new Map(); // poId -> PurchaseOrder
  }

  /**
   * Registers a new supplier.
   * @param {Object} config 
   * @returns {Supplier}
   */
  registerSupplier(config) {
    const supplier = new Supplier(config);
    this.suppliers.set(supplier.id, supplier);
    
    auditEngine.log('SUPPLIER_REGISTERED', `Supplier ${supplier.name} (${supplier.id}) registered.`, {
      supplierId: supplier.id,
      name: supplier.name
    });
    
    return supplier;
  }

  /**
   * Creates a new Purchase Order.
   * @param {Object} config 
   * @returns {PurchaseOrder}
   */
  createPurchaseOrder(config) {
    if (!this.suppliers.has(config.supplierId)) {
      throw new Error(`SupplierEngine Error: Supplier ${config.supplierId} not found.`);
    }
    
    const po = new PurchaseOrder(config);
    this.purchaseOrders.set(po.id, po);
    
    auditEngine.log('PO_CREATED', `Purchase Order ${po.id} created for supplier ${po.supplierId}.`, {
      poId: po.id,
      supplierId: po.supplierId
    });
    
    return po;
  }

  /**
   * Retrieves a Purchase Order by ID.
   * @param {string} poId 
   * @returns {PurchaseOrder}
   */
  getPurchaseOrder(poId) {
    return this.purchaseOrders.get(poId);
  }

  /**
   * Finalizes a Purchase Order status.
   * Note: This does NOT trigger inventory deduction; that's handled by InventoryEngine.
   * @param {string} poId 
   * @param {string} status 
   * @param {string} userId 
   */
  updatePOStatus(poId, status, userId) {
    const po = this.getPurchaseOrder(poId);
    if (!po) throw new Error('Purchase Order not found.');

    const oldStatus = po.status;
    po.setStatus(status, userId);

    auditEngine.log('PO_STATUS_CHANGED', `PO ${poId} status changed from ${oldStatus} to ${status} by ${userId}.`, {
      poId,
      oldStatus,
      status,
      userId
    });

    return po;
  }
}

export default new SupplierEngine();
