// Saver — core money math. PORTED VERBATIM from legacy App.jsx. **DO NOT change the maths.**
// See saver-site/APP-LOGIC.md (locked). Transaction types: income|expense|saving|goal_withdraw|goal_return|transfer.

export function calcBankBalance(bankId, txns) {
  return txns.reduce((acc, t) => {
    if (t.bankId === bankId && t.type === "income") return acc + t.amount;
    if (t.bankId === bankId && t.type === "expense") return acc - t.amount;
    if (t.bankId === bankId && t.type === "goal_withdraw") return acc - t.amount;
    if (t.toBankId === bankId && t.type === "transfer") return acc + t.amount;
    if ((t.fromBankId || t.bankId) === bankId && t.type === "transfer") return acc - t.amount;
    return acc;
  }, 0);
}

export function calcGoalSaved(goalId, txns) {
  return txns.reduce((acc, t) => {
    if (t.goalId === goalId && t.type === "saving") return acc + t.amount;
    if (t.goalId === goalId && t.type === "goal_withdraw") return acc - t.amount;
    if (t.goalId === goalId && t.type === "goal_return") return acc - t.amount;
    return acc;
  }, 0);
}

export function calcFrozenForBank(bankId, savings, txns) {
  return txns.reduce((acc, t) => {
    if (t.bankId === bankId && t.type === "saving") return acc + t.amount;
    if (t.bankId === bankId && t.type === "goal_withdraw") return acc - t.amount;
    if (t.bankId === bankId && t.type === "goal_return") return acc - t.amount;
    return acc;
  }, 0);
}

// Per-bank goal balance map (used to split a goal withdraw/return across the banks it was frozen in)
export function goalBalancesPerBank(goalId, txns) {
  const balances = {};
  txns.forEach((t) => {
    if (t.goalId !== goalId) return;
    if (t.type === "saving") balances[t.bankId] = (balances[t.bankId] || 0) + t.amount;
    if (t.type === "goal_withdraw" || t.type === "goal_return") balances[t.bankId] = (balances[t.bankId] || 0) - t.amount;
  });
  return balances;
}

// Derived helpers (clamped where legacy clamps with Math.max(0, …))
export const makeCalc = (txns, savings = []) => ({
  bankBalance: (id) => calcBankBalance(id, txns),
  goalSaved: (id) => Math.max(0, calcGoalSaved(id, txns)),
  frozenForBank: (id) => Math.max(0, calcFrozenForBank(id, savings, txns)),
  safeToSpend: (id) => calcBankBalance(id, txns) - Math.max(0, calcFrozenForBank(id, savings, txns)),
});

export const totalBalance = (banks, txns) => banks.reduce((s, b) => s + calcBankBalance(b.id, txns), 0);
export const totalSafe = (banks, txns, savings) => banks.reduce((s, b) => s + (calcBankBalance(b.id, txns) - Math.max(0, calcFrozenForBank(b.id, savings, txns))), 0);
export const totalFrozen = (banks, txns, savings) => banks.reduce((s, b) => s + Math.max(0, calcFrozenForBank(b.id, savings, txns)), 0);

// ── Budgets & Projects (spend = expense + goal_withdraw in the budget's categories) ──
// Monthly budgets reset each month; projects accumulate from startMonth across all months.
const inBudget = (t, cats) => (t.type === "expense" || t.type === "goal_withdraw") && cats?.includes(t.catId);
export const budgetTxns = (budget, txns, month) =>
  budget.kind === "project"
    ? txns.filter((t) => inBudget(t, budget.cats) && (!budget.startMonth || (t.date || "").slice(0, 7) >= budget.startMonth))
    : txns.filter((t) => inBudget(t, budget.cats) && (t.date || "").startsWith(month));
export const budgetSpentMonth = (budget, txns, month) => txns.filter((t) => inBudget(t, budget.cats) && (t.date || "").startsWith(month)).reduce((a, t) => a + t.amount, 0);
export const projectSpent = (project, txns) => txns.filter((t) => inBudget(t, project.cats) && (!project.startMonth || (t.date || "").slice(0, 7) >= project.startMonth)).reduce((a, t) => a + t.amount, 0);

// Month-scoped income / expense (expense includes goal_withdraw, per legacy)
export const monthTxns = (txns, month) => txns.filter((t) => (t.date || "").startsWith(month));
export const sumIncome = (txns) => txns.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
export const sumExpense = (txns) => txns.filter((t) => t.type === "expense" || t.type === "goal_withdraw").reduce((a, t) => a + t.amount, 0);
