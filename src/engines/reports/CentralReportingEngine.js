import auditEngine from '../audit/index.js';

/**
 * CentralReportingEngine aggregates data from multiple branch nodes.
 * It takes reporting states (from ReportingEngine.exportState) and consolidates them.
 */
class CentralReportingEngine {
  /**
   * Consolidates multiple branch reporting states.
   * @param {Array<Object>} branchStates - Array of objects { branchCode: string, state: Object }
   * @returns {Object} Consolidated report
   */
  consolidate(branchStates) {
    const totals = {
      grossSales: 0,
      netSales: 0,
      vatableSales: 0,
      vatAmount: 0,
      vatExemptSales: 0,
      zeroRatedSales: 0,
      discountTotal: 0,
      serviceCharge: 0,
      transactionCount: 0,
      grandTotal: 0
    };

    const branchBreakdown = {};

    for (const { branchCode, state } of branchStates) {
      const acc = state.accumulators || {};
      
      // Update Totals
      totals.grossSales += acc.grossSales || 0;
      totals.netSales += acc.netSales || 0;
      totals.vatableSales += acc.vatableSales || 0;
      totals.vatAmount += acc.vatAmount || 0;
      totals.vatExemptSales += acc.vatExemptSales || 0;
      totals.zeroRatedSales += acc.zeroRatedSales || 0;
      totals.discountTotal += acc.discountTotal || 0;
      totals.serviceCharge += acc.serviceCharge || 0;
      totals.transactionCount += acc.transactionCount || 0;
      totals.grandTotal += state.grandTotal || 0;

      // Store breakdown
      branchBreakdown[branchCode] = {
        grossSales: acc.grossSales || 0,
        netSales: acc.netSales || 0,
        transactionCount: acc.transactionCount || 0,
        grandTotal: state.grandTotal || 0
      };
    }

    auditEngine.log('CENTRAL_REPORT_CONSOLIDATED', `Consolidated report generated for ${branchStates.length} branches.`, {
      branchCount: branchStates.length,
      totalGross: totals.grossSales
    });

    return {
      timestamp: new Date().toISOString(),
      totals,
      branchBreakdown
    };
  }

  /**
   * Compares performance between branches.
   * @param {Object} consolidatedReport 
   * @returns {Array} Sorted list of branches by performance
   */
  getTopPerformers(consolidatedReport) {
    return Object.entries(consolidatedReport.branchBreakdown)
      .map(([code, data]) => ({ branchCode: code, ...data }))
      .sort((a, b) => b.grossSales - a.grossSales);
  }
}

export default new CentralReportingEngine();
