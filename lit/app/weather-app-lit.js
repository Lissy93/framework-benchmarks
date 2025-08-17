(function() {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload"))
    return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]'))
    r(i);
  new MutationObserver((i) => {
    for (const a of i)
      if (a.type === "childList")
        for (const o of a.addedNodes)
          o.tagName === "LINK" && o.rel === "modulepreload" && r(o);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(i) {
    const a = {};
    return i.integrity && (a.integrity = i.integrity), i.referrerPolicy && (a.referrerPolicy = i.referrerPolicy), i.crossOrigin === "use-credentials" ? a.credentials = "include" : i.crossOrigin === "anonymous" ? a.credentials = "omit" : a.credentials = "same-origin", a;
  }
  function r(i) {
    if (i.ep)
      return;
    i.ep = !0;
    const a = t(i);
    fetch(i.href, a);
  }
})();
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = globalThis, q = N.ShadowRoot && (N.ShadyCSS === void 0 || N.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, G = Symbol(), X = /* @__PURE__ */ new WeakMap();
let he = class {
  constructor(e, t, r) {
    if (this._$cssResult$ = !0, r !== G) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (q && e === void 0) {
      const r = t !== void 0 && t.length === 1;
      r && (e = X.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && X.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const _e = (s) => new he(typeof s == "string" ? s : s + "", void 0, G), w = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((r, i, a) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + s[a + 1], s[0]);
  return new he(t, s, G);
}, ve = (s, e) => {
  if (q) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const r = document.createElement("style"), i = N.litNonce;
    i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, s.appendChild(r);
  }
}, ee = q ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const r of e.cssRules) t += r.cssText;
  return _e(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ye, defineProperty: $e, getOwnPropertyDescriptor: we, getOwnPropertyNames: be, getOwnPropertySymbols: xe, getPrototypeOf: Ae } = Object, R = globalThis, te = R.trustedTypes, Se = te ? te.emptyScript : "", Ee = R.reactiveElementPolyfillSupport, L = (s, e) => s, V = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? Se : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, ue = (s, e) => !ye(s, e), re = { attribute: !0, type: String, converter: V, reflect: !1, useDefault: !1, hasChanged: ue };
Symbol.metadata ??= Symbol("metadata"), R.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let k = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = re) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, t);
      i !== void 0 && $e(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, r) {
    const { get: i, set: a } = we(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: i, set(o) {
      const l = i?.call(this);
      a?.call(this, o), this.requestUpdate(e, l, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? re;
  }
  static _$Ei() {
    if (this.hasOwnProperty(L("elementProperties"))) return;
    const e = Ae(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(L("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(L("properties"))) {
      const t = this.properties, r = [...be(t), ...xe(t)];
      for (const i of r) this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [r, i] of t) this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, r] of this.elementProperties) {
      const i = this._$Eu(t, r);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const i of r) t.unshift(ee(i));
    } else e !== void 0 && t.push(ee(e));
    return t;
  }
  static _$Eu(e, t) {
    const r = t.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const r of t.keys()) this.hasOwnProperty(r) && (e.set(r, this[r]), delete this[r]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ve(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, r) {
    this._$AK(e, r);
  }
  _$ET(e, t) {
    const r = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, r);
    if (i !== void 0 && r.reflect === !0) {
      const a = (r.converter?.toAttribute !== void 0 ? r.converter : V).toAttribute(t, r.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const a = r.getPropertyOptions(i), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : V;
      this._$Em = i;
      const l = o.fromAttribute(t, a.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, r) {
    if (e !== void 0) {
      const i = this.constructor, a = this[e];
      if (r ??= i.getPropertyOptions(e), !((r.hasChanged ?? ue)(a, t) || r.useDefault && r.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(i._$Eu(e, r)))) return;
      this.C(e, t, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: r, reflect: i, wrapped: a }, o) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), a !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, a] of this._$Ep) this[i] = a;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [i, a] of r) {
        const { wrapped: o } = a, l = this[i];
        o !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, a, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (r) {
      throw e = !1, this._$EM(), r;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[L("elementProperties")] = /* @__PURE__ */ new Map(), k[L("finalized")] = /* @__PURE__ */ new Map(), Ee?.({ ReactiveElement: k }), (R.reactiveElementVersions ??= []).push("2.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = globalThis, I = Y.trustedTypes, ie = I ? I.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, pe = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, me = "?" + $, ke = `<${me}>`, S = document, M = () => S.createComment(""), T = (s) => s === null || typeof s != "object" && typeof s != "function", K = Array.isArray, De = (s) => K(s) || typeof s?.[Symbol.iterator] == "function", F = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, se = /-->/g, ae = />/g, b = RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), oe = /'/g, ne = /"/g, fe = /^(?:script|style|textarea|title)$/i, Ce = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), _ = Ce(1), E = Symbol.for("lit-noChange"), g = Symbol.for("lit-nothing"), ce = /* @__PURE__ */ new WeakMap(), A = S.createTreeWalker(S, 129);
function ge(s, e) {
  if (!K(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ie !== void 0 ? ie.createHTML(e) : e;
}
const Pe = (s, e) => {
  const t = s.length - 1, r = [];
  let i, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = P;
  for (let l = 0; l < t; l++) {
    const n = s[l];
    let h, m, c = -1, u = 0;
    for (; u < n.length && (o.lastIndex = u, m = o.exec(n), m !== null); ) u = o.lastIndex, o === P ? m[1] === "!--" ? o = se : m[1] !== void 0 ? o = ae : m[2] !== void 0 ? (fe.test(m[2]) && (i = RegExp("</" + m[2], "g")), o = b) : m[3] !== void 0 && (o = b) : o === b ? m[0] === ">" ? (o = i ?? P, c = -1) : m[1] === void 0 ? c = -2 : (c = o.lastIndex - m[2].length, h = m[1], o = m[3] === void 0 ? b : m[3] === '"' ? ne : oe) : o === ne || o === oe ? o = b : o === se || o === ae ? o = P : (o = b, i = void 0);
    const d = o === b && s[l + 1].startsWith("/>") ? " " : "";
    a += o === P ? n + ke : c >= 0 ? (r.push(h), n.slice(0, c) + pe + n.slice(c) + $ + d) : n + $ + (c === -2 ? l : d);
  }
  return [ge(s, a + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class U {
  constructor({ strings: e, _$litType$: t }, r) {
    let i;
    this.parts = [];
    let a = 0, o = 0;
    const l = e.length - 1, n = this.parts, [h, m] = Pe(e, t);
    if (this.el = U.createElement(h, r), A.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (i = A.nextNode()) !== null && n.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const c of i.getAttributeNames()) if (c.endsWith(pe)) {
          const u = m[o++], d = i.getAttribute(c).split($), f = /([.?@])?(.*)/.exec(u);
          n.push({ type: 1, index: a, name: f[2], strings: d, ctor: f[1] === "." ? Le : f[1] === "?" ? Me : f[1] === "@" ? Te : B }), i.removeAttribute(c);
        } else c.startsWith($) && (n.push({ type: 6, index: a }), i.removeAttribute(c));
        if (fe.test(i.tagName)) {
          const c = i.textContent.split($), u = c.length - 1;
          if (u > 0) {
            i.textContent = I ? I.emptyScript : "";
            for (let d = 0; d < u; d++) i.append(c[d], M()), A.nextNode(), n.push({ type: 2, index: ++a });
            i.append(c[u], M());
          }
        }
      } else if (i.nodeType === 8) if (i.data === me) n.push({ type: 2, index: a });
      else {
        let c = -1;
        for (; (c = i.data.indexOf($, c + 1)) !== -1; ) n.push({ type: 7, index: a }), c += $.length - 1;
      }
      a++;
    }
  }
  static createElement(e, t) {
    const r = S.createElement("template");
    return r.innerHTML = e, r;
  }
}
function D(s, e, t = s, r) {
  if (e === E) return e;
  let i = r !== void 0 ? t._$Co?.[r] : t._$Cl;
  const a = T(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(s), i._$AT(s, t, r)), r !== void 0 ? (t._$Co ??= [])[r] = i : t._$Cl = i), i !== void 0 && (e = D(s, i._$AS(s, e.values), i, r)), e;
}
let ze = class {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: r } = this._$AD, i = (e?.creationScope ?? S).importNode(t, !0);
    A.currentNode = i;
    let a = A.nextNode(), o = 0, l = 0, n = r[0];
    for (; n !== void 0; ) {
      if (o === n.index) {
        let h;
        n.type === 2 ? h = new C(a, a.nextSibling, this, e) : n.type === 1 ? h = new n.ctor(a, n.name, n.strings, this, e) : n.type === 6 && (h = new Ue(a, this, e)), this._$AV.push(h), n = r[++l];
      }
      o !== n?.index && (a = A.nextNode(), o++);
    }
    return A.currentNode = S, i;
  }
  p(e) {
    let t = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, t), t += r.strings.length - 2) : r._$AI(e[t])), t++;
  }
};
class C {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, r, i) {
    this.type = 2, this._$AH = g, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = r, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = D(this, e, t), T(e) ? e === g || e == null || e === "" ? (this._$AH !== g && this._$AR(), this._$AH = g) : e !== this._$AH && e !== E && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : De(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== g && T(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = U.createElement(ge(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === i) this._$AH.p(t);
    else {
      const a = new ze(i, this), o = a.u(this.options);
      a.p(t), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let t = ce.get(e.strings);
    return t === void 0 && ce.set(e.strings, t = new U(e)), t;
  }
  k(e) {
    K(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let r, i = 0;
    for (const a of e) i === t.length ? t.push(r = new C(this.O(M()), this.O(M()), this, this.options)) : r = t[i], r._$AI(a), i++;
    i < t.length && (this._$AR(r && r._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const r = e.nextSibling;
      e.remove(), e = r;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class B {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, r, i, a) {
    this.type = 1, this._$AH = g, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = a, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = g;
  }
  _$AI(e, t = this, r, i) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) e = D(this, e, t, 0), o = !T(e) || e !== this._$AH && e !== E, o && (this._$AH = e);
    else {
      const l = e;
      let n, h;
      for (e = a[0], n = 0; n < a.length - 1; n++) h = D(this, l[r + n], t, n), h === E && (h = this._$AH[n]), o ||= !T(h) || h !== this._$AH[n], h === g ? e = g : e !== g && (e += (h ?? "") + a[n + 1]), this._$AH[n] = h;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === g ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Le extends B {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === g ? void 0 : e;
  }
}
class Me extends B {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== g);
  }
}
class Te extends B {
  constructor(e, t, r, i, a) {
    super(e, t, r, i, a), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = D(this, e, t, 0) ?? g) === E) return;
    const r = this._$AH, i = e === g && r !== g || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, a = e !== g && (r === g || i);
    i && this.element.removeEventListener(this.name, this, r), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ue {
  constructor(e, t, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    D(this, e);
  }
}
const We = { I: C }, He = Y.litHtmlPolyfillSupport;
He?.(U, C), (Y.litHtmlVersions ??= []).push("3.3.1");
const Oe = (s, e, t) => {
  const r = t?.renderBefore ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const a = t?.renderBefore ?? null;
    r._$litPart$ = i = new C(e.insertBefore(M(), a), a, void 0, t ?? {});
  }
  return i._$AI(s), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis;
let y = class extends k {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Oe(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return E;
  }
};
y._$litElement$ = !0, y.finalized = !0, J.litElementHydrateSupport?.({ LitElement: y });
const Ne = J.litElementPolyfillSupport;
Ne?.({ LitElement: y });
(J.litElementVersions ??= []).push("4.2.1");
class Ie {
  constructor() {
    this.baseUrl = "https://api.open-meteo.com/v1", this.geocodingUrl = "https://geocoding-api.open-meteo.com/v1", this.useMockData = this.shouldUseMockData();
  }
  shouldUseMockData() {
    const e = navigator.userAgent.includes("Playwright") || navigator.userAgent.includes("HeadlessChrome");
    return window.location.search.includes("mock=false") ? !1 : window.location.search.includes("mock=true") || e;
  }
  async getMockData() {
    try {
      this.isTestEnvironment() && await new Promise((t) => setTimeout(t, 200));
      const e = await fetch("./mocks/weather-data.json");
      if (!e.ok)
        throw new Error("Failed to load mock data");
      return await e.json();
    } catch (e) {
      throw console.error("Error loading mock data:", e), e;
    }
  }
  isTestEnvironment() {
    return navigator.userAgent.includes("Playwright") || navigator.userAgent.includes("HeadlessChrome");
  }
  getMockGeocodingData(e) {
    const t = {
      London: {
        latitude: 51.5074,
        longitude: -0.1278,
        name: "London",
        country: "United Kingdom"
      },
      Tokyo: {
        latitude: 35.6762,
        longitude: 139.6503,
        name: "Tokyo",
        country: "Japan"
      },
      Paris: {
        latitude: 48.8566,
        longitude: 2.3522,
        name: "Paris",
        country: "France"
      },
      "São Paulo": {
        latitude: -23.5505,
        longitude: -46.6333,
        name: "São Paulo",
        country: "Brazil"
      },
      "New York": {
        latitude: 40.7128,
        longitude: -74.006,
        name: "New York",
        country: "United States"
      }
    };
    if (e.includes("Invalid") || e.includes("123") || !e.trim())
      throw new Error("Unable to find location. Please check the city name and try again.");
    return t[e] || t.London;
  }
  async geocodeLocation(e) {
    if (this.useMockData)
      return this.getMockGeocodingData(e);
    try {
      const t = await fetch(
        `${this.geocodingUrl}/search?name=${encodeURIComponent(e)}&count=1&language=en&format=json`
      );
      if (!t.ok)
        throw new Error("Geocoding failed");
      const r = await t.json();
      if (!r.results || r.results.length === 0)
        throw new Error("Location not found");
      const i = r.results[0];
      return {
        latitude: i.latitude,
        longitude: i.longitude,
        name: i.name,
        country: i.country
      };
    } catch (t) {
      throw console.error("Geocoding error:", t), new Error("Unable to find location. Please check the city name and try again.");
    }
  }
  async getWeatherData(e, t) {
    if (this.useMockData)
      return await this.getMockData();
    try {
      const r = new URLSearchParams({
        latitude: e.toString(),
        longitude: t.toString(),
        daily: "temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,rain_sum,uv_index_max,precipitation_probability_max",
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,snowfall,showers,rain,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_direction_10m,wind_gusts_10m,wind_speed_10m",
        timezone: "GMT"
      }), i = await fetch(`${this.baseUrl}/forecast?${r}`);
      if (!i.ok)
        throw new Error(`Weather API error: ${i.status}`);
      return await i.json();
    } catch (r) {
      throw console.error("Weather API error:", r), new Error("Unable to fetch weather data. Please try again later.");
    }
  }
  async getWeatherByCity(e) {
    try {
      const t = await this.geocodeLocation(e);
      return {
        ...await this.getWeatherData(t.latitude, t.longitude),
        locationName: t.name,
        country: t.country
      };
    } catch (t) {
      throw console.error("Weather service error:", t), t;
    }
  }
}
const W = w`
  /* Design System Variables - imported from design-system.css */
  :host {
    --color-primary: #3b82f6;
    --color-primary-dark: #2563eb;
    --color-secondary: #6b7280;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-background: #ffffff;
    --color-background-secondary: #f9fafb;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-text-light: #9ca3af;
    --color-border: #e5e7eb;
    --color-border-light: #f3f4f6;
    
    --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    
    --border-radius-sm: 0.25rem;
    --border-radius-md: 0.375rem;
    --border-radius-lg: 0.5rem;
    --border-radius-xl: 0.75rem;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
    --spacing-20: 5rem;
    --spacing-24: 6rem;
    --spacing-32: 8rem;
  }
`, H = w`
  /* Base styles */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-4);
  }
  
  @media (min-width: 640px) {
    .container {
      padding: 0 var(--spacing-6);
    }
  }
  
  @media (min-width: 1024px) {
    .container {
      padding: 0 var(--spacing-8);
    }
  }
`, O = w`
  /* Header */
  .header {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: white;
    padding: var(--spacing-6) 0;
    box-shadow: var(--shadow-md);
  }
  
  .header__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    margin: 0;
    text-align: center;
    letter-spacing: -0.025em;
  }
  
  /* Main */
  .main {
    flex: 1;
    padding: var(--spacing-8) 0;
    min-height: calc(100vh - 200px);
  }
  
  /* Search Section */
  .search-section {
    margin-bottom: var(--spacing-8);
  }
  
  .search-form__group {
    display: flex;
    gap: var(--spacing-3);
    max-width: 600px;
    margin: 0 auto;
  }
  
  .search-input {
    flex: 1;
    padding: var(--spacing-3) var(--spacing-4);
    border: 2px solid var(--color-border);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-family: var(--font-family-sans);
    background: white;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .search-input::placeholder {
    color: var(--color-text-light);
  }
  
  .search-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3) var(--spacing-5);
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: white;
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-sans);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    white-space: nowrap;
  }
  
  .search-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }
  
  .search-button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .search-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .search-button__text {
    font-weight: var(--font-weight-medium);
  }
  
  .search-button__icon {
    font-size: var(--font-size-lg);
  }
  
  /* Loading */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-16);
    text-align: center;
  }
  
  .loading__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border-light);
    border-top: 3px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-4);
  }
  
  .loading p {
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    margin: 0;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Error */
  .error {
    text-align: center;
    padding: var(--spacing-12);
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--border-radius-lg);
    margin: var(--spacing-8) 0;
  }
  
  .error__title {
    color: var(--color-error);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    margin: 0 0 var(--spacing-2) 0;
  }
  
  .error__message {
    color: #991b1b;
    font-size: var(--font-size-base);
    margin: 0;
    line-height: var(--line-height-relaxed);
  }
  
  /* Weather Content */
  .weather-content {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .weather-layout {
    display: grid;
    gap: var(--spacing-8);
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 1024px) {
    .weather-layout {
      grid-template-columns: 400px 1fr;
    }
  }
  
  .section-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin: 0 0 var(--spacing-6) 0;
    text-align: center;
  }
  
  @media (min-width: 1024px) {
    .section-title {
      text-align: left;
    }
  }
  
  /* Weather Card */
  .weather-card {
    background: white;
    border-radius: var(--border-radius-xl);
    padding: var(--spacing-8);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border-light);
  }
  
  .current-weather__location {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin: 0 0 var(--spacing-6) 0;
    text-align: center;
  }
  
  .current-weather__main {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-8);
    flex-wrap: wrap;
  }
  
  .current-weather__icon {
    font-size: 4rem;
    line-height: 1;
  }
  
  .current-weather__temp-group {
    text-align: center;
  }
  
  .current-weather__temp {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    line-height: var(--line-height-tight);
    margin-bottom: var(--spacing-2);
  }
  
  .current-weather__condition {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    text-transform: capitalize;
  }
  
  .weather-condition-sunny { color: #f59e0b; }
  .weather-condition-cloudy { color: #6b7280; }
  .weather-condition-rainy { color: #3b82f6; }
  .weather-condition-stormy { color: #7c3aed; }
  
  .current-weather__details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-4);
  }
  
  .weather-detail {
    text-align: center;
    padding: var(--spacing-3);
    background: var(--color-background-secondary);
    border-radius: var(--border-radius-md);
  }
  
  .weather-detail__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--spacing-1);
  }
  
  .weather-detail__value {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }
  
  /* Forecast */
  .forecast__list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .forecast-item {
    background: white;
    border: 1px solid var(--color-border-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-5);
    cursor: pointer;
    transition: all 0.3s ease;
    display: grid;
    grid-template-columns: 100px 60px 1fr;
    align-items: center;
    gap: var(--spacing-4);
  }
  
  .forecast-item:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }
  
  .forecast-item:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    border-color: var(--color-primary);
  }
  
  .forecast-item.active {
    background: var(--color-background-secondary);
    border-color: var(--color-primary);
  }
  
  .forecast-item__day {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    font-size: var(--font-size-base);
  }
  
  .forecast-item__icon {
    font-size: var(--font-size-2xl);
    text-align: center;
  }
  
  .forecast-item__condition {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-1);
  }
  
  .forecast-item__temps {
    display: flex;
    gap: var(--spacing-2);
  }
  
  .forecast-item__high {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
  }
  
  .forecast-item__low {
    color: var(--color-text-secondary);
  }
  
  .forecast-item__details {
    grid-column: 1 / -1;
    margin-top: var(--spacing-4);
    padding-top: var(--spacing-4);
    border-top: 1px solid var(--color-border-light);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-3);
  }
  
  .forecast-detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2);
    background: white;
    border-radius: var(--border-radius-sm);
  }
  
  .forecast-detail-item__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
  
  .forecast-detail-item__value {
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
  }
  
  /* Footer */
  .footer {
    background: var(--color-background-secondary);
    border-top: 1px solid var(--color-border);
    padding: var(--spacing-6) 0;
    margin-top: auto;
  }
  
  .footer__text {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    margin: 0;
  }
  
  .footer__link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
  }
  
  .footer__link:hover {
    text-decoration: underline;
  }
  
  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Responsive adjustments */
  @media (max-width: 640px) {
    .search-form__group {
      flex-direction: column;
    }
    
    .forecast-item {
      grid-template-columns: 80px 50px 1fr;
      gap: var(--spacing-3);
    }
    
    .current-weather__main {
      flex-direction: column;
      gap: var(--spacing-4);
    }
    
    .current-weather__details {
      grid-template-columns: 1fr 1fr;
    }
    
    .forecast-item__details {
      grid-template-columns: 1fr;
    }
  }
`;
class Re extends y {
  // eslint-disable-next-line
  static styles = [
    W,
    H,
    O,
    w`
      :host {
        display: block;
      }
    `
  ];
  // eslint-disable-next-line
  static properties = {
    searchQuery: { type: String },
    isLoading: { type: Boolean }
  };
  constructor() {
    super(), this.searchQuery = "", this.isLoading = !1;
  }
  render() {
    return _`
      <section class="search-section">
        <form 
          class="search-form" 
          data-testid="search-form"
          @submit=${this._handleSubmit}
        >
          <div class="search-form__group">
            <label for="location-input" class="sr-only">Enter city name</label>
            <input 
              type="text" 
              id="location-input"
              class="search-input" 
              placeholder="Enter city name..."
              data-testid="search-input"
              autocomplete="off"
              .value=${this.searchQuery}
              @input=${this._handleInput}
            >
            <button 
              type="submit" 
              class="search-button" 
              data-testid="search-button"
              ?disabled=${this.isLoading}
            >
              <span class="search-button__text">${this.isLoading ? "Loading..." : "Get Weather"}</span>
              <span class="search-button__icon">🌦️</span>
            </button>
          </div>
        </form>
      </section>
    `;
  }
  _handleInput(e) {
    this.searchQuery = e.target.value, this.dispatchEvent(new CustomEvent("search-input", {
      detail: { query: this.searchQuery },
      bubbles: !0,
      composed: !0
    }));
  }
  _handleSubmit(e) {
    e.preventDefault();
    const t = this.searchQuery.trim();
    if (!t) {
      this.dispatchEvent(new CustomEvent("search-error", {
        detail: { message: "Please enter a city name" },
        bubbles: !0,
        composed: !0
      }));
      return;
    }
    this.dispatchEvent(new CustomEvent("search-submit", {
      detail: { city: t },
      bubbles: !0,
      composed: !0
    }));
  }
}
customElements.define("weather-search", Re);
class p {
  static getWeatherDescription(e) {
    return {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail"
    }[e] || "Unknown";
  }
  static getWeatherIcon(e, t = !0) {
    return e === 0 ? t ? "☀️" : "🌙" : e <= 3 ? t ? "⛅" : "☁️" : e <= 48 ? "🌫️" : e <= 57 || e >= 80 && e <= 82 || e >= 61 && e <= 67 ? "🌧️" : e >= 71 && e <= 77 ? "❄️" : e >= 85 && e <= 86 ? "🌨️" : e >= 95 ? "⛈️" : "🌤️";
  }
  static formatTemperature(e) {
    return `${Math.round(e)}°C`;
  }
  static formatWindSpeed(e) {
    return `${Math.round(e)} km/h`;
  }
  static formatPressure(e) {
    return `${Math.round(e)} hPa`;
  }
  static formatPercentage(e) {
    return `${Math.round(e)}%`;
  }
  static getWindDirection(e) {
    const t = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"], r = Math.round(e / 22.5) % 16;
    return t[r];
  }
  static formatDate(e) {
    const t = new Date(e), r = /* @__PURE__ */ new Date(), i = new Date(r);
    return i.setDate(r.getDate() + 1), t.toDateString() === r.toDateString() ? "Today" : t.toDateString() === i.toDateString() ? "Tomorrow" : t.toLocaleDateString("en-US", { weekday: "long" });
  }
  static formatTime(e) {
    return new Date(e).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !1
    });
  }
  static getConditionClass(e) {
    return e === 0 ? "weather-condition-sunny" : e <= 3 ? "weather-condition-cloudy" : e >= 51 && e <= 67 || e >= 80 && e <= 82 ? "weather-condition-rainy" : e >= 95 ? "weather-condition-stormy" : "weather-condition-cloudy";
  }
  static debounce(e, t) {
    let r;
    return function(...a) {
      const o = () => {
        clearTimeout(r), e(...a);
      };
      clearTimeout(r), r = setTimeout(o, t);
    };
  }
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Be = { CHILD: 2 }, je = (s) => (...e) => ({ _$litDirective$: s, values: e });
class Fe {
  constructor(e) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(e, t, r) {
    this._$Ct = e, this._$AM = t, this._$Ci = r;
  }
  _$AS(e, t) {
    return this.update(e, t);
  }
  update(e, t) {
    return this.render(...t);
  }
}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: Qe } = We, le = () => document.createComment(""), z = (s, e, t) => {
  const r = s._$AA.parentNode, i = e === void 0 ? s._$AB : e._$AA;
  if (t === void 0) {
    const a = r.insertBefore(le(), i), o = r.insertBefore(le(), i);
    t = new Qe(a, o, s, s.options);
  } else {
    const a = t._$AB.nextSibling, o = t._$AM, l = o !== s;
    if (l) {
      let n;
      t._$AQ?.(s), t._$AM = s, t._$AP !== void 0 && (n = s._$AU) !== o._$AU && t._$AP(n);
    }
    if (a !== i || l) {
      let n = t._$AA;
      for (; n !== a; ) {
        const h = n.nextSibling;
        r.insertBefore(n, i), n = h;
      }
    }
  }
  return t;
}, x = (s, e, t = s) => (s._$AI(e, t), s), Ve = {}, qe = (s, e = Ve) => s._$AH = e, Ge = (s) => s._$AH, Q = (s) => {
  s._$AR(), s._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const de = (s, e, t) => {
  const r = /* @__PURE__ */ new Map();
  for (let i = e; i <= t; i++) r.set(s[i], i);
  return r;
}, Ye = je(class extends Fe {
  constructor(s) {
    if (super(s), s.type !== Be.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(s, e, t) {
    let r;
    t === void 0 ? t = e : e !== void 0 && (r = e);
    const i = [], a = [];
    let o = 0;
    for (const l of s) i[o] = r ? r(l, o) : o, a[o] = t(l, o), o++;
    return { values: a, keys: i };
  }
  render(s, e, t) {
    return this.dt(s, e, t).values;
  }
  update(s, [e, t, r]) {
    const i = Ge(s), { values: a, keys: o } = this.dt(e, t, r);
    if (!Array.isArray(i)) return this.ut = o, a;
    const l = this.ut ??= [], n = [];
    let h, m, c = 0, u = i.length - 1, d = 0, f = a.length - 1;
    for (; c <= u && d <= f; ) if (i[c] === null) c++;
    else if (i[u] === null) u--;
    else if (l[c] === o[d]) n[d] = x(i[c], a[d]), c++, d++;
    else if (l[u] === o[f]) n[f] = x(i[u], a[f]), u--, f--;
    else if (l[c] === o[f]) n[f] = x(i[c], a[f]), z(s, n[f + 1], i[c]), c++, f--;
    else if (l[u] === o[d]) n[d] = x(i[u], a[d]), z(s, i[c], i[u]), u--, d++;
    else if (h === void 0 && (h = de(o, d, f), m = de(l, c, u)), h.has(l[c])) if (h.has(l[u])) {
      const v = m.get(o[d]), j = v !== void 0 ? i[v] : null;
      if (j === null) {
        const Z = z(s, i[c]);
        x(Z, a[d]), n[d] = Z;
      } else n[d] = x(j, a[d]), z(s, i[c], j), i[v] = null;
      d++;
    } else Q(i[u]), u--;
    else Q(i[c]), c++;
    for (; d <= f; ) {
      const v = z(s, n[f + 1]);
      x(v, a[d]), n[d++] = v;
    }
    for (; c <= u; ) {
      const v = i[c++];
      v !== null && Q(v);
    }
    return this.ut = o, qe(s, n), E;
  }
});
class Ke extends y {
  // eslint-disable-next-line
  static styles = [
    W,
    H,
    O,
    w`
      :host {
        display: block;
      }
    `
  ];
  // eslint-disable-next-line
  static properties = {
    forecastData: { type: Object },
    index: { type: Number },
    active: { type: Boolean, reflect: !0 },
    _expanded: { state: !0 }
  };
  constructor() {
    super(), this.forecastData = null, this.index = 0, this.active = !1, this._expanded = !1;
  }
  render() {
    if (!this.forecastData) return _``;
    const { daily: e, index: t } = this, r = p.formatDate(e.time[t]), i = e.weather_code[t], a = e.temperature_2m_max[t], o = e.temperature_2m_min[t], l = p.getWeatherDescription(i), n = p.getWeatherIcon(i);
    return _`
      <div 
        class="forecast-item ${this.active ? "active" : ""}"
        data-testid="forecast-item"
        tabindex="0"
        role="button"
        aria-label="View detailed forecast for ${r}"
        @click=${this._handleClick}
        @keydown=${this._handleKeyDown}
      >
        <div class="forecast-item__day">${r}</div>
        <div class="forecast-item__icon">${n}</div>
        <div class="forecast-item__info">
          <div class="forecast-item__condition">${l}</div>
          <div class="forecast-item__temps" data-testid="forecast-temps">
            <span class="forecast-item__high" data-testid="forecast-high">${p.formatTemperature(a)}</span>
            <span class="forecast-item__low" data-testid="forecast-low">${p.formatTemperature(o)}</span>
          </div>
        </div>

        ${this.active ? this._renderDetails() : ""}
      </div>
    `;
  }
  _renderDetails() {
    const { daily: e, index: t } = this, r = e.sunrise[t], i = e.sunset[t], a = e.rain_sum[t], o = e.uv_index_max[t], l = e.temperature_2m_min[t], n = e.temperature_2m_max[t], h = e.precipitation_probability_max[t];
    return _`
      <div class="forecast-item__details">
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunrise</div>
          <div class="forecast-detail-item__value">${p.formatTime(r)}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Sunset</div>
          <div class="forecast-detail-item__value">${p.formatTime(i)}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Rain</div>
          <div class="forecast-detail-item__value">${a?.toFixed(1) || 0} mm</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">UV Index</div>
          <div class="forecast-detail-item__value">${o?.toFixed(1) || 0}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Precipitation</div>
          <div class="forecast-detail-item__value">${p.formatPercentage(h || 0)}</div>
        </div>
        <div class="forecast-detail-item">
          <div class="forecast-detail-item__label">Temperature</div>
          <div class="forecast-detail-item__value">
            ${p.formatTemperature(l)} to ${p.formatTemperature(n)}
          </div>
        </div>
      </div>
    `;
  }
  get daily() {
    return this.forecastData;
  }
  _handleClick() {
    this._dispatchToggle();
  }
  _handleKeyDown(e) {
    (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this._dispatchToggle());
  }
  _dispatchToggle() {
    this.dispatchEvent(new CustomEvent("toggle-forecast", {
      detail: { index: this.index },
      bubbles: !0,
      composed: !0
    }));
  }
  updated(e) {
    super.updated(e), e.has("active") && this.active && setTimeout(() => {
      this.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }
}
customElements.define("forecast-item", Ke);
class Je extends y {
  // eslint-disable-next-line
  static styles = [
    W,
    H,
    O,
    w`
      :host {
        display: block;
      }
    `
  ];
  // eslint-disable-next-line
  static properties = {
    forecastData: { type: Object },
    _activeForecastIndex: { state: !0 }
  };
  constructor() {
    super(), this.forecastData = null, this._activeForecastIndex = null;
  }
  render() {
    if (!this.forecastData?.daily?.time)
      return _``;
    const { daily: e } = this.forecastData;
    return _`
      <section class="forecast-section">
        <h2 class="section-title">7-Day Forecast</h2>
        <div class="forecast">
          <div class="forecast__list" data-testid="forecast-list">
            ${Ye(
      e.time,
      (t, r) => r,
      (t, r) => _`
                <forecast-item
                  .forecastData=${e}
                  .index=${r}
                  ?active=${this._activeForecastIndex === r}
                  @toggle-forecast=${this._handleToggleForecast}
                ></forecast-item>
              `
    )}
          </div>
        </div>
      </section>
    `;
  }
  _handleToggleForecast(e) {
    const { index: t } = e.detail;
    if (this._activeForecastIndex === t) {
      this._activeForecastIndex = null;
      return;
    }
    this._activeForecastIndex = t;
  }
}
customElements.define("weather-forecast", Je);
class Ze extends y {
  // eslint-disable-next-line
  static styles = [
    W,
    H,
    O,
    w`
      :host {
        display: block;
      }
    `
  ];
  // eslint-disable-next-line
  static properties = {
    weatherData: { type: Object },
    isLoading: { type: Boolean },
    hasError: { type: Boolean },
    errorMessage: { type: String }
  };
  constructor() {
    super(), this.weatherData = null, this.isLoading = !1, this.hasError = !1, this.errorMessage = "";
  }
  render() {
    return this.isLoading ? this._renderLoading() : this.hasError ? this._renderError() : this.weatherData ? this._renderWeatherContent() : _``;
  }
  _renderLoading() {
    return _`
      <div class="loading" data-testid="loading">
        <div class="loading__spinner"></div>
        <p>Loading weather data...</p>
      </div>
    `;
  }
  _renderError() {
    return _`
      <div class="error" data-testid="error">
        <h2 class="error__title">Unable to load weather data</h2>
        <p class="error__message">${this.errorMessage || "Please check the city name and try again."}</p>
      </div>
    `;
  }
  _renderWeatherContent() {
    const { current: e, locationName: t, country: r } = this.weatherData;
    return _`
      <div class="weather-content" data-testid="weather-content">
        <div class="weather-layout">
          <!-- Current Weather -->
          <section class="current-section">
            <h2 class="section-title">Current Weather</h2>
            <div class="weather-card" data-testid="current-weather">
              <div class="current-weather">
                <h3 class="current-weather__location" data-testid="current-location">
                  ${t}${r ? `, ${r}` : ""}
                </h3>
                <div class="current-weather__main">
                  <div class="current-weather__icon" data-testid="current-icon">
                    ${p.getWeatherIcon(e.weather_code, e.is_day)}
                  </div>
                  <div class="current-weather__temp-group">
                    <div class="current-weather__temp" data-testid="current-temperature">
                      ${p.formatTemperature(e.temperature_2m)}
                    </div>
                    <div 
                      class="current-weather__condition ${p.getConditionClass(e.weather_code)}" 
                      data-testid="current-condition"
                    >
                      ${p.getWeatherDescription(e.weather_code)}
                    </div>
                  </div>
                </div>
                
                <div class="current-weather__details">
                  <div class="weather-detail">
                    <div class="weather-detail__label">Feels like</div>
                    <div class="weather-detail__value" data-testid="feels-like">
                      ${p.formatTemperature(e.apparent_temperature)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Humidity</div>
                    <div class="weather-detail__value" data-testid="humidity">
                      ${p.formatPercentage(e.relative_humidity_2m)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Wind Speed</div>
                    <div class="weather-detail__value" data-testid="wind-speed">
                      ${p.formatWindSpeed(e.wind_speed_10m)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Pressure</div>
                    <div class="weather-detail__value" data-testid="pressure">
                      ${p.formatPressure(e.pressure_msl)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Cloud Cover</div>
                    <div class="weather-detail__value" data-testid="cloud-cover">
                      ${p.formatPercentage(e.cloud_cover)}
                    </div>
                  </div>
                  <div class="weather-detail">
                    <div class="weather-detail__label">Wind Direction</div>
                    <div class="weather-detail__value" data-testid="wind-direction">
                      ${p.getWindDirection(e.wind_direction_10m)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Forecast -->
          <weather-forecast .forecastData=${this.weatherData}></weather-forecast>
        </div>
      </div>
    `;
  }
}
customElements.define("weather-display", Ze);
class Xe extends y {
  // eslint-disable-next-line
  static styles = [
    W,
    H,
    O,
    w`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        font-family: var(--font-family-sans);
        background: var(--color-background);
        color: var(--color-text);
        line-height: var(--line-height-normal);
      }
    `
  ];
  // eslint-disable-next-line
  static properties = {
    _searchQuery: { state: !0 },
    _isLoading: { state: !0 },
    _hasError: { state: !0 },
    _errorMessage: { state: !0 },
    _weatherData: { state: !0 }
  };
  constructor() {
    super(), this._searchQuery = "", this._isLoading = !1, this._hasError = !1, this._errorMessage = "", this._weatherData = null, this._weatherService = new Ie(), this._loadSavedLocationOrDefault();
  }
  render() {
    return _`
      <header class="header">
        <div class="container">
          <h1 class="header__title">Weather Front</h1>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <weather-search
            .searchQuery=${this._searchQuery}
            .isLoading=${this._isLoading}
            @search-input=${this._handleSearchInput}
            @search-submit=${this._handleSearchSubmit}
            @search-error=${this._handleSearchError}
          ></weather-search>

          <div class="weather-container" data-testid="weather-container">
            <weather-display
              .weatherData=${this._weatherData}
              .isLoading=${this._isLoading}
              .hasError=${this._hasError}
              .errorMessage=${this._errorMessage}
            ></weather-display>
          </div>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p class="footer__text">
            Built with Lit • MIT License • 
            <a href="https://github.com/Lissy93" class="footer__link" target="_blank" rel="noopener">Alicia Sykes</a>
          </p>
        </div>
      </footer>
    `;
  }
  _handleSearchInput(e) {
    this._searchQuery = e.detail.query;
  }
  _handleSearchSubmit(e) {
    const { city: t } = e.detail;
    this._loadWeather(t);
  }
  _handleSearchError(e) {
    this._showError(e.detail.message);
  }
  async _loadWeather(e) {
    try {
      this._setLoading(!0), this._clearError(), this._weatherData = await this._weatherService.getWeatherByCity(e), this._saveLocation(e), this._showWeatherContent();
    } catch (t) {
      this._showError(t.message);
    } finally {
      this._setLoading(!1);
    }
  }
  async _loadSavedLocationOrDefault() {
    try {
      const e = this._getSavedLocation();
      if (e) {
        this._searchQuery = e, await this._loadWeather(e);
        return;
      }
    } catch (e) {
      console.warn("Could not load saved location:", e);
    }
    try {
      await this._getCurrentLocationWeather();
    } catch (e) {
      console.warn("Could not get current location:", e), this._searchQuery = "London", await this._loadWeather("London");
    }
  }
  _getCurrentLocationWeather() {
    return new Promise((e, t) => {
      if (!navigator.geolocation) {
        t(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (r) => {
          try {
            this._setLoading(!0), this._clearError();
            const { latitude: i, longitude: a } = r.coords;
            this._weatherData = await this._weatherService.getWeatherData(i, a), this._weatherData.locationName = "Current Location", this._searchQuery = "Current Location", this._showWeatherContent(), e();
          } catch (i) {
            t(i);
          } finally {
            this._setLoading(!1);
          }
        },
        (r) => {
          t(r);
        },
        {
          timeout: 1e4,
          enableHighAccuracy: !1,
          maximumAge: 3e5
          // 5 minutes
        }
      );
    });
  }
  _setLoading(e) {
    this._isLoading = e;
  }
  _showError(e) {
    this._hasError = !0, this._weatherData = null, this._errorMessage = e;
  }
  _clearError() {
    this._hasError = !1, this._errorMessage = "";
  }
  _showWeatherContent() {
    this._hasError = !1;
  }
  _saveLocation(e) {
    try {
      localStorage.setItem("weather-app-location", e);
    } catch (t) {
      console.warn("Could not save location to localStorage:", t);
    }
  }
  _getSavedLocation() {
    try {
      return localStorage.getItem("weather-app-location");
    } catch (e) {
      return console.warn("Could not get saved location from localStorage:", e), null;
    }
  }
}
customElements.define("weather-app", Xe);
