import persistenceManager from '.../engines/PersistenceManager.js';
import identityEngine from '.../engines/identity.js';
import catalogEngine from '.../engines/catalog/index.js';
import orderEngine from '.../engines/order/index.js';
import settlementEngine from '.../engines/settlement.js';
import inventoryEngine from '.../engines/inventory/index.js';
import auditEngine from '.../engines/audit/index.js';
import storageEngine from '.../engines/StorageEngine.js';
import authEngine from '.../engines/auth.js';

async function verifyPersistence() {
  console.log('--- STARTING PERSISTENCE VERIFICATION ---');

  // 1. Cleanup old data
  await storageEngine.delete('identity.json');
  await storageEngine.delete('inventory.json');
  await storageEngine.delete('audit.json');
  await storageEngine.delete('receipt.json');
  await storageEngine.delete('reports.json');
  await storageEngine.delete('customer.json');
  await storageEngine.delete('order.json');

  // 2. Initialize and perform actions
  console.log('\n[STEP 1] Initializing system and performing sample actions...');
  identityEngine.registerStore({
    storeName: 'Persistence Test Shop',
    address: '123 Drip Lane',
    tin: '123-456-789-000',
    branchCode: 'PN-01'
  });
  identityEngine.registerTerminal({
    terminalId: 'T01',
    ptuNumber: 'PTU-999',
    accreditationNumber: 'ACC-888'
  });
  identityEngine.verifyIdentity();
  console.log('Identity status:', identityEngine.getStatus());

  // Login a cashier
  authEngine.login('cashier1', 'password');
  console.log('Current user:', authEngine.getCurrentUser());

  // Setup catalog and inventory
  catalogEngine.addItem({
    id: 'ITEM-001',
    name: 'Durable Coffee',
    price: 150,
    trackInventory: true,
    alertThreshold: 5
  });
  inventoryEngine.initStock('ITEM-001', 20);

  // Perform a sale (triggers auto-save)
  const order = orderEngine.createOrder('DINE_IN', 'TABLE-1');
  orderEngine.addItem(order.id, 'ITEM-001', 2);
  
  console.log('Finalizing sale...');
  await settlementEngine.settleOrder(order.id, {
    method: 'CASH',
    amountPaid: 300
  });

  // CRITICAL: Wait for async auto-saves to finish before we wipe memory
  console.log('Waiting for persistence...');
  await persistenceManager.saveAll();

  const stockBefore = inventoryEngine.getStock('ITEM-001');
  const logsBefore = auditEngine.getLogs().length;
  console.log(`- Stock before reload: ${stockBefore}`);
  console.log(`- Audit logs before reload: ${logsBefore}`);

  // 3. Simulated Restart
  console.log('\n[STEP 2] Simulating system restart (clearing memory)...');
  
  // Re-instantiate or reset internal states (simulated)
  // In our engine-based architecture, we can just call bootstrap again on the existing instances
  // but to be truly sure, we'd want to check if the file exists and has content.
  
  // We'll reset memory-like fields manually for verification
  inventoryEngine.stockLevels.clear();
  auditEngine.logs = [];
  identityEngine.isInitialized = false;
  identityEngine.store = null;
  identityEngine.terminal = null;

  console.log('Memory cleared. Current stock in memory:', inventoryEngine.getStock('ITEM-001'));

  // 4. Bootstrap from disk
  console.log('\n[STEP 3] Bootstrapping from disk...');
  await persistenceManager.bootstrap();

  // 5. Verify
  console.log('\n[STEP 4] Verifying state integrity...');
  const stockAfter = inventoryEngine.getStock('ITEM-001');
  const logsAfter = auditEngine.getLogs().length;
  const isInitialized = identityEngine.getStatus().initialized;

  console.log(`- Stock after reload: ${stockAfter}`);
  console.log(`- Audit logs after reload: ${logsAfter}`);
  console.log(`- System initialized: ${isInitialized}`);

  let success = true;
  if (stockAfter !== stockBefore) {
    console.error('❌ FAILED: Stock level mismatch!');
    success = false;
  }
  if (logsAfter < logsBefore) {
    console.error('❌ FAILED: Audit log loss!');
    success = false;
  }
  if (!isInitialized) {
    console.error('❌ FAILED: Identity not preserved!');
    success = false;
  }

  if (success) {
    console.log('\n✅ PERSISTENCE VERIFICATION PASSED');
  } else {
    console.log('\n❌ PERSISTENCE VERIFICATION FAILED');
    process.exit(1);
  }
}

verifyPersistence().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
