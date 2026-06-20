// Saver — formatting & time helpers (ported verbatim from legacy; LOGIC LOCKED)
export const APP_VERSION = "3.0";

export const CURRENCIES = [
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬" }, { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" }, { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" }, { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
];

let _currency = "EGP";
export const setCurrency = (c) => { _currency = c; };
export const getCurrency = () => _currency;

export const fmt = (n, ov) => {
  const cur = ov || _currency;
  try {
    const r = Math.round(n * 100) / 100;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: r % 1 === 0 ? 0 : 1, maximumFractionDigits: 2 }).format(r);
  } catch { return `${cur} ${n}`; }
};

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtDate = (d) => { const dt = new Date(d + "T12:00:00"); return `${DAYS[dt.getDay()]}: ${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`; };

const getLocalTime = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const localISO = new Date(d.getTime() - offset).toISOString();
  return { today: localISO.split("T")[0], month: localISO.slice(0, 7) };
};
export const today = () => getLocalTime().today;
export const currentMonth = () => getLocalTime().month;
export const prevMonthOf = (m) => { const [y, mo] = m.split("-"); const d = new Date(+y, +mo - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

// colour helpers for brand cards
export const _lum = (hex) => { try { const c = hex.replace("#", ""); const r = parseInt(c.slice(0, 2), 16) / 255, g = parseInt(c.slice(2, 4), 16) / 255, b = parseInt(c.slice(4, 6), 16) / 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b; } catch { return 0.5; } };
export const darken = (hex, f = 0.5) => { try { let c = String(hex).replace("#", ""); if (c.length === 3) c = c.split("").map((ch) => ch + ch).join(""); if (c.length !== 6) return hex; const x = (i) => Math.round(parseInt(c.slice(i, i + 2), 16) * (1 - f)).toString(16).padStart(2, "0"); return `#${x(0)}${x(2)}${x(4)}`; } catch { return hex; } };
export const cardGradient = (hex) => `linear-gradient(140deg, ${hex}, ${darken(hex, 0.52)})`;

export const vibrate = (p) => { if (typeof window !== "undefined" && window.navigator?.vibrate) try { window.navigator.vibrate(p); } catch (e) {} };
export const HAPTICS = { light: () => vibrate(10), medium: () => vibrate(20), heavy: () => vibrate(50), success: () => vibrate([30, 50, 30]), warning: () => vibrate(100) };
