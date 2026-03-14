import authEngine from './src/engines/auth.js';
import rbacEngine from './src/engines/rbac.js';

console.log('--- Initializing Auth & RBAC Verification Test ---');

// Test 1: Invalid Login
console.log('Test 1: Attempting login with invalid credentials...');
const invalidUser = authEngine.login('wrong', 'wrong');
if (!invalidUser && !authEngine.isAuthenticated()) {
  console.log('SUCCESS: Invalid login rejected.');
} else {
  console.error('FAILURE: Invalid login accepted.');
  process.exit(1);
}

// Test 2: Cashier Login & Permissions
console.log('\nTest 2: Logging in as Cashier...');
const cashier = authEngine.login('cashier1', 'password');
console.log(`Logged in as: ${cashier.fullName} (${cashier.role})`);

const canOrder = rbacEngine.check(authEngine, 'ORDER_CREATE');
const canVoid = rbacEngine.check(authEngine, 'VOID_SALES');

console.log(`Permission ORDER_CREATE: ${canOrder}`);
console.log(`Permission VOID_SALES: ${canVoid}`);

if (canOrder === true && canVoid === false) {
  console.log('SUCCESS: Cashier permissions correctly restricted.');
} else {
  console.error('FAILURE: Incorrect Cashier permissions.');
  process.exit(1);
}

// Test 3: Manager Login & Void Permission
console.log('\nTest 3: Logging in as Manager...');
authEngine.logout();
const manager = authEngine.login('manager1', 'password');
console.log(`Logged in as: ${manager.fullName} (${manager.role})`);

const managerCanVoid = rbacEngine.check(authEngine, 'VOID_SALES');
const managerCanRefund = rbacEngine.check(authEngine, 'REFUND');

console.log(`Permission VOID_SALES: ${managerCanVoid}`);
console.log(`Permission REFUND: ${managerCanRefund}`);

if (managerCanVoid === true && managerCanRefund === true) {
  console.log('SUCCESS: Manager permissions correctly elevated.');
} else {
  console.error('FAILURE: Incorrect Manager permissions.');
  process.exit(1);
}

console.log('\n--- Auth & RBAC Verification Complete ---');
