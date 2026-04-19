import { useState, useEffect } from 'react';
import { callGAS } from '../GAS';

const FoodPassForm = () => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const foodRate = 90;

  const displayQuantity = quantity === "" ? "" : parseInt(quantity) || 0;
  const totalAmount = (displayQuantity || 0) * foodRate;

  const handleIncrement = () => setQuantity(prev => (parseInt(prev) || 0) + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, (parseInt(prev) || 1) - 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalQty = Math.max(1, parseInt(quantity) || 1);
    const finalAmount = finalQty * foodRate;
    
    const today = new Date().toLocaleDateString('en-GB');
    const todayTime = new Date().toLocaleTimeString('en-GB');
    const foodPassTime = todayTime < '17:00:00' ? 'Lunch' : 'Dinner';
    const tempId = Math.floor(Date.now() / 1000).toString().slice(-6);

    const foodPassData = {
      quantity: finalQty,
      totalAmount: finalAmount,
      date: today,
      time: todayTime,
      foodPassTime: foodPassTime,
      tempId
    };

    // 1. Open Print Window Instantly
    const htmlContent = `
<div style="display: flex; justify-content: center; width: 100%;">
<pre style="font-family: monospace; font-size: 14px; font-weight: bold; white-space: pre-wrap; word-wrap: break-word; text-align: left; max-width: 300px;">
Shree Swaminarayan Gurukul
-------------------------
    🍛 FOOD PASS 🍛        
-------------------------

Ref ID     : ${tempId}
Date       : ${today} 
Time       : ${todayTime} (${foodPassTime})
Quantity   : ${finalQty}
Rate       : ₹${foodRate}
----------------------------
Total      : ₹${finalAmount}

🙏 Jay Swaminarayan 🙏
</pre>
</div>`;

    const win = window.open('', '', 'width=1200,height=800');
    win.document.write(`
      <html><head><title>Print Food Pass</title></head>
      <body onload="window.onafterprint = () => window.close(); window.print();">
        ${htmlContent}
      </body></html>
    `);
    win.document.close();

    // 2. Send to GAS in the background
    setLoading(true);
    callGAS('addFoodPass', foodPassData)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setQuantity(1);
      });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Food Pass</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider block">Quantity</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 text-2xl font-bold active:scale-95"
            >
              −
            </button>
            <div className="flex-grow">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={() => !quantity && setQuantity(1)}
                required
                min="1"
                placeholder="0"
                className="w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border transition-all text-center text-xl font-bold"
              />
            </div>
            <button
              type="button"
              onClick={handleIncrement}
              className="w-12 h-12 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all border border-blue-100 text-2xl font-bold active:scale-95"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Amount</label>
          <div className="w-full rounded-xl border-slate-100 bg-slate-50 p-4 border font-mono font-bold text-2xl text-blue-700 flex justify-between items-center">
            <span className="text-slate-400 text-sm font-normal">Amount to Pay:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <div className="pt-4 mt-auto">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-100 hover:bg-orange-600 hover:shadow-orange-200 disabled:bg-orange-300 transition-all flex items-center justify-center gap-2 text-lg"
          >
            {loading ? 'Saving...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Food Pass
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodPassForm;
