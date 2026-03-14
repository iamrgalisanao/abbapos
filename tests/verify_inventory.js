import catalogEngine from '../src/engines/catalog/index.js';
import identityEngine from '../src/engines/identity.js';
import authEngine from '../src/engines/auth.js';
import orderEngine from '../src/engines/order/index.js';
import settlementEngine from '../src/engines/settlement.js';
import inventoryEngine from '../src/engines/inventory/index.js';

console.log('--- Inventory Movement Automation Verification Test ---');

// 1. Initial Setup
identityEngine.registerStore({ storeName: 'Inventory Test Store', tin: '999-888-777', branchCode: '001', address: '456 Stock Ave' });
identityEngine.registerTerminal({ terminalId: 'TERM-01', ptuNumber: 'PTU-123', accreditationNumber: 'ACC-123' });
identityEngine.verifyIdentity();
authEngine.login('cashier1', 'password');
catalogEngine.loadCatalog({
  items: [
    { id: 'item-01', name: 'Hot Burger', basePrice: 150, trackInventory: true },
  ]
});

// 2. Initialize Stock
console.log('\nInitializing stock for Hot Burger to 50 units...');
inventoryEngine.initStock('item-01', 50);

// Test 1: Automatic Deduction on Sale
console.log('\nTest 1: Selling 5 Hot Burgers...');
const order1 = orderEngine.createOrder('TAKE_OUT', 'Walk-in');
orderEngine.addItem(order1.id, 'item-01', 5);

settlementEngine.settleOrder(order1.id, { method: 'CASH', amountPaid: 1000 });

const remaining = inventoryEngine.getStock('item-01');
console.log(`Remaining stock: ${remaining}`);

if (remaining === 45) {
  console.log('SUCCESS: Stock deducted correctly on sale.');
} else {
  console.error(`FAILURE: Expected stock 45, got ${remaining}`);
  process.exit(1);
}

// Test 2: Manual Adjustment (Manager Required)
console.log('\nTest 2: Manual Adjustment (Adding 10 units)...');
try {
    inventoryEngine.adjustStock('item-01', 10, 'RECEIVE', 'Stock delivery', 'admin-01');
    const newStock = inventoryEngine.getStock('item-01');
    console.log(`New stock level: ${newStock}`);
    if (newStock === 55) {
        console.log('SUCCESS: Manual adjustment applied correctly.');
    } else {
        throw new Error(`Expected stock 55, got ${newStock}`);
    }
} catch (error) {
    console.error(`FAILURE: ${error.message}`);
    process.exit(1);
}

// Test 3: Unauthorized Adjustment (Should Fail)
console.log('\nTest 3: Unauthorized Adjustment (No managerId)...');
try {
    inventoryEngine.adjustStock('item-01', 5, 'ADJUST', 'Shrinkage', '');
    console.error('FAILURE: Adjustment without managerId should have failed.');
    process.exit(1);
} catch (error) {
    console.log(`SUCCESS indicator: Properly failed with message: "${error.message}"`);
}

console.log('\n--- Inventory Movement Verification Complete ---');
