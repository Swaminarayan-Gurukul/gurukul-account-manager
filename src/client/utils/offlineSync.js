import { execGAS } from '../GAS';

const OFFLINE_QUEUE_KEY = 'gurukul_offline_queue';
const SYNC_LOCK_KEY = 'gurukul_sync_in_progress';

export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

const saveQueue = (queue) => {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const queueOfflineRequest = (functionName, args) => {
  const queue = getOfflineQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    functionName,
    args,
    timestamp: new Date().toISOString(),
    status: 'pending' // pending, sending
  });
  saveQueue(queue);
};

const removeFromQueue = (id) => {
  const queue = getOfflineQueue().filter(item => item.id !== id);
  saveQueue(queue);
};

export const syncOfflineData = async () => {
  // 1. Simple cross-tab lock check
  const lock = localStorage.getItem(SYNC_LOCK_KEY);
  if (lock && Date.now() - parseInt(lock) < 30000) { // 30s lock safety
    return;
  }

  const queue = getOfflineQueue();
  const pendingItems = queue.filter(item => item.status === 'pending');
  
  if (pendingItems.length === 0) return;

  // 2. Set Lock
  localStorage.setItem(SYNC_LOCK_KEY, Date.now().toString());

  try {
    for (const item of pendingItems) {
      if (!navigator.onLine) break;

      // 3. Mark as sending in localStorage immediately (atomic update)
      const currentQueue = getOfflineQueue();
      const itemIdx = currentQueue.findIndex(q => q.id === item.id);
      if (itemIdx === -1 || currentQueue[itemIdx].status === 'sending') continue;
      
      currentQueue[itemIdx].status = 'sending';
      saveQueue(currentQueue);

      try {
        const response = await execGAS(item.functionName, ...item.args);
        if (response && response.success) {
          removeFromQueue(item.id);
          console.log(`Synced: ${item.functionName}`);
        } else {
          throw new Error("Server error");
        }
      } catch (error) {
        console.error(`Sync failed for ${item.id}:`, error);
        // Reset status to pending so it can be retried later
        const resetQueue = getOfflineQueue();
        const resetIdx = resetQueue.findIndex(q => q.id === item.id);
        if (resetIdx !== -1) {
          resetQueue[resetIdx].status = 'pending';
          saveQueue(resetQueue);
        }
        break; // Stop processing further items for now
      }
    }
  } finally {
    localStorage.removeItem(SYNC_LOCK_KEY);
  }
};
