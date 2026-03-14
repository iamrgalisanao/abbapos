/**
 * @typedef {Object} ModifierGroupConfig
 * @property {string} id - Unique group ID.
 * @property {string} name - Display name (e.g., 'Toppings').
 * @property {number} [minSelect=0] - Minimum number of modifiers to select.
 * @property {number} [maxSelect=1] - Maximum number of modifiers to select.
 * @property {Array<import('./Modifier.js').default>} modifiers - List of modifiers in this group.
 */

class ModifierGroup {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.minSelect = config.minSelect || 0;
    this.maxSelect = config.maxSelect || 1;
    this.modifiers = config.modifiers || [];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      minSelect: this.minSelect,
      maxSelect: this.maxSelect,
      modifiers: this.modifiers.map(m => m.toJSON()),
    };
  }
}

export default ModifierGroup;
