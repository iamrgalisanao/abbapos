import auditEngine from '../audit/index.js';
import ZRead from '../../models/ZRead.js';

class ReportingEngine {
  constructor() {
    this.resetAccumulators();
    this.zCounter = 0;
    this.grandTotal = 0;
    this.firstReceipt = null;
    this.lastReceipt = null;
  }

  /**
   * Resets daily sales accumulators.
   * Internal use only (triggered by Z-Read).
   */
  resetAccumulators() {
    this.accumulators = {
      grossSales: 0,
      netSales: 0,
      vatableSales: 0,
      vatAmount: 0,
      vatExemptSales: 0,
      zeroRatedSales: 0,
      discountTotal: 0,
      serviceCharge: 0,
      transactionCount: 0
    };
    this.firstReceipt = null;
    this.lastReceipt = null;
  }

  /**
   * Records a finalized transaction into the current period's accumulators.
   * @param {Object} transaction - Data from finalReceipt.
   */
  recordTransaction(transaction) {
    const { totals, receiptNumber } = transaction;
    const { 
      total, 
      subtotal, 
      discount, 
      vatAmount, 
      vatableSales, 
      netOfVat,
      vatExemptSales, 
      zeroRatedSales, 
      serviceCharge 
    } = totals;

    if (!this.firstReceipt) this.firstReceipt = receiptNumber;
    this.lastReceipt = receiptNumber;

    this.accumulators.grossSales += subtotal;
    this.accumulators.vatableSales += (vatableSales || netOfVat || 0);
    this.accumulators.vatAmount += (vatAmount || 0);
    this.accumulators.vatExemptSales += (vatExemptSales || 0);
    this.accumulators.zeroRatedSales += (zeroRatedSales || 0);
    this.accumulators.discountTotal += (discount || 0);
    this.accumulators.serviceCharge += (serviceCharge || 0);
    this.accumulators.transactionCount += 1;

    // Net Sales = Gross Sales - Discounts
    this.accumulators.netSales = this.accumulators.grossSales - this.accumulators.discountTotal;

    // Update session grand total (Running total of actual money received)
    this.grandTotal += total;

    auditEngine.log('REPORT_UPDATE', `Metrics updated for receipt ${receiptNumber}`, {
      receiptNumber,
      currentGross: this.accumulators.grossSales
    });
  }

  /**
   * Generates a snapshot of the current sales (X-Read).
   * @returns {Object}
   */
  generateXRead() {
    return {
      type: 'X-READ',
      timestamp: new Date().toISOString(),
      ...this.accumulators,
      firstReceipt: this.firstReceipt,
      lastReceipt: this.lastReceipt,
      grandTotal: this.grandTotal
    };
  }

  /**
   * Finalizes the current period, increments Z-counter, and resets accumulators.
   * @returns {ZRead}
   */
  generateZRead() {
    const oldGrandTotal = this.grandTotal - this.accumulators.grossSales;
    const zReadData = new ZRead({
      zCounter: ++this.zCounter,
      timestamp: new Date().toISOString(),
      firstReceipt: this.firstReceipt,
      lastReceipt: this.lastReceipt,
      ...this.accumulators,
      oldGrandTotal: oldGrandTotal,
      newGrandTotal: this.grandTotal
    });

    auditEngine.log('Z_READ_GENERATED', `Z-Read #${this.zCounter} generated. Daily totals reset.`, {
      zCounter: this.zCounter,
      grossSales: this.accumulators.grossSales
    });

    this.resetAccumulators();
    return zReadData;
  }

  /**
   * Export state for persistence.
   */
  exportState() {
    return JSON.stringify({
      zCounter: this.zCounter,
      grandTotal: this.grandTotal,
      accumulators: this.accumulators,
      firstReceipt: this.firstReceipt,
      lastReceipt: this.lastReceipt
    });
  }

  /**
   * Import state from persistence.
   */
  importState(stateData) {
    try {
      const state = JSON.parse(stateData);
      this.zCounter = state.zCounter || 0;
      this.grandTotal = state.grandTotal || 0;
      this.accumulators = state.accumulators || this.accumulators;
      this.firstReceipt = state.firstReceipt;
      this.lastReceipt = state.lastReceipt;
    } catch (err) {
      console.error('Reporting Engine Error: Failed to import state.', err);
    }
  }
}

export default new ReportingEngine();
