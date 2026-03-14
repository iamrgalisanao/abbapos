import identityEngine from './src/engines/identity.js';
import taxEngine from './src/engines/tax/index.js';
import receiptEngine from './src/engines/receipt/index.js';

console.log('--- Integrated Full Sales Flow Test ---');

// 1. Setup Identity
const storeConfig = {
  storeName: 'Abaa Restaurant',
  tin: '123-456-789-000',
  branchCode: '001',
  address: '123 Food Street, Metro Manila',
  vatReg: 'VAT-987654321',
  owner: 'Abaa Group Inc.',
};
const terminalConfig = {
  terminalId: 'POS-01',
  serialNumber: 'SN-ABC-12345',
  accreditationNumber: 'ACCR-2026-1234',
  accreditationDate: '2026-12-31',
  ptuNumber: 'PTU-2026-5678',
  ptuDate: '2030-12-31',
};
identityEngine.registerStore(storeConfig);
identityEngine.registerTerminal(terminalConfig);
identityEngine.verifyIdentity();

// 2. Define a mockup order
const order = {
  subtotal: 500.00,
  items: [
    { qty: 1, description: 'Cheeseburger', amount: 300.00 },
    { qty: 2, description: 'Coke', amount: 200.00 },
  ]
};

// 3. Calculate Tax
console.log('Calculating Tax...');
const taxBreakdown = taxEngine.calculateBreakdown(order.subtotal, { hasServiceCharge: true });

// 4. Compose Receipt
console.log('Composing Receipt 1...');
const receipt1 = receiptEngine.composeReceipt(order, taxBreakdown);
console.log(receiptEngine.renderText(receipt1));

// 5. Compose Receipt 2 (Verify Sequential Numbering)
console.log('Composing Receipt 2...');
const receipt2 = receiptEngine.composeReceipt(order, taxBreakdown);
console.log(receiptEngine.renderText(receipt2));

// 6. Verify Reprint
console.log('Composing Reprint of Receipt 2...');
const reprint = receiptEngine.composeReceipt(order, taxBreakdown, { isReprint: true });
console.log(receiptEngine.renderText(reprint));

if (receipt1.receiptNumber !== receipt2.receiptNumber && reprint.receiptNumber === receipt2.receiptNumber) {
  console.log('SUCCESS: Sequential numbering and reprint logic verified.');
} else {
  console.error('FAILURE: Numbering or reprint logic failed.');
  process.exit(1);
}

console.log('\n--- Full Sales Flow Verification Complete ---');
