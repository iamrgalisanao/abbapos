/**
 * @typedef {Object} ModifierConfig
 * @property {string} id - Unique modifier ID.
 * @property {string} name - Display name (e.g., 'Extra Cheese').
 * @property {number} price - Additional cost (0 if free).
 */

class Modifier {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.price = config.price || 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
    };
  }
}

export default Modifier;
