var app = (function (d) {
  "use strict";
  const x = () => {
      try {
        const { sendAs: r = [] } = Gmail.Users.Settings.SendAs.list("me");
        if (r.length) return r.map((e) => e.sendAsEmail);
      } catch (r) {
        Logger.log(r.message);
      }
      return [Session.getActiveUser().getEmail()];
    },
    F = "%[a-f0-9]{2}",
    S = new RegExp("(" + F + ")|([^%]+?)", "gi"),
    p = new RegExp("(" + F + ")+", "gi");
  function l(r, e) {
    try {
      return [decodeURIComponent(r.join(""))];
    } catch {}
    if (r.length === 1) return r;
    e = e || 1;
    const t = r.slice(0, e),
      n = r.slice(e);
    return Array.prototype.concat.call([], l(t), l(n));
  }
  function C(r) {
    try {
      return decodeURIComponent(r);
    } catch {
      let e = r.match(S) || [];
      for (let t = 1; t < e.length; t++)
        (r = l(e, t).join("")), (e = r.match(S) || []);
      return r;
    }
  }
  function I(r) {
    const e = { "%FE%FF": "��", "%FF%FE": "��" };
    let t = p.exec(r);
    for (; t; ) {
      try {
        e[t[0]] = decodeURIComponent(t[0]);
      } catch {
        const c = C(t[0]);
        c !== t[0] && (e[t[0]] = c);
      }
      t = p.exec(r);
    }
    e["%C2"] = "�";
    const n = Object.keys(e);
    for (const c of n) r = r.replace(new RegExp(c, "g"), e[c]);
    return r;
  }
  function R(r) {
    if (typeof r != "string")
      throw new TypeError(
        "Expected `encodedURI` to be of type `string`, got `" + typeof r + "`",
      );
    try {
      return decodeURIComponent(r);
    } catch {
      return I(r);
    }
  }
  function D(r, e) {
    const t = {};
    if (Array.isArray(e))
      for (const n of e) {
        const c = Object.getOwnPropertyDescriptor(r, n);
        c != null && c.enumerable && Object.defineProperty(t, n, c);
      }
    else
      for (const n of Reflect.ownKeys(r)) {
        const c = Object.getOwnPropertyDescriptor(r, n);
        if (c.enumerable) {
          const a = r[n];
          e(n, a, r) && Object.defineProperty(t, n, c);
        }
      }
    return t;
  }
  function b(r, e) {
    if (!(typeof r == "string" && typeof e == "string"))
      throw new TypeError("Expected the arguments to be of type `string`");
    if (r === "" || e === "") return [];
    const t = r.indexOf(e);
    return t === -1 ? [] : [r.slice(0, t), r.slice(t + e.length)];
  }
  const V = (r) => r == null,
    L = (r) =>
      encodeURIComponent(r).replaceAll(
        /[!'()*]/g,
        (e) => `%${e.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    m = Symbol("encodeFragmentIdentifier");
  function T(r) {
    switch (r.arrayFormat) {
      case "index":
        return (e) => (t, n) => {
          const c = t.length;
          return n === void 0 ||
            (r.skipNull && n === null) ||
            (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(e, r), "[", c, "]"].join("")]
              : [...t, [f(e, r), "[", f(c, r), "]=", f(n, r)].join("")];
        };
      case "bracket":
        return (e) => (t, n) =>
          n === void 0 ||
          (r.skipNull && n === null) ||
          (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(e, r), "[]"].join("")]
              : [...t, [f(e, r), "[]=", f(n, r)].join("")];
      case "colon-list-separator":
        return (e) => (t, n) =>
          n === void 0 ||
          (r.skipNull && n === null) ||
          (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, [f(e, r), ":list="].join("")]
              : [...t, [f(e, r), ":list=", f(n, r)].join("")];
      case "comma":
      case "separator":
      case "bracket-separator": {
        const e = r.arrayFormat === "bracket-separator" ? "[]=" : "=";
        return (t) => (n, c) =>
          c === void 0 ||
          (r.skipNull && c === null) ||
          (r.skipEmptyString && c === "")
            ? n
            : ((c = c === null ? "" : c),
              n.length === 0
                ? [[f(t, r), e, f(c, r)].join("")]
                : [[n, f(c, r)].join(r.arrayFormatSeparator)]);
      }
      default:
        return (e) => (t, n) =>
          n === void 0 ||
          (r.skipNull && n === null) ||
          (r.skipEmptyString && n === "")
            ? t
            : n === null
              ? [...t, f(e, r)]
              : [...t, [f(e, r), "=", f(n, r)].join("")];
    }
  }
  function M(r) {
    let e;
    switch (r.arrayFormat) {
      case "index":
        return (t, n, c) => {
          if (((e = /\[(\d*)]$/.exec(t)), (t = t.replace(/\[\d*]$/, "")), !e)) {
            c[t] = n;
            return;
          }
          c[t] === void 0 && (c[t] = {}), (c[t][e[1]] = n);
        };
      case "bracket":
        return (t, n, c) => {
          if (((e = /(\[])$/.exec(t)), (t = t.replace(/\[]$/, "")), !e)) {
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
          if (((e = /(:list)$/.exec(t)), (t = t.replace(/:list$/, "")), !e)) {
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
          const a = typeof n == "string" && n.includes(r.arrayFormatSeparator),
            s =
              typeof n == "string" &&
              !a &&
              o(n, r).includes(r.arrayFormatSeparator);
          n = s ? o(n, r) : n;
          const i =
            a || s
              ? n.split(r.arrayFormatSeparator).map((u) => o(u, r))
              : n === null
                ? n
                : o(n, r);
          c[t] = i;
        };
      case "bracket-separator":
        return (t, n, c) => {
          const a = /(\[])$/.test(t);
          if (((t = t.replace(/\[]$/, "")), !a)) {
            c[t] = n && o(n, r);
            return;
          }
          const s = n === null ? [] : o(n, r).split(r.arrayFormatSeparator);
          if (c[t] === void 0) {
            c[t] = s;
            return;
          }
          c[t] = [...c[t], ...s];
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
  function O(r) {
    if (typeof r != "string" || r.length !== 1)
      throw new TypeError(
        "arrayFormatSeparator must be single character string",
      );
  }
  function f(r, e) {
    return e.encode ? (e.strict ? L(r) : encodeURIComponent(r)) : r;
  }
  function o(r, e) {
    return e.decode ? R(r) : r;
  }
  function A(r) {
    return Array.isArray(r)
      ? r.sort()
      : typeof r == "object"
        ? A(Object.keys(r))
            .sort((e, t) => Number(e) - Number(t))
            .map((e) => r[e])
        : r;
  }
  function j(r) {
    const e = r.indexOf("#");
    return e !== -1 && (r = r.slice(0, e)), r;
  }
  function G(r) {
    let e = "";
    const t = r.indexOf("#");
    return t !== -1 && (e = r.slice(t)), e;
  }
  function N(r, e, t) {
    return t === "string" && typeof r == "string"
      ? r
      : typeof t == "function" && typeof r == "string"
        ? t(r)
        : e.parseBooleans &&
            r !== null &&
            (r.toLowerCase() === "true" || r.toLowerCase() === "false")
          ? r.toLowerCase() === "true"
          : (t === "number" &&
                !Number.isNaN(Number(r)) &&
                typeof r == "string" &&
                r.trim() !== "") ||
              (e.parseNumbers &&
                !Number.isNaN(Number(r)) &&
                typeof r == "string" &&
                r.trim() !== "")
            ? Number(r)
            : r;
  }
  function g(r) {
    r = j(r);
    const e = r.indexOf("?");
    return e === -1 ? "" : r.slice(e + 1);
  }
  function y(r, e) {
    (e = {
      decode: !0,
      sort: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      parseNumbers: !1,
      parseBooleans: !1,
      types: Object.create(null),
      ...e,
    }),
      O(e.arrayFormatSeparator);
    const t = M(e),
      n = Object.create(null);
    if (typeof r != "string" || ((r = r.trim().replace(/^[?#&]/, "")), !r))
      return n;
    for (const c of r.split("&")) {
      if (c === "") continue;
      const a = e.decode ? c.replaceAll("+", " ") : c;
      let [s, i] = b(a, "=");
      s === void 0 && (s = a),
        (i =
          i === void 0
            ? null
            : ["comma", "separator", "bracket-separator"].includes(
                  e.arrayFormat,
                )
              ? i
              : o(i, e)),
        t(o(s, e), i, n);
    }
    for (const [c, a] of Object.entries(n))
      if (typeof a == "object" && a !== null && e.types[c] !== "string")
        for (const [s, i] of Object.entries(a)) {
          const u = e.types[c] ? e.types[c].replace("[]", "") : void 0;
          a[s] = N(i, e, u);
        }
      else
        typeof a == "object" && a !== null && e.types[c] === "string"
          ? (n[c] = Object.values(a).join(e.arrayFormatSeparator))
          : (n[c] = N(a, e, e.types[c]));
    return e.sort === !1
      ? n
      : (e.sort === !0
          ? Object.keys(n).sort()
          : Object.keys(n).sort(e.sort)
        ).reduce((c, a) => {
          const s = n[a];
          return (
            (c[a] = s && typeof s == "object" && !Array.isArray(s) ? A(s) : s),
            c
          );
        }, Object.create(null));
  }
  function w(r, e) {
    if (!r) return "";
    (e = {
      encode: !0,
      strict: !0,
      arrayFormat: "none",
      arrayFormatSeparator: ",",
      ...e,
    }),
      O(e.arrayFormatSeparator);
    const t = (s) =>
        (e.skipNull && V(r[s])) || (e.skipEmptyString && r[s] === ""),
      n = T(e),
      c = {};
    for (const [s, i] of Object.entries(r)) t(s) || (c[s] = i);
    const a = Object.keys(c);
    return (
      e.sort !== !1 && a.sort(e.sort),
      a
        .map((s) => {
          const i = r[s];
          return i === void 0
            ? ""
            : i === null
              ? f(s, e)
              : Array.isArray(i)
                ? i.length === 0 && e.arrayFormat === "bracket-separator"
                  ? f(s, e) + "[]"
                  : i.reduce(n(s), []).join("&")
                : f(s, e) + "=" + f(i, e);
        })
        .filter((s) => s.length > 0)
        .join("&")
    );
  }
  function E(r, e) {
    var c;
    e = { decode: !0, ...e };
    let [t, n] = b(r, "#");
    return (
      t === void 0 && (t = r),
      {
        url:
          ((c = t == null ? void 0 : t.split("?")) == null ? void 0 : c[0]) ??
          "",
        query: y(g(r), e),
        ...(e && e.parseFragmentIdentifier && n
          ? { fragmentIdentifier: o(n, e) }
          : {}),
      }
    );
  }
  function U(r, e) {
    e = { encode: !0, strict: !0, [m]: !0, ...e };
    const t = j(r.url).split("?")[0] || "",
      n = g(r.url),
      c = { ...y(n, { sort: !1 }), ...r.query };
    let a = w(c, e);
    a && (a = `?${a}`);
    let s = G(r.url);
    if (typeof r.fragmentIdentifier == "string") {
      const i = new URL(t);
      (i.hash = r.fragmentIdentifier),
        (s = e[m] ? i.hash : `#${r.fragmentIdentifier}`);
    }
    return `${t}${a}${s}`;
  }
  function $(r, e, t) {
    t = { parseFragmentIdentifier: !0, [m]: !1, ...t };
    const { url: n, query: c, fragmentIdentifier: a } = E(r, t);
    return U({ url: n, query: D(c, e), fragmentIdentifier: a }, t);
  }
  function P(r, e, t) {
    const n = Array.isArray(e) ? (c) => !e.includes(c) : (c, a) => !e(c, a);
    return $(r, n, t);
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
      const r = "https://example.com",
        e = {
          name: "amit",
          location: "india",
          interests: ["workspace", "apps script"],
        },
        t = q.stringify(e, { sort: !1, arrayFormat: "bracket" }),
        n = `${r}?${t}`;
      Logger.log(`URL: ${n}`);
    },
    H = () =>
      HtmlService.createHtmlOutputFromFile("index.html")
        .setTitle("Google Apps Script")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
  function _() {
    const e = SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName("Vouchers")
        .getDataRange()
        .getValues(),
      t = e[0],
      c = e.slice(1).map((a, s) => {
        const i = {};
        return (
          t.forEach((u, h) => {
            i[u] = a[h] !== void 0 && a[h] !== null ? a[h] : "";
          }),
          (i.ID = s + 1),
          i
        );
      });
    return JSON.stringify(c);
  }
  function J(r) {
    const e = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Vouchers"),
      t = new Date().getTime();
    return (
      e.appendRow([
        t,
        r.date,
        r.type,
        r.amount,
        r.description,
        r.ledger,
        r.department,
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
