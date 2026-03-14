import storageEngine from './StorageEngine.js';

class PersistenceManager {
  constructor() {
    this.engines = {};
  }

  /**
   * Registers an engine for persistence.
   * @param {string} name 
   * @param {Object} engine 
   */
  registerEngine(name, engine) {
    this.engines[name] = engine;
  }

  /**
   * Loads all engine states from disk.
   */
  async bootstrap() {
    console.log('[PERSISTENCE] Bootstrapping system state...');
    for (const [name, engine] of Object.entries(this.engines)) {
      try {
        const data = await storageEngine.load(`${name}.json`);
        if (data) {
          engine.importState(data);
          console.log(`- Loaded ${name} state.`);
        }
      } catch (err) {
        console.error(`- Failed to load ${name} state:`, err.message);
      }
    }
    console.log('[PERSISTENCE] Bootstrap complete.');
  }

  /**
   * Saves all engine states to disk.
   */
  async saveAll() {
    const saves = Object.entries(this.engines).map(async ([name, engine]) => {
      try {
        const state = engine.exportState();
        await storageEngine.save(`${name}.json`, state);
      } catch (err) {
        console.error(`- Failed to save ${name} state:`, err.message);
      }
    });

    await Promise.all(saves);
  }

  /**
   * Saves a specific engine state.
   * @param {string} engineName 
   */
  async saveEngine(engineName) {
    const engine = this.engines[engineName];
    if (!engine) return;
    try {
      const state = engine.exportState();
      await storageEngine.save(`${engineName}.json`, state);
    } catch (err) {
      console.error(`- Failed to save ${engineName} state:`, err.message);
    }
  }
}

export default new PersistenceManager();
