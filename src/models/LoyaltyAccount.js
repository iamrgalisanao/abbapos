/**
 * @typedef {Object} LoyaltyAccountConfig
 * @property {string} customerId - Reference to Customer ID.
 * @property {number} pointsBalance - Current point balance.
 * @property {string} tier - SILVER|GOLD|PLATINUM.
 */

class LoyaltyAccount {
  constructor(config) {
    this.customerId = config.customerId;
    this.pointsBalance = config.pointsBalance || 0;
    this.tier = config.tier || 'SILVER';
    this.history = config.history || []; // [{ date, type: 'EARN'|'REDEEM', points, referenceId }]
  }

  addPoints(points, referenceId) {
    this.pointsBalance += points;
    this.history.push({
      date: new Date().toISOString(),
      type: 'EARN',
      points,
      referenceId
    });
    this.updateTier();
  }

  redeemPoints(points, referenceId) {
    if (this.pointsBalance < points) {
      throw new Error('Insufficient loyalty points.');
    }
    this.pointsBalance -= points;
    this.history.push({
      date: new Date().toISOString(),
      type: 'REDEEM',
      points,
      referenceId
    });
    this.updateTier();
  }

  updateTier() {
    // Basic tier logic based on total points earned or current balance
    // For this baseline, we'll keep it simple
    if (this.pointsBalance > 5000) this.tier = 'PLATINUM';
    else if (this.pointsBalance > 1000) this.tier = 'GOLD';
    else this.tier = 'SILVER';
  }

  toJSON() {
    return { ...this };
  }
}

export default LoyaltyAccount;
