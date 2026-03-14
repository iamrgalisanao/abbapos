import syncEngine from '.../engines/SyncEngine.js';
import persistenceManager from '.../engines/PersistenceManager.js';
import storageEngine from '.../engines/StorageEngine.js';

async function verifyOfflineSync() {
  console.log('--- STARTING OFFLINE SYNC VERIFICATION ---');

  // 1. Initial State
  console.log('\n[STEP 1] Enqueueing initial actions...');
  syncEngine.enqueue('ORDER', { id: 'ORD-001', total: 100 });
  syncEngine.enqueue('AUDIT', { action: 'LOGIN', user: 'admin' });

  let status = syncEngine.getQueueStatus();
  console.log(`- Queue Status: ${JSON.stringify(status)}`);
  if (status.pending !== 2) throw new Error('Queue failed to initialize');

  // 2. Simulate Cloud Outage (Mock Failure)
  console.log('\n[STEP 2] Simulating Cloud Outage (retries should fail)...');
  const faultySender = async (item) => {
    throw new Error('NETWORK_TIMEOUT');
  };

  await syncEngine.processQueue(faultySender);
  status = syncEngine.getQueueStatus();
  console.log(`- Status after outage: ${status.failed} failed items.`);
  if (status.failed !== 2) throw new Error('Outage not handled correctly');

  // 3. Verify Persistence during outage
  console.log('\n[STEP 3] Verifying persistence of the failed queue...');
  const state = syncEngine.exportState();
  
  // Create a new instance and import state to simulate restart
  const newInstance = (await import('.../engines/SyncEngine.js?update=' + Date.now())).default;
  newInstance.importState(state);
  
  if (newInstance.getQueueStatus().failed !== 2) {
    throw new Error('Queue did not persist during simulated outage/restart');
  }

  // 4. Simulate Cloud Restoration (Success)
  console.log('\n[STEP 4] Simulating Cloud Restoration (recovery)...');
  const healthySender = async (item) => {
    // console.log(`  -> Sending ${item.id} successfully.`);
    return { success: true };
  };

  await syncEngine.processQueue(healthySender);
  status = syncEngine.getQueueStatus();
  console.log(`- Status after restoration: ${status.synced} synced items.`);
  
  if (status.synced !== 2) throw new Error('Recovery failed');
  if (status.pending !== 0) throw new Error('Items still pending after recovery');

  console.log('\n✅ OFFLINE SYNC VERIFICATION PASSED');
}

verifyOfflineSync().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
