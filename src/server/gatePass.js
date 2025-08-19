export function addGatePass(data) {
    const sheetName = "GatePass";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Date","Name", "Department", "Purpose", "OutTime", "TimeIn"]);
    }
    const lastRow = sheet.getLastRow();

    sheet.appendRow([
        new Date(),       // Date created
        data.name,
        data.dept,
        data.purpose,
        data.outTime,
        ""                // Time In (manual later)
    ]);

    return { success: true, id: lastRow };
}
