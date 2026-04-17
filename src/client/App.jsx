import { useState, useEffect } from 'react';
import VoucherForm from './components/VoucherForm';
import FoodPassForm from './components/FoodPassForm';
import GatePassForm from './components/GatePassForm';
import DonationForm from './components/DonationForm';
import VoucherList from './components/VoucherList';
import { syncOfflineData, getOfflineQueue } from './utils/offlineSync';
import { callGAS } from './GAS';

const App = () => {
  const [voucherRefresh, setVoucherRefresh] = useState(0);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'done'

  const performSync = async () => {
    if (getOfflineQueue().length === 0) return;
    
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      await syncOfflineData(callGAS);
      setOfflineCount(getOfflineQueue().length);
      setSyncStatus('done');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus('idle');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync offline data when coming back online
  useEffect(() => {
    const handleSync = () => {
      setOfflineCount(getOfflineQueue().length);
      if (navigator.onLine) performSync();
    };

    window.addEventListener('online', handleSync);
    
    // Initial check on mount
    const count = getOfflineQueue().length;
    setOfflineCount(count);
    if (navigator.onLine && count > 0) performSync();

    // Check periodically for offline items
    const interval = setInterval(() => {
      setOfflineCount(getOfflineQueue().length);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleSync);
      clearInterval(interval);
    };
  }, []);

  const handleVoucherAdded = () => {
    setVoucherRefresh((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Progress Bar for Syncing */}
          {syncStatus === 'syncing' && (
            <div className="absolute top-0 left-0 h-1 bg-blue-500 w-full animate-progress-indefinite"></div>
          )}
          
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <img
              className="w-48 md:w-64"
              src="https://gurukul.org/wp-content/uploads/2023/09/head-logo-1.svg"
              alt="Gurukul Logo"
            />
            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Accounts Manager</h1>
          </div>

          <div className="flex flex-col md:items-end gap-2">
            {/* Sync Status Indicators */}
            <div className="flex items-center gap-3">
              {syncStatus === 'syncing' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 animate-pulse">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Syncing Data...
                </div>
              )}

              {syncStatus === 'done' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sync Done
                </div>
              )}

              {offlineCount > 0 && syncStatus !== 'syncing' && (
                <button 
                  onClick={performSync}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100 hover:bg-amber-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V4a1 1 0 10-2 0v7.586l-1.293-1.293z" /><path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                  {offlineCount} Stored Offline
                </button>
              )}
            </div>

            <div className="text-right hidden md:block text-slate-500 text-sm">
              <p className="font-medium">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>Shree Swaminarayan Gurukul, Ahmedabad</p>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {/* Quick Actions Section: Food, Gate, Donation Side by Side */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
              <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider">Passes & Donations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100">
                <FoodPassForm />
              </div>
              <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100">
                <GatePassForm />
              </div>
              <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100">
                <DonationForm />
              </div>
            </div>
          </section>
          
           {/* Top Section: Voucher Form (Full or Partial) */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <VoucherForm onVoucherAdded={handleVoucherAdded} />
          </section>

          {/* History Section: Voucher List */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <VoucherList refreshTrigger={voucherRefresh} />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-500 mb-4">Designed & Developed By</p>
          <a
            href="http://sahajananddigital.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center group transition-transform hover:scale-105"
          >
            <img 
              src="https://sahajananddigital.in/images/logo.png" 
              alt="Sahajanand Digital Logo" 
              className="w-40 md:w-48 h-auto mb-2 grayscale group-hover:grayscale-0 transition-all" 
            />
            <span className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">Sahajanand Digital</span>
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;

