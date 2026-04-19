export function getDailyReport(clientDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const timeZone = ss.getSpreadsheetTimeZone();
    const todayStr = clientDate || Utilities.formatDate(new Date(), timeZone, "dd/MM/yyyy");

    const report = {
      date: todayStr,
      foodPass: { 
        lunch: 0, 
        dinner: 0, 
        lunchAmount: 0, 
        dinnerAmount: 0, 
        totalAmount: 0, 
        totalQuantity: 0 
      },
      gatePass: { count: 0, entries: [] },
      donations: { count: 0, totalAmount: 0, entries: [] }
    };

    const isToday = (val) => {
      if (!val) return false;
      const cellStr = (val instanceof Date) ? Utilities.formatDate(val, timeZone, "dd/MM/yyyy") : String(val);
      return cellStr.includes(todayStr);
    };

    const formatTime = (val) => {
      if (!val) return "-";
      if (val instanceof Date) return Utilities.formatDate(val, timeZone, "hh:mm a").toUpperCase();
      const str = String(val);
      if (str.match(/\d{1,2}:\d{2}/)) {
        const parts = str.split(":");
        let h = parseInt(parts[0]);
        const m = parts[1].substring(0, 2);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return h + ":" + m + " " + ampm;
      }
      return str.toUpperCase();
    };

    const getSafeData = (sheetName, maxRows = 1000) => {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) return { headers: [], rows: [] };
      const lastRow = sheet.getLastRow();
      if (lastRow < 1) return { headers: [], rows: [] };
      const lastCol = sheet.getLastColumn();
      const allData = sheet.getRange(1, 1, Math.min(lastRow, maxRows + 1), lastCol).getValues();
      const headers = allData[0].map(h => String(h).trim().toLowerCase());
      let rows = allData.slice(1);
      if (lastRow > maxRows) {
        rows = sheet.getRange(lastRow - maxRows + 1, 1, maxRows, lastCol).getValues();
      }
      return { headers, rows };
    };

    // 1. Food Pass Summary
    const food = getSafeData("FoodPass");
    if (food.headers.length > 0) {
      const qtyIdx = food.headers.indexOf("quantity");
      const amtIdx = food.headers.indexOf("totalamount");
      
      food.rows.forEach(row => {
        if (isToday(row[0])) {
          const qty = parseInt(row[qtyIdx]) || 0;
          const amt = parseFloat(row[amtIdx]) || 0;
          
          let finalType = "dinner";
          const rowStr = row.join(" ").toLowerCase();
          
          if (rowStr.includes("lunch")) {
            finalType = "lunch";
          } else if (rowStr.includes("dinner")) {
            finalType = "dinner";
          } else {
            const timeStr = row.map(c => String(c)).find(c => c.match(/\d{1,2}:\d{2}/));
            if (timeStr) {
              const hour = parseInt(timeStr.split(":")[0]);
              finalType = (hour < 17) ? "lunch" : "dinner";
            }
          }
          
          if (finalType === "lunch") {
            report.foodPass.lunch += qty;
            report.foodPass.lunchAmount += amt;
          } else {
            report.foodPass.dinner += qty;
            report.foodPass.dinnerAmount += amt;
          }
          
          report.foodPass.totalQuantity += qty;
          report.foodPass.totalAmount += amt;
        }
      });
    }

    // 2. Gate Pass Summary
    const gate = getSafeData("GatePass", 500);
    if (gate.headers.length > 0) {
      const nameIdx = gate.headers.indexOf("name");
      const deptIdx = gate.headers.indexOf("department");
      const outIdx = gate.headers.indexOf("outtime");
      gate.rows.forEach(row => {
        if (isToday(row[0])) {
          report.gatePass.count++;
          report.gatePass.entries.push({
            name: String(row[nameIdx] || "Unknown"),
            dept: String(row[deptIdx] || "-"),
            outTime: formatTime(row[outIdx])
          });
        }
      });
    }

    // 3. Donations Summary
    const dons = getSafeData("Donations", 500);
    if (dons.headers.length > 0) {
      const nameIdx = dons.headers.indexOf("name");
      const noteIdx = dons.headers.indexOf("note");
      let amtIdx = dons.headers.indexOf("amount");
      if (amtIdx === -1) amtIdx = dons.headers.findIndex(h => h.includes("amt") || h.includes("rs"));
      
      dons.rows.forEach(row => {
        if (isToday(row[0])) {
          let amt = 0;
          if (amtIdx !== -1) {
            amt = parseFloat(String(row[amtIdx]).replace(/[^\d.]/g, "")) || 0;
          } else {
            const possibleAmts = row.filter(c => typeof c === 'number' && c > 10 && c !== 202);
            amt = possibleAmts.length > 0 ? possibleAmts[possibleAmts.length-1] : 0;
          }

          report.donations.count++;
          report.donations.totalAmount += amt;
          report.donations.entries.push({
            name: String(row[nameIdx] || "Donor"),
            purpose: String(row[noteIdx] || "-"),
            amount: amt
          });
        }
      });
    }

    return JSON.stringify(report);
  } catch (e) {
    return JSON.stringify({ error: e.toString() });
  }
}
