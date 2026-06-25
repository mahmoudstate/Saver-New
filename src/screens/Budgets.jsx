// Saver — Budgets + Projects. Monthly budgets are viewed per-month (pick any month);
// the top is a live infographic (animated donut + ranked bars). Projects accumulate
// from a start month and may be open-ended (no fixed amount).
import { useState, useEffect } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import BudgetRing from "../ui/BudgetRing.jsx";
import MonthSheet from "../ui/MonthSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import Money from "../ui/Money.jsx";
import { fmt, currentMonth, today, MONTHS } from "../lib/format.js";
import { budgetSpentMonth, projectSpent, budgetTxns, daysLeftInMonth, spentPerActiveDay } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

const budgetCat = (b) => b.glyph || resolveCat({ catId: b.cats?.[0], catName: b.name }) || "income";
const rangeLabel = (start, end) => `${MONTHS[+(start || end).split("-")[1] - 1]}–${MONTHS[+end.split("-")[1] - 1]}`;
const monthChip = (m, cm, tr) => { const [y, mo] = m.split("-"); return m === cm ? tr("budget.thisMonth") : `${MONTHS[+mo - 1]}${y !== cm.slice(0, 4) ? " " + y : ""}`; };
const barColor = (pct) => (pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--ac)");

export default function Budgets({ store, back, onAdd, onOpenBudget, onOpenProject, initialSeg, onSegChange }) {
  const { budgets = [], txns = [] } = store;
  const tr = useT();
  const [seg, setSeg] = useState(initialSeg || "monthly");
  const changeSeg = (v) => { setSeg(v); onSegChange?.(v); };
  const [projView, setProjView] = useState("active"); // active | completed
  const cm = currentMonth();
  const [vm, setVm] = useState(cm); // viewed month (monthly tab)
  const [monthSheet, setMonthSheet] = useState(false);
  const [anim, setAnim] = useState(false); // replays the bar growth on month/tab change
  useEffect(() => { setAnim(false); const t = setTimeout(() => setAnim(true), 60); return () => clearTimeout(t); }, [vm, seg]);
  const isMonthly = seg === "monthly";

  // A monthly budget shows in the viewed month if it's that one-off month, or it's a
  // recurring budget that has started by then (legacy budgets with neither = always on).
  const activeInMonth = (b) => (b.month ? b.month === vm : (!b.startMonth || vm >= b.startMonth));
  const monthly = budgets.filter((b) => b.kind !== "project" && activeInMonth(b))
    .map((b) => { const spent = budgetSpentMonth(b, txns, vm); return { ...b, spent, pct: b.amount > 0 ? (spent / b.amount) * 100 : 0, over: spent > b.amount }; })
    .sort((a, b) => b.pct - a.pct);
  const projects = budgets.filter((b) => b.kind === "project");
  const active = projects.filter((p) => p.status !== "archived").map((p) => { const spent = projectSpent(p, txns); return { ...p, spent, pct: p.amount > 0 ? Math.min(100, (spent / p.amount) * 100) : 0 }; });
  const completed = projects.filter((p) => p.status === "archived");

  const mSpent = monthly.reduce((a, b) => a + b.spent, 0);
  const mLimit = monthly.reduce((a, b) => a + b.amount, 0);
  const overCount = monthly.filter((b) => b.over).length;
  const pSpent = active.reduce((a, p) => a + p.spent, 0);

  // Daily pacing for the viewed month: how much is safe to spend per remaining day,
  // and how much was actually spent per day (averaged over days that had spending).
  const mTxns = (() => { const seen = new Set(), rows = []; monthly.forEach((b) => budgetTxns(b, txns, vm).forEach((t) => { if (!seen.has(t.id)) { seen.add(t.id); rows.push(t); } })); return rows; })();
  const daysLeft = daysLeftInMonth(vm, today());
  const safePerDay = vm === cm && mLimit > 0 ? Math.max(0, (mLimit - mSpent)) / daysLeft : null;
  const spentPerDay = spentPerActiveDay(mTxns);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{isMonthly ? tr("budget.titleMonthly") : tr("budget.projects")}</div><div className="grow" />{isMonthly && <div className="hchip" onClick={() => setMonthSheet(true)} style={{ cursor: "pointer", marginRight: 8 }}><Ico name="cal" size={14} />{monthChip(vm, cm, tr)}</div>}<div className="hib" onClick={() => onAdd?.(seg)}><Ico name="plus" size={20} /></div></div>
        {isMonthly ? <>
          <div className="lbl">{tr("budget.spent")}</div><Money className="big tnum" v={mSpent} /><div className="sub">{tr("budget.ofBudget", { amt: fmt(mLimit) })} &nbsp;·&nbsp; {tr("budget.pctUsed", { pct: mLimit > 0 ? Math.round((mSpent / mLimit) * 100) : 0 })}</div>
        </> : <>
          <div className="lbl">{tr("budget.projSpentSoFar")}</div><Money className="big tnum" v={pSpent} /><div className="sub">{tr("budget.activeCount", { n: active.length })}{completed.length ? ` · ${tr("budget.completedCount", { n: completed.length })}` : ""}</div>
        </>}
      </div>

      <SegToggle style={{ marginBottom: 18 }} value={seg} onChange={changeSeg} options={[{ id: "monthly", label: tr("budget.monthly") }, { id: "projects", label: tr("budget.projects") }]} />

      {isMonthly ? (
        monthly.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("budget.noBudgets", { month: monthChip(vm, cm, tr) })}</div> : <>
          {/* infographic: animated donut + at-a-glance totals */}
          <div className="tile" style={{ display: "flex", alignItems: "center", gap: 18, padding: 16, marginBottom: 16 }}>
            <BudgetRing spent={mSpent} total={mLimit} size={120} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
              <div><div className="over" style={{ margin: 0 }}>{tr("budget.spent")}</div><div className="title tnum" style={{ fontSize: 21 }}>{fmt(mSpent)}</div></div>
              <div><div className="over" style={{ margin: 0 }}>{tr("budget.ofBudgetLabel")}</div><div className="title tnum" style={{ fontSize: 16, color: "var(--muted)" }}>{fmt(mLimit)}</div></div>
              <span className={`pill${overCount ? " pill-red" : ""}`} style={{ alignSelf: "flex-start", fontSize: 11.5 }}>
                <Ico name={overCount ? "bell" : "check"} size={13} />{overCount ? tr("budget.overCount", { n: overCount }) : tr("budget.onTrack")}
              </span>
            </div>
          </div>

          {/* daily pacing: safe-to-spend per remaining day + actual average per spending day */}
          <div className="tile" style={{ display: "flex", padding: 14, marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="over" style={{ margin: 0 }}>{tr("budget.safePerDay")}</div>
              <div className="title tnum" style={{ fontSize: 18, marginTop: 4 }}>{safePerDay != null ? fmt(safePerDay) : "—"}</div>
              <div className="caption" style={{ marginTop: 2 }}>{safePerDay != null ? tr(daysLeft === 1 ? "budget.daysLeftOne" : "budget.daysLeftMany", { n: daysLeft }) : tr("budget.pastMonth")}</div>
            </div>
            <div style={{ width: 1, background: "var(--border)", margin: "2px 14px" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="over" style={{ margin: 0 }}>{tr("budget.spentPerDay")}</div>
              <div className="title tnum" style={{ fontSize: 18, marginTop: 4 }}>{fmt(spentPerDay)}</div>
              <div className="caption" style={{ marginTop: 2 }}>{tr("budget.avgDays")}</div>
            </div>
          </div>

          <div className="over">{tr("budget.categoriesMostUsed")}</div>
          {monthly.map((b) => (
            <div className="bcard" key={b.id} onClick={() => onOpenBudget?.(b)} style={{ cursor: "pointer" }}>
              <div className="top"><CatTile cat={budgetCat(b)} color={b.color} name={b.name} size={38} /><div className="nm">{b.name}</div><div className="rt tnum" style={b.over ? { color: "var(--red)" } : {}}>{fmt(b.spent)} / {fmt(b.amount)}</div></div>
              <div className="pbar bar" style={{ marginTop: 12 }}><i style={{ width: `${anim ? Math.min(100, b.pct) : 0}%`, background: barColor(b.pct), transition: "width .85s cubic-bezier(.3,.8,.3,1)" }} /></div>
            </div>
          ))}
        </>
      ) : (
        active.length === 0 && completed.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("budget.noProjects")}</div> : <>
          {completed.length > 0 && <SegToggle style={{ marginBottom: 16 }} value={projView} onChange={setProjView} options={[{ id: "active", label: tr("budget.active") }, { id: "completed", label: tr("budget.completed") }]} />}
          {(projView === "active" ? active : completed).length === 0
            ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "30px", fontWeight: 600 }}>{projView === "active" ? tr("budget.noActiveProjects") : tr("budget.nothingCompleted")}</div>
            : (projView === "active" ? active : completed).map((p) => {
              const spent = p.spent ?? projectSpent(p, txns);
              const hasLimit = p.amount > 0;
              const pct = hasLimit ? Math.min(100, (spent / p.amount) * 100) : 0;
              const isDone = projView === "completed";
              return (
                <div className="bcard" key={p.id} onClick={() => onOpenProject?.(p)} style={{ cursor: "pointer", opacity: isDone ? .75 : 1 }}>
                  <div className="top"><CatTile cat={budgetCat(p)} color={p.color} name={p.name} size={40} /><div className="nm">{p.name}</div><div className="pct">{isDone ? tr("budget.done") : hasLimit ? `${Math.round(pct)}%` : tr("budget.open")}</div></div>
                  <div className="nums"><div className="a tnum">{fmt(spent)}</div><div className="b tnum">{isDone ? `${tr("budget.completed")}${hasLimit ? ` · ${fmt(p.amount)}` : ""}` : (spent > 0 ? rangeLabel(p.startMonth, cm) : tr("budget.noSpendingYet")) + (hasLimit ? ` · ${fmt(p.amount)}` : "")}</div></div>
                  <div className="pbar bar" style={{ overflow: "hidden" }}>{hasLimit
                    ? <i style={{ width: `${anim ? pct : 0}%`, background: isDone ? "var(--muted)" : "var(--ac)", transition: "width .85s cubic-bezier(.3,.8,.3,1)" }} />
                    : <i className="bar-flow" />}</div>
                </div>
              );
            })}
        </>
      )}

      {monthSheet && <MonthSheet value={vm} max={cm} onPick={(m) => { setVm(m); setMonthSheet(false); }} onClose={() => setMonthSheet(false)} />}
    </div>
  );
}
