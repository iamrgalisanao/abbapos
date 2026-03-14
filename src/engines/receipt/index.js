import identityEngine from '../identity.js';
import auditEngine from '../audit/index.js';

class ReceiptEngine {
  constructor() {
    this.currentSequence = 0;
    this.receiptPrefix = 'OR-';
    this.lastReceiptId = null;
  }

  /**
   * Initializes the sequence from a stored value (e.g., from a database or file).
   * @param {number} lastSequence
   */
  initSequence(lastSequence) {
    this.currentSequence = lastSequence;
  }

  /**
   * Returns current sequence for persistence.
   * @returns {number}
   */
  getCurrentSequence() {
    return this.currentSequence;
  }

  /**
   * Generates the next sequential receipt number.
   * Format: OR-<TerminalID>-<PaddedSequence>
   * @returns {string}
   */
  getNextReceiptNumber() {
    const terminalId = identityEngine.getStatus().terminal?.terminalId || '00';
    this.currentSequence += 1;
    const paddedSeq = String(this.currentSequence).padStart(8, '0');
    return `${this.receiptPrefix}${terminalId}-${paddedSeq}`;
  }

  /**
   * Composes a receipt data structure.
   * @param {Object} orderData
   * @param {Object} taxBreakdown
   * @param {Object} options
   * @param {boolean} options.isReprint
   * @returns {Object} receipt
   */
  composeReceipt(orderData, taxBreakdown, options = {}) {
    const { isReprint = false } = options;
    const status = identityEngine.getStatus();
    
    if (!status.initialized) {
      throw new Error('Receipt Engine Error: System not initialized. Identity required.');
    }

    const receiptNumber = isReprint ? this.lastReceiptId : this.getNextReceiptNumber();
    if (!isReprint) {
      this.lastReceiptId = receiptNumber;
    } else {
      // Log sensitive action: REPRINT
      auditEngine.log('REPRINT', `Reprinted receipt ${receiptNumber}`, { receiptNumber });
    }

    const { status: receiptStatus = 'NORMAL' } = options;
    let title = isReprint ? 'OFFICIAL RECEIPT (REPRINT)' : 'OFFICIAL RECEIPT';
    
    if (receiptStatus === 'VOID') title = 'VOID RECEIPT';
    if (receiptStatus === 'REFUND') title = 'REFUND RECEIPT';

    return {
      title,
      status: receiptStatus,
      receiptNumber: receiptNumber,
      timestamp: new Date().toISOString(),
      store: status.store,
      terminal: status.terminal,
      items: orderData.items || [],
      totals: {
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        ...taxBreakdown,
      },
      footer: {
        birAccreditation: status.terminal.accreditationNumber,
        ptuNumber: status.terminal.ptuNumber,
        message: 'Thank you for dining with us!',
      },
      loyalty: options.loyalty || null
    };
  }

  /**
   * Renders a text-based preview of the receipt.
   * @param {Object} receipt
   * @returns {string}
   */
  renderText(receipt) {
    let titleLine = receipt.title;
    if (receipt.status !== 'NORMAL' && !titleLine.includes(receipt.status)) {
      titleLine = `*** ${receipt.status} ***\n${titleLine}`;
    }

    let output = `\n${titleLine.padStart(25)}\n`;
    output += `---------------------------\n`;
    output += `${receipt.store.storeName}\n`;
    output += `${receipt.store.address}\n`;
    output += `TIN: ${receipt.store.tin}\n`;
    output += `Branch: ${receipt.store.branchCode}\n`;
    output += `---------------------------\n`;
    output += `Receipt #: ${receipt.receiptNumber}\n`;
    output += `Date: ${receipt.timestamp}\n`;
    output += `---------------------------\n`;
    
    receipt.items.forEach(item => {
      const line = `${item.qty} x ${item.description.padEnd(15)} ${item.amount.toFixed(2).padStart(8)}`;
      output += `${line}\n`;
    });
    
    output += `---------------------------\n`;
    output += `Subtotal: ${receipt.totals.subtotal.toFixed(2).padStart(15)}\n`;
    if (receipt.totals.discount > 0) {
      output += `Discount: -${receipt.totals.discount.toFixed(2).padStart(14)}\n`;
    }
    output += `VAT (12%): ${receipt.totals.vatAmount.toFixed(2).padStart(14)}\n`;
    if (receipt.totals.serviceCharge > 0) {
      output += `Srv Chg: ${receipt.totals.serviceCharge.toFixed(2).padStart(16)}\n`;
    }
    output += `TOTAL: ${receipt.totals.total.toFixed(2).padStart(18)}\n`;
    output += `---------------------------\n`;
    
    if (receipt.loyalty) {
      output += `LOYALTY POINTS\n`;
      output += `Points Earned: ${String(receipt.loyalty.pointsEarned).padStart(12)}\n`;
      output += `New Balance: ${String(receipt.loyalty.newBalance).padStart(14)}\n`;
      output += `---------------------------\n`;
    }

    output += `PTU: ${receipt.footer.ptuNumber}\n`;
    output += `Accred: ${receipt.footer.birAccreditation}\n`;
    output += `${receipt.footer.message.padStart(25)}\n`;
    
    return output;
  }

  exportState() {
    return JSON.stringify({
      currentSequence: this.currentSequence,
      lastReceiptId: this.lastReceiptId
    });
  }

  importState(stateData) {
    try {
      const state = JSON.parse(stateData);
      this.currentSequence = state.currentSequence || 0;
      this.lastReceiptId = state.lastReceiptId;
    } catch (err) {
      console.error('Receipt Engine Error: Failed to import state.', err);
    }
  }
}

import persistenceManager from '../PersistenceManager.js';

const instance = new ReceiptEngine();
persistenceManager.registerEngine('receipt', instance);
export default instance;
