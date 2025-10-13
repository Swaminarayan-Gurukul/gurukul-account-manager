export function addDonation(data) {
  const sheetName = "Donations";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["Date", "Name", "Note", "Amount"]);
  }

  
  const username = PropertiesService.getScriptProperties().getProperty('username');
  const password = PropertiesService.getScriptProperties().getProperty('password');
  const headers = {
      "Authorization": "Basic " + Utilities.base64Encode(username + ':' + password),
  };

  const SMSdata = {
      message: `જય સ્વામિનારાયણ, આપ શ્રી ના તરફથી આજે ${data.date} તારીખે રૂપિયા ${data.amount} નો સહયોગ પ્રાપ્ત થયેલ છે. \nશ્રી સ્વામિનારાયણ ગુરુકુળ અમદાવાદ - નિકોલ`,
      phoneNumbers: [
          `+91${data.phone}`
      ],
  };

  const response = UrlFetchApp.fetch(
      'https://api.sms-gate.app/3rdparty/v1/message',
      {
          method: 'POST',
          contentType: 'application/json',
          headers: headers,
          payload: JSON.stringify(SMSdata),
          muteHttpExceptions: true
      }
  );

  sheet.appendRow([
    data.date,
    data.name,
    data.ledger,
    data.note,
    data.phone,
    data.amount,
    response.getResponseCode()
  ]);

  return { success: true, lastRow: sheet.getLastRow() };
}

