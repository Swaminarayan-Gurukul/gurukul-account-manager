import { useState, useEffect } from 'react';
import { callGAS } from '../GAS';

const DonationForm = () => {
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-GB'),
    name: '',
    phone: '',
    ledger: '',
    note: '',
    customAmount: '',
  });
  const [presetTotal, setPresetTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const total = presetTotal + (parseInt(formData.customAmount) || 0);

  // Autofill effect when phone number reaches 10 digits
  useEffect(() => {
    const fetchDetails = async () => {
      if (formData.phone.length === 10) {
        setIsFetching(true);
        try {
          const details = await callGAS('getDonorDetails', formData.phone);
          if (details && details.name) {
            setFormData(prev => ({
              ...prev,
              name: details.name,
              ledger: details.ledger || prev.ledger
            }));
          }
        } catch (error) {
          console.error("Autofill error:", error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchDetails();
  }, [formData.phone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addPreset = (amt) => {
    setPresetTotal((prev) => prev + amt);
  };

  const handleReset = () => {
    setFormData({
      date: new Date().toLocaleDateString('en-GB'),
      name: '',
      phone: '',
      ledger: '',
      note: '',
      customAmount: '',
    });
    setPresetTotal(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (total <= 0) {
      alert('Please enter an amount');
      return;
    }

    const tempId = Math.floor(Date.now() / 1000).toString().slice(-5);

    // 1. Open Print Window Instantly
    const htmlContent = `
<div style="display: flex; justify-content: center; width: 100%;">
<pre style="font-family: monospace; font-size: 14px; font-weight: bold; white-space: pre-wrap; word-wrap: break-word; text-align: left; max-width: 300px;">
Shree Swaminarayan Gurukul 
    Ahmedabad - Nikol
    
        <b style="font-size: 16px">DONATION</b>        

 Ref ID : ${tempId}
 Date   : ${formData.date}
 Name   : ${formData.name}
 Amount : ₹${total}
 Phone  : ${formData.phone || '-'}
 Details: ${formData.note || '-'}

✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻
 
 Gurkul Activities:
  ✻ Morning Evening Aarti
  ✻ Daily Shiramani & Pooja
  ✻ Sunday Ravi Sabha
  ✻ Saturday Youth Sabha
  ✻ Poonam Abhishek
  ✻ Hanumanji Pooja / Yagna
  
🙏 🙏 Jay Swaminarayan 🙏 🙏
</pre>
</div>`;

    const win = window.open('', '', 'width=1200,height=800');
    win.document.write(`
      <html><head><title>Print Donation Receipt</title></head>
      <body onload="window.onafterprint = () => window.close(); window.print();">
        ${htmlContent}
      </body></html>
    `);
    win.document.close();

    // 2. Save in Background
    setLoading(true);
    const donationData = {
      date: formData.date,
      name: formData.name,
      ledger: formData.ledger,
      note: formData.note,
      phone: formData.phone,
      amount: total,
    };

    callGAS('addDonation', donationData)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        handleReset();
      });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-green-100 p-2 rounded-lg text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Donation Receipt</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Date</label>
            <input
              type="text"
              value={formData.date}
              readOnly
              className="w-full rounded-xl border-slate-100 bg-slate-50 p-2 border cursor-not-allowed text-sm font-medium"
            />
          </div>
          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-slate-500 uppercase flex justify-between">
              Phone
              {isFetching && <span className="text-[10px] text-blue-500 animate-pulse normal-case">Searching...</span>}
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              minLength="10"
              maxLength="12"
              required
              placeholder="Mobile No."
              className={`w-full rounded-xl border-slate-200 p-2 border text-sm ${isFetching ? 'border-blue-300 ring-1 ring-blue-100' : ''}`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Donor Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Full Name"
            className="w-full rounded-xl border-slate-200 p-2 border text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Ledger</label>
          <select
            name="ledger"
            value={formData.ledger}
            onChange={handleChange}
            required
            className="w-full rounded-xl border-slate-200 p-2 border text-sm bg-white"
          >
            <option value="">-- Select Ledger --</option>
            <option value="Donation">Donation</option>
            <option value="Hostel">Hostel</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Shreeji Prasadam">Shreeji Prasadam</option>
            <option value="Store Stationary">Store Stationary</option>
            <option value="Shreeji Store">Shreeji Store</option>
            <option value="Satsang Mandal">Satsang Mandal</option>
            <option value="Other Income">Other Income</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Quick Amount</label>
          <div className="flex flex-wrap gap-2">
            {[100, 200, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => addPreset(amt)}
                className="bg-slate-100 px-3 py-1 rounded-lg hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all border border-slate-200"
              >
                +₹{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Custom</label>
            <input
              type="number"
              name="customAmount"
              value={formData.customAmount}
              onChange={handleChange}
              min="0"
              placeholder="₹"
              className="w-full rounded-xl border-slate-200 p-2 border text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase">Total</label>
            <div className="w-full rounded-xl border-slate-100 bg-blue-50 p-2 border font-bold text-blue-700 text-center">
              ₹{total}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white p-3 rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 font-bold transition-all disabled:bg-green-300 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-slate-200 text-slate-700 px-4 rounded-xl hover:bg-slate-300 font-bold transition-all"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;
