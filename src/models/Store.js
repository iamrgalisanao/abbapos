/**
 * @typedef {Object} StoreConfig
 * @property {string} storeName - Name of the store.
 * @property {string} tin - Taxpayer Identification Number (TIN).
 * @property {string} branchCode - BIR-assigned branch code (e.g., 000).
 * @property {string} address - Physical address of the branch.
 * @property {string} vatReg - VAT Registration Number.
 * @property {string} owner - Entity or Individual owner.
 */

class Store {
  /**
   * @param {StoreConfig} config
   */
  constructor(config) {
    this.storeName = config.storeName;
    this.tin = config.tin;
    this.branchCode = config.branchCode;
    this.address = config.address;
    this.vatReg = config.vatReg;
    this.owner = config.owner;
  }

  toJSON() {
    return {
      storeName: this.storeName,
      tin: this.tin,
      branchCode: this.branchCode,
      address: this.address,
      vatReg: this.vatReg,
      owner: this.owner,
    };
  }
}

export default Store;
