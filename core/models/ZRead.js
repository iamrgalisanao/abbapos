/**
 * @typedef {Object} ZReadConfig
 * @property {number} zCounter - Sequential Z-Read number.
 * @property {string} timestamp - Time of generation.
 * @property {string} firstReceipt - First OR number in the period.
 * @property {string} lastReceipt - Last OR number in the period.
 * @property {number} grossSales - Total sales including tax and discounts.
 * @property {number} netSales - Total sales minus discounts.
 * @property {number} vatableSales - Amount subject to VAT.
 * @property {number} vatAmount - Total VAT collected.
 * @property {number} vatExemptSales - Amount exempt from VAT.
 * @property {number} zeroRatedSales - Amount with 0% VAT.
 * @property {number} discountTotal - Total discounts applied.
 * @property {number} serviceCharge - Total service charges collected.
 * @property {number} oldGrandTotal - Cumulative grand total before this Z-Read.
 * @property {number} newGrandTotal - Cumulative grand total after this Z-Read.
 */

class ZRead {
  constructor(config) {
    Object.assign(this, config);
  }

  toJSON() {
    return { ...this };
  }
}

export default ZRead;
