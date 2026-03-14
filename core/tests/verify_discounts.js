import catalogEngine from '.../engines/catalog/index.js';
import identityEngine from '.../engines/identity.js';
import authEngine from '.../engines/auth.js';
import orderEngine from '.../engines/order/index.js';
import settlementEngine from '.../engines/settlement.js';

console.log('--- Pricing & Promo Engine Verification Test ---');

// 1. Initial Setup
identityEngine.registerStore({ storeName: 'Promo Test Store', tin: '000-111-222', branchCode: '001', address: '123 Promo St' });
identityEngine.registerTerminal({ terminalId: 'TERM-01', ptuNumber: 'PTU-123', accreditationNumber: 'ACC-123' });
identityEngine.verifyIdentity();
authEngine.login('cashier1', 'password');
catalogEngine.loadCatalog({
  items: [
    { id: 'i1', name: 'Premium Coffee', basePrice: 200 },
  ]
});

// Test 1: Standard Discount (10% OFF)
console.log('\nTest 1: Applying 10% Discount...');
const order1 = orderEngine.createOrder('DINE_IN', 'Table 1');
orderEngine.addItem(order1.id, 'i1', 1);

const discountData1 = {
  method: 'CASH',
  amountPaid: 200,
  discounts: [
    { itemId: 'i1', type: 'PERCENT', value: 10, reason: 'Promo' }
  ]
};

const settlement1 = settlementEngine.settleOrder(order1.id, discountData1);
console.log(settlement1.receipt.content);

// Calculation: 200 * 0.9 = 180.
// VAT (12% of 180 inclusive): 180 - (180/1.12) = 19.29
if (settlement1.receipt.totals.total === 180) {
  console.log('SUCCESS: 10% Discount applied correctly.');
} else {
  console.error(`FAILURE: Expected total 180, got ${settlement1.receipt.totals.total}`);
  process.exit(1);
}

// Test 2: Senior Citizen Discount
// Logic: VAT Exempt (remove 12%) then 20% discount.
// Price: 200. Net of VAT: 200 / 1.12 = 178.57
// Discount: 178.57 * 0.20 = 35.71
// Final: 178.57 - 35.71 = 142.86
console.log('\nTest 2: Applying Senior Citizen Discount...');
const order2 = orderEngine.createOrder('DINE_IN', 'Table 2');
orderEngine.addItem(order2.id, 'i1', 1);

const discountData2 = {
  method: 'CASH',
  amountPaid: 200,
  discounts: [
    { type: 'SC', reason: 'Senior Citizen' }
  ]
};

const settlement2 = settlementEngine.settleOrder(order2.id, discountData2);
console.log(settlement2.receipt.content);

if (Math.abs(settlement2.receipt.totals.total - 142.86) < 0.01) {
  console.log('SUCCESS: SC Discount (VAT Exempt + 20%) applied correctly.');
} else {
  console.error(`FAILURE: Expected total 142.86, got ${settlement2.receipt.totals.total}`);
  process.exit(1);
}

console.log('\n--- Pricing & Promo Verification Complete ---');
