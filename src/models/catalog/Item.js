/**
 * @typedef {Object} ItemConfig
 * @property {string} id - Unique item ID.
 * @property {string} name - Display name.
 * @property {string} categoryId - Reference to a Category ID.
 * @property {number} basePrice - Base cost before modifiers.
 * @property {string} [description] - Optional description.
 * @property {Array<import('./ModifierGroup.js').default>} [modifierGroups] - Linked modifier groups.
 */

class Item {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.categoryId = config.categoryId;
    this.basePrice = config.basePrice;
    this.description = config.description || '';
    this.modifierGroups = config.modifierGroups || [];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      categoryId: this.categoryId,
      basePrice: this.basePrice,
      description: this.description,
      modifierGroups: this.modifierGroups.map(mg => mg.toJSON()),
    };
  }
}

export default Item;
