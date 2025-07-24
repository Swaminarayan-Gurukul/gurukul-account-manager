export function getVouchers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vouchers');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1); // Exclude header row

  // Get last 15 rows and reverse to show latest first
  const last15Rows = rows.slice(-15).reverse();

  const sendJsonObject = last15Rows.map((row, index) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined && row[i] !== null ? row[i] : "";
    });
    // Correct ID as per reversed index
    obj.ID = rows.length - index;
    return obj;
  });

  return JSON.stringify(sendJsonObject);
}



export function addVoucher(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vouchers");
  const id = new Date().getTime();

  sheet.appendRow([
    id,
    data.date,
    data.type,
    data.amount,
    data.description,
    data.ledger,
    data.department,
    data.personname,
  ]);

  return { success: true, id };
}