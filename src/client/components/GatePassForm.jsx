import { useState, useEffect } from 'react';
import { callGAS } from '../GAS';

const GatePassForm = () => {
  // Helper to format time like 12:23 PM
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const [formData, setFormData] = useState({
    name: '',
    dept: '',
    purpose: '',
    outTime: getCurrentTime(),
    inTime: '', // Estimated Return Time
  });
  const [loading, setLoading] = useState(false);

  // Update time occasionally if name is empty (keep it fresh)
  useEffect(() => {
    if (!formData.name && !formData.dept) {
      const interval = setInterval(() => {
        setFormData(prev => ({ ...prev, outTime: getCurrentTime() }));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [formData.name, formData.dept]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tempId = Math.floor(Date.now() / 1000).toString().slice(-4);
    const today = new Date().toLocaleDateString('en-IN');

    // 1. Open Print Window Instantly
    const printHtml = `
<div style="display: flex; justify-content: center; width: 100%;">
<pre style="font-family: monospace; font-size: 14px; font-weight: bold; white-space: pre-wrap; word-wrap: break-word; text-align: left; max-width: 300px;">
Shree Swaminarayan Gurukul
----------------------------
        🚪 GATE PASS        
----------------------------
Ref ID : ${tempId}
Date   : ${today}
Name   : ${formData.name}
Dept.  : ${formData.dept}
Purpose: ${formData.purpose}

Time Out : ${formData.outTime}
Est. In  : ${formData.inTime || '________________'}
Singnature : __________________
</pre>
</div>`;

    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`
      <html>
      <head><title>Gate Pass</title></head>
      <body onload="window.onafterprint = () => window.close(); window.print();">
        ${printHtml}
      </body>
      </html>
    `);
    win.document.close();

    // 2. Save in Background
    setLoading(true);
    callGAS('addGatePass', { ...formData, tempId, today })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setFormData({ name: '', dept: '', purpose: '', outTime: getCurrentTime(), inTime: '' });
      });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Gate Pass</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Department</label>
          <input
            type="text"
            name="dept"
            value={formData.dept}
            onChange={handleChange}
            required
            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border transition-all"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Out Time</label>
            <input
              type="text"
              name="outTime"
              value={formData.outTime}
              onChange={handleChange}
              placeholder="e.g. 10:30 AM"
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border transition-all font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Est. Return</label>
            <input
              type="text"
              name="inTime"
              value={formData.inTime}
              onChange={handleChange}
              placeholder="e.g. 12:00 PM"
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border transition-all font-mono text-blue-600 font-bold"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Purpose</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
            className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border transition-all"
          />
        </div>

        <div className="pt-4 mt-auto">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 disabled:bg-blue-300 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print & Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GatePassForm;
