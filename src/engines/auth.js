import User from '../models/User.js';

class AuthEngine {
  constructor() {
    this.currentUser = null;
    // In a real system, these would BE HASHED in a DB.
    // We use a base64-simulated hash for this baseline to avoid plaintext in memory.
    this.users = [
      { id: '1', username: 'cashier1', passwordHash: 'cGFzc3dvcmQ=', role: 'Cashier', fullName: 'John Doe' },
      { id: '2', username: 'manager1', passwordHash: 'cGFzc3dvcmQ=', role: 'Manager', fullName: 'Jane Smith' },
      { id: '3', username: 'admin', passwordHash: 'cGFzc3dvcmQ=', role: 'Admin', fullName: 'Super Admin' },
    ];
  }

  /**
   * Authenticates a user.
   * @param {string} username
   * @param {string} password
   * @returns {User|null}
   */
  login(username, password) {
    const inputHash = Buffer.from(password).toString('base64');
    const userData = this.users.find(u => u.username === username && u.passwordHash === inputHash);
    
    if (userData) {
      const { passwordHash, ...cleanData } = userData;
      this.currentUser = new User(cleanData);
      return this.currentUser;
    }
    return null;
  }

  logout() {
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }
}

export default new AuthEngine();
