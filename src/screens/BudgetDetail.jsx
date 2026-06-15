// Saver — Budget detail (monthly): ported 1:1 from showcase 12 (category ledger).
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, currentMonth, MONTHS, fmtDate } from "../lib/format.js";
import { budgetSpentMonth, budgetTxns } from "../lib/calc.js";

export default function BudgetDetail({ store, budgetId, back }) {
  const { budgets = [], txns = [], banks = [] } = store;
  const budget = budgets.find((b) => b.id === budgetId);
  if (!budget) return null;
  const cm = currentMonth();
  const spent = budgetSpentMonth(budget, txns, cm);
  const limit = budget.amount || 0;
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const over = spent > limit;
  const left = limit - spent;
  const rows = budgetTxns(budget, txns, cm).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "—";

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{budget.name}</div><div className="grow" /><div className="hchip"><Ico name="cal" size={14} />{MONTHS[+cm.split("-")[1] - 1]}</div></div>
        <div className="lbl">Spent</div>
        <div className="big tnum">{fmt(spent)}</div>
        <div className="sub">of {fmt(limit)} budget &nbsp;·&nbsp; {limit > 0 ? Math.round((spent / limit) * 100) : 0}% used</div>
      </div>

      <div className="tile" style={{ marginBottom: 18, padding: 14 }}>
        <div className="pbar bar"><i style={{ width: `${pct}%`, background: over ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--ac)" }} /></div>
        <div className="caption" style={{ marginTop: 9, color: over ? "var(--red)" : "var(--muted)" }}>{over ? `${fmt(-left)} over for ${MONTHS[+cm.split("-")[1] - 1]}` : `${fmt(left)} left for ${MONTHS[+cm.split("-")[1] - 1]}`}</div>
      </div>

      <div className="over">Transactions</div>
      {rows.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px" }}>No spending in these categories yet.</div>
        : rows.map((t) => (
          <div className="icard" key={t.id}>
            <CatTile txn={t} size={44} />
            <div><div className="nm">{t.catName || t.note || "Expense"}</div><div className="mt">{bankName(t.bankId)} · {t.date ? fmtDate(t.date).split(":")[0] : ""}</div></div>
            <div className="amtb"><b className="tnum" style={{ color: "var(--red)" }}>−{fmt(t.amount)}</b></div>
          </div>
        ))}
    </div>
  );
}
