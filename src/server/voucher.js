export function getVouchers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Vouchers');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const sendJsonObject = rows.map((row, index) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined && row[i] !== null ? row[i] : "";
    });
    obj.ID = index + 1;
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
    data.department
  ]);

  return { success: true, id };
}