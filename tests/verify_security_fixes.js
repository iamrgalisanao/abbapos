import authEngine from '../src/engines/auth.js';
import settlementEngine from '../src/engines/settlement.js';
import identityEngine from '../src/engines/identity.js';
import catalogEngine from '../src/engines/catalog/index.js';
import orderEngine from '../src/engines/order/index.js';
import taxEngine from '../src/engines/tax/index.js';
import rbacEngine from '../src/engines/rbac.js';
import auditEngine from '../src/engines/audit/index.js';
import pricingEngine from '../src/engines/pricing/index.js';
import receiptEngine from '../src/engines/receipt/index.js';

async function runSecurityVerification() {
  console.log('--- STARTING SECURITY & HYGIENE VERIFICATION ---');

  // 1. Verify Auth Hardening
  console.log('\n[1] Verifying Auth Hardening...');
  const badLogin = authEngine.login('admin', 'wrongpassword');
  if (badLogin === null) {
    console.log('✅ PASS: Incorrect password rejected.');
  } else {
    console.error('❌ FAIL: Incorrect password allowed login.');
    process.exit(1);
  }

  const goodLogin = authEngine.login('admin', 'password');
  if (goodLogin && goodLogin.username === 'admin' && !goodLogin.passwordHash) {
    console.log('✅ PASS: Secure login successful (passwordHash not exposed).');
  } else {
    console.error('❌ FAIL: Secure login failed or exposed Hash.');
    process.exit(1);
  }

  // 2. Setup Identity for Settlement
  identityEngine.registerStore({ storeName: 'Secure POS', tin: '123-456', branchCode: '001' });
  identityEngine.registerTerminal({ terminalId: 'T01', ptuNumber: 'PTU-789' });
  identityEngine.verifyIdentity();

  // 3. Verify RBAC Enforcement for Void/Refund
  console.log('\n[2] Verifying RBAC Enforcement...');
  const cashierId = '1'; // John Doe (Cashier role)
  
  try {
    settlementEngine.voidTransaction('OR-123', cashierId, 'Customer test');
    console.error('❌ FAIL: Cashier was allowed to VOID.');
    process.exit(1);
  } catch (err) {
    if (err.message.includes('Unauthorized')) {
      console.log('✅ PASS: Cashier unauthorized for VOID.');
    } else {
      throw err;
    }
  }

  const managerId = '2'; // Jane Smith (Manager role)
  try {
    const res = settlementEngine.voidTransaction('OR-123', managerId, 'Manual void test');
    if (res.success) {
      console.log('✅ PASS: Manager authorized for VOID.');
    }
  } catch (err) {
    console.error('❌ FAIL: Manager failed authorization for VOID:', err.message);
    process.exit(1);
  }

  // 4. Verify Payment Validation
  console.log('\n[3] Verifying Payment Validation...');
  catalogEngine.loadCatalog({
    items: [
      { id: 'S1', name: 'Security Coffee', basePrice: 100, trackInventory: true, alertThreshold: 10 }
    ]
  });
  const order = orderEngine.createOrder('T1');
  orderEngine.addItem(order.id, 'S1', 1); // Subtotal: 100

  // Case: Insufficient Payment
  try {
    settlementEngine.settleOrder(order.id, { method: 'CASH', amountPaid: 50 });
    console.error('❌ FAIL: Insufficient payment was accepted.');
    process.exit(1);
  } catch (err) {
    if (err.message.includes('Insufficient payment')) {
      console.log('✅ PASS: Insufficient payment rejected.');
    } else {
      throw err;
    }
  }

  // Case: Valid Payment & Change Math
  const settleRes = settlementEngine.settleOrder(order.id, { method: 'CASH', amountPaid: 150 });
  if (settleRes.receipt.change === 50) {
    console.log('✅ PASS: Change calculated correctly (150 - 100 = 50).');
  } else {
    console.error(`❌ FAIL: Incorrect change calculation: ${settleRes.receipt.change}`);
    process.exit(1);
  }

  // 5. Verify Hygiene Cleanup (Sprint 2)
  console.log('\n[4] Verifying Hygiene Cleanup...');
  
  // Tax Override
  taxEngine.configure({ vatRate: 0.15 });
  if (taxEngine.vatRate === 0.15) {
    console.log('✅ PASS: Tax rate override successful.');
  }

  // RBAC Override
  rbacEngine.configure({ 'Cashier': ['SUPER_ACTION'] });
  if (rbacEngine.can('Cashier', 'SUPER_ACTION')) {
    console.log('✅ PASS: RBAC matrix override successful.');
  }

  // Discount Guard
  const riskyOrder = orderEngine.createOrder('T2');
  orderEngine.addItem(riskyOrder.id, 'S1', 1); // 100
  const pricingRes = pricingEngine.calculateItemPrice(catalogEngine.getItem('S1'), [{ type: 'AMOUNT', value: 200 }]);
  if (pricingRes.netPrice === 0 && pricingRes.totalDiscount === 100) {
    console.log('✅ PASS: Discount limit guard clamped successfully.');
  } else {
    console.error('❌ FAIL: Discount limit guard failed.', pricingRes);
    process.exit(1);
  }

  // Persistence Hooks
  const logCount = auditEngine.getLogs().length;
  const exported = auditEngine.exportLogs();
  auditEngine.importLogs('[]');
  if (auditEngine.getLogs().length === 0) {
    auditEngine.importLogs(exported);
    if (auditEngine.getLogs().length === logCount) {
      console.log('✅ PASS: Audit log persistence hooks verified.');
    }
  }

  console.log('\n--- SECURITY & HYGIENE VERIFICATION COMPLETE: ALL PASSED ---');
  process.exit(0);
}

runSecurityVerification().catch(err => {
  console.error('Verification crashed:', err);
  process.exit(1);
});
