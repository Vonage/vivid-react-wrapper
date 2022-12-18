import l, { useRef as j, useEffect as f } from "react";
import { flow as w, noop as F, isUndefined as L, upperFirst as N, pickBy as S, isString as a, identity as A } from "lodash";
const V = (t, e, n) => t.setAttribute(e, n), h = (t, e, n) => t[n === "true" ? "setAttribute" : "removeAttribute"](e, n), k = (t, e, n, p, o) => () => {
  const s = n.current, c = w(o, t[e] || F), u = () => s == null ? void 0 : s.removeEventListener(p, c);
  return y(t, e) && (s == null || s.addEventListener(p, c)), u;
}, v = (t, e, n, p) => () => {
  const o = n.current;
  o && y(t, e) && p(o, e, t[e]);
}, y = (t, e) => !L(t[e]), O = (t) => t.propName || ["on", N(t.name || t)].join(""), g = (t, e = {
  events: [],
  attributes: [],
  properties: []
}) => l.forwardRef(({ children: n = [], ...p }, o) => {
  var u, d, E;
  const s = S(p, (r) => r !== !1), c = j(null);
  return (u = e.events) == null || u.forEach((r) => {
    const m = a(r) ? r : r.name, i = a(r) ? A : r.transform || A, b = O(r);
    f(k(s, b, c, m, i), [s[b]]);
  }), (d = e.attributes) == null || d.forEach((r) => {
    const m = a(r) ? r : r.name, i = a(r) ? h : r.setter || h;
    f(v(s, m, c, i), [s[m]]);
  }), (E = e.properties) == null || E.forEach((r) => {
    f(() => {
      c.current && (c.current[r] = s[r]);
    }, [s[r]]);
  }), l.createElement(t, {
    ref: (r) => {
      c.current = r, typeof o == "function" ? o(r) : o && typeof o == "object" && (o.current = r);
    },
    ...M(s, e)
  }, [], ...[].concat(n));
}), x = (t) => typeof t == "string" ? t : t.name, M = (t, e) => {
  var o, s;
  const n = [...Object.keys(t)], p = [
    ...((o = e.events) == null ? void 0 : o.map(O)) || [],
    ...((s = e.attributes) == null ? void 0 : s.map(x)) || [],
    ...e.properties || []
  ];
  return n.filter((c) => !p.includes(c)).reduce(B(t), {});
}, B = (t) => (e, n) => ({ ...e, [n]: t[n] });
export {
  h as attributeSetterToggle,
  V as attributeSetterValue,
  g as default,
  y as propExists,
  O as propNameFromEvent,
  v as setDOMAttributes,
  k as setDOMListeners
};
