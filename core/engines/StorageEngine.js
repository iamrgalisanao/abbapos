/**
 * Environment-agnostic StorageEngine.
 * Handles persistence using FS in Node.js and Memory/LocalStorage in Browser.
 */
class StorageEngine {
  constructor() {
    this.isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    this.memoryStorage = new Map();
    this.locks = new Map();
    this.initialized = false;
    
    // Lazy-loaded Node modules
    this.fs = null;
    this.path = null;
    this.baseDir = null;
  }

  async init() {
    if (this.initialized) return;

    if (!this.isBrowser) {
      // We are in Node.js - hide the imports from Vite static analysis
      const fsModuleName = 'node:fs/promises';
      const pathModuleName = 'node:path';
      const fsModule = await import(/* @vite-ignore */ fsModuleName);
      const pathModule = await import(/* @vite-ignore */ pathModuleName);
      this.fs = fsModule.default || fsModule;
      this.path = pathModule.default || pathModule;
      const cwd = typeof process !== 'undefined' ? process.cwd() : '.';
      this.baseDir = this.path.resolve(cwd, '.data');
      
      try {
        await this.fs.mkdir(this.baseDir, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') throw err;
      }
    }
    
    this.initialized = true;
  }

  async save(filename, data) {
    await this.init();

    if (this.isBrowser) {
      this.memoryStorage.set(filename, data);
      // Optional: Backup to localStorage if needed
      try {
        localStorage.setItem(`abbapos_${filename}`, data);
      } catch (e) {}
      return;
    }

    // Node.js Implementation
    const previousLock = this.locks.get(filename) || Promise.resolve();
    const currentLock = (async () => {
      await previousLock;
      const targetPath = this.path.join(this.baseDir, filename);
      const tempPath = `${targetPath}.${Math.random().toString(36).substring(2)}.tmp`;

      try {
        await this.fs.writeFile(tempPath, data, 'utf8');
        await this.fs.rename(tempPath, targetPath);
      } catch (err) {
        console.error(`Storage Error: Failed to save ${filename}`, err);
        try { await this.fs.unlink(tempPath); } catch {}
        throw err;
      }
    })();

    this.locks.set(filename, currentLock.catch(() => {}));
    return currentLock;
  }

  async load(filename) {
    await this.init();

    if (this.isBrowser) {
      if (this.memoryStorage.has(filename)) {
        return this.memoryStorage.get(filename);
      }
      return localStorage.getItem(`abbapos_${filename}`);
    }

    // Node.js Implementation
    const targetPath = this.path.join(this.baseDir, filename);
    try {
      return await this.fs.readFile(targetPath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  async delete(filename) {
    await this.init();

    if (this.isBrowser) {
      this.memoryStorage.delete(filename);
      localStorage.removeItem(`abbapos_${filename}`);
      return;
    }

    const targetPath = this.path.join(this.baseDir, filename);
    try {
      await this.fs.unlink(targetPath);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

export default new StorageEngine();
