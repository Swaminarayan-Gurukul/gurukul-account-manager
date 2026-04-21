export function addGatePass(data) {
    const sheetName = "GatePass";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Date","Name", "Department", "Purpose", "OutTime", "EstimatedInTime", "TimeIn", "TxnID"]);
    }

    sheet.appendRow([
        data.today || new Date(), 
        data.name,
        data.dept,
        data.purpose,
        data.outTime,
        data.inTime || "", 
        "",                
        data.tempId || ""
    ]);

    return { success: true, lastRow: sheet.getLastRow() };
}
