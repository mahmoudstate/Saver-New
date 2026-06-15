// Saver — data layer: localStorage persistence + React store hook.
// Same storage keys/shape as legacy so existing user backups restore unchanged.
import { useState, useEffect, useCallback, useRef } from "react";
import { setCurrency, currentMonth } from "./format.js";

export const KEYS = {
  txns: "et_txns", banks: "et_banks", expCats: "et_expCats", incCats: "et_incCats",
  groups: "et_groups", savings: "et_savings", currency: "et_currency",
  username: "et_username", lastBackup: "et_lastBackup", bills: "et_bills",
  budgets: "et_budgets", quickActions: "et_quick_actions", seenWelcome: "et_seenWelcome",
  theme: "et_theme", installments: "et_installments",
};

export const loadKey = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
export const saveKey = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { console.warn("Storage:", e); return false; } };

const ENTITIES = {
  txns: [], banks: [], expCats: [], incCats: [], groups: [], savings: [],
  bills: [], budgets: [], installments: [], quickActions: [],
};
const SCALARS = { currency: "EGP", username: "", theme: "dark" };

// Single store hook: loads everything, exposes data + persisted setters.
export function useStore() {
  const [data, setData] = useState(() => {
    const d = {};
    for (const k in ENTITIES) d[k] = loadKey(KEYS[k], ENTITIES[k]);
    for (const k in SCALARS) d[k] = loadKey(KEYS[k], SCALARS[k]);
    setCurrency(d.currency); // sync before first render so amounts format correctly
    return d;
  });

  // keep currency formatter + theme attribute in sync
  useEffect(() => { setCurrency(data.currency); }, [data.currency]);
  useEffect(() => { document.documentElement.setAttribute("data-theme", data.theme === "dark" ? "dark" : "light"); }, [data.theme]);

  const set = useCallback((key, valOrFn) => {
    setData((prev) => {
      const val = typeof valOrFn === "function" ? valOrFn(prev[key]) : valOrFn;
      saveKey(KEYS[key], val);
      return { ...prev, [key]: val };
    });
  }, []);

  // restore a full backup payload (maps backup keys → store)
  const restore = useCallback((payload) => {
    setData((prev) => {
      const next = { ...prev };
      for (const k in ENTITIES) if (payload[k]) { next[k] = payload[k]; saveKey(KEYS[k], payload[k]); }
      for (const k in SCALARS) if (payload[k] != null) { next[k] = payload[k]; saveKey(KEYS[k], payload[k]); }
      return next;
    });
  }, []);

  return { ...data, set, restore };
}

export { currentMonth };
