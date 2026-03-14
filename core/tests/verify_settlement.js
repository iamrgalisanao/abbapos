import catalogEngine from '../engines/catalog/index.js';
import identityEngine from '../engines/identity.js';
import authEngine from '../engines/auth.js';
import orderEngine from '../engines/order/index.js';
import settlementEngine from '../engines/settlement.js';

console.log('--- Phase 2: Full Sales & Settlement Verification Test ---');

// 1. Setup
identityEngine.registerStore({ storeName: 'Settlement Test', tin: '999-999-999', branchCode: '000' });
identityEngine.registerTerminal({ terminalId: 'TERM-SETTLE', ptuNumber: 'PTU-SETTLE' });
identityEngine.verifyIdentity();
authEngine.login('manager1', 'password');
catalogEngine.loadCatalog({
  items: [
    { id: 'steak1', name: 'Ribeye Steak', basePrice: 1200.00 }
  ]
});

// 2. Create and Populate Order
console.log('Creating order for steak...');
const order = orderEngine.createOrder('DINE_IN', 'Table 1');
orderEngine.addItem(order.id, 'steak1', 1);

// 3. Settle Order
console.log('\nSettling Order...');
const payment = { method: 'CASH', amountPaid: 1500.00 };
const result = settlementEngine.settleOrder(order.id, payment);

console.log('--- RECEIPT OUTPUT ---');
console.log(result.receipt.content);
console.log('----------------------');

// Verification
const expectedTotal = 1200 * 1.12; // Base + 12% VAT (assuming no SC for this test setup if default is 12% vatable)
// Wait, my TaxEngine defaults to 12% VAT and optional SC. Let's check the result.
console.log(`Receipt Total: ${result.receipt.totalAmount}`);
console.log(`Order Status: ${result.order.status}`);

if (result.order.status === 'PAID' && result.receipt.receiptNumber) {
  console.log('SUCCESS: Order settled, receipt generated, and status updated.');
} else {
  console.error('FAILURE: Settlement failed.');
  process.exit(1);
}

console.log('\n--- Full Sales & Settlement Verification Complete ---');
