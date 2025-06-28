var app = (function (d) {
  "use strict";
  const x = () => {
      try {
        const { sendAs: e = [] } = Gmail.Users.Settings.SendAs.list("me");
        if (e.length) return e.map((r) => r.sendAsEmail);
      } catch (e) {
        Logger.log(e.message);
      }
      return [Session.getActiveUser().getEmail()];
    },
    F = "%[a-f0-9]{2}",
    S = new RegExp("(" + F + ")|([^%]+?)", "gi"),
    p = new RegExp("(" + F + ")+", "gi");
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
  function C(e) {
    try {
      return decodeURIComponent(e);
    } catch {
      let r = e.match(S) || [];
      for (let t = 1; t < r.length; t++)
        (e = l(r, t).join("")), (r = e.match(S) || []);
      return e;
    }
  }
  function I(e) {
    const r = { "%FE%FF": "��", "%FF%FE": "��" };
    let t = p.exec(e);
    for (; t; ) {
      try {
        r[t[0]] = decodeURIComponent(t[0]);
      } catch {
        const c = C(t[0]);
        c !== t[0] && (r[t[0]] = c);
      }
      t = p.exec(e);
    }
    r["%C2"] = "�";
    const n = Object.keys(r);
    for (const c of n) e = e.replace(new RegExp(c, "g"), r[c]);
    return e;
  }
  function R(e) {
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
  function D(e, r) {
    const t = {};
    if (Array.isArray(r))
      for (const n of r) {
        const c = Object.getOwnPropertyDescriptor(e, n);
        c != null && c.enumerable && Object.defineProperty(t, n, c);
      }
    else
      for (const n of Reflect.ownKeys(e)) {
        const c = Object.getOwnPropertyDescriptor(e, n);
        if (c.enumerable) {
          const s = e[n];
          r(n, s, e) && Object.defineProperty(t, n, c);
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
  const V = (e) => e == null,
    L = (e) =>
      encodeURIComponent(e).replaceAll(
        /[!'()*]/g,
        (r) => `%${r.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    m = Symbol("encodeFragmentIdentifier");
  function T(e) {
    switch (e.arrayFormat) {
      case "index":
        return (r) => (t, n) => {
          const c = t.length;
          return n === void 0 ||
            (e.skipNull && n === null) ||
            (e.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(r, e), "[", c, "]"].join("")]
              : [...t, [f(r, e), "[", f(c, e), "]=", f(n, e)].join("")];
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
        return (t) => (n, c) =>
          c === void 0 ||
          (e.skipNull && c === null) ||
          (e.skipEmptyString && c === "")
            ? n
            : ((c = c === null ? "" : c),
              n.length === 0
                ? [[f(t, e), r, f(c, e)].join("")]
                : [[n, f(c, e)].join(e.arrayFormatSeparator)]);
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
  function M(e) {
    let r;
    switch (e.arrayFormat) {
      case "index":
        return (t, n, c) => {
          if (((r = /\[(\d*)]$/.exec(t)), (t = t.replace(/\[\d*]$/, "")), !r)) {
            c[t] = n;
            return;
          }
          c[t] === void 0 && (c[t] = {}), (c[t][r[1]] = n);
        };
      case "bracket":
        return (t, n, c) => {
          if (((r = /(\[])$/.exec(t)), (t = t.replace(/\[]$/, "")), !r)) {
            c[t] = n;
            return;
          }
          if (c[t] === void 0) {
            c[t] = [n];
            return;
          }
          c[t] = [...c[t], n];
        };
      case "colon-list-separator":
        return (t, n, c) => {
          if (((r = /(:list)$/.exec(t)), (t = t.replace(/:list$/, "")), !r)) {
            c[t] = n;
            return;
          }
          if (c[t] === void 0) {
            c[t] = [n];
            return;
          }
          c[t] = [...c[t], n];
        };
      case "comma":
      case "separator":
        return (t, n, c) => {
          const s = typeof n == "string" && n.includes(e.arrayFormatSeparator),
            a =
              typeof n == "string" &&
              !s &&
              o(n, e).includes(e.arrayFormatSeparator);
          n = a ? o(n, e) : n;
          const i =
            s || a
              ? n.split(e.arrayFormatSeparator).map((u) => o(u, e))
              : n === null
                ? n
                : o(n, e);
          c[t] = i;
        };
      case "bracket-separator":
        return (t, n, c) => {
          const s = /(\[])$/.test(t);
          if (((t = t.replace(/\[]$/, "")), !s)) {
            c[t] = n && o(n, e);
            return;
          }
          const a = n === null ? [] : o(n, e).split(e.arrayFormatSeparator);
          if (c[t] === void 0) {
            c[t] = a;
            return;
          }
          c[t] = [...c[t], ...a];
        };
      default:
        return (t, n, c) => {
          if (c[t] === void 0) {
            c[t] = n;
            return;
          }
          c[t] = [...[c[t]].flat(), n];
        };
    }
  }
  function O(e) {
    if (typeof e != "string" || e.length !== 1)
      throw new TypeError(
        "arrayFormatSeparator must be single character string",
      );
  }
  function f(e, r) {
    return r.encode ? (r.strict ? L(e) : encodeURIComponent(e)) : e;
  }
  function o(e, r) {
    return r.decode ? R(e) : e;
  }
  function A(e) {
    return Array.isArray(e)
      ? e.sort()
      : typeof e == "object"
        ? A(Object.keys(e))
            .sort((r, t) => Number(r) - Number(t))
            .map((r) => e[r])
        : e;
  }
  function j(e) {
    const r = e.indexOf("#");
    return r !== -1 && (e = e.slice(0, r)), e;
  }
  function G(e) {
    let r = "";
    const t = e.indexOf("#");
    return t !== -1 && (r = e.slice(t)), r;
  }
  function N(e, r, t) {
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
    e = j(e);
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
      O(r.arrayFormatSeparator);
    const t = M(r),
      n = Object.create(null);
    if (typeof e != "string" || ((e = e.trim().replace(/^[?#&]/, "")), !e))
      return n;
    for (const c of e.split("&")) {
      if (c === "") continue;
      const s = r.decode ? c.replaceAll("+", " ") : c;
      let [a, i] = b(s, "=");
      a === void 0 && (a = s),
        (i =
          i === void 0
            ? null
            : ["comma", "separator", "bracket-separator"].includes(
                  r.arrayFormat,
                )
              ? i
              : o(i, r)),
        t(o(a, r), i, n);
    }
    for (const [c, s] of Object.entries(n))
      if (typeof s == "object" && s !== null && r.types[c] !== "string")
        for (const [a, i] of Object.entries(s)) {
          const u = r.types[c] ? r.types[c].replace("[]", "") : void 0;
          s[a] = N(i, r, u);
        }
      else
        typeof s == "object" && s !== null && r.types[c] === "string"
          ? (n[c] = Object.values(s).join(r.arrayFormatSeparator))
          : (n[c] = N(s, r, r.types[c]));
    return r.sort === !1
      ? n
      : (r.sort === !0
          ? Object.keys(n).sort()
          : Object.keys(n).sort(r.sort)
        ).reduce((c, s) => {
          const a = n[s];
          return (
            (c[s] = a && typeof a == "object" && !Array.isArray(a) ? A(a) : a),
            c
          );
        }, Object.create(null));
  }
  function w(e, r) {
    if (!e) return "";
    (r = {
      encode: !0,
      strict: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      ...r,
    }),
      O(r.arrayFormatSeparator);
    const t = (a) =>
        (r.skipNull && V(e[a])) || (r.skipEmptyString && e[a] === ""),
      n = T(r),
      c = {};
    for (const [a, i] of Object.entries(e)) t(a) || (c[a] = i);
    const s = Object.keys(c);
    return (
      r.sort !== !1 && s.sort(r.sort),
      s
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
  function E(e, r) {
    var c;
    r = { decode: !0, ...r };
    let [t, n] = b(e, "#");
    return (
      t === void 0 && (t = e),
      {
        url:
          ((c = t == null ? void 0 : t.split("?")) == null ? void 0 : c[0]) ??
          "",
        query: y(g(e), r),
        ...(r && r.parseFragmentIdentifier && n
          ? { fragmentIdentifier: o(n, r) }
          : {}),
      }
    );
  }
  function U(e, r) {
    r = { encode: !0, strict: !0, [m]: !0, ...r };
    const t = j(e.url).split("?")[0] || "",
      n = g(e.url),
      c = { ...y(n, { sort: !1 }), ...e.query };
    let s = w(c, r);
    s && (s = `?${s}`);
    let a = G(e.url);
    if (typeof e.fragmentIdentifier == "string") {
      const i = new URL(t);
      (i.hash = e.fragmentIdentifier),
        (a = r[m] ? i.hash : `#${e.fragmentIdentifier}`);
    }
    return `${t}${s}${a}`;
  }
  function $(e, r, t) {
    t = { parseFragmentIdentifier: !0, [m]: !1, ...t };
    const { url: n, query: c, fragmentIdentifier: s } = E(e, t);
    return U({ url: n, query: D(c, r), fragmentIdentifier: s }, t);
  }
  function P(e, r, t) {
    const n = Array.isArray(r) ? (c) => !r.includes(c) : (c, s) => !r(c, s);
    return $(e, n, t);
  }
  const q = Object.freeze(
      Object.defineProperty(
        {
          __proto__: null,
          exclude: P,
          extract: g,
          parse: y,
          parseUrl: E,
          pick: $,
          stringify: w,
          stringifyUrl: U,
        },
        Symbol.toStringTag,
        { value: "Module" },
      ),
    ),
    B = () => {
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
      c = n.slice(-15),
      s = c.map((a, i) => {
        const u = {};
        return (
          t.forEach((K, h) => {
            u[K] = a[h] !== void 0 && a[h] !== null ? a[h] : "";
          }),
          (u.ID = n.length - c.length + i + 1),
          u
        );
      });
    return JSON.stringify(s);
  }
  function J(e) {
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
      ]),
      { success: !0, id: t }
    );
  }
  return (
    (d.addVoucher = J),
    (d.doGet = H),
    (d.getGmailAliases = x),
    (d.getVouchers = _),
    (d.makeQueryString = B),
    Object.defineProperty(d, Symbol.toStringTag, { value: "Module" }),
    d
  );
})({});

const addVoucher = (...args) => app.addVoucher(...args);
const doGet = (...args) => app.doGet(...args);
const getGmailAliases = (...args) => app.getGmailAliases(...args);
const getVouchers = (...args) => app.getVouchers(...args);
const makeQueryString = (...args) => app.makeQueryString(...args);
