export function getDonorDetails(phone) {
  const sheetName = "Donations";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return null;

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const phoneIdx = headers.indexOf("Phone");
  const nameIdx = headers.indexOf("Name");
  const ledgerIdx = headers.indexOf("Ledger");

  if (phoneIdx === -1) return null;

  // Search from bottom to top to get the latest details
  for (let i = data.length - 1; i > 0; i--) {
    if (String(data[i][phoneIdx]).includes(phone)) {
      return {
        name: data[i][nameIdx] || "",
        ledger: data[i][ledgerIdx] || ""
      };
    }
  }

  return null;
}

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
  const extraSmsPhone = PropertiesService.getScriptProperties().getProperty('extraSmsPhone');
  
  const headers = {
      "Authorization": "Basic " + Utilities.base64Encode(username + ':' + password),
  };

  const phoneNumbers = [`+91${data.phone}`];
  if (extraSmsPhone) {
    phoneNumbers.push(`+91${extraSmsPhone}`);
  }

  const SMSdata = {
      message: `જય સ્વામિનારાયણ ${data.name}, આપ શ્રી ના તરફથી આજે ${data.date} તારીખે રૂપિયા ${data.amount} નો સહયોગ પ્રાપ્ત થયેલ છે. \nશ્રી સ્વામિનારાયણ ગુરુકુળ અમદાવાદ - નિકોલ`,
      phoneNumbers: phoneNumbers,
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

