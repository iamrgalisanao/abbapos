import authEngine from '../engines/auth.js';
import identityEngine from '../engines/identity.js';
import auditEngine from '../engines/audit/index.js';

console.log('--- Compliance Audit Engine Verification Test ---');

// 1. Setup Identity
identityEngine.registerStore({ storeName: 'Audit Test Store', tin: '000-111-222', branchCode: '001' });
identityEngine.registerTerminal({ terminalId: 'TERM-01', ptuNumber: 'PTU-123' });
identityEngine.verifyIdentity();

// 2. Setup User
authEngine.login('manager1', 'password');

// 3. Log a sensitive action
console.log('Logging a VOID action...');
auditEngine.log('VOID', 'Manager John voided OR-POS-01-00000001', { receiptId: 'OR-POS-01-00000001', reason: 'Customer changed mind' });

// 4. Log another action
console.log('Logging a REPRINT action...');
auditEngine.log('REPRINT', 'Reprinted OR-POS-01-00000001', { receiptId: 'OR-POS-01-00000001' });

// 5. Verify logs
const logs = auditEngine.getLogs();
console.log('\nAudit Logs Captured:', JSON.stringify(logs, null, 2));

if (logs.length === 2 && logs[0].action === 'VOID' && logs[1].action === 'REPRINT') {
  console.log('\nSUCCESS: Compliance Audit Engine functional.');
} else {
  console.error('\nFAILURE: Audit logging failed.');
  process.exit(1);
}

console.log('--- Compliance Audit Engine Verification Complete ---');
