import settlementEngine from '../src/engines/settlement.js';
import catalogEngine from '../src/engines/catalog/index.js';
import orderEngine from '../src/engines/order/index.js';
import reportingEngine from '../src/engines/reports/index.js';
import identityEngine from '../src/engines/identity.js';
import authEngine from '../src/engines/auth.js';

async function runReportingVerification() {
  console.log('--- STARTING REPORTING VERIFICATION (X/Z READS) ---');

  // 1. Setup Identity (PTU/Terminal) and Auth
  identityEngine.registerStore({ tin: '123-456-789-000', branchCode: 'B01', name: 'Test Store' });
  identityEngine.registerTerminal({ terminalId: 'T01', ptuNumber: 'PTU-999' });
  identityEngine.verifyIdentity();

  authEngine.login('cashier1', 'password');

  // 2. Load Catalog
  catalogEngine.loadCatalog({
    categories: [{ id: 'C1', name: 'Food' }],
    items: [
      { id: 'S1', name: 'Burger', basePrice: 100, categoryId: 'C1' },
      { id: 'S2', name: 'Drinks', basePrice: 50, categoryId: 'C1' }
    ]
  });

  console.log('\n[1] Processing Sample Transactions...');
  
  // Transaction 1: Simple sale
  const order1 = orderEngine.createOrder('T1');
  orderEngine.addItem(order1.id, 'S1', 1);
  settlementEngine.settleOrder(order1.id, { method: 'CASH', amountPaid: 200 });

  // Transaction 2: Tax-Exempt (Mocking SC/PWD type logic)
  const order2 = orderEngine.createOrder('T1');
  orderEngine.addItem(order2.id, 'S2', 2); // 100
  settlementEngine.settleOrder(order2.id, { method: 'CASH', amountPaid: 100, discounts: [{ type: 'SC', value: 20 }] });

  // 3. Verify X-Read
  console.log('\n[2] Verifying X-Read (Snapshot)...');
  const xRead = reportingEngine.generateXRead();
  console.log(`- Gross Sales (Pre-Discount): ${xRead.grossSales}`);
  console.log(`- Discount Total: ${xRead.discountTotal.toFixed(2)}`);
  console.log(`- Net Sales: ${xRead.netSales.toFixed(2)}`);
  console.log(`- Transaction Count: ${xRead.transactionCount}`);
  
  if (xRead.grossSales === 200 && xRead.transactionCount === 2) {
    console.log('✅ PASS: X-Read totals are accurate.');
  } else {
    console.error('❌ FAIL: X-Read totals mismatch.', xRead);
    process.exit(1);
  }

  // 4. Verify Z-Read (Counter and Reset)
  console.log('\n[3] Verifying Z-Read (Finalize & Reset)...');
  const zRead = reportingEngine.generateZRead();
  console.log(`- Z-Counter: ${zRead.zCounter}`);
  console.log(`- Grand Total (Money Collected): ${zRead.newGrandTotal.toFixed(2)}`);
  
  if (zRead.zCounter === 1 && Math.abs(zRead.newGrandTotal - 171.43) < 0.01) {
    console.log('✅ PASS: Z-Read counter and grand total incremented.');
  } else {
    console.error('❌ FAIL: Z-Read sequence or grand total error.', zRead);
    process.exit(1);
  }

  // 5. Verify Accumulator Reset
  const xReadPostReset = reportingEngine.generateXRead();
  if (xReadPostReset.grossSales === 0 && xReadPostReset.transactionCount === 0) {
    console.log('✅ PASS: Daily accumulators reset successfully after Z-Read.');
  } else {
    console.error('❌ FAIL: Accumulators did not reset.', xReadPostReset);
    process.exit(1);
  }

  // 6. Verify Sequential Z-Counter
  reportingEngine.recordTransaction({ 
    receiptNumber: 'OR-99',
    totals: { total: 50, subtotal: 50, vatAmount: 0 } 
  });
  const zRead2 = reportingEngine.generateZRead();
  if (zRead2.zCounter === 2) {
    console.log('✅ PASS: Z-Counter is sequential.');
  } else {
    console.error('❌ FAIL: Z-Counter not sequential.', zRead2);
    process.exit(1);
  }

  console.log('\n--- REPORTING VERIFICATION COMPLETE: ALL PASSED ---');
  process.exit(0);
}

runReportingVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
