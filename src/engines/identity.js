import Store from '../models/Store.js';
import Terminal from '../models/Terminal.js';
import persistenceManager from './PersistenceManager.js';

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
    persistenceManager.saveEngine('identity').catch(() => {});
    return this.store;
  }

  /**
   * Registers the terminal configuration.
   * @param {import('../models/Terminal.js').TerminalConfig} config
   */
  registerTerminal(config) {
    this.terminal = new Terminal(config);
    persistenceManager.saveEngine('identity').catch(() => {});
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

  exportState() {
    return JSON.stringify({
      store: this.store ? this.store.toJSON() : null,
      terminal: this.terminal ? this.terminal.toJSON() : null,
      isInitialized: this.isInitialized
    });
  }

  importState(stateData) {
    try {
      const state = JSON.parse(stateData);
      this.store = state.store ? new Store(state.store) : null;
      this.terminal = state.terminal ? new Terminal(state.terminal) : null;
      this.isInitialized = state.isInitialized;
    } catch (err) {
      console.error('Identity Engine Error: Failed to import state.', err);
    }
  }
}

export default new IdentityEngine();
