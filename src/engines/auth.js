import User from '../models/User.js';

class AuthEngine {
  constructor() {
    this.currentUser = null;
    // Mock user database for now
    this.users = [
      { id: '1', username: 'cashier1', password: 'password', role: 'Cashier', fullName: 'John Doe' },
      { id: '2', username: 'manager1', password: 'password', role: 'Manager', fullName: 'Jane Smith' },
      { id: '3', username: 'admin', password: 'password', role: 'Admin', fullName: 'Super Admin' },
    ];
  }

  /**
   * Authenticates a user.
   * @param {string} username
   * @param {string} password
   * @returns {User|null}
   */
  login(username, password) {
    const userData = this.users.find(u => u.username === username && u.password === password);
    if (userData) {
      const { password, ...cleanData } = userData;
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
