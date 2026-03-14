/**
 * @typedef {Object} SupplierConfig
 * @property {string} id - Unique supplier ID.
 * @property {string} name - Vendor/Supplier name.
 * @property {string} contactPerson - Primary contact name.
 * @property {string} email - Contact email.
 * @property {string} phone - Contact phone number.
 * @property {string} tin - Tax Identification Number.
 * @property {string} address - Physical address.
 */

class Supplier {
  constructor(config) {
    this.id = config.id || `SUP-${Date.now()}`;
    this.name = config.name;
    this.contactPerson = config.contactPerson;
    this.email = config.email;
    this.phone = config.phone;
    this.tin = config.tin;
    this.address = config.address;
  }

  toJSON() {
    return { ...this };
  }
}

export default Supplier;
