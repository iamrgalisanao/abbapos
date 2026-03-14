import identityEngine from './src/engines/identity.js';

console.log('--- Initializing POS Identity Registration Test ---');

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

console.log('Registering Store...');
identityEngine.registerStore(storeConfig);

console.log('Registering Terminal...');
identityEngine.registerTerminal(terminalConfig);

console.log('Verifying Identity...');
const isReady = identityEngine.verifyIdentity();

console.log('Status Report:', JSON.stringify(identityEngine.getStatus(), null, 2));

if (isReady) {
  console.log('SUCCESS: Identity verified and system ready for compliance.');
} else {
  console.error('FAILURE: Identity verification failed. Check configuration.');
  process.exit(1);
}
