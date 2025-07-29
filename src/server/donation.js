export function addDonation(data) {
  const sheetName = "Donations";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["Date", "Name", "Note", "Amount"]);
  }

  sheet.appendRow([
    data.date,
    data.name,
    data.ledger,
    data.note,
    data.phone,
    data.amount
  ]);

  return { success: true, lastRow: sheet.getLastRow() };
}
