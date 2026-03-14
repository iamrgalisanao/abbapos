/**
 * @typedef {Object} UserConfig
 * @property {string} id - Unique user ID.
 * @property {string} username - Login username.
 * @property {string} role - User role (e.g., 'Cashier', 'Manager', 'Admin').
 * @property {string} fullName - Display name.
 */

class User {
  /**
   * @param {UserConfig} config
   */
  constructor(config) {
    this.id = config.id;
    this.username = config.username;
    this.role = config.role;
    this.fullName = config.fullName;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      fullName: this.fullName,
    };
  }
}

export default User;
