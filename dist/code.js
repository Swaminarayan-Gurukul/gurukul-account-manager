var app = (function (y) {
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
    x = "%[a-f0-9]{2}",
    I = new RegExp("(" + x + ")|([^%]+?)", "gi"),
    R = new RegExp("(" + x + ")+", "gi");
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
      let t = e.match(I) || [];
      for (let r = 1; r < t.length; r++)
        (e = N(t, r).join("")), (t = e.match(I) || []);
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
          const o = e[n];
          t(n, o, e) && Object.defineProperty(r, n, s);
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
          const o = typeof n == "string" && n.includes(e.arrayFormatSeparator),
            a =
              typeof n == "string" &&
              !o &&
              F(n, e).includes(e.arrayFormatSeparator);
          n = a ? F(n, e) : n;
          const i =
            o || a
              ? n.split(e.arrayFormatSeparator).map((l) => F(l, e))
              : n === null
                ? n
                : F(n, e);
          s[r] = i;
        };
      case "bracket-separator":
        return (r, n, s) => {
          const o = /(\[])$/.test(r);
          if (((r = r.replace(/\[]$/, "")), !o)) {
            s[r] = n && F(n, e);
            return;
          }
          const a = n === null ? [] : F(n, e).split(e.arrayFormatSeparator);
          if (s[r] === void 0) {
            s[r] = a;
            return;
          }
          s[r] = [...s[r], ...a];
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
  function U(e) {
    return Array.isArray(e)
      ? e.sort()
      : typeof e == "object"
        ? U(Object.keys(e))
            .sort((t, r) => Number(t) - Number(r))
            .map((t) => e[t])
        : e;
  }
  function T(e) {
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
  function w(e) {
    e = T(e);
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
      const o = t.decode ? s.replaceAll("+", " ") : s;
      let [a, i] = j(o, "=");
      a === void 0 && (a = o),
        (i =
          i === void 0
            ? null
            : ["comma", "separator", "bracket-separator"].includes(
                  t.arrayFormat,
                )
              ? i
              : F(i, t)),
        r(F(a, t), i, n);
    }
    for (const [s, o] of Object.entries(n))
      if (typeof o == "object" && o !== null && t.types[s] !== "string")
        for (const [a, i] of Object.entries(o)) {
          const l = t.types[s] ? t.types[s].replace("[]", "") : void 0;
          o[a] = C(i, t, l);
        }
      else
        typeof o == "object" && o !== null && t.types[s] === "string"
          ? (n[s] = Object.values(o).join(t.arrayFormatSeparator))
          : (n[s] = C(o, t, t.types[s]));
    return t.sort === !1
      ? n
      : (t.sort === !0
          ? Object.keys(n).sort()
          : Object.keys(n).sort(t.sort)
        ).reduce((s, o) => {
          const a = n[o];
          return (
            (s[o] = a && typeof a == "object" && !Array.isArray(a) ? U(a) : a),
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
    const r = (a) =>
        (t.skipNull && J(e[a])) || (t.skipEmptyString && e[a] === ""),
      n = k(t),
      s = {};
    for (const [a, i] of Object.entries(e)) r(a) || (s[a] = i);
    const o = Object.keys(s);
    return (
      t.sort !== !1 && o.sort(t.sort),
      o
        .map((a) => {
          const i = e[a];
          return i === void 0
            ? ""
            : i === null
              ? d(a, t)
              : Array.isArray(i)
                ? i.length === 0 && t.arrayFormat === "bracket-separator"
                  ? d(a, t) + "[]"
                  : i.reduce(n(a), []).join("&")
                : d(a, t) + "=" + d(i, t);
        })
        .filter((a) => a.length > 0)
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
        query: D(w(e), t),
        ...(t && t.parseFragmentIdentifier && n
          ? { fragmentIdentifier: F(n, t) }
          : {}),
      }
    );
  }
  function M(e, t) {
    t = { encode: !0, strict: !0, [P]: !0, ...t };
    const r = T(e.url).split("?")[0] || "",
      n = w(e.url),
      s = { ...D(n, { sort: !1 }), ...e.query };
    let o = $(s, t);
    o && (o = `?${o}`);
    let a = K(e.url);
    if (typeof e.fragmentIdentifier == "string") {
      const i = new URL(r);
      (i.hash = e.fragmentIdentifier),
        (a = t[P] ? i.hash : `#${e.fragmentIdentifier}`);
    }
    return `${r}${o}${a}`;
  }
  function V(e, t, r) {
    r = { parseFragmentIdentifier: !0, [P]: !1, ...r };
    const { url: n, query: s, fragmentIdentifier: o } = L(e, r);
    return M({ url: n, query: H(s, t), fragmentIdentifier: o }, r);
  }
  function X(e, t, r) {
    const n = Array.isArray(t) ? (s) => !t.includes(s) : (s, o) => !t(s, o);
    return V(e, n, r);
  }
  const Z = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          exclude: X,
          extract: w,
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
      o = n
        .slice(-15)
        .reverse()
        .map((a, i) => {
          const l = {};
          return (
            r.forEach((S, u) => {
              l[S] = a[u] !== void 0 && a[u] !== null ? a[u] : "";
            }),
            (l.ID = n.length - i),
            l
          );
        });
    return JSON.stringify(o);
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
        n.appendRow(["Date", "Time", "Type", "Quantity", "TotalAmount"])),
      n.appendRow([e.date, e.time, e.foodPassTime, e.quantity, e.totalAmount]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function re(e) {
    const n = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Donations");
    if (!n) return null;
    const s = n.getDataRange().getValues(),
      o = s[0],
      a = o.indexOf("Phone"),
      i = o.indexOf("Name"),
      l = o.indexOf("Ledger"),
      S = o.indexOf("Note");
    if (a === -1) return null;
    for (let u = s.length - 1; u > 0; u--)
      if (String(s[u][a]).includes(e))
        return {
          name: s[u][i] || "",
          ledger: s[u][l] || "",
          purpose: (S !== -1 && s[u][S]) || "",
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
      ]));
    const s = PropertiesService.getScriptProperties().getProperty("username"),
      o = PropertiesService.getScriptProperties().getProperty("password"),
      a =
        PropertiesService.getScriptProperties().getProperty("extraSmsPhone") ||
        PropertiesService.getScriptProperties().getProperty("swamiji_phone"),
      i = { Authorization: "Basic " + Utilities.base64Encode(s + ":" + o) },
      l = [`+91${e.phone}`];
    a && l.push(`+91${a}`);
    const S = {
        message: `જય સ્વામિનારાયણ ${e.name}, આપ શ્રી ના તરફથી આજે ${e.date} તારીખે રૂપિયા ${e.amount} નો સહયોગ પ્રાપ્ત થયેલ છે. 
શ્રી સ્વામિનારાયણ ગુરુકુળ અમદાવાદ - નિકોલ`,
        phoneNumbers: l,
      },
      u = UrlFetchApp.fetch("https://api.sms-gate.app/3rdparty/v1/message", {
        method: "POST",
        contentType: "application/json",
        headers: i,
        payload: JSON.stringify(S),
        muteHttpExceptions: !0,
      });
    return (
      n.appendRow([
        e.date,
        e.name,
        e.ledger,
        e.purpose || e.note || "",
        e.phone,
        e.amount,
        u.getResponseCode(),
      ]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function se(e) {
    const t = "GatePass",
      r = SpreadsheetApp.getActiveSpreadsheet();
    let n = r.getSheetByName(t);
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
        o = (m) =>
          m
            ? (m instanceof Date
                ? Utilities.formatDate(m, r, "dd/MM/yyyy")
                : String(m)
              ).includes(n)
            : !1,
        a = (m) => {
          if (!m) return "-";
          if (m instanceof Date)
            return Utilities.formatDate(m, r, "hh:mm a").toUpperCase();
          const g = String(m);
          if (g.match(/\d{1,2}:\d{2}/)) {
            const f = g.split(":");
            let c = parseInt(f[0]);
            const h = f[1].substring(0, 2),
              p = c >= 12 ? "PM" : "AM";
            return (c = c % 12 || 12), c + ":" + h + " " + p;
          }
          return g.toUpperCase();
        },
        i = (m, g = 1e3) => {
          const f = t.getSheetByName(m);
          if (!f) return { headers: [], rows: [] };
          const c = f.getLastRow();
          if (c < 1) return { headers: [], rows: [] };
          const h = f.getLastColumn(),
            p = f.getRange(1, 1, Math.min(c, g + 1), h).getValues(),
            A = p[0].map((O) => String(O).trim().toLowerCase());
          let b = p.slice(1);
          return (
            c > g && (b = f.getRange(c - g + 1, 1, g, h).getValues()),
            { headers: A, rows: b }
          );
        },
        l = i("FoodPass");
      if (l.headers.length > 0) {
        const m = l.headers.indexOf("quantity"),
          g = l.headers.indexOf("totalamount");
        l.rows.forEach((f) => {
          if (o(f[0])) {
            const c = parseInt(f[m]) || 0,
              h = parseFloat(f[g]) || 0;
            let p = "dinner";
            const A = f.join(" ").toLowerCase();
            if (A.includes("lunch")) p = "lunch";
            else if (A.includes("dinner")) p = "dinner";
            else {
              const b = f
                .map((O) => String(O))
                .find((O) => O.match(/\d{1,2}:\d{2}/));
              b && (p = parseInt(b.split(":")[0]) < 17 ? "lunch" : "dinner");
            }
            p === "lunch"
              ? ((s.foodPass.lunch += c), (s.foodPass.lunchAmount += h))
              : ((s.foodPass.dinner += c), (s.foodPass.dinnerAmount += h)),
              (s.foodPass.totalQuantity += c),
              (s.foodPass.totalAmount += h);
          }
        });
      }
      const S = i("GatePass", 500);
      if (S.headers.length > 0) {
        const m = S.headers.indexOf("name"),
          g = S.headers.indexOf("department"),
          f = S.headers.indexOf("outtime");
        S.rows.forEach((c) => {
          o(c[0]) &&
            (s.gatePass.count++,
            s.gatePass.entries.push({
              name: String(c[m] || "Unknown"),
              dept: String(c[g] || "-"),
              outTime: a(c[f]),
            }));
        });
      }
      const u = i("Donations", 500);
      if (u.headers.length > 0) {
        const m = u.headers.indexOf("name"),
          g = u.headers.indexOf("note");
        let f = u.headers.indexOf("amount");
        f === -1 &&
          (f = u.headers.findIndex(
            (c) => c.includes("amt") || c.includes("rs"),
          )),
          u.rows.forEach((c) => {
            if (o(c[0])) {
              let h = 0;
              if (f !== -1)
                h = parseFloat(String(c[f]).replace(/[^\d.]/g, "")) || 0;
              else {
                const p = c.filter(
                  (A) => typeof A == "number" && A > 10 && A !== 202,
                );
                h = p.length > 0 ? p[p.length - 1] : 0;
              }
              s.donations.count++,
                (s.donations.totalAmount += h),
                s.donations.entries.push({
                  name: String(c[m] || "Donor"),
                  purpose: String(c[g] || "-"),
                  amount: h,
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
    (y.addDonation = ne),
    (y.addFoodPass = te),
    (y.addGatePass = se),
    (y.addVoucher = ee),
    (y.doGet = Y),
    (y.getDailyReport = ae),
    (y.getDonorDetails = re),
    (y.getGmailAliases = B),
    (y.getVouchers = v),
    (y.makeQueryString = W),
    Object.defineProperty(y, Symbol.toStringTag, { value: "Module" }),
    y
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
