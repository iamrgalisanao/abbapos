class RBACEngine {
  constructor() {
    // Permission mapping based on the RBAC Matrix
    this.permissions = {
      'Cashier': ['ORDER_CREATE', 'CATALOG_VIEW'],
      'Supervisor': ['ORDER_CREATE', 'CATALOG_VIEW', 'VOID_SALES'],
      'Manager': ['ORDER_CREATE', 'CATALOG_VIEW', 'VOID_SALES', 'REFUND'],
      'Admin': ['ORDER_CREATE', 'CATALOG_VIEW', 'VOID_SALES', 'REFUND', 'MANAGE_USERS'],
    };
  }

  /**
   * Checks if a role has a specific permission.
   * @param {string} role
   * @param {string} action
   * @returns {boolean}
   */
  can(role, action) {
    const rolePermissions = this.permissions[role];
    if (!rolePermissions) return false;
    return rolePermissions.includes(action);
  }

  /**
   * Helper to check current user's permission via AuthEngine.
   * @param {import('./auth.js').default} authEngine
   * @param {string} action
   * @returns {boolean}
   */
  check(authEngine, action) {
    const user = authEngine.getCurrentUser();
    if (!user) return false;
    return this.can(user.role, action);
  }
}

export default new RBACEngine();
