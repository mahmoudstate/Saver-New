// Saver — Budgets + Projects: ported from showcase 03 (monthly) + 36 (projects tab).
// Monthly budgets reset each month; projects accumulate from startMonth.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt, currentMonth, MONTHS } from "../lib/format.js";
import { budgetSpentMonth, projectSpent } from "../lib/calc.js";

const budgetCat = (b) => resolveCat({ catId: b.cats?.[0], catName: b.name }) || "income";
const monthLabel = (m) => MONTHS[+m.split("-")[1] - 1];
const rangeLabel = (start, end) => `${MONTHS[+(start || end).split("-")[1] - 1]}–${MONTHS[+end.split("-")[1] - 1]}`;
const barColor = (pct) => (pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--ac)");

export default function Budgets({ store, back, onAdd, onOpenBudget, onOpenProject }) {
  const { budgets = [], txns = [] } = store;
  const [seg, setSeg] = useState("monthly");
  const cm = currentMonth();
  const isMonthly = seg === "monthly";

  const monthly = budgets.filter((b) => b.kind !== "project").map((b) => { const spent = budgetSpentMonth(b, txns, cm); return { ...b, spent, pct: b.amount > 0 ? (spent / b.amount) * 100 : 0, over: spent > b.amount }; });
  const projects = budgets.filter((b) => b.kind === "project");
  const active = projects.filter((p) => p.status !== "archived").map((p) => { const spent = projectSpent(p, txns); return { ...p, spent, pct: p.amount > 0 ? Math.min(100, (spent / p.amount) * 100) : 0 }; });
  const completed = projects.filter((p) => p.status === "archived");

  const mSpent = monthly.reduce((a, b) => a + b.spent, 0);
  const mLimit = monthly.reduce((a, b) => a + b.amount, 0);
  const overCount = monthly.filter((b) => b.over).length;
  const pTotal = active.reduce((a, p) => a + p.amount, 0);
  const pSpent = active.reduce((a, p) => a + p.spent, 0);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Budgets</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        {isMonthly
          ? <><div className="lbl">Spent this month</div><div className="big tnum">{fmt(mSpent)}</div><div className="sub">of {fmt(mLimit)} budget &nbsp;·&nbsp; {mLimit > 0 ? Math.round((mSpent / mLimit) * 100) : 0}% used</div></>
          : <><div className="lbl">Projects · long-term</div><div className="big tnum">{fmt(pTotal)}</div><div className="sub">{active.length} active &nbsp;·&nbsp; {fmt(pSpent)} spent so far</div></>}
      </div>

      <div className="seg" style={{ marginBottom: 18 }}>
        <b className={isMonthly ? "on" : ""} onClick={() => setSeg("monthly")}>Monthly</b>
        <b className={!isMonthly ? "on" : ""} onClick={() => setSeg("projects")}>Projects{active.length ? ` (${active.length})` : ""}</b>
      </div>

      {isMonthly ? (
        monthly.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>No budgets yet. Tap + to set a limit.</div> : <>
          <div className="insight" style={{ marginBottom: 20, borderRadius: 14, padding: "12px 14px", ...(overCount ? { background: "color-mix(in srgb,var(--red) 13%,transparent)", color: "var(--red)" } : {}) }}>
            <Ico name={overCount ? "bell" : "check"} size={17} color={overCount ? "var(--red)" : "var(--success)"} />{overCount ? `${overCount} budget${overCount > 1 ? "s" : ""} over this month` : "All budgets on track this month"}
          </div>
          <div className="over">Categories</div>
          {monthly.map((b) => (
            <div className="bcard" key={b.id} onClick={() => onOpenBudget?.(b)} style={{ cursor: "pointer" }}>
              <div className="top"><CatTile cat={budgetCat(b)} name={b.name} size={38} /><div className="nm">{b.name}</div><div className="rt tnum" style={b.over ? { color: "var(--red)" } : {}}>{fmt(b.spent)} / {fmt(b.amount)}</div></div>
              <div className="pbar bar" style={{ marginTop: 12 }}><i style={{ width: `${Math.min(100, b.pct)}%`, background: barColor(b.pct) }} /></div>
            </div>
          ))}
        </>
      ) : (
        active.length === 0 && completed.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>No projects yet. Track a long-term cost with +.</div> : <>
          {active.map((p) => (
            <div className="bcard" key={p.id} onClick={() => onOpenProject?.(p)} style={{ cursor: "pointer" }}>
              <div className="top"><CatTile cat={budgetCat(p)} name={p.name} size={40} /><div className="nm">{p.name}</div><div className="pct">{Math.round(p.pct)}%</div></div>
              <div className="nums"><div className="a tnum">{fmt(p.spent)}</div><div className="b tnum">{p.spent > 0 ? rangeLabel(p.startMonth, cm) : "No spending yet"} · {fmt(p.amount)}</div></div>
              <div className="pbar bar"><i style={{ width: `${p.pct}%`, background: "var(--ac)" }} /></div>
            </div>
          ))}
          {completed.length > 0 && <div className="lsh">Completed ({completed.length}) <Ico name="chev" size={16} /></div>}
        </>
      )}
    </div>
  );
}
