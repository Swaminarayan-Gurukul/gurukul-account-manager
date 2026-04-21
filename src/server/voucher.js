export function getVouchers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vouchers');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1); 

  const last15Rows = rows.slice(-15).reverse();

  const sendJsonObject = last15Rows.map((row, index) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined && row[i] !== null ? row[i] : "";
    });
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
    data.txnId || ""
  ]);

  return { success: true, id };
}
