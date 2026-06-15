// Saver — Activity: ported 1:1 from showcase 02. Grouped history + month summary.
import { useMemo } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, currentMonth, MONTHS, today } from "../lib/format.js";
import { monthTxns, sumIncome, sumExpense } from "../lib/calc.js";

const Funnel = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8.5V20l-4-2.5v-4z" /></svg>;

function dayLabel(date) {
  const t = today();
  const y = (() => { const d = new Date(t + "T12:00:00"); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); })();
  if (date === t) return "Today";
  if (date === y) return "Yesterday";
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default function Activity({ store, onFilter, onEdit }) {
  const { txns, banks } = store;
  const cm = currentMonth();
  const bankName = (t) => t.bankName || banks.find((b) => b.id === t.bankId)?.name || "";

  const { spent, income, net, groups } = useMemo(() => {
    const mt = monthTxns(txns, cm);
    const sp = sumExpense(mt), inc = sumIncome(mt);
    const sorted = [...txns].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (Number(b.id) || 0) - (Number(a.id) || 0));
    const g = [];
    sorted.forEach((t) => {
      const last = g[g.length - 1];
      if (last && last.date === t.date) last.items.push(t);
      else g.push({ date: t.date, items: [t] });
    });
    return { spent: sp, income: inc, net: inc - sp, groups: g };
  }, [txns, cm]);

  const row = (t) => {
    let cls = "", sign = "", nm, sub, cat = null, color;
    if (t.type === "income") { cls = "in"; sign = "+"; nm = t.note || t.catName || "Income"; sub = bankName(t); }
    else if (t.type === "expense") { cls = "out"; sign = "−"; nm = t.note || t.catName || "Expense"; sub = `${bankName(t)}${t.catName ? " · " + t.catName : ""}`; }
    else if (t.type === "saving") { cat = "goal"; color = "var(--ac)"; nm = t.goalName ? "Saved · " + t.goalName : "Saving"; sub = `${bankName(t)} → goal`; }
    else if (t.type === "goal_withdraw") { cls = "out"; sign = "−"; cat = "goal"; nm = t.goalName ? "Spent from " + t.goalName : "Goal spend"; sub = bankName(t); }
    else if (t.type === "goal_return") { cls = "in"; sign = "+"; cat = "goal"; nm = t.goalName ? "Returned · " + t.goalName : "Goal return"; sub = bankName(t); }
    else if (t.type === "transfer") { cat = "transfer"; color = "var(--blue)"; nm = "Transfer"; sub = `${bankName(t)} → ${t.toBankName || ""}`; }
    else { nm = t.catName || t.type; sub = bankName(t); }
    return (
      <div className="icard" key={t.id} onClick={() => onEdit?.(t)} style={{ cursor: "pointer" }}>
        <CatTile txn={t} cat={cat} size={44} />
        <div><div className="nm">{nm}</div><div className="mt">{sub}</div></div>
        <div className={`amt ${cls} tnum`} style={!cls && color ? { color } : undefined}>{sign}{fmt(t.amount)}</div>
      </div>
    );
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">Activity</div><div className="grow" /><div className="hchip"><Ico name="cal" size={14} /> {MONTHS[+cm.split("-")[1] - 1]}</div></div>
        <div className="lbl">Spent this month</div>
        <div className="big tnum">{fmt(spent)}</div>
        <div className="sub">Income {fmt(income)} &nbsp;·&nbsp; Net {net < 0 ? "−" : "+"}{fmt(Math.abs(net))}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div onClick={onFilter} style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: "var(--surface)", border: "var(--cardBorder)", borderRadius: 13, padding: "11px 13px", color: "var(--faint)" }}><Ico name="search" size={17} /><span style={{ fontSize: 13.5, fontWeight: 600 }}>Search transactions…</span></div>
        <div onClick={onFilter} role="button" aria-label="filter" style={{ width: 48, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--acDim)", border: "1px solid var(--ac)", borderRadius: 13, color: "var(--ac)" }}><Funnel /></div>
      </div>

      {groups.length === 0 && <div style={{ textAlign: "center", color: "var(--muted)", padding: "48px 20px", fontWeight: 600 }}>No transactions yet.</div>}
      {groups.map((g) => (
        <div key={g.date}>
          <div className="over">{dayLabel(g.date)}</div>
          {g.items.map(row)}
        </div>
      ))}
    </div>
  );
}
