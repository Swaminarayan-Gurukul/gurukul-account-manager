import { queueOfflineRequest } from './utils/offlineSync';

/**
 * A helper to call Google Apps Script functions
 * @param {string} functionName
 * @param {...any} args
 * @returns {Promise<any>}
 */
export const callGAS = (functionName, ...args) => {
  return new Promise((resolve, reject) => {
    // Check if we are online
    if (!navigator.onLine) {
      console.warn(`Browser is offline. Queueing ${functionName}`);
      queueOfflineRequest(functionName, args);
      resolve({ success: true, offline: true, message: 'Queued for offline sync' });
      return;
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler((error) => {
          console.error(`GAS Error in ${functionName}:`, error);
          // If it's likely a network error, queue it
          if (!navigator.onLine || error.message?.includes('network') || error.message?.includes('failed to fetch')) {
            queueOfflineRequest(functionName, args);
            resolve({ success: true, offline: true, message: 'Network failed. Queued for offline sync' });
          } else {
            reject(error);
          }
        })[functionName](...args);
    } else {
      console.warn(`google.script.run is not available. Mocking ${functionName}`);
      // Mocking for local development
      setTimeout(() => {
        resolve({ success: true, message: 'Mocked response' });
      }, 500);
    }
  });
};
