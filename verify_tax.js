import taxEngine from './src/engines/tax/index.js';

console.log('--- Initializing Tax Engine Verification Test ---');

// Test 1: Standard VATable Sale
console.log('Test 1: Standard VATable Sale (100.00 Net of VAT)');
const res1 = taxEngine.calculateBreakdown(100.00);
console.log('Breakdown:', JSON.stringify(res1, null, 2));
if (res1.netOfVat === 100.00 && res1.vatAmount === 12.00 && res1.total === 112.00) {
  console.log('SUCCESS: Standard VAT calculated correctly.');
} else {
  console.error('FAILURE: Standard VAT calculation incorrect.');
  process.exit(1);
}

// Test 2: VAT-Exempt Sale
console.log('\nTest 2: VAT-Exempt Sale (100.00)');
const res2 = taxEngine.calculateBreakdown(100.00, { isVatExempt: true });
console.log('Breakdown:', JSON.stringify(res2, null, 2));
if (res2.netOfVat === 100.00 && res2.vatAmount === 0 && res2.total === 100.00) {
  console.log('SUCCESS: VAT-Exempt handled correctly.');
} else {
  console.error('FAILURE: VAT-Exempt calculation incorrect.');
  process.exit(1);
}

// Test 3: VAT + Service Charge
console.log('\nTest 3: VAT + 10% Service Charge (100.00 Net of VAT)');
const res3 = taxEngine.calculateBreakdown(100.00, { hasServiceCharge: true });
console.log('Breakdown:', JSON.stringify(res3, null, 2));
// Net: 100, VAT: 12, SC: 10, Total: 122
if (res3.vatAmount === 12.00 && res3.serviceCharge === 10.00 && res3.total === 122.00) {
  console.log('SUCCESS: VAT and Service Charge calculated correctly.');
} else {
  console.error('FAILURE: VAT+SC calculation incorrect.');
  process.exit(1);
}

// Test 4: VAT-Inclusive Extraction
console.log('\nTest 4: VAT-Inclusive Extraction (112.00 Gross)');
const res4 = taxEngine.fromVatInclusive(112.00);
console.log('Breakdown:', JSON.stringify(res4, null, 2));
if (res4.netOfVat === 100.00 && res4.vatAmount === 12.00) {
  console.log('SUCCESS: VAT extraction correctly reversed.');
} else {
  console.error('FAILURE: VAT inclusive extraction incorrect.');
  process.exit(1);
}

console.log('\n--- Tax Engine Verification Complete ---');
