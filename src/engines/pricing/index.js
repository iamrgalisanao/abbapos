import auditEngine from '../audit/index.js';

class PricingEngine {
  /**
   * Calculates the net price of an item after applying discounts.
   * @param {Object} item - line item object
   * @param {Array} discounts - list of discount objects { type: 'PERCENT'|'AMOUNT', value, reason }
   * @returns {Object} { netPrice, totalDiscount }
   */
  calculateItemPrice(item, discounts = []) {
    let totalDiscount = 0;
    const baseAmount = item.basePrice + (item.modifiers || []).reduce((sum, m) => sum + (m.price || 0), 0);
    const qty = item.qty || 1;
    const lineSubtotal = baseAmount * qty;

    discounts.forEach(d => {
      if (d.type === 'PERCENT') {
        const disc = lineSubtotal * (d.value / 100);
        totalDiscount += disc;
      } else if (d.type === 'AMOUNT') {
        totalDiscount += d.value * qty;
      }
    });

    return {
      netPrice: Math.max(0, lineSubtotal - totalDiscount),
      totalDiscount
    };
  }

  /**
   * Specialized logic for Senior Citizen / PWD discounts.
   * Logic: (VAT-inclusive Price / 1.12) * 0.80
   * @param {number} vatInclusivePrice 
   * @returns {Object} { netPrice, discountAmount, vatExemptAmount }
   */
  applySCDiscount(vatInclusivePrice) {
    const vatExemptAmount = vatInclusivePrice / 1.12;
    const netPrice = vatExemptAmount * 0.80;
    const discountAmount = vatExemptAmount * 0.20;
    
    return {
      netPrice,
      discountAmount,
      vatExemptAmount,
      totalReduction: vatInclusivePrice - netPrice
    };
  }
}

export default new PricingEngine();
