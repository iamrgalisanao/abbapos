import catalogEngine from '.../engines/catalog/index.js';
import identityEngine from '.../engines/identity.js';
import authEngine from '.../engines/auth.js';
import orderEngine from '.../engines/order/index.js';
import settlementEngine from '.../engines/settlement.js';
import receiptEngine from '.../engines/receipt/index.js';

console.log('--- Void & Refund Policy Verification Test ---');

// 1. Initial Setup
identityEngine.registerStore({ 
  storeName: 'Compliance Test Store', 
  tin: '000-111-222', 
  branchCode: '001',
  address: '123 POS St, Manila'
});
identityEngine.registerTerminal({ 
  terminalId: 'TERM-01', 
  ptuNumber: 'PTU-123',
  accreditationNumber: 'ACCRED-456'
});
identityEngine.verifyIdentity();
authEngine.login('cashier1', 'password');
catalogEngine.loadCatalog({
  items: [
    { id: 'i1', name: 'Coffee', basePrice: 150 },
  ]
});

// 2. Create and Settle an Order
console.log('\nStep 1: Completing a sale...');
const order = orderEngine.createOrder('DINE_IN', 'Table 5');
orderEngine.addItem(order.id, 'i1', 1);
const settlement = settlementEngine.settleOrder(order.id, { method: 'CASH', amountPaid: 200 });
const originalReceiptNumber = settlement.receipt.receiptNumber;
console.log(`Sale completed. Receipt: ${originalReceiptNumber}`);

// 3. Test Void (Failure Case: No Supervisor)
console.log('\nStep 2: Attempting void without supervisor approval...');
try {
  settlementEngine.voidTransaction(originalReceiptNumber, null, 'Customer changed mind');
  console.error('FAILURE: Void succeeded without supervisorId.');
  process.exit(1);
} catch (error) {
  console.log('SUCCESS: Void blocked as expected.');
}

// 4. Test Void (Success Case)
console.log('\nStep 3: Voiding with supervisor approval...');
const voidResult = settlementEngine.voidTransaction(originalReceiptNumber, 'manager01', 'Error in entry');
if (voidResult.success && voidResult.status === 'VOIDED') {
  console.log('SUCCESS: Transaction voided.');
} else {
  console.error('FAILURE: Void failed.');
  process.exit(1);
}

// 5. Verify Receipt Rendering for Void
console.log('\nStep 4: Verifying Void Receipt formatting...');
const orderDataForVoid = {
  subtotal: settlement.order.subtotal,
  items: settlement.order.items.map(i => ({
    qty: i.qty,
    description: i.name,
    amount: i.totalAmount
  }))
};
const voidReceipt = receiptEngine.composeReceipt(orderDataForVoid, { total: 0, vatAmount: 0, totalVat: 0 }, { status: 'VOID' });
const voidText = receiptEngine.renderText(voidReceipt);
console.log(voidText);

// Check for the header (either as the main title or the prepended status)
if (voidText.includes('VOID RECEIPT') || voidText.includes('*** VOID ***')) {
  console.log('SUCCESS: Receipt marked as VOID correctly.');
} else {
  console.error('FAILURE: Void receipt header missing or incorrect.');
  process.exit(1);
}

// 6. Test Refund
console.log('\nStep 5: Testing Refund logic...');
const refundResult = settlementEngine.refundTransaction(originalReceiptNumber, 'manager01', 'Damaged item');
if (refundResult.success && refundResult.status === 'REFUNDED') {
  console.log('SUCCESS: Refund processed.');
} else {
  console.error('FAILURE: Refund failed.');
  process.exit(1);
}

console.log('\n--- Void & Refund Verification Complete ---');
