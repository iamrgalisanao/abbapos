import catalogEngine from '../engines/catalog/index.js';
import identityEngine from '../engines/identity.js';
import authEngine from '../engines/auth.js';
import orderEngine from '../engines/order/index.js';

console.log('--- Order Engine Lifecycle Verification Test ---');

// 1. Initial Setup
identityEngine.registerStore({ storeName: 'Order Test Store', tin: '000-111-222', branchCode: '001' });
identityEngine.registerTerminal({ terminalId: 'TERM-01', ptuNumber: 'PTU-123' });
identityEngine.verifyIdentity();

authEngine.login('cashier1', 'password');

catalogEngine.loadCatalog({
  items: [
    {
      id: 'burger1',
      name: 'Classic Burger',
      basePrice: 200.00,
      modifierGroups: [
        {
          id: 'g1',
          name: 'Extras',
          minSelect: 0,
          maxSelect: 1,
          modifiers: [{ id: 'mod1', name: 'Cheese', price: 20.00 }]
        }
      ]
    }
  ]
});

// Test 1: Order Creation
console.log('Test 1: Creating Order...');
const order = orderEngine.createOrder('DINE_IN', 'Table 5');
console.log(`Order Created: ${order.id} for ${order.tableNumber}`);

if (order.status === 'DRAFT' && order.serviceType === 'DINE_IN') {
  console.log('SUCCESS: Order created in DRAFT.');
} else {
  console.error('FAILURE: Order creation failed.');
  process.exit(1);
}

// Test 2: Adding Items with Modifiers
console.log('\nTest 2: Adding Item with Modifier...');
orderEngine.addItem(order.id, 'burger1', 1, { 'g1': ['mod1'] });
const updatedOrder = orderEngine.getOrder(order.id);

console.log('Order Items:', JSON.stringify(updatedOrder.items, null, 2));
console.log(`Subtotal: ${updatedOrder.subtotal}`);

// Expected: 200 (base) + 20 (cheese) = 220
if (updatedOrder.subtotal === 220.00) {
  console.log('SUCCESS: Item and modifier price calculated correctly.');
} else {
  console.error(`FAILURE: Incorrect subtotal. Expected 220, got ${updatedOrder.subtotal}`);
  process.exit(1);
}

// Test 3: Hold and Resume
console.log('\nTest 3: Hold and Resume Logic...');
orderEngine.holdOrder(order.id);
console.log(`Status after Hold: ${orderEngine.getOrder(order.id).status}`);

if (orderEngine.getOrder(order.id).status === 'HELD') {
  console.log('SUCCESS: Order held.');
} else {
  console.error('FAILURE: Hold failed.');
  process.exit(1);
}

orderEngine.resumeOrder(order.id);
console.log(`Status after Resume: ${orderEngine.getOrder(order.id).status}`);

if (orderEngine.getOrder(order.id).status === 'DRAFT') {
  console.log('SUCCESS: Order resumed.');
} else {
  console.error('FAILURE: Resume failed.');
  process.exit(1);
}

console.log('\n--- Order Engine Verification Complete ---');
