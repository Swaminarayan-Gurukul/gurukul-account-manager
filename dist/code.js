var app = (function (S) {
  "use strict";
  const B = () => {
      try {
        const { sendAs: e = [] } = Gmail.Users.Settings.SendAs.list("me");
        if (e.length) return e.map((t) => t.sendAsEmail);
      } catch (e) {
        Logger.log(e.message);
      }
      return [Session.getActiveUser().getEmail()];
    },
    I = "%[a-f0-9]{2}",
    w = new RegExp("(" + I + ")|([^%]+?)", "gi"),
    R = new RegExp("(" + I + ")+", "gi");
  function N(e, t) {
    try {
      return [decodeURIComponent(e.join(""))];
    } catch {}
    if (e.length === 1) return e;
    t = t || 1;
    const r = e.slice(0, t),
      n = e.slice(t);
    return Array.prototype.concat.call([], N(r), N(n));
  }
  function G(e) {
    try {
      return decodeURIComponent(e);
    } catch {
      let t = e.match(w) || [];
      for (let r = 1; r < t.length; r++)
        (e = N(t, r).join("")), (t = e.match(w) || []);
      return e;
    }
  }
  function q(e) {
    const t = { "%FE%FF": "��", "%FF%FE": "��" };
    let r = R.exec(e);
    for (; r; ) {
      try {
        t[r[0]] = decodeURIComponent(r[0]);
      } catch {
        const s = G(r[0]);
        s !== r[0] && (t[r[0]] = s);
      }
      r = R.exec(e);
    }
    t["%C2"] = "�";
    const n = Object.keys(t);
    for (const s of n) e = e.replace(new RegExp(s, "g"), t[s]);
    return e;
  }
  function _(e) {
    if (typeof e != "string")
      throw new TypeError(
        "Expected `encodedURI` to be of type `string`, got `" + typeof e + "`",
      );
    try {
      return decodeURIComponent(e);
    } catch {
      return q(e);
    }
  }
  function H(e, t) {
    const r = {};
    if (Array.isArray(t))
      for (const n of t) {
        const s = Object.getOwnPropertyDescriptor(e, n);
        s?.enumerable && Object.defineProperty(r, n, s);
      }
    else
      for (const n of Reflect.ownKeys(e)) {
        const s = Object.getOwnPropertyDescriptor(e, n);
        if (s.enumerable) {
          const a = e[n];
          t(n, a, e) && Object.defineProperty(r, n, s);
        }
      }
    return r;
  }
  function j(e, t) {
    if (!(typeof e == "string" && typeof t == "string"))
      throw new TypeError("Expected the arguments to be of type `string`");
    if (e === "" || t === "") return [];
    const r = e.indexOf(t);
    return r === -1 ? [] : [e.slice(0, r), e.slice(r + t.length)];
  }
  const J = (e) => e == null,
    Q = (e) =>
      encodeURIComponent(e).replaceAll(
        /[!'()*]/g,
        (t) => `%${t.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    P = Symbol("encodeFragmentIdentifier");
  function k(e) {
    switch (e.arrayFormat) {
      case "index":
        return (t) => (r, n) => {
          const s = r.length;
          return n === void 0 ||
            (e.skipNull && n === null) ||
            (e.skipEmptyString && n === "")
            ? r
            : n === null
              ? [...r, [d(t, e), "[", s, "]"].join("")]
              : [...r, [d(t, e), "[", d(s, e), "]=", d(n, e)].join("")];
        };
      case "bracket":
        return (t) => (r, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? r
            : n === null
              ? [...r, [d(t, e), "[]"].join("")]
              : [...r, [d(t, e), "[]=", d(n, e)].join("")];
      case "colon-list-separator":
        return (t) => (r, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? r
            : n === null
              ? [...r, [d(t, e), ":list="].join("")]
              : [...r, [d(t, e), ":list=", d(n, e)].join("")];
      case "comma":
      case "separator":
      case "bracket-separator": {
        const t = e.arrayFormat === "bracket-separator" ? "[]=" : "=";
        return (r) => (n, s) =>
          s === void 0 ||
          (e.skipNull && s === null) ||
          (e.skipEmptyString && s === "")
            ? n
            : ((s = s === null ? "" : s),
              n.length === 0
                ? [[d(r, e), t, d(s, e)].join("")]
                : [[n, d(s, e)].join(e.arrayFormatSeparator)]);
      }
      default:
        return (t) => (r, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? r
            : n === null
              ? [...r, d(t, e)]
              : [...r, [d(t, e), "=", d(n, e)].join("")];
    }
  }
  function z(e) {
    let t;
    switch (e.arrayFormat) {
      case "index":
        return (r, n, s) => {
          if (((t = /\[(\d*)]$/.exec(r)), (r = r.replace(/\[\d*]$/, "")), !t)) {
            s[r] = n;
            return;
          }
          s[r] === void 0 && (s[r] = {}), (s[r][t[1]] = n);
        };
      case "bracket":
        return (r, n, s) => {
          if (((t = /(\[])$/.exec(r)), (r = r.replace(/\[]$/, "")), !t)) {
            s[r] = n;
            return;
          }
          if (s[r] === void 0) {
            s[r] = [n];
            return;
          }
          s[r] = [...s[r], n];
        };
      case "colon-list-separator":
        return (r, n, s) => {
          if (((t = /(:list)$/.exec(r)), (r = r.replace(/:list$/, "")), !t)) {
            s[r] = n;
            return;
          }
          if (s[r] === void 0) {
            s[r] = [n];
            return;
          }
          s[r] = [...s[r], n];
        };
      case "comma":
      case "separator":
        return (r, n, s) => {
          const a = typeof n == "string" && n.includes(e.arrayFormatSeparator),
            o =
              typeof n == "string" &&
              !a &&
              F(n, e).includes(e.arrayFormatSeparator);
          n = o ? F(n, e) : n;
          const i =
            a || o
              ? n.split(e.arrayFormatSeparator).map((m) => F(m, e))
              : n === null
                ? n
                : F(n, e);
          s[r] = i;
        };
      case "bracket-separator":
        return (r, n, s) => {
          const a = /(\[])$/.test(r);
          if (((r = r.replace(/\[]$/, "")), !a)) {
            s[r] = n && F(n, e);
            return;
          }
          const o = n === null ? [] : F(n, e).split(e.arrayFormatSeparator);
          if (s[r] === void 0) {
            s[r] = o;
            return;
          }
          s[r] = [...s[r], ...o];
        };
      default:
        return (r, n, s) => {
          if (s[r] === void 0) {
            s[r] = n;
            return;
          }
          s[r] = [...[s[r]].flat(), n];
        };
    }
  }
  function E(e) {
    if (typeof e != "string" || e.length !== 1)
      throw new TypeError(
        "arrayFormatSeparator must be single character string",
      );
  }
  function d(e, t) {
    return t.encode ? (t.strict ? Q(e) : encodeURIComponent(e)) : e;
  }
  function F(e, t) {
    return t.decode ? _(e) : e;
  }
  function T(e) {
    return Array.isArray(e)
      ? e.sort()
      : typeof e == "object"
        ? T(Object.keys(e))
            .sort((t, r) => Number(t) - Number(r))
            .map((t) => e[t])
        : e;
  }
  function U(e) {
    const t = e.indexOf("#");
    return t !== -1 && (e = e.slice(0, t)), e;
  }
  function K(e) {
    let t = "";
    const r = e.indexOf("#");
    return r !== -1 && (t = e.slice(r)), t;
  }
  function C(e, t, r) {
    return r === "string" && typeof e == "string"
      ? e
      : typeof r == "function" && typeof e == "string"
        ? r(e)
        : t.parseBooleans &&
            e !== null &&
            (e.toLowerCase() === "true" || e.toLowerCase() === "false")
          ? e.toLowerCase() === "true"
          : (r === "number" &&
                !Number.isNaN(Number(e)) &&
                typeof e == "string" &&
                e.trim() !== "") ||
              (t.parseNumbers &&
                !Number.isNaN(Number(e)) &&
                typeof e == "string" &&
                e.trim() !== "")
            ? Number(e)
            : e;
  }
  function x(e) {
    e = U(e);
    const t = e.indexOf("?");
    return t === -1 ? "" : e.slice(t + 1);
  }
  function D(e, t) {
    (t = {
      decode: !0,
      sort: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      parseNumbers: !1,
      parseBooleans: !1,
      types: Object.create(null),
      ...t,
    }),
      E(t.arrayFormatSeparator);
    const r = z(t),
      n = Object.create(null);
    if (typeof e != "string" || ((e = e.trim().replace(/^[?#&]/, "")), !e))
      return n;
    for (const s of e.split("&")) {
      if (s === "") continue;
      const a = t.decode ? s.replaceAll("+", " ") : s;
      let [o, i] = j(a, "=");
      o === void 0 && (o = a),
        (i =
          i === void 0
            ? null
            : ["comma", "separator", "bracket-separator"].includes(
                  t.arrayFormat,
                )
              ? i
              : F(i, t)),
        r(F(o, t), i, n);
    }
    for (const [s, a] of Object.entries(n))
      if (typeof a == "object" && a !== null && t.types[s] !== "string")
        for (const [o, i] of Object.entries(a)) {
          const m = t.types[s] ? t.types[s].replace("[]", "") : void 0;
          a[o] = C(i, t, m);
        }
      else
        typeof a == "object" && a !== null && t.types[s] === "string"
          ? (n[s] = Object.values(a).join(t.arrayFormatSeparator))
          : (n[s] = C(a, t, t.types[s]));
    return t.sort === !1
      ? n
      : (t.sort === !0
          ? Object.keys(n).sort()
          : Object.keys(n).sort(t.sort)
        ).reduce((s, a) => {
          const o = n[a];
          return (
            (s[a] = o && typeof o == "object" && !Array.isArray(o) ? T(o) : o),
            s
          );
        }, Object.create(null));
  }
  function $(e, t) {
    if (!e) return "";
    (t = {
      encode: !0,
      strict: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      ...t,
    }),
      E(t.arrayFormatSeparator);
    const r = (o) =>
        (t.skipNull && J(e[o])) || (t.skipEmptyString && e[o] === ""),
      n = k(t),
      s = {};
    for (const [o, i] of Object.entries(e)) r(o) || (s[o] = i);
    const a = Object.keys(s);
    return (
      t.sort !== !1 && a.sort(t.sort),
      a
        .map((o) => {
          const i = e[o];
          return i === void 0
            ? ""
            : i === null
              ? d(o, t)
              : Array.isArray(i)
                ? i.length === 0 && t.arrayFormat === "bracket-separator"
                  ? d(o, t) + "[]"
                  : i.reduce(n(o), []).join("&")
                : d(o, t) + "=" + d(i, t);
        })
        .filter((o) => o.length > 0)
        .join("&")
    );
  }
  function L(e, t) {
    t = { decode: !0, ...t };
    let [r, n] = j(e, "#");
    return (
      r === void 0 && (r = e),
      {
        url: r?.split("?")?.[0] ?? "",
        query: D(x(e), t),
        ...(t && t.parseFragmentIdentifier && n
          ? { fragmentIdentifier: F(n, t) }
          : {}),
      }
    );
  }
  function M(e, t) {
    t = { encode: !0, strict: !0, [P]: !0, ...t };
    const r = U(e.url).split("?")[0] || "",
      n = x(e.url),
      s = { ...D(n, { sort: !1 }), ...e.query };
    let a = $(s, t);
    a && (a = `?${a}`);
    let o = K(e.url);
    if (typeof e.fragmentIdentifier == "string") {
      const i = new URL(r);
      (i.hash = e.fragmentIdentifier),
        (o = t[P] ? i.hash : `#${e.fragmentIdentifier}`);
    }
    return `${r}${a}${o}`;
  }
  function V(e, t, r) {
    r = { parseFragmentIdentifier: !0, [P]: !1, ...r };
    const { url: n, query: s, fragmentIdentifier: a } = L(e, r);
    return M({ url: n, query: H(s, t), fragmentIdentifier: a }, r);
  }
  function X(e, t, r) {
    const n = Array.isArray(t) ? (s) => !t.includes(s) : (s, a) => !t(s, a);
    return V(e, n, r);
  }
  const Z = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          exclude: X,
          extract: x,
          parse: D,
          parseUrl: L,
          pick: V,
          stringify: $,
          stringifyUrl: M,
        },
        Symbol.toStringTag,
        { value: "Module" },
      ),
    ),
    W = () => {
      const e = "https://example.com",
        t = {
          name: "amit",
          location: "india",
          interests: ["workspace", "apps script"],
        },
        r = Z.stringify(t, { sort: !1, arrayFormat: "bracket" }),
        n = `${e}?${r}`;
      Logger.log(`URL: ${n}`);
    },
    Y = () =>
      HtmlService.createHtmlOutputFromFile("index.html")
        .setTitle("Google Apps Script")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  function v() {
    const t = SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName("Vouchers")
        .getDataRange()
        .getValues(),
      r = t[0],
      n = t.slice(1),
      a = n
        .slice(-15)
        .reverse()
        .map((o, i) => {
          const m = {};
          return (
            r.forEach((h, l) => {
              m[h] = o[l] !== void 0 && o[l] !== null ? o[l] : "";
            }),
            (m.ID = n.length - i),
            m
          );
        });
    return JSON.stringify(a);
  }
  function ee(e) {
    const t = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vouchers"),
      r = new Date().getTime();
    return (
      t.appendRow([
        r,
        e.date,
        e.type,
        e.amount,
        e.description,
        e.ledger,
        e.department,
        e.personname,
        e.txnId || "",
      ]),
      { success: !0, id: r }
    );
  }
  function te(e) {
    const t = "FoodPass",
      r = SpreadsheetApp.getActiveSpreadsheet();
    let n = r.getSheetByName(t);
    return (
      n ||
        ((n = r.insertSheet(t)),
        n.appendRow([
          "Date",
          "Time",
          "Type",
          "Quantity",
          "TotalAmount",
          "TxnID",
        ])),
      n.appendRow([
        e.date,
        e.time,
        e.foodPassTime,
        e.quantity,
        e.totalAmount,
        e.tempId || "",
      ]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function re(e) {
    const n = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Donations");
    if (!n) return null;
    const s = n.getDataRange().getValues(),
      a = s[0],
      o = a.indexOf("Phone"),
      i = a.indexOf("Name"),
      m = a.indexOf("Ledger"),
      h = a.indexOf("Note");
    if (o === -1) return null;
    for (let l = s.length - 1; l > 0; l--)
      if (String(s[l][o]).includes(e))
        return {
          name: s[l][i] || "",
          ledger: s[l][m] || "",
          purpose: (h !== -1 && s[l][h]) || "",
        };
    return null;
  }
  function ne(e) {
    const t = "Donations",
      r = SpreadsheetApp.getActiveSpreadsheet();
    let n = r.getSheetByName(t);
    n ||
      ((n = r.insertSheet(t)),
      n.appendRow([
        "Date",
        "Name",
        "Ledger",
        "Note",
        "Phone",
        "Amount",
        "SMS_Status",
        "TxnID",
      ]));
    const s = PropertiesService.getScriptProperties().getProperty("username"),
      a = PropertiesService.getScriptProperties().getProperty("password"),
      o =
        PropertiesService.getScriptProperties().getProperty("extraSmsPhone") ||
        PropertiesService.getScriptProperties().getProperty("swamiji_phone");
    let i = "N/A";
    if (s && a) {
      const m = {
          Authorization: "Basic " + Utilities.base64Encode(s + ":" + a),
        },
        h = [`+91${e.phone}`];
      o && h.push(`+91${o}`);
      const l = {
        message: `જય સ્વામિનારાયણ ${e.name}, આપ શ્રી ના તરફથી આજે ${e.date} તારીખે રૂપિયા ${e.amount} નો સહયોગ પ્રાપ્ત થયેલ છે. 
શ્રી સ્વામિનારાયણ ગુરુકુળ અમદાવાદ - નિકોલ`,
        phoneNumbers: h,
      };
      try {
        i = UrlFetchApp.fetch("https://api.sms-gate.app/3rdparty/v1/message", {
          method: "POST",
          contentType: "application/json",
          headers: m,
          payload: JSON.stringify(l),
          muteHttpExceptions: !0,
        }).getResponseCode();
      } catch (u) {
        i = "Error: " + u.message;
      }
    }
    return (
      n.appendRow([
        e.date,
        e.name,
        e.ledger,
        e.purpose || e.note || "",
        e.phone,
        e.amount,
        i,
        e.tempId || "",
      ]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function se(e) {
    const t = "GatePass",
      r = SpreadsheetApp.getActiveSpreadsheet();
    let n = r.getSheetByName(t);
    return (
      n ||
        ((n = r.insertSheet(t)),
        n.appendRow([
          "Date",
          "Name",
          "Department",
          "Purpose",
          "OutTime",
          "EstimatedInTime",
          "TimeIn",
          "TxnID",
        ])),
      n.appendRow([
        e.today || new Date(),
        e.name,
        e.dept,
        e.purpose,
        e.outTime,
        e.inTime || "",
        "",
        e.tempId || "",
      ]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function ae(e) {
    try {
      const t = SpreadsheetApp.getActiveSpreadsheet(),
        r = t.getSpreadsheetTimeZone(),
        n = e || Utilities.formatDate(new Date(), r, "dd/MM/yyyy"),
        s = {
          date: n,
          foodPass: {
            lunch: 0,
            dinner: 0,
            lunchAmount: 0,
            dinnerAmount: 0,
            totalAmount: 0,
            totalQuantity: 0,
          },
          gatePass: { count: 0, entries: [] },
          donations: { count: 0, totalAmount: 0, entries: [] },
        },
        a = (u) =>
          u
            ? (u instanceof Date
                ? Utilities.formatDate(u, r, "dd/MM/yyyy")
                : String(u)
              ).includes(n)
            : !1,
        o = (u) => {
          if (!u) return "-";
          if (u instanceof Date)
            return Utilities.formatDate(u, r, "hh:mm a").toUpperCase();
          const g = String(u);
          if (g.match(/\d{1,2}:\d{2}/)) {
            const f = g.split(":");
            let c = parseInt(f[0]);
            const p = f[1].substring(0, 2),
              y = c >= 12 ? "PM" : "AM";
            return (c = c % 12 || 12), c + ":" + p + " " + y;
          }
          return g.toUpperCase();
        },
        i = (u, g = 1e3) => {
          const f = t.getSheetByName(u);
          if (!f) return { headers: [], rows: [] };
          const c = f.getLastRow();
          if (c < 1) return { headers: [], rows: [] };
          const p = f.getLastColumn(),
            y = f.getRange(1, 1, Math.min(c, g + 1), p).getValues(),
            A = y[0].map((O) => String(O).trim().toLowerCase());
          let b = y.slice(1);
          return (
            c > g && (b = f.getRange(c - g + 1, 1, g, p).getValues()),
            { headers: A, rows: b }
          );
        },
        m = i("FoodPass");
      if (m.headers.length > 0) {
        const u = m.headers.indexOf("quantity"),
          g = m.headers.indexOf("totalamount");
        m.rows.forEach((f) => {
          if (a(f[0])) {
            const c = parseInt(f[u]) || 0,
              p = parseFloat(f[g]) || 0;
            let y = "dinner";
            const A = f.join(" ").toLowerCase();
            if (A.includes("lunch")) y = "lunch";
            else if (A.includes("dinner")) y = "dinner";
            else {
              const b = f
                .map((O) => String(O))
                .find((O) => O.match(/\d{1,2}:\d{2}/));
              b && (y = parseInt(b.split(":")[0]) < 17 ? "lunch" : "dinner");
            }
            y === "lunch"
              ? ((s.foodPass.lunch += c), (s.foodPass.lunchAmount += p))
              : ((s.foodPass.dinner += c), (s.foodPass.dinnerAmount += p)),
              (s.foodPass.totalQuantity += c),
              (s.foodPass.totalAmount += p);
          }
        });
      }
      const h = i("GatePass", 500);
      if (h.headers.length > 0) {
        const u = h.headers.indexOf("name"),
          g = h.headers.indexOf("department"),
          f = h.headers.indexOf("outtime");
        h.rows.forEach((c) => {
          a(c[0]) &&
            (s.gatePass.count++,
            s.gatePass.entries.push({
              name: String(c[u] || "Unknown"),
              dept: String(c[g] || "-"),
              outTime: o(c[f]),
            }));
        });
      }
      const l = i("Donations", 500);
      if (l.headers.length > 0) {
        const u = l.headers.indexOf("name"),
          g = l.headers.indexOf("note");
        let f = l.headers.indexOf("amount");
        f === -1 &&
          (f = l.headers.findIndex(
            (c) => c.includes("amt") || c.includes("rs"),
          )),
          l.rows.forEach((c) => {
            if (a(c[0])) {
              let p = 0;
              if (f !== -1)
                p = parseFloat(String(c[f]).replace(/[^\d.]/g, "")) || 0;
              else {
                const y = c.filter(
                  (A) => typeof A == "number" && A > 10 && A !== 202,
                );
                p = y.length > 0 ? y[y.length - 1] : 0;
              }
              s.donations.count++,
                (s.donations.totalAmount += p),
                s.donations.entries.push({
                  name: String(c[u] || "Donor"),
                  purpose: String(c[g] || "-"),
                  amount: p,
                });
            }
          });
      }
      return JSON.stringify(s);
    } catch (t) {
      return JSON.stringify({ error: t.toString() });
    }
  }
  return (
    (S.addDonation = ne),
    (S.addFoodPass = te),
    (S.addGatePass = se),
    (S.addVoucher = ee),
    (S.doGet = Y),
    (S.getDailyReport = ae),
    (S.getDonorDetails = re),
    (S.getGmailAliases = B),
    (S.getVouchers = v),
    (S.makeQueryString = W),
    Object.defineProperty(S, Symbol.toStringTag, { value: "Module" }),
    S
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
function getDailyReport() {
  return app.getDailyReport.apply(this, arguments);
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
