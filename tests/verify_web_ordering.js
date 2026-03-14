import integrationEngine from '../src/engines/IntegrationEngine.js';
import orderEngine from '../src/engines/order/index.js';
import catalogEngine from '../src/engines/catalog/index.js';
import identityEngine from '../src/engines/identity.js';
import authEngine from '../src/engines/auth.js';
import auditEngine from '../src/engines/audit/index.js';

async function verifyWebOrdering() {
  console.log('--- STARTING WEB ORDERING VERIFICATION ---');

  // 1. Setup Environment
  identityEngine.registerStore({
    storeName: 'Web Order Test Shop',
    tin: '000-111-222-333',
    branchCode: 'WEB-01'
  });
  identityEngine.registerTerminal({
    terminalId: 'T01',
    ptuNumber: 'PTU-W-01'
  });
  identityEngine.verifyIdentity();

  authEngine.login('cashier1', 'password');

  catalogEngine.addItem({
    id: 'WEB-ITEM-01',
    name: 'Cloud Burger',
    price: 250
  });

  // 2. Simulate External Payload (e.g. from a Website)
  const webPayload = {
    refId: 'WEB-REF-999',
    items: [
      { id: 'WEB-ITEM-01', qty: 2 }
    ]
  };

  console.log('\n[STEP 1] Ingesting Web Order...');
  const order = integrationEngine.receiveOrder(webPayload, 'WEB');

  // 3. Verify Order Model
  console.log('\n[STEP 2] Verifying Order Data...');
  console.log(`- Order ID: ${order.id}`);
  console.log(`- Service Type: ${order.serviceType}`);
  console.log(`- External Source: ${order.externalSource}`);
  console.log(`- External Ref: ${order.externalReferenceId}`);
  console.log(`- Item Count: ${order.items.length}`);

  if (order.serviceType !== 'WEB_ORDER') throw new Error('Incorrect service type');
  if (order.externalSource !== 'WEB') throw new Error('Incorrect external source');
  if (order.externalReferenceId !== 'WEB-REF-999') throw new Error('Incorrect ref ID');

  // 4. Verify Audit Log
  console.log('\n[STEP 3] Verifying Audit Log...');
  const logs = auditEngine.getLogs();
  const lastLog = logs[logs.length - 1];
  console.log(`- Last Log Entry: ${lastLog.details}`);
  
  if (lastLog.action !== 'EXTERNAL_ORDER_RECEIVED') {
    throw new Error('Audit log entry missing or incorrect.');
  }

  // 5. Simulate Delivery App Payload
  const appPayload = {
    refId: 'FP-W-123',
    items: [
      { id: 'WEB-ITEM-01', qty: 1 }
    ]
  };

  console.log('\n[STEP 4] Ingesting App Delivery Order (FoodPanda)...');
  const appOrder = integrationEngine.receiveOrder(appPayload, 'FOODPANDA');
  console.log(`- Service Type: ${appOrder.serviceType}`);
  if (appOrder.serviceType !== 'APP_DELIVERY') throw new Error('Incorrect delivery service type');

  console.log('\n✅ WEB ORDERING VERIFICATION PASSED');
}

verifyWebOrdering().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
