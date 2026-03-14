import centralReportingEngine from '../src/engines/reports/CentralReportingEngine.js';

async function verifyCentralReporting() {
  console.log('--- STARTING CENTRAL REPORTING VERIFICATION ---');

  // 1. Simulate Branch States
  // Normally these come from different persistence files or Cloud sync.
  const branchAState = {
    grandTotal: 1500,
    accumulators: {
      grossSales: 1500,
      netSales: 1400,
      vatAmount: 150,
      transactionCount: 5,
      discountTotal: 100
    }
  };

  const branchBState = {
    grandTotal: 2500,
    accumulators: {
      grossSales: 2500,
      netSales: 2300,
      vatAmount: 250,
      transactionCount: 8,
      discountTotal: 200
    }
  };

  const input = [
    { branchCode: 'BRANCH-MNL', state: branchAState },
    { branchCode: 'BRANCH-CEB', state: branchBState }
  ];

  console.log('[STEP 1] Consolidating 2 branch states...');
  const report = centralReportingEngine.consolidate(input);

  // 2. Verify Totals
  console.log('[STEP 2] Verifying Consolidated Totals...');
  console.log(`- Total Gross: ${report.totals.grossSales}`);
  console.log(`- Total Transactions: ${report.totals.transactionCount}`);
  
  if (report.totals.grossSales !== 4000) throw new Error('Consolidated gross sales mismatch');
  if (report.totals.transactionCount !== 13) throw new Error('Consolidated transaction count mismatch');
  if (report.totals.grandTotal !== 4000) throw new Error('Consolidated grand total mismatch');

  // 3. Verify Breakdown
  console.log('[STEP 3] Verifying Branch Breakdown...');
  if (!report.branchBreakdown['BRANCH-MNL'] || !report.branchBreakdown['BRANCH-CEB']) {
    throw new Error('Branch breakdown missing entries');
  }
  console.log(`- Branch MNL Gross: ${report.branchBreakdown['BRANCH-MNL'].grossSales}`);

  // 4. Verify Comparison Utility
  console.log('[STEP 4] Verifying Top Performers...');
  const top = centralReportingEngine.getTopPerformers(report);
  console.log(`- Top Branch: ${top[0].branchCode} with ${top[0].grossSales}`);

  if (top[0].branchCode !== 'BRANCH-CEB') throw new Error('Top performer ranking error');

  console.log('\n✅ CENTRAL REPORTING VERIFICATION PASSED');
}

verifyCentralReporting().catch(err => {
  console.error('\n❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
