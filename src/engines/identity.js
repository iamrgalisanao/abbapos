import Store from '../models/Store.js';
import Terminal from '../models/Terminal.js';

/**
 * IdentityEngine handles the registration and verification of the Store and Terminal.
 */
class IdentityEngine {
  constructor() {
    this.store = null;
    this.terminal = null;
    this.isInitialized = false;
  }

  /**
   * Registers the store configuration.
   * @param {import('../models/Store.js').StoreConfig} config
   */
  registerStore(config) {
    this.store = new Store(config);
    return this.store;
  }

  /**
   * Registers the terminal configuration.
   * @param {import('../models/Terminal.js').TerminalConfig} config
   */
  registerTerminal(config) {
    this.terminal = new Terminal(config);
    return this.terminal;
  }

  /**
   * Verifies if the identity is fully configured for compliance.
   * @returns {boolean}
   */
  verifyIdentity() {
    if (!this.store || !this.terminal) return false;
    
    // Basic compliance checks
    const hasStoreInfo = !!(this.store.tin && this.store.branchCode);
    const hasTerminalInfo = !!(this.terminal.terminalId && this.terminal.ptuNumber);
    
    this.isInitialized = hasStoreInfo && hasTerminalInfo;
    return this.isInitialized;
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      store: this.store ? this.store.toJSON() : null,
      terminal: this.terminal ? this.terminal.toJSON() : null,
    };
  }
}

export default new IdentityEngine();
