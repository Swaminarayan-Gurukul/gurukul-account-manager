import { queueOfflineRequest } from './utils/offlineSync';

const mutatingFunctions = ['addFoodPass', 'addGatePass', 'addDonation', 'addVoucher'];

/**
 * Raw execution of GAS function without queuing
 * @param {string} functionName 
 * @param  {...any} args 
 * @returns {Promise<any>}
 */
export const execGAS = (functionName, ...args) => {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler((error) => {
          console.error(`GAS Execution Error in ${functionName}:`, error);
          reject(error);
        })[functionName](...args);
    } else {
      console.warn(`google.script.run is not available. Mocking ${functionName}`);
      setTimeout(() => {
        resolve({ success: true, message: 'Mocked response', mocked: true });
      }, 500);
    }
  });
};

/**
 * A helper to call Google Apps Script functions
 * Mutations (add*) are ALWAYS queued first and processed in background.
 * @param {string} functionName
 * @param {...any} args
 * @returns {Promise<any>}
 */
export const callGAS = (functionName, ...args) => {
  // Always queue mutating functions to ensure sequential processing and delay
  if (mutatingFunctions.includes(functionName)) {
    console.log(`Queuing transaction: ${functionName}`);
    queueOfflineRequest(functionName, args);
    return Promise.resolve({ success: true, offline: true, message: 'Transaction queued' });
  }

  // Read operations are executed immediately
  return execGAS(functionName, ...args);
};
