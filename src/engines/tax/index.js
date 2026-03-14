class TaxEngine {
  constructor() {
    this.vatRate = 0.12; // 12% default
    this.serviceChargeRate = 0.10; // 10% default
    this.roundingPrecision = 2;
  }

  /**
   * Rounds a number to the defined precision.
   * @param {number} value
   * @returns {number}
   */
  round(value) {
    const factor = Math.pow(10, this.roundingPrecision);
    return Math.round(value * factor) / factor;
  }

  /**
   * Calculates tax components for a given base amount.
   * @param {number} baseAmount - Subtotal before tax and service charge.
   * @param {Object} options
   * @param {boolean} options.isVatExempt - Whether the sale is VAT-exempt.
   * @param {boolean} options.hasServiceCharge - Whether to apply service charge.
   * @returns {Object} breakdown
   */
  calculateBreakdown(baseAmount, options = {}) {
    const { isVatExempt = false, hasServiceCharge = false } = options;

    let netOfVat = baseAmount;
    let vatAmount = 0;

    if (!isVatExempt) {
      // If baseAmount is VAT-inclusive (typical in PH retail), we back it out
      // Formula: VATable Sales = Gross Sales / 1.12
      // However, usually in POS we start with Net or Gross. 
      // Let's assume baseAmount passed is the "VATable Sales" (Net of VAT) if not exempt.
      vatAmount = this.round(baseAmount * this.vatRate);
    } else {
      netOfVat = baseAmount;
      vatAmount = 0;
    }

    let serviceCharge = 0;
    if (hasServiceCharge) {
      // Service charge is typically applied to the net amount
      serviceCharge = this.round(baseAmount * this.serviceChargeRate);
    }

    const total = this.round(netOfVat + vatAmount + serviceCharge);

    return {
      netOfVat: this.round(netOfVat),
      vatAmount: this.round(vatAmount),
      serviceCharge: this.round(serviceCharge),
      total: total,
    };
  }

  /**
   * Helper to extract VAT from a VAT-inclusive amount.
   * @param {number} inclusiveAmount
   * @returns {Object}
   */
  fromVatInclusive(inclusiveAmount, options = {}) {
    const { isVatExempt = false, hasServiceCharge = false } = options;

    let netOfVat;
    let vatAmount;

    if (!isVatExempt) {
      netOfVat = inclusiveAmount / (1 + this.vatRate);
      vatAmount = inclusiveAmount - netOfVat;
    } else {
      netOfVat = inclusiveAmount;
      vatAmount = 0;
    }

    let serviceCharge = 0;
    if (hasServiceCharge) {
      serviceCharge = netOfVat * this.serviceChargeRate;
    }

    return this.calculateBreakdown(this.round(netOfVat), { isVatExempt, hasServiceCharge });
  }
}

export default new TaxEngine();
