/**
 * @typedef {Object} CategoryConfig
 * @property {string} id - Unique category ID.
 * @property {string} name - Display name (e.g., 'Beverages').
 * @property {string} [description] - Optional description.
 */

class Category {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description || '';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
    };
  }
}

export default Category;
