/**
 * @typedef {Object} AuditLogEntry
 * @property {string} timestamp - ISO timestamp of the action.
 * @property {string} userId - ID of the operator.
 * @property {string} terminalId - ID of the terminal where action occurred.
 * @property {string} action - The action performed (e.g., 'REPRINT', 'VOID').
 * @property {string} details - Human-readable description.
 * @property {Object} [metadata] - Additional technical details (before/after states).
 */

class AuditLog {
  /**
   * @param {AuditLogEntry} entry
   */
  constructor(entry) {
    this.timestamp = entry.timestamp || new Date().toISOString();
    this.userId = entry.userId;
    this.terminalId = entry.terminalId;
    this.action = entry.action;
    this.details = entry.details;
    this.metadata = entry.metadata || {};
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      userId: this.userId,
      terminalId: this.terminalId,
      action: this.action,
      details: this.details,
      metadata: this.metadata,
    };
  }
}

export default AuditLog;
