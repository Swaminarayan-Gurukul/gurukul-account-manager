import { useState } from 'react';
import { callGAS } from '../GAS';

const VoucherForm = ({ onVoucherAdded }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Expense',
    amount: '',
    description: '',
    ledger: '',
    personname: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await callGAS('addVoucher', formData);
      if (response.success) {
        setFormData({
          ...formData,
          amount: '',
          description: '',
          personname: '',
          department: '',
        });
        if (onVoucherAdded) onVoucherAdded();
      } else {
        alert('Error adding voucher');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Income / Expense Voucher</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Transaction Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all bg-white"
            >
              <option value="Expense">Expense 🔴</option>
              <option value="Income">Income 🟢</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all font-mono font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Ledger Category</label>
            <select
              name="ledger"
              value={formData.ledger}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all bg-white"
            >
              <option value="">-- Select Ledger --</option>
              <option value="Education">Education</option>
              <option value="Hostel">Hostel</option>
              <option value="Health/medical">Health/medical</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Transportation">Transportation</option>
              <option value="Store Stationary">Store Stationary</option>
              <option value="Shreeji Store">Shreeji Store</option>
              <option value="Office">Office</option>
              <option value="Satsang Mandal">Satsang Mandal</option>
              <option value="Shreeji Prasadam">Shreeji Prasadam</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Recipient / Payer Name</label>
            <input
              type="text"
              name="personname"
              placeholder="Full Name"
              value={formData.personname}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all"
            />
          </div>
          
          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Department</label>
            <input
              type="text"
              name="department"
              placeholder="E.g. Office, School"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Description</label>
            <input
              type="text"
              name="description"
              placeholder="Purpose of transaction"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 disabled:bg-blue-300 transition-all flex items-center gap-2 group"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Voucher Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoucherForm;
