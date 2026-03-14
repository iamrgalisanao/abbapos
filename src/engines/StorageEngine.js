import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * StorageEngine provides a low-level utility for atomic file writes.
 * Atomic writes are achieved by writing to a temporary file first and then renaming it.
 */
class StorageEngine {
  constructor() {
    this.baseDir = path.resolve(process.cwd(), '.data');
    this.isInitialized = false;
    this.locks = new Map(); // filename -> Promise (queue)
  }

  /**
   * Ensures the data directory exists.
   */
  async ensureDir() {
    if (this.isInitialized) return;
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      this.isInitialized = true;
    } catch (err) {
      console.error('Storage Engine Error: Failed to create data directory.', err);
      throw err;
    }
  }

  /**
   * Saves data to a file atomically.
   * @param {string} filename - Filename (e.g., 'audit.json').
   * @param {string} data - JSON string or raw text.
   */
  async save(filename, data) {
    // Basic queue/lock for the specific file
    const previousLock = this.locks.get(filename) || Promise.resolve();
    
    const currentLock = (async () => {
      await previousLock;
      await this.ensureDir();
      const targetPath = path.join(this.baseDir, filename);
      const tempPath = `${targetPath}.${Math.random().toString(36).substring(2)}.tmp`;

      try {
        await fs.writeFile(tempPath, data, { encoding: 'utf8', flag: 'w' });
        await fs.rename(tempPath, targetPath);
      } catch (err) {
        console.error(`Storage Engine Error: Failed to save ${filename}.`, err);
        try { await fs.unlink(tempPath); } catch {}
        throw err;
      }
    })();

    this.locks.set(filename, currentLock.catch(() => {})); // Prevent chain break on error
    return currentLock;
  }

  /**
   * Loads data from a file.
   * @param {string} filename 
   * @returns {Promise<string|null>}
   */
  async load(filename) {
    await this.ensureDir();
    const targetPath = path.join(this.baseDir, filename);
    
    try {
      return await fs.readFile(targetPath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') return null; // File doesn't exist yet
      console.error(`Storage Engine Error: Failed to load ${filename}.`, err);
      throw err;
    }
  }

  /**
   * Deletes a file.
   * @param {string} filename 
   */
  async delete(filename) {
    await this.ensureDir();
    const targetPath = path.join(this.baseDir, filename);
    try {
      await fs.unlink(targetPath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

export default new StorageEngine();
