import { useState, useEffect } from 'react';
import { callGAS } from '../GAS';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const localToday = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy
      const response = await callGAS('getDailyReport', localToday);
      
      const report = typeof response === 'string' ? JSON.parse(response) : response;
      setData(report);
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center p-8 text-slate-500">No report data available for today.</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Today's Report Summary</h2>
        <button 
          onClick={fetchReport}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all text-sm"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Food Pass Card */}
        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-500 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-orange-900 text-lg">Food Passes</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b border-orange-200 pb-3">
               <div>
                  <div className="text-[10px] text-orange-600 uppercase font-bold tracking-wider">Morning (Lunch)</div>
                  <div className="text-xl font-black text-orange-900">{data.foodPass.lunch} <span className="text-xs font-normal">qty</span></div>
                  <div className="text-sm font-bold text-orange-700 font-mono">₹{data.foodPass.lunchAmount}</div>
               </div>
               <div>
                  <div className="text-[10px] text-orange-600 uppercase font-bold tracking-wider">Evening (Dinner)</div>
                  <div className="text-xl font-black text-orange-900">{data.foodPass.dinner} <span className="text-xs font-normal">qty</span></div>
                  <div className="text-sm font-bold text-orange-700 font-mono">₹{data.foodPass.dinnerAmount}</div>
               </div>
            </div>
            <div className="pt-2">
              <div className="text-xs text-orange-600 uppercase font-bold tracking-widest mb-1">Total Food Revenue</div>
              <div className="text-4xl font-black text-orange-900 font-mono flex items-baseline gap-1">
                <span className="text-xl">₹</span>
                {data.foodPass.totalAmount}
              </div>
            </div>
          </div>
        </div>

        {/* Gate Pass Card */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-blue-900 text-lg">Gate Passes</h3>
          </div>
          <div className="text-4xl font-black text-blue-900 mb-4">{data.gatePass.count} <span className="text-sm font-normal text-blue-600 uppercase tracking-widest">Issued</span></div>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {(data.gatePass.entries || []).map((e, i) => (
              <div key={i} className="bg-white p-2 rounded-lg text-xs flex justify-between border border-blue-100 items-center">
                <div className="flex flex-col">
                  <span className="font-bold truncate max-w-[120px]">{e.name}</span>
                  <span className="text-[10px] text-slate-400">{e.dept}</span>
                </div>
                <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">{e.outTime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donations Card */}
        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-green-900 text-lg">Donations</h3>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-end border-b border-green-200 pb-2">
              <span className="text-green-700 font-medium">Total Today</span>
              <span className="text-3xl font-black text-green-900 font-mono">₹{data.donations.totalAmount}</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 mt-2">
              {(data.donations.entries || []).map((e, i) => (
                <div key={i} className="bg-white p-2 rounded-lg text-xs flex justify-between border border-green-100 items-center">
                  <div className="flex flex-col">
                    <span className="font-bold truncate max-w-[120px]">{e.name}</span>
                    <span className="text-[10px] text-slate-400 italic">{e.purpose}</span>
                  </div>
                  <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded">₹{e.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
