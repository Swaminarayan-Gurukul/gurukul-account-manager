export function addFoodPass(data) {
  const sheetName = "FoodPass";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["Date","Time", "Quantity", "TotalAmount"]);
  }

  sheet.appendRow([
    data.date,
    data.time,
    data.foodPassTime,
    data.quantity,
    data.totalAmount
  ]);

  return { success: true, lastRow: sheet.getLastRow()};
}
