var app = (function (d) {
  "use strict";
  const $ = () => {
      try {
        const { sendAs: e = [] } = Gmail.Users.Settings.SendAs.list("me");
        if (e.length) return e.map((r) => r.sendAsEmail);
      } catch (e) {
        Logger.log(e.message);
      }
      return [Session.getActiveUser().getEmail()];
    },
    S = "%[a-f0-9]{2}",
    F = new RegExp("(" + S + ")|([^%]+?)", "gi"),
    A = new RegExp("(" + S + ")+", "gi");
  function g(e, r) {
    try {
      return [decodeURIComponent(e.join(""))];
    } catch {}
    if (e.length === 1) return e;
    r = r || 1;
    const t = e.slice(0, r),
      n = e.slice(r);
    return Array.prototype.concat.call([], g(t), g(n));
  }
  function x(e) {
    try {
      return decodeURIComponent(e);
    } catch {
      let r = e.match(F) || [];
      for (let t = 1; t < r.length; t++)
        (e = g(r, t).join("")), (r = e.match(F) || []);
      return e;
    }
  }
  function I(e) {
    const r = { "%FE%FF": "��", "%FF%FE": "��" };
    let t = A.exec(e);
    for (; t; ) {
      try {
        r[t[0]] = decodeURIComponent(t[0]);
      } catch {
        const s = x(t[0]);
        s !== t[0] && (r[t[0]] = s);
      }
      t = A.exec(e);
    }
    r["%C2"] = "�";
    const n = Object.keys(r);
    for (const s of n) e = e.replace(new RegExp(s, "g"), r[s]);
    return e;
  }
  function U(e) {
    if (typeof e != "string")
      throw new TypeError(
        "Expected `encodedURI` to be of type `string`, got `" + typeof e + "`",
      );
    try {
      return decodeURIComponent(e);
    } catch {
      return I(e);
    }
  }
  function T(e, r) {
    const t = {};
    if (Array.isArray(r))
      for (const n of r) {
        const s = Object.getOwnPropertyDescriptor(e, n);
        s?.enumerable && Object.defineProperty(t, n, s);
      }
    else
      for (const n of Reflect.ownKeys(e)) {
        const s = Object.getOwnPropertyDescriptor(e, n);
        if (s.enumerable) {
          const c = e[n];
          r(n, c, e) && Object.defineProperty(t, n, s);
        }
      }
    return t;
  }
  function b(e, r) {
    if (!(typeof e == "string" && typeof r == "string"))
      throw new TypeError("Expected the arguments to be of type `string`");
    if (e === "" || r === "") return [];
    const t = e.indexOf(r);
    return t === -1 ? [] : [e.slice(0, t), e.slice(t + r.length)];
  }
  const C = (e) => e == null,
    V = (e) =>
      encodeURIComponent(e).replaceAll(
        /[!'()*]/g,
        (r) => `%${r.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    p = Symbol("encodeFragmentIdentifier");
  function L(e) {
    switch (e.arrayFormat) {
      case "index":
        return (r) => (t, n) => {
          const s = t.length;
          return n === void 0 ||
            (e.skipNull && n === null) ||
            (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [o(r, e), "[", s, "]"].join("")]
              : [...t, [o(r, e), "[", o(s, e), "]=", o(n, e)].join("")];
        };
      case "bracket":
        return (r) => (t, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [o(r, e), "[]"].join("")]
              : [...t, [o(r, e), "[]=", o(n, e)].join("")];
      case "colon-list-separator":
        return (r) => (t, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [o(r, e), ":list="].join("")]
              : [...t, [o(r, e), ":list=", o(n, e)].join("")];
      case "comma":
      case "separator":
      case "bracket-separator": {
        const r = e.arrayFormat === "bracket-separator" ? "[]=" : "=";
        return (t) => (n, s) =>
          s === void 0 ||
          (e.skipNull && s === null) ||
          (e.skipEmptyString && s === "")
            ? n
            : ((s = s === null ? "" : s),
              n.length === 0
                ? [[o(t, e), r, o(s, e)].join("")]
                : [[n, o(s, e)].join(e.arrayFormatSeparator)]);
      }
      default:
        return (r) => (t, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, o(r, e)]
              : [...t, [o(r, e), "=", o(n, e)].join("")];
    }
  }
  function B(e) {
    let r;
    switch (e.arrayFormat) {
      case "index":
        return (t, n, s) => {
          if (((r = /\[(\d*)]$/.exec(t)), (t = t.replace(/\[\d*]$/, "")), !r)) {
            s[t] = n;
            return;
          }
          s[t] === void 0 && (s[t] = {}), (s[t][r[1]] = n);
        };
      case "bracket":
        return (t, n, s) => {
          if (((r = /(\[])$/.exec(t)), (t = t.replace(/\[]$/, "")), !r)) {
            s[t] = n;
            return;
          }
          if (s[t] === void 0) {
            s[t] = [n];
            return;
          }
          s[t] = [...s[t], n];
        };
      case "colon-list-separator":
        return (t, n, s) => {
          if (((r = /(:list)$/.exec(t)), (t = t.replace(/:list$/, "")), !r)) {
            s[t] = n;
            return;
          }
          if (s[t] === void 0) {
            s[t] = [n];
            return;
          }
          s[t] = [...s[t], n];
        };
      case "comma":
      case "separator":
        return (t, n, s) => {
          const c = typeof n == "string" && n.includes(e.arrayFormatSeparator),
            a =
              typeof n == "string" &&
              !c &&
              u(n, e).includes(e.arrayFormatSeparator);
          n = a ? u(n, e) : n;
          const i =
            c || a
              ? n.split(e.arrayFormatSeparator).map((f) => u(f, e))
              : n === null
                ? n
                : u(n, e);
          s[t] = i;
        };
      case "bracket-separator":
        return (t, n, s) => {
          const c = /(\[])$/.test(t);
          if (((t = t.replace(/\[]$/, "")), !c)) {
            s[t] = n && u(n, e);
            return;
          }
          const a = n === null ? [] : u(n, e).split(e.arrayFormatSeparator);
          if (s[t] === void 0) {
            s[t] = a;
            return;
          }
          s[t] = [...s[t], ...a];
        };
      default:
        return (t, n, s) => {
          if (s[t] === void 0) {
            s[t] = n;
            return;
          }
          s[t] = [...[s[t]].flat(), n];
        };
    }
  }
  function N(e) {
    if (typeof e != "string" || e.length !== 1)
      throw new TypeError(
        "arrayFormatSeparator must be single character string",
      );
  }
  function o(e, r) {
    return r.encode ? (r.strict ? V(e) : encodeURIComponent(e)) : e;
  }
  function u(e, r) {
    return r.decode ? U(e) : e;
  }
  function w(e) {
    return Array.isArray(e)
      ? e.sort()
      : typeof e == "object"
        ? w(Object.keys(e))
            .sort((r, t) => Number(r) - Number(t))
            .map((r) => e[r])
        : e;
  }
  function O(e) {
    const r = e.indexOf("#");
    return r !== -1 && (e = e.slice(0, r)), e;
  }
  function G(e) {
    let r = "";
    const t = e.indexOf("#");
    return t !== -1 && (r = e.slice(t)), r;
  }
  function R(e, r, t) {
    return t === "string" && typeof e == "string"
      ? e
      : typeof t == "function" && typeof e == "string"
        ? t(e)
        : r.parseBooleans &&
            e !== null &&
            (e.toLowerCase() === "true" || e.toLowerCase() === "false")
          ? e.toLowerCase() === "true"
          : (t === "number" &&
                !Number.isNaN(Number(e)) &&
                typeof e == "string" &&
                e.trim() !== "") ||
              (r.parseNumbers &&
                !Number.isNaN(Number(e)) &&
                typeof e == "string" &&
                e.trim() !== "")
            ? Number(e)
            : e;
  }
  function h(e) {
    e = O(e);
    const r = e.indexOf("?");
    return r === -1 ? "" : e.slice(r + 1);
  }
  function y(e, r) {
    (r = {
      decode: !0,
      sort: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      parseNumbers: !1,
      parseBooleans: !1,
      types: Object.create(null),
      ...r,
    }),
      N(r.arrayFormatSeparator);
    const t = B(r),
      n = Object.create(null);
    if (typeof e != "string" || ((e = e.trim().replace(/^[?#&]/, "")), !e))
      return n;
    for (const s of e.split("&")) {
      if (s === "") continue;
      const c = r.decode ? s.replaceAll("+", " ") : s;
      let [a, i] = b(c, "=");
      a === void 0 && (a = c),
        (i =
          i === void 0
            ? null
            : ["comma", "separator", "bracket-separator"].includes(
                  r.arrayFormat,
                )
              ? i
              : u(i, r)),
        t(u(a, r), i, n);
    }
    for (const [s, c] of Object.entries(n))
      if (typeof c == "object" && c !== null && r.types[s] !== "string")
        for (const [a, i] of Object.entries(c)) {
          const f = r.types[s] ? r.types[s].replace("[]", "") : void 0;
          c[a] = R(i, r, f);
        }
      else
        typeof c == "object" && c !== null && r.types[s] === "string"
          ? (n[s] = Object.values(c).join(r.arrayFormatSeparator))
          : (n[s] = R(c, r, r.types[s]));
    return r.sort === !1
      ? n
      : (r.sort === !0
          ? Object.keys(n).sort()
          : Object.keys(n).sort(r.sort)
        ).reduce((s, c) => {
          const a = n[c];
          return (
            (s[c] = a && typeof a == "object" && !Array.isArray(a) ? w(a) : a),
            s
          );
        }, Object.create(null));
  }
  function j(e, r) {
    if (!e) return "";
    (r = {
      encode: !0,
      strict: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      ...r,
    }),
      N(r.arrayFormatSeparator);
    const t = (a) =>
        (r.skipNull && C(e[a])) || (r.skipEmptyString && e[a] === ""),
      n = L(r),
      s = {};
    for (const [a, i] of Object.entries(e)) t(a) || (s[a] = i);
    const c = Object.keys(s);
    return (
      r.sort !== !1 && c.sort(r.sort),
      c
        .map((a) => {
          const i = e[a];
          return i === void 0
            ? ""
            : i === null
              ? o(a, r)
              : Array.isArray(i)
                ? i.length === 0 && r.arrayFormat === "bracket-separator"
                  ? o(a, r) + "[]"
                  : i.reduce(n(a), []).join("&")
                : o(a, r) + "=" + o(i, r);
        })
        .filter((a) => a.length > 0)
        .join("&")
    );
  }
  function P(e, r) {
    r = { decode: !0, ...r };
    let [t, n] = b(e, "#");
    return (
      t === void 0 && (t = e),
      {
        url: t?.split("?")?.[0] ?? "",
        query: y(h(e), r),
        ...(r && r.parseFragmentIdentifier && n
          ? { fragmentIdentifier: u(n, r) }
          : {}),
      }
    );
  }
  function D(e, r) {
    r = { encode: !0, strict: !0, [p]: !0, ...r };
    const t = O(e.url).split("?")[0] || "",
      n = h(e.url),
      s = { ...y(n, { sort: !1 }), ...e.query };
    let c = j(s, r);
    c && (c = `?${c}`);
    let a = G(e.url);
    if (typeof e.fragmentIdentifier == "string") {
      const i = new URL(t);
      (i.hash = e.fragmentIdentifier),
        (a = r[p] ? i.hash : `#${e.fragmentIdentifier}`);
    }
    return `${t}${c}${a}`;
  }
  function E(e, r, t) {
    t = { parseFragmentIdentifier: !0, [p]: !1, ...t };
    const { url: n, query: s, fragmentIdentifier: c } = P(e, t);
    return D({ url: n, query: T(s, r), fragmentIdentifier: c }, t);
  }
  function M(e, r, t) {
    const n = Array.isArray(r) ? (s) => !r.includes(s) : (s, c) => !r(s, c);
    return E(e, n, t);
  }
  const q = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          exclude: M,
          extract: h,
          parse: y,
          parseUrl: P,
          pick: E,
          stringify: j,
          stringifyUrl: D,
        },
        Symbol.toStringTag,
        { value: "Module" },
      ),
    ),
    H = () => {
      const e = "https://example.com",
        r = {
          name: "amit",
          location: "india",
          interests: ["workspace", "apps script"],
        },
        t = q.stringify(r, { sort: !1, arrayFormat: "bracket" }),
        n = `${e}?${t}`;
      Logger.log(`URL: ${n}`);
    },
    _ = () =>
      HtmlService.createHtmlOutputFromFile("index.html")
        .setTitle("Google Apps Script")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  function J() {
    const r = SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName("Vouchers")
        .getDataRange()
        .getValues(),
      t = r[0],
      n = r.slice(1),
      c = n
        .slice(-15)
        .reverse()
        .map((a, i) => {
          const f = {};
          return (
            t.forEach((l, m) => {
              f[l] = a[m] !== void 0 && a[m] !== null ? a[m] : "";
            }),
            (f.ID = n.length - i),
            f
          );
        });
    return JSON.stringify(c);
  }
  function Q(e) {
    const r = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vouchers"),
      t = new Date().getTime();
    return (
      r.appendRow([
        t,
        e.date,
        e.type,
        e.amount,
        e.description,
        e.ledger,
        e.department,
        e.personname,
      ]),
      { success: !0, id: t }
    );
  }
  function z(e) {
    const r = "FoodPass",
      t = SpreadsheetApp.getActiveSpreadsheet();
    let n = t.getSheetByName(r);
    return (
      n ||
        ((n = t.insertSheet(r)),
        n.appendRow(["Date", "Time", "Quantity", "TotalAmount"])),
      n.appendRow([e.date, e.time, e.foodPassTime, e.quantity, e.totalAmount]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function K(e) {
    const n = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Donations");
    if (!n) return null;
    const s = n.getDataRange().getValues(),
      c = s[0],
      a = c.indexOf("Phone"),
      i = c.indexOf("Name"),
      f = c.indexOf("Ledger");
    if (a === -1) return null;
    for (let l = s.length - 1; l > 0; l--)
      if (String(s[l][a]).includes(e))
        return { name: s[l][i] || "", ledger: s[l][f] || "" };
    return null;
  }
  function X(e) {
    const r = "Donations",
      t = SpreadsheetApp.getActiveSpreadsheet();
    let n = t.getSheetByName(r);
    n ||
      ((n = t.insertSheet(r)), n.appendRow(["Date", "Name", "Note", "Amount"]));
    const s = PropertiesService.getScriptProperties().getProperty("username"),
      c = PropertiesService.getScriptProperties().getProperty("password"),
      a = PropertiesService.getScriptProperties().getProperty("extraSmsPhone"),
      i = { Authorization: "Basic " + Utilities.base64Encode(s + ":" + c) },
      f = [`+91${e.phone}`];
    a && f.push(`+91${a}`);
    const l = {
        message: `જય સ્વામિનારાયણ ${e.name}, આપ શ્રી ના તરફથી આજે ${e.date} તારીખે રૂપિયા ${e.amount} નો સહયોગ પ્રાપ્ત થયેલ છે. 
શ્રી સ્વામિનારાયણ ગુરુકુળ અમદાવાદ - નિકોલ`,
        phoneNumbers: f,
      },
      m = UrlFetchApp.fetch("https://api.sms-gate.app/3rdparty/v1/message", {
        method: "POST",
        contentType: "application/json",
        headers: i,
        payload: JSON.stringify(l),
        muteHttpExceptions: !0,
      });
    return (
      n.appendRow([
        e.date,
        e.name,
        e.ledger,
        e.note,
        e.phone,
        e.amount,
        m.getResponseCode(),
      ]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function k(e) {
    const r = "GatePass",
      t = SpreadsheetApp.getActiveSpreadsheet();
    let n = t.getSheetByName(r);
    n ||
      ((n = t.insertSheet(r)),
      n.appendRow([
        "Date",
        "Name",
        "Department",
        "Purpose",
        "OutTime",
        "EstimatedInTime",
        "TimeIn",
      ]));
    const s = n.getLastRow();
    return (
      n.appendRow([
        new Date(),
        e.name,
        e.dept,
        e.purpose,
        e.outTime,
        e.inTime || "",
        "",
      ]),
      { success: !0, id: s }
    );
  }
  return (
    (d.addDonation = X),
    (d.addFoodPass = z),
    (d.addGatePass = k),
    (d.addVoucher = Q),
    (d.doGet = _),
    (d.getDonorDetails = K),
    (d.getGmailAliases = $),
    (d.getVouchers = J),
    (d.makeQueryString = H),
    Object.defineProperty(d, Symbol.toStringTag, { value: "Module" }),
    d
  );
})({});

function addDonation() {
  return app.addDonation.apply(this, arguments);
}
function addFoodPass() {
  return app.addFoodPass.apply(this, arguments);
}
function addGatePass() {
  return app.addGatePass.apply(this, arguments);
}
function addVoucher() {
  return app.addVoucher.apply(this, arguments);
}
function doGet() {
  return app.doGet.apply(this, arguments);
}
function getDonorDetails() {
  return app.getDonorDetails.apply(this, arguments);
}
function getGmailAliases() {
  return app.getGmailAliases.apply(this, arguments);
}
function getVouchers() {
  return app.getVouchers.apply(this, arguments);
}
function makeQueryString() {
  return app.makeQueryString.apply(this, arguments);
}
