import catalogEngine from '.../engines/catalog/index.js';
import identityEngine from '.../engines/identity.js';
import authEngine from '.../engines/auth.js';
import orderEngine from '.../engines/order/index.js';
import settlementEngine from '.../engines/settlement.js';
import inventoryEngine from '.../engines/inventory/index.js';

console.log('--- Low-Stock Alerts Verification Test ---');

// 1. Initial Setup
identityEngine.registerStore({ storeName: 'Alert Test Store', tin: '555-444-333', branchCode: '001', address: '789 Alert Way' });
identityEngine.registerTerminal({ terminalId: 'TERM-01', ptuNumber: 'PTU-123', accreditationNumber: 'ACC-123' });
identityEngine.verifyIdentity();
authEngine.login('cashier1', 'password');
catalogEngine.loadCatalog({
  items: [
    { id: 'item-alert', name: 'Critical Item', basePrice: 100, trackInventory: true, alertThreshold: 5 },
  ]
});

// 2. Initialize Stock
console.log('\nInitializing stock for Critical Item to 10 units (Threshold: 5)...');
inventoryEngine.initStock('item-alert', 10);

// Test 1: Trigger Alert on Sale
console.log('\nTest 1: Selling 6 units (Stock should drop to 4, triggering alert)...');
const order1 = orderEngine.createOrder('TAKE_OUT', 'Walk-in');
orderEngine.addItem(order1.id, 'item-alert', 6);
settlementEngine.settleOrder(order1.id, { method: 'CASH', amountPaid: 1000 });

const remaining = inventoryEngine.getStock('item-alert');
console.log(`Remaining stock: ${remaining}`);

if (inventoryEngine.alerts.has('item-alert')) {
    console.log('SUCCESS: Low stock alert triggered correctly.');
} else {
    console.error('FAILURE: Alert was not triggered.');
    process.exit(1);
}

// Test 2: Resolve Alert on Refill
console.log('\nTest 2: Refilling stock by 10 units (Stock should rise to 14, resolving alert)...');
inventoryEngine.adjustStock('item-alert', 10, 'RECEIVE', 'Stock delivery', 'admin-01');

if (!inventoryEngine.alerts.has('item-alert')) {
    console.log('SUCCESS: Low stock alert resolved correctly.');
} else {
    console.error('FAILURE: Alert was not resolved.');
    process.exit(1);
}

console.log('\n--- Low-Stock Alerts Verification Complete ---');
