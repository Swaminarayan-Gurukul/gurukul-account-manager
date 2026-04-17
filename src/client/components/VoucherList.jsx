import { useState, useEffect, useCallback } from 'react';
import { callGAS } from '../GAS';

const VoucherList = ({ refreshTrigger }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callGAS('getVouchers');
      if (data) {
        setVouchers(JSON.parse(data));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers, refreshTrigger]);

  const printVoucher = (voucher) => {
    const voucherDate = new Date(voucher.Date).toLocaleDateString('en-GB');
    const htmlContent = `
<div style="display: flex; justify-content: center; width: 100%;">
<pre style="font-family: monospace; font-size: 14px; font-weight: bold; white-space: pre-wrap; word-wrap: break-word; text-align: left; max-width: 300px;">
Shree Swaminarayan Gurukul
----------------------------
  ${voucher.Type.toUpperCase()} VOUCHER
----------------------------

ID         : ${voucher.ID}
Date       : ${voucherDate}
Amount     : ₹${voucher.Amount}
----------------------------
Ledger     : ${voucher.Ledger}
Dept.      : ${voucher.Department}
Desc.      : ${voucher.Description}

🙏 Jay Swaminarayan 🙏
</pre>
</div>`;

    const win = window.open('', '', 'width=1200,height=800');
    win.document.write(`
      <html><head><title>Print</title></head>
      <body onload="window.onafterprint = () => window.close(); window.print();">
        ${htmlContent}
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
        </div>
        <button
          onClick={loadVouchers}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-all font-semibold disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Updating...' : 'Sync Data'}
        </button>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Ledger</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {vouchers.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">No transactions found</td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.ID} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-slate-500">#{v.ID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{v.Date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      v.Type === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {v.Type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">₹{v.Amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{v.Ledger}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => printVoucher(v)} 
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100"
                      title="Print Voucher"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoucherList;
