// Saver — data layer: localStorage persistence + React store hook.
// Same storage keys/shape as legacy so existing user backups restore unchanged.
// Transaction CRUD (addTxn/addTxns/delTxn/updateTxn) is PORTED VERBATIM from the
// legacy app — money maths & validation rules are LOCKED (see saver-site/APP-LOGIC.md).
import { useState, useEffect, useCallback, useRef } from "react";
import { setCurrency, currentMonth, HAPTICS, fmt } from "./format.js";
import { makeCalc, goalBalancesPerBank } from "./calc.js";

export const KEYS = {
  txns: "et_txns", banks: "et_banks", expCats: "et_expCats", incCats: "et_incCats",
  groups: "et_groups", savings: "et_savings", currency: "et_currency",
  username: "et_username", lastBackup: "et_lastBackup", bills: "et_bills",
  budgets: "et_budgets", quickActions: "et_quick_actions", seenWelcome: "et_seenWelcome",
  theme: "et_theme", installments: "et_installments", accent: "et_accent", dashboard: "et_dashboard",
};

export const DASH_SECTIONS = [
  { id: "accounts", label: "Accounts & balance", icon: "wallet", bg: "var(--acDim)", color: "var(--ac)" },
  { id: "income", label: "Income & expenses", icon: "activity", bg: "var(--blueDim)", color: "var(--blue)" },
  { id: "bills", label: "Monthly bills", icon: "bills", bg: "var(--blueDim)", color: "var(--blue)" },
  { id: "installments", label: "Installments", icon: "card", bg: "var(--orangeDim)", color: "var(--orange)" },
  { id: "budgets", label: "Monthly budgets", icon: "layers", bg: "var(--purpleDim)", color: "var(--purple)" },
  { id: "projects", label: "Projects", icon: "sparkles", bg: "var(--purpleDim)", color: "var(--purple)" },
  { id: "goals", label: "Savings goals", icon: "target", bg: "var(--acDim)", color: "var(--ac)" },
];
export const DASH_DEFAULT = { order: DASH_SECTIONS.map((s) => s.id), hidden: [] };

// calm accent palette (dark+light safe): [ac, ac2]; onacc stays dark for all pastels
export const ACCENTS = {
  mint: ["#5FE3C0", "#8af0d6"], sage: ["#93CFA8", "#B4E0C4"], ocean: ["#86B5E6", "#A9CDF0"],
  lavender: ["#C0A9E6", "#D6C6F0"], rose: ["#F1AECB", "#F8CFE0"], honey: ["#E6C98A", "#F0DDAE"],
};

export const loadKey = (key, fallback) => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } };
export const saveKey = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { console.warn("Storage:", e); return false; } };

const ENTITIES = {
  txns: [], banks: [], expCats: [], incCats: [], groups: [], savings: [],
  bills: [], budgets: [], installments: [], quickActions: [],
};
const SCALARS = { currency: "EGP", username: "", theme: "dark", accent: "mint", dashboard: DASH_DEFAULT, seenWelcome: false };

// Single store hook: loads everything, exposes data + persisted setters + locked actions.
export function useStore() {
  const [data, setData] = useState(() => {
    const d = {};
    for (const k in ENTITIES) d[k] = loadKey(KEYS[k], ENTITIES[k]);
    for (const k in SCALARS) d[k] = loadKey(KEYS[k], SCALARS[k]);
    setCurrency(d.currency); // sync before first render so amounts format correctly
    return d;
  });

  // mirror latest data into a ref so actions can read/validate synchronously
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // global message surface (friendly hybrid: blocking dialogs + confirms + toasts)
  const [alert, setAlert] = useState(null);     // { title, message, color }
  const [confirm, setConfirm] = useState(null);  // { title, message, color, confirmText, danger, onConfirm }
  const [toast, setToast] = useState(null);      // { title, sub, color, icon }
  const toastTimer = useRef(null);
  const flash = useCallback((t) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // keep currency formatter + theme attribute in sync
  useEffect(() => { setCurrency(data.currency); }, [data.currency]);
  useEffect(() => { document.documentElement.setAttribute("data-theme", data.theme === "dark" ? "dark" : "light"); }, [data.theme]);
  useEffect(() => { const [ac, ac2] = ACCENTS[data.accent] || ACCENTS.mint; const s = document.documentElement.style; s.setProperty("--ac", ac); s.setProperty("--ac2", ac2); }, [data.accent]);

  const set = useCallback((key, valOrFn) => {
    setData((prev) => {
      const val = typeof valOrFn === "function" ? valOrFn(prev[key]) : valOrFn;
      saveKey(KEYS[key], val);
      return { ...prev, [key]: val };
    });
  }, []);

  // ── Transaction CRUD (LOCKED logic, ported verbatim from legacy) ──
  const processingRef = useRef(false);

  // Keep installment plans AND bills in sync when their linked transactions are removed.
  const reconcileLinked = useCallback((removedIds) => {
    const removed = new Set(removedIds);
    const { installments, bills } = dataRef.current;
    let changed = false;
    const upd = installments.map((inst) => {
      let n = inst;
      if (inst.downPaymentTxnId && removed.has(inst.downPaymentTxnId)) { n = { ...n, downPayment: 0, downPaymentTxnId: null }; changed = true; }
      if (n.payments && n.payments.some((p) => p.txnId && removed.has(p.txnId))) {
        const np = n.payments.filter((p) => !(p.txnId && removed.has(p.txnId)));
        n = { ...n, payments: np, paidInstallments: np.length, status: np.length >= n.totalInstallments ? "completed" : "active" };
        changed = true;
      }
      return n;
    });
    if (changed) set("installments", upd);
    let bChanged = false;
    const updB = bills.map((b) => {
      if (b.payments && b.payments.some((p) => p.txnId && removed.has(p.txnId))) { bChanged = true; return { ...b, payments: b.payments.filter((p) => !(p.txnId && removed.has(p.txnId))) }; }
      return b;
    });
    if (bChanged) set("bills", updB);
  }, [set]);

  const addTxn = useCallback((t) => {
    if (processingRef.current) return false;
    processingRef.current = true;
    try {
      const { txns, banks, savings } = dataRef.current;
      const calc = makeCalc(txns, savings);
      if (t.type === "expense" || t.type === "transfer") {
        const checkId = t.type === "transfer" ? (t.fromBankId || t.bankId) : t.bankId;
        const avail = calc.safeToSpend(checkId);
        if (avail < t.amount) { HAPTICS.warning(); setAlert({ title: "Not enough balance", message: `Available balance is ${fmt(avail)}. That doesn't cover this.`, color: "var(--red)" }); return false; }
      }
      if (t.type === "saving") {
        const avail = calc.safeToSpend(t.bankId);
        if (avail < t.amount) { HAPTICS.warning(); setAlert({ title: "Not enough balance", message: `Available balance is ${fmt(avail)}. Not enough to save.`, color: "var(--red)" }); return false; }
      }
      if (t.type === "goal_withdraw" || t.type === "goal_return") {
        const saved = calc.goalSaved(t.goalId);
        if (t.amount > saved) { HAPTICS.warning(); setAlert({ title: "Not enough in this goal", message: `This goal only has ${fmt(saved)}.`, color: "var(--red)" }); return false; }
        let rem = t.amount;
        const bpb = goalBalancesPerBank(t.goalId, txns);
        const newTxns = [];
        const ts = Date.now();
        for (const [bId, bAmt] of Object.entries(bpb)) {
          if (bAmt > 0 && rem > 0) {
            const deduct = Math.min(bAmt, rem);
            const bankObj = banks.find((b) => b.id === bId);
            newTxns.push({ ...t, id: (ts + newTxns.length).toString(), amount: deduct, bankId: bId, bankName: bankObj?.name || "Unknown", splitGroupId: ts.toString() });
            rem -= deduct;
          }
        }
        if (newTxns.length > 0) { set("txns", (prev) => [...newTxns, ...prev]); HAPTICS.success(); return newTxns[0].id; }
      }
      const id = Date.now().toString();
      set("txns", (prev) => [{ ...t, id }, ...prev]);
      HAPTICS.success(); return id;
    } finally { setTimeout(() => { processingRef.current = false; }, 500); }
  }, [set]);

  // Batch-add (used for back-filling a down payment / already-paid installments).
  const addTxns = useCallback((list) => {
    if (!list || !list.length) return [];
    const { txns, savings } = dataRef.current;
    const calc = makeCalc(txns, savings);
    const byBank = {};
    for (const t of list) { if (t.type === "expense" || t.type === "transfer") { const b = t.type === "transfer" ? (t.fromBankId || t.bankId) : t.bankId; byBank[b] = (byBank[b] || 0) + t.amount; } }
    for (const [bId, total] of Object.entries(byBank)) {
      const avail = calc.safeToSpend(bId);
      if (avail < total) { HAPTICS.warning(); setAlert({ title: "Not enough balance", message: `Available balance is ${fmt(avail)}. That doesn't cover this.`, color: "var(--red)" }); return false; }
    }
    const ts = Date.now();
    const withIds = list.map((t, i) => ({ ...t, id: (ts + i).toString() }));
    set("txns", (prev) => [...withIds, ...prev]);
    HAPTICS.success(); return withIds.map((t) => t.id);
  }, [set]);

  const delTxn = useCallback((id) => {
    const { txns, savings } = dataRef.current;
    const t = txns.find((x) => x.id === id);
    if (!t) return false;
    if (t.type === "saving") {
      const calc = makeCalc(txns, savings);
      if (calc.goalSaved(t.goalId) - t.amount < 0) { HAPTICS.warning(); setAlert({ title: "Can't remove this", message: "These funds were already spent or returned, so this saving can't be deleted.", color: "var(--red)" }); return false; }
    }
    const removedIds = t.splitGroupId ? txns.filter((x) => x.splitGroupId === t.splitGroupId).map((x) => x.id) : [id];
    const next = t.splitGroupId ? txns.filter((x) => x.splitGroupId !== t.splitGroupId) : txns.filter((x) => x.id !== id);
    set("txns", next);
    reconcileLinked(removedIds);
    return next;
  }, [set, reconcileLinked]);

  const updateTxn = useCallback((id, patch) => {
    const { txns, savings } = dataRef.current;
    const orig = txns.find((t) => t.id === id);
    if (!orig) return false;
    const calc = makeCalc(txns, savings);
    if (orig.splitGroupId && patch.amount && patch.amount !== orig.amount) { HAPTICS.warning(); setAlert({ title: "Split transaction", message: "This is split across banks. Delete it and add it again to change the amount.", color: "var(--yellow)" }); return false; }
    if (patch.amount && patch.amount !== orig.amount) {
      if (orig.type === "saving") {
        if (patch.amount < orig.amount) { const diff = orig.amount - patch.amount; if (calc.goalSaved(orig.goalId) - diff < 0) { HAPTICS.warning(); setAlert({ title: "Can't reduce this", message: "Those funds have already been spent.", color: "var(--red)" }); return false; } }
        else { const extra = patch.amount - orig.amount; if (calc.safeToSpend(orig.bankId) < extra) { HAPTICS.warning(); setAlert({ title: "Not enough balance", message: `Available balance is ${fmt(calc.safeToSpend(orig.bankId))}. Not enough to increase this saving.`, color: "var(--red)" }); return false; } }
      }
      if (orig.type === "expense" || orig.type === "transfer") { const checkId = orig.type === "transfer" ? (orig.fromBankId || orig.bankId) : orig.bankId; const availWithout = calc.safeToSpend(checkId) + orig.amount; if (availWithout < patch.amount) { HAPTICS.warning(); setAlert({ title: "Not enough balance", message: "Not enough balance for this change.", color: "var(--red)" }); return false; } }
    }
    set("txns", txns.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    return true;
  }, [set]);

  // restore a full backup payload (maps backup keys → store)
  const restore = useCallback((payload) => {
    setData((prev) => {
      const next = { ...prev };
      for (const k in ENTITIES) if (payload[k]) { next[k] = payload[k]; saveKey(KEYS[k], payload[k]); }
      for (const k in SCALARS) if (payload[k] != null) { next[k] = payload[k]; saveKey(KEYS[k], payload[k]); }
      return next;
    });
  }, []);

  return {
    ...data, set, restore,
    addTxn, addTxns, delTxn, updateTxn,
    alert, setAlert, confirm, setConfirm, toast, flash,
  };
}

export { currentMonth };
