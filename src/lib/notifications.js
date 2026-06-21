// Saver — single source of truth for the notifications inbox. Used by the
// Notifications screen (full list) and the Home bell (unread badge). Items are
// derived live from bills, installments, goals, budgets & accounts; read state
// persists per stable item key in store.notifReadKeys.
import { fmt, currentMonth } from "./format.js";
import { calcBankBalance, calcFrozenForBank, calcGoalSaved, budgetSpentMonth } from "./calc.js";

export function buildNotifications(store) {
  const { bills = [], installments = [], budgets = [], savings = [], banks = [], txns = [], notifReadKeys = [] } = store;
  const cm = currentMonth();
  const day = new Date().getDate();
  const items = [];

  // bills due soon (unpaid, within 3 days)
  bills.forEach((b) => {
    if (b.payments?.some((p) => p.month === cm)) return;
    if (b.dueDay == null) return;
    const dueIn = b.dueDay - day;
    if (dueIn >= 0 && dueIn <= 3) items.push({ key: `bill-${b.id}-${cm}`, icon: "bell", bg: "var(--yellowDim)", col: "var(--yellow)", nm: `${b.name}’s knocking — due ${dueIn === 0 ? "today" : dueIn === 1 ? "tomorrow" : `in ${dueIn} days`}`, mt: "Bills" });
  });
  // installment payments due this month (active plan, not yet paid)
  installments.forEach((i) => {
    if (i.stopped || i.status === "completed") return;
    if ((i.paidInstallments || 0) >= (i.totalInstallments || 0)) return;
    if (i.payments?.some((p) => p.month === cm)) return;
    const label = i.name || i.company || "Installment";
    items.push({ key: `inst-${i.id}-${cm}`, icon: "card", bg: "var(--orangeDim)", col: "var(--orange)", nm: `${label} — this month’s payment is due`, mt: `${fmt(i.installmentAmount)} · Installments` });
  });
  // goals reached
  savings.filter((s) => s.status !== "archived").forEach((s) => {
    if (s.goal > 0 && calcGoalSaved(s.id, txns) >= s.goal) items.push({ key: `goal-${s.id}`, icon: "target", bg: "var(--acDim)", col: "var(--ac)", nm: `You smashed it — ${s.name} goal done!`, mt: "Goals" });
  });
  // budgets overspent this month
  budgets.filter((b) => b.kind !== "project" && (b.month ? b.month === cm : (!b.startMonth || cm >= b.startMonth))).forEach((b) => {
    const limit = b.amount || 0;
    if (limit <= 0) return;
    const spent = budgetSpentMonth(b, txns, cm);
    if (spent > limit) items.push({ key: `budget-${b.id}-${cm}`, icon: "layers", bg: "var(--purpleDim)", col: "var(--purple)", nm: `${b.name} budget is over`, mt: `${fmt(spent - limit)} past your ${fmt(limit)} cap` });
  });
  // low-balance accounts
  banks.forEach((b) => {
    if (b.lowBalanceThreshold == null) return;
    const safe = calcBankBalance(b.id, txns) - Math.max(0, calcFrozenForBank(b.id, savings, txns));
    if (safe <= b.lowBalanceThreshold) items.push({ key: `bank-low-${b.id}`, icon: "wallet", bg: "var(--redDim)", col: "var(--red)", nm: `${b.name}’s running low`, mt: `${fmt(safe)} left` });
  });
  // backup nudge (informational — never counts as unread)
  items.push({ key: "backup", icon: "download", bg: "var(--blueDim)", col: "var(--blue)", nm: "Your backup misses you", mt: "Keep a recent copy", muted: true });

  const read = new Set(notifReadKeys);
  items.forEach((n) => { n.unread = !n.muted && !read.has(n.key); });
  return items;
}

// Count of unread items — drives the Home bell badge.
export function unreadCount(store) {
  return buildNotifications(store).filter((n) => n.unread).length;
}
