import AuditLog from '../../models/AuditLog.js';
import identityEngine from '../identity.js';
import authEngine from '../auth.js';
import persistenceManager from '../PersistenceManager.js';

class ComplianceAuditEngine {
  constructor() {
    // In a real system, this would be a protected database or append-only file.
    this.logs = [];
  }

  /**
   * Records a sensitive action in the audit log.
   * @param {string} action - Action name (e.g., 'VOID', 'REPRINT').
   * @param {string} details - Summary of the action.
   * @param {Object} [metadata] - Data related to the action.
   */
  log(action, details, metadata = {}) {
    const user = authEngine.getCurrentUser();
    const terminal = identityEngine.getStatus().terminal;

    const entry = new AuditLog({
      userId: user ? user.id : 'SYSTEM',
      terminalId: terminal ? terminal.terminalId : 'UNKNOWN',
      action: action,
      details: details,
      metadata: metadata,
    });

    // In-memory push for now
    this.logs.push(entry.toJSON());
    
    // Auto-save audit state
    persistenceManager.saveEngine('audit').catch(err => {
      console.error('Persistence Error: Failed to save audit engine state.', err);
    });

    // In a real environment, we would trigger a write to a secure storage here.
    console.log(`[AUDIT] ${entry.timestamp} | ${entry.userId} | ${entry.action} | ${entry.details}`);
    
    return entry;
  }

  /**
   * Retrieves all logs (for reporting/verification).
   * @returns {Array}
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Exports logs for persistence.
   * @returns {string} JSON string of logs.
   */
  exportLogs() {
    return JSON.stringify(this.logs);
  }

  /**
   * Imports logs from a persistent store.
   * @param {string} logsData - JSON string of logs.
   */
  importLogs(logsData) {
    try {
      this.logs = JSON.parse(logsData);
    } catch (err) {
      console.error('Audit Engine Error: Failed to import logs.', err);
    }
  }

  exportState() {
    return JSON.stringify({
      logs: this.logs
    });
  }

  importState(stateData) {
    try {
      const state = JSON.parse(stateData);
      this.logs = state.logs || [];
    } catch (err) {
      console.error('Audit Engine Error: Failed to import state.', err);
    }
  }
}

export default new ComplianceAuditEngine();
