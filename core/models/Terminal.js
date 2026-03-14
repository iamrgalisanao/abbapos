/**
 * @typedef {Object} TerminalConfig
 * @property {string} terminalId - Unique ID for the terminal (e.g., POS-01).
 * @property {string} serialNumber - Hardware or Virtual serial number.
 * @property {string} accreditationNumber - BIR Accreditation Number.
 * @property {string} accreditationDate - Validity date of accreditation.
 * @property {string} ptuNumber - Permit to Use number.
 * @property {string} ptuDate - Validity date of PTU.
 */

class Terminal {
  /**
   * @param {TerminalConfig} config
   */
  constructor(config) {
    this.terminalId = config.terminalId;
    this.serialNumber = config.serialNumber;
    this.accreditationNumber = config.accreditationNumber;
    this.accreditationDate = config.accreditationDate;
    this.ptuNumber = config.ptuNumber;
    this.ptuDate = config.ptuDate;
  }

  toJSON() {
    return {
      terminalId: this.terminalId,
      serialNumber: this.serialNumber,
      accreditationNumber: this.accreditationNumber,
      accreditationDate: this.accreditationDate,
      ptuNumber: this.ptuNumber,
      ptuDate: this.ptuDate,
    };
  }
}

export default Terminal;
