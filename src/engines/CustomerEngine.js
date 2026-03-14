import Customer from '../models/Customer.js';
import LoyaltyAccount from '../models/LoyaltyAccount.js';
import auditEngine from './audit/index.js';

class CustomerEngine {
  constructor() {
    this.customers = new Map(); // phone -> Customer
    this.loyaltyAccounts = new Map(); // customerId -> LoyaltyAccount
  }

  /**
   * Registers a new customer and initializes a loyalty account.
   * @param {Object} config 
   * @returns {Object} { customer, loyaltyAccount }
   */
  registerCustomer(config) {
    if (this.customers.has(config.phone)) {
      throw new Error(`Customer with phone ${config.phone} already exists.`);
    }

    const customer = new Customer(config);
    const loyaltyAccount = new LoyaltyAccount({ customerId: customer.id });

    this.customers.set(customer.phone, customer);
    this.loyaltyAccounts.set(customer.id, loyaltyAccount);

    auditEngine.log('CUSTOMER_REGISTERED', `Customer ${customer.name} (${customer.phone}) registered.`, {
      customerId: customer.id,
      phone: customer.phone
    });

    return { customer, loyaltyAccount };
  }

  /**
   * Finds a customer by phone number.
   * @param {string} phone 
   * @returns {Customer|null}
   */
  findCustomerByPhone(phone) {
    return this.customers.get(phone) || null;
  }

  /**
   * Retrieves loyalty account for a customer.
   * @param {string} customerId 
   * @returns {LoyaltyAccount|null}
   */
  getLoyaltyAccount(customerId) {
    return this.loyaltyAccounts.get(customerId) || null;
  }

  /**
   * Awards points to a customer based on spending.
   * Standard Rate: 1pt per ₱100.
   * @param {string} customerId 
   * @param {number} amountPaid 
   * @param {string} referenceId 
   */
  awardPoints(customerId, amountPaid, referenceId) {
    const account = this.getLoyaltyAccount(customerId);
    if (!account) return;

    const points = Math.floor(amountPaid / 100);
    if (points > 0) {
      account.addPoints(points, referenceId);
      auditEngine.log('LOYALTY_EARN', `Awarded ${points} points to customer ${customerId} for ${referenceId}`, {
        customerId,
        points,
        referenceId
      });
    }
  }

  /**
   * Redeems points for a transaction.
   * Rate: 1pt = ₱1 discount.
   * @param {string} customerId 
   * @param {number} points 
   * @param {string} referenceId 
   * @returns {number} discountAmount
   */
  redeemPoints(customerId, points, referenceId) {
    const account = this.getLoyaltyAccount(customerId);
    if (!account) throw new Error('Loyalty account not found.');

    account.redeemPoints(points, referenceId);
    
    auditEngine.log('LOYALTY_REDEEM', `Customer ${customerId} redeemed ${points} points for ${referenceId}`, {
      customerId,
      points,
      referenceId
    });

    return points; // 1:1 conversion for this baseline
  }

  exportState() {
    return JSON.stringify({
      customers: Array.from(this.customers.entries()),
      loyaltyAccounts: Array.from(this.loyaltyAccounts.entries()).map(([k, v]) => [k, v.toJSON ? v.toJSON() : v])
    });
  }

  importState(stateData) {
    try {
      const state = JSON.parse(stateData);
      this.customers = new Map(state.customers || []);
      
      // Need to re-instantiate LoyaltyAccount objects to preserve methods
      const loyaltyEntries = (state.loyaltyAccounts || []).map(([k, v]) => {
        return [k, new LoyaltyAccount(v)];
      });
      this.loyaltyAccounts = new Map(loyaltyEntries);
    } catch (err) {
      console.error('Customer Engine Error: Failed to import state.', err);
    }
  }
}

const instance = new CustomerEngine();
persistenceManager.registerEngine('customer', instance);
export default instance;
