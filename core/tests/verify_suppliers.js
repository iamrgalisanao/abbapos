import supplierEngine from '.../engines/inventory/SupplierEngine.js';
import inventoryEngine from '.../engines/inventory/index.js';
import auditEngine from '.../engines/audit/index.js';

async function runSupplierVerification() {
  console.log('--- STARTING SUPPLIER & PO VERIFICATION ---');

  // 1. Setup Supplier
  console.log('\n[1] Registering Supplier...');
  const supplier = supplierEngine.registerSupplier({
    name: 'Mega Food Corp',
    contactPerson: 'Alice Vender',
    email: 'alice@megafood.com',
    phone: '555-0199',
    tin: '999-888-777'
  });
  console.log(`✅ Registered: ${supplier.name} (${supplier.id})`);

  // 2. Initialize Stock levels for verification
  inventoryEngine.initStock('S1', 10); // Burgers
  console.log(`\n[2] Initial Stock for S1: ${inventoryEngine.getStock('S1')}`);

  // 3. Create Purchase Order
  console.log('\n[3] Creating Purchase Order...');
  const po = supplierEngine.createPurchaseOrder({
    supplierId: supplier.id,
    items: [
      { itemId: 'S1', qty: 50, costPrice: 60 }
    ],
    createdBy: 'manager1'
  });
  console.log(`✅ PO Created: ${po.id} for ${po.items[0].qty} units of S1.`);

  // 4. Test PO Status Change
  console.log('\n[4] Sending & Receiving PO...');
  supplierEngine.updatePOStatus(po.id, 'SENT', 'manager1');
  supplierEngine.updatePOStatus(po.id, 'RECEIVED', 'manager1');
  console.log(`✅ PO Status updated to: ${po.status}`);

  // 5. Reconcile Inventory
  console.log('\n[5] Reconciling Inventory...');
  const initialStock = inventoryEngine.getStock('S1');
  inventoryEngine.receivePurchaseOrder(po, 'manager1');
  const finalStock = inventoryEngine.getStock('S1');
  
  console.log(`- Initial Stock: ${initialStock}`);
  console.log(`- Received Qty: 50`);
  console.log(`- Final Stock: ${finalStock}`);

  if (finalStock === initialStock + 50) {
    console.log('✅ PASS: Inventory reconciled correctly.');
  } else {
    console.error('❌ FAIL: Inventory mismatch.');
    process.exit(1);
  }

  // 6. Verify Audit Logs
  const logs = auditEngine.getLogs();
  const poLog = logs.find(l => l.action === 'INVENTORY_PO_RECONCILED' && l.metadata.poId === po.id);
  if (poLog) {
    console.log('✅ PASS: Audit log captured for PO reconciliation.');
  } else {
    console.error('❌ FAIL: Audit log missing for PO.');
    process.exit(1);
  }

  console.log('\n--- SUPPLIER & PO VERIFICATION COMPLETE: ALL PASSED ---');
}

runSupplierVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
