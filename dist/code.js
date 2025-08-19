var app = (function (o) {
  "use strict";
  const U = () => {
      try {
        const { sendAs: e = [] } = Gmail.Users.Settings.SendAs.list("me");
        if (e.length) return e.map((r) => r.sendAsEmail);
      } catch (e) {
        Logger.log(e.message);
      }
      return [Session.getActiveUser().getEmail()];
    },
    p = "%[a-f0-9]{2}",
    F = new RegExp("(" + p + ")|([^%]+?)", "gi"),
    S = new RegExp("(" + p + ")+", "gi");
  function l(e, r) {
    try {
      return [decodeURIComponent(e.join(""))];
    } catch {}
    if (e.length === 1) return e;
    r = r || 1;
    const t = e.slice(0, r),
      n = e.slice(r);
    return Array.prototype.concat.call([], l(t), l(n));
  }
  function $(e) {
    try {
      return decodeURIComponent(e);
    } catch {
      let r = e.match(F) || [];
      for (let t = 1; t < r.length; t++)
        (e = l(r, t).join("")), (r = e.match(F) || []);
      return e;
    }
  }
  function I(e) {
    const r = { "%FE%FF": "��", "%FF%FE": "��" };
    let t = S.exec(e);
    for (; t; ) {
      try {
        r[t[0]] = decodeURIComponent(t[0]);
      } catch {
        const s = $(t[0]);
        s !== t[0] && (r[t[0]] = s);
      }
      t = S.exec(e);
    }
    r["%C2"] = "�";
    const n = Object.keys(r);
    for (const s of n) e = e.replace(new RegExp(s, "g"), r[s]);
    return e;
  }
  function C(e) {
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
  function x(e, r) {
    const t = {};
    if (Array.isArray(r))
      for (const n of r) {
        const s = Object.getOwnPropertyDescriptor(e, n);
        s != null && s.enumerable && Object.defineProperty(t, n, s);
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
  const P = (e) => e == null,
    T = (e) =>
      encodeURIComponent(e).replaceAll(
        /[!'()*]/g,
        (r) => `%${r.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    m = Symbol("encodeFragmentIdentifier");
  function V(e) {
    switch (e.arrayFormat) {
      case "index":
        return (r) => (t, n) => {
          const s = t.length;
          return n === void 0 ||
            (e.skipNull && n === null) ||
            (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(r, e), "[", s, "]"].join("")]
              : [...t, [f(r, e), "[", f(s, e), "]=", f(n, e)].join("")];
        };
      case "bracket":
        return (r) => (t, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(r, e), "[]"].join("")]
              : [...t, [f(r, e), "[]=", f(n, e)].join("")];
      case "colon-list-separator":
        return (r) => (t, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(r, e), ":list="].join("")]
              : [...t, [f(r, e), ":list=", f(n, e)].join("")];
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
                ? [[f(t, e), r, f(s, e)].join("")]
                : [[n, f(s, e)].join(e.arrayFormatSeparator)]);
      }
      default:
        return (r) => (t, n) =>
          n === void 0 ||
          (e.skipNull && n === null) ||
          (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, f(r, e)]
              : [...t, [f(r, e), "=", f(n, e)].join("")];
    }
  }
  function L(e) {
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
              d(n, e).includes(e.arrayFormatSeparator);
          n = a ? d(n, e) : n;
          const i =
            c || a
              ? n.split(e.arrayFormatSeparator).map((u) => d(u, e))
              : n === null
                ? n
                : d(n, e);
          s[t] = i;
        };
      case "bracket-separator":
        return (t, n, s) => {
          const c = /(\[])$/.test(t);
          if (((t = t.replace(/\[]$/, "")), !c)) {
            s[t] = n && d(n, e);
            return;
          }
          const a = n === null ? [] : d(n, e).split(e.arrayFormatSeparator);
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
  function A(e) {
    if (typeof e != "string" || e.length !== 1)
      throw new TypeError(
        "arrayFormatSeparator must be single character string",
      );
  }
  function f(e, r) {
    return r.encode ? (r.strict ? T(e) : encodeURIComponent(e)) : e;
  }
  function d(e, r) {
    return r.decode ? C(e) : e;
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
  function N(e) {
    const r = e.indexOf("#");
    return r !== -1 && (e = e.slice(0, r)), e;
  }
  function G(e) {
    let r = "";
    const t = e.indexOf("#");
    return t !== -1 && (r = e.slice(t)), r;
  }
  function O(e, r, t) {
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
  function g(e) {
    e = N(e);
    const r = e.indexOf("?");
    return r === -1 ? "" : e.slice(r + 1);
  }
  function h(e, r) {
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
      A(r.arrayFormatSeparator);
    const t = L(r),
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
              : d(i, r)),
        t(d(a, r), i, n);
    }
    for (const [s, c] of Object.entries(n))
      if (typeof c == "object" && c !== null && r.types[s] !== "string")
        for (const [a, i] of Object.entries(c)) {
          const u = r.types[s] ? r.types[s].replace("[]", "") : void 0;
          c[a] = O(i, r, u);
        }
      else
        typeof c == "object" && c !== null && r.types[s] === "string"
          ? (n[s] = Object.values(c).join(r.arrayFormatSeparator))
          : (n[s] = O(c, r, r.types[s]));
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
      A(r.arrayFormatSeparator);
    const t = (a) =>
        (r.skipNull && P(e[a])) || (r.skipEmptyString && e[a] === ""),
      n = V(r),
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
              ? f(a, r)
              : Array.isArray(i)
                ? i.length === 0 && r.arrayFormat === "bracket-separator"
                  ? f(a, r) + "[]"
                  : i.reduce(n(a), []).join("&")
                : f(a, r) + "=" + f(i, r);
        })
        .filter((a) => a.length > 0)
        .join("&")
    );
  }
  function R(e, r) {
    var s;
    r = { decode: !0, ...r };
    let [t, n] = b(e, "#");
    return (
      t === void 0 && (t = e),
      {
        url:
          ((s = t == null ? void 0 : t.split("?")) == null ? void 0 : s[0]) ??
          "",
        query: h(g(e), r),
        ...(r && r.parseFragmentIdentifier && n
          ? { fragmentIdentifier: d(n, r) }
          : {}),
      }
    );
  }
  function E(e, r) {
    r = { encode: !0, strict: !0, [m]: !0, ...r };
    const t = N(e.url).split("?")[0] || "",
      n = g(e.url),
      s = { ...h(n, { sort: !1 }), ...e.query };
    let c = j(s, r);
    c && (c = `?${c}`);
    let a = G(e.url);
    if (typeof e.fragmentIdentifier == "string") {
      const i = new URL(t);
      (i.hash = e.fragmentIdentifier),
        (a = r[m] ? i.hash : `#${e.fragmentIdentifier}`);
    }
    return `${t}${c}${a}`;
  }
  function D(e, r, t) {
    t = { parseFragmentIdentifier: !0, [m]: !1, ...t };
    const { url: n, query: s, fragmentIdentifier: c } = R(e, t);
    return E({ url: n, query: x(s, r), fragmentIdentifier: c }, t);
  }
  function B(e, r, t) {
    const n = Array.isArray(r) ? (s) => !r.includes(s) : (s, c) => !r(s, c);
    return D(e, n, t);
  }
  const M = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          exclude: B,
          extract: g,
          parse: h,
          parseUrl: R,
          pick: D,
          stringify: j,
          stringifyUrl: E,
        },
        Symbol.toStringTag,
        { value: "Module" },
      ),
    ),
    q = () => {
      const e = "https://example.com",
        r = {
          name: "amit",
          location: "india",
          interests: ["workspace", "apps script"],
        },
        t = M.stringify(r, { sort: !1, arrayFormat: "bracket" }),
        n = `${e}?${t}`;
      Logger.log(`URL: ${n}`);
    },
    H = () =>
      HtmlService.createHtmlOutputFromFile("index.html")
        .setTitle("Google Apps Script")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  function _() {
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
          const u = {};
          return (
            t.forEach((k, y) => {
              u[k] = a[y] !== void 0 && a[y] !== null ? a[y] : "";
            }),
            (u.ID = n.length - i),
            u
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
  function J(e) {
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
    const r = "Donations",
      t = SpreadsheetApp.getActiveSpreadsheet();
    let n = t.getSheetByName(r);
    return (
      n ||
        ((n = t.insertSheet(r)),
        n.appendRow(["Date", "Name", "Note", "Amount"])),
      n.appendRow([e.date, e.name, e.ledger, e.note, e.phone, e.amount]),
      { success: !0, lastRow: n.getLastRow() }
    );
  }
  function X(e) {
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
        "TimeIn",
      ]));
    const s = n.getLastRow();
    return (
      n.appendRow([new Date(), e.name, e.dept, e.purpose, e.outTime, ""]),
      { success: !0, id: s }
    );
  }
  return (
    (o.addDonation = K),
    (o.addFoodPass = J),
    (o.addGatePass = X),
    (o.addVoucher = Q),
    (o.doGet = H),
    (o.getGmailAliases = U),
    (o.getVouchers = _),
    (o.makeQueryString = q),
    Object.defineProperty(o, Symbol.toStringTag, { value: "Module" }),
    o
  );
})({});

const addDonation = (...args) => app.addDonation(...args);
const addFoodPass = (...args) => app.addFoodPass(...args);
const addGatePass = (...args) => app.addGatePass(...args);
const addVoucher = (...args) => app.addVoucher(...args);
const doGet = (...args) => app.doGet(...args);
const getGmailAliases = (...args) => app.getGmailAliases(...args);
const getVouchers = (...args) => app.getVouchers(...args);
const makeQueryString = (...args) => app.makeQueryString(...args);
