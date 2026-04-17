const OFFLINE_QUEUE_KEY = 'gurukul_offline_queue';

/**
 * Adds a request to the offline queue
 */
export const queueOfflineRequest = (functionName, args) => {
  const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  queue.push({
    id: Date.now(),
    functionName,
    args,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Gets all pending requests
 */
export const getOfflineQueue = () => {
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
};

/**
 * Removes a specific request from the queue
 */
const removeFromQueue = (id) => {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
};

/**
 * Syncs the offline queue with Google Sheets
 */
export const syncOfflineData = async (callGAS) => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  console.log(`Attempting to sync ${queue.length} offline items...`);

  for (const item of queue) {
    try {
      const response = await callGAS(item.functionName, ...item.args);
      if (response.success) {
        removeFromQueue(item.id);
        console.log(`Synced: ${item.functionName}`);
      }
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      // Stop syncing if we hit a network error again
      break;
    }
  }
};
