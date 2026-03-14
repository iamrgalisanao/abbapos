import Category from '../../models/catalog/Category.js';
import Item from '../../models/catalog/Item.js';
import ModifierGroup from '../../models/catalog/ModifierGroup.js';
import Modifier from '../../models/catalog/Modifier.js';

class CatalogEngine {
  constructor() {
    this.categories = new Map();
    this.items = new Map();
    this.initialized = false;
  }

  /**
   * Loads catalog data.
   * @param {Object} data 
   */
  loadCatalog(data) {
    // Clear current
    this.categories.clear();
    this.items.clear();

    // Map categories
    (data.categories || []).forEach(cat => {
      this.categories.set(cat.id, new Category(cat));
    });

    // Map items
    (data.items || []).forEach(itemData => {
      const modifierGroups = (itemData.modifierGroups || []).map(groupData => {
        const modifiers = (groupData.modifiers || []).map(modData => new Modifier(modData));
        return new ModifierGroup({ ...groupData, modifiers });
      });
      
      const item = new Item({ ...itemData, modifierGroups });
      this.items.set(item.id, item);
    });

    this.initialized = true;
  }

  getCategory(id) {
    return this.categories.get(id);
  }

  getItem(id) {
    return this.items.get(id);
  }

  getMenu() {
    return {
      categories: Array.from(this.categories.values()).map(c => c.toJSON()),
      items: Array.from(this.items.values()).map(i => i.toJSON()),
    };
  }

  /**
   * Validates a selection of modifiers for an item.
   * @param {string} itemId 
   * @param {Object} selection - Map of groupId -> [modifierIds]
   * @returns {boolean}
   */
  validateSelection(itemId, selection) {
    const item = this.getItem(itemId);
    if (!item) return false;

    for (const group of item.modifierGroups) {
      const selectedIds = selection[group.id] || [];
      if (selectedIds.length < group.minSelect || selectedIds.length > group.maxSelect) {
        return false;
      }
    }
    return true;
  }
}

export default new CatalogEngine();
