import { useState, useEffect } from 'react';
import VoucherForm from './components/VoucherForm';
import FoodPassForm from './components/FoodPassForm';
import GatePassForm from './components/GatePassForm';
import DonationForm from './components/DonationForm';
import VoucherList from './components/VoucherList';
import Dashboard from './components/Dashboard';
import { syncOfflineData, getOfflineQueue } from './utils/offlineSync';
import { callGAS } from './GAS';

const App = () => {
  const [activeTab, setActiveTab] = useState('forms'); // 'forms' or 'dashboard'
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

  useEffect(() => {
    const handleSync = () => {
      setOfflineCount(getOfflineQueue().length);
      if (navigator.onLine) performSync();
    };

    window.addEventListener('online', handleSync);
    const count = getOfflineQueue().length;
    setOfflineCount(count);
    if (navigator.onLine && count > 0) performSync();

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
        <header className="flex flex-col md:flex-row items-center justify-between mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
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
            <div className="flex items-center gap-3">
              {syncStatus === 'syncing' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 animate-pulse">
                  Syncing...
                </div>
              )}
              {syncStatus === 'done' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                  Sync Done
                </div>
              )}
              {offlineCount > 0 && syncStatus !== 'syncing' && (
                <button onClick={performSync} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                  {offlineCount} Offline
                </button>
              )}
            </div>
            <div className="text-right hidden md:block text-slate-500 text-sm font-medium">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 w-fit">
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'forms' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
              : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Entry Forms
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dashboard' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
              : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Live Dashboard
          </button>
        </div>

        <main>
          {activeTab === 'forms' ? (
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                  <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider">Passes & Donations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><FoodPassForm /></div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><GatePassForm /></div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><DonationForm /></div>
                </div>
              </section>
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <VoucherForm onVoucherAdded={handleVoucherAdded} />
              </section>
              <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <VoucherList refreshTrigger={voucherRefresh} />
              </section>
            </div>
          ) : (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <Dashboard />
            </section>
          )}
        </main>

        <footer className="mt-16 pb-8 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-500 mb-4 font-medium italic">Designed & Developed By Sahajanand Digital</p>
          <a href="http://sahajananddigital.in" target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-105">
            <img src="https://sahajananddigital.in/images/logo.png" alt="Logo" className="w-40 h-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;

