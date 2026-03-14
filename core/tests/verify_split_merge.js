import catalogEngine from '../engines/catalog/index.js';
import identityEngine from '../engines/identity.js';
import authEngine from '../engines/auth.js';
import orderEngine from '../engines/order/index.js';

console.log('--- Order Split & Merge Verification Test ---');

// 1. Initial Setup
identityEngine.registerStore({ storeName: 'Split/Merge Test Store', tin: '000-111-222', branchCode: '001' });
identityEngine.registerTerminal({ terminalId: 'TERM-01', ptuNumber: 'PTU-123' });
identityEngine.verifyIdentity();
authEngine.login('cashier1', 'password');
catalogEngine.loadCatalog({
  items: [
    { id: 'i1', name: 'Item 1', basePrice: 100 },
    { id: 'i2', name: 'Item 2', basePrice: 200 },
  ]
});

// Test 1: Splitting an Order
console.log('Test 1: Splitting Order...');
const order1 = orderEngine.createOrder('DINE_IN', 'Table 1');
orderEngine.addItem(order1.id, 'i1', 1);
orderEngine.addItem(order1.id, 'i2', 1);

console.log(`Original Subtotal: ${order1.subtotal}`); // Should be 300

const order2 = orderEngine.splitOrder(order1.id, [1]); // Move Item 2 (index 1) to order2

console.log(`Order 1 Subtotal: ${order1.subtotal}`); // Should be 100
console.log(`Order 2 Subtotal: ${order2.subtotal}`); // Should be 200

if (order1.subtotal === 100 && order2.subtotal === 200) {
  console.log('SUCCESS: Order split correctly.');
} else {
  console.error('FAILURE: Order split failed.');
  process.exit(1);
}

// Test 2: Merging Orders
console.log('\nTest 2: Merging Orders...');
orderEngine.mergeOrders(order1.id, order2.id);

const mergedOrder = orderEngine.getOrder(order1.id);
console.log(`Merged Subtotal: ${mergedOrder.subtotal}`); // Should be 300

if (mergedOrder.subtotal === 300 && !orderEngine.getOrder(order2.id)) {
  console.log('SUCCESS: Orders merged and source deleted.');
} else {
  console.error('FAILURE: Order merge failed.');
  process.exit(1);
}

console.log('\n--- Split & Merge Verification Complete ---');
