/**
 * @typedef {Object} CustomerConfig
 * @property {string} id - Unique customer ID.
 * @property {string} name - Customer name.
 * @property {string} phone - Unique phone number (primary lookup).
 * @property {string} email - Contact email.
 */

class Customer {
  constructor(config) {
    this.id = config.id || `CUS-${Date.now()}`;
    this.name = config.name;
    this.phone = config.phone;
    this.email = config.email;
    this.createdAt = config.createdAt || new Date().toISOString();
  }

  toJSON() {
    return { ...this };
  }
}

export default Customer;
