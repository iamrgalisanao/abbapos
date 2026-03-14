import persistenceManager from './PersistenceManager.js';
import auditEngine from './audit/index.js';

/**
 * SyncEngine manages a local queue of data actions that need to be synchronized with the cloud.
 * It ensures idempotency and survives application restarts via persistence.
 */
class SyncEngine {
  constructor() {
    this.queue = []; // Array of { id, type, data, status, timestamp, attempts }
    this.isProcessing = false;
  }

  /**
   * Enqueues a new action for synchronization.
   * @param {string} type - ORDER, AUDIT, INVENTORY, etc.
   * @param {Object} data - The payload to sync.
   * @returns {string} The unique sync ID.
   */
  enqueue(type, data) {
    const syncId = `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const entry = {
      id: syncId,
      type,
      data,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    this.queue.push(entry);
    
    // Proactively save state
    this.saveState();

    console.log(`[SYNC] Enqueued ${type}: ${syncId}`);
    return syncId;
  }

  /**
   * Processes the queue sequentially. (Mocked for baseline)
   * @param {Function} [mockSender] - Optional function to simulate network transmission.
   */
  async processQueue(mockSender = null) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const pending = this.queue.filter(item => item.status === 'PENDING' || item.status === 'FAILED');
    
    for (const item of pending) {
      item.attempts += 1;
      try {
        if (mockSender) {
          await mockSender(item);
        } else {
          // Default mock: always succeed if no sender provided
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        item.status = 'SYNCED';
        item.syncedAt = new Date().toISOString();
      } catch (err) {
        item.status = 'FAILED';
        item.lastError = err.message;
        console.error(`[SYNC] Failed to sync ${item.id}: ${err.message}`);
      }
    }

    this.saveState();
    this.isProcessing = false;
  }

  saveState() {
    persistenceManager.saveEngine('sync').catch(err => {
      console.error('Persistence Error: Failed to save sync state.', err.message);
    });
  }

  exportState() {
    return JSON.stringify({
      queue: this.queue
    });
  }

  importState(stateData) {
    try {
      const state = JSON.parse(stateData);
      this.queue = state.queue || [];
    } catch (err) {
      console.error('Sync Engine Error: Failed to import state.', err.message);
    }
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'PENDING').length,
      failed: this.queue.filter(i => i.status === 'FAILED').length,
      synced: this.queue.filter(i => i.status === 'SYNCED').length
    };
  }
}

const instance = new SyncEngine();
persistenceManager.registerEngine('sync', instance);
export default instance;
