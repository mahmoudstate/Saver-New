// Saver — Breakdown: income / expense analytics (showcase 35) for the current month.
// Spending ⇄ Income toggle; biggest item + top categories; filter entry → Smart Filter.
import { useMemo, useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt, currentMonth, MONTHS } from "../lib/format.js";
import { monthTxns } from "../lib/calc.js";

// same day+date label used across Activity / Account / Budget / Project rows
const rowDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";

const Funnel = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8.5V20l-4-2.5v-4z" /></svg>;
const BARC = ["#E5544E", "#F59E0B", "#3B82F6", "#8B5CF6", "#16BFA6", "#A78BFA"];

export default function Breakdown({ store, back, onFilter }) {
  const { txns = [], banks = [] } = store;
  const cm = currentMonth();
  const [mode, setMode] = useState("expense"); // expense | income
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "";

  const { total, biggest, cats } = useMemo(() => {
    const mt = monthTxns(txns, cm).filter((t) => (mode === "expense" ? (t.type === "expense" || t.type === "goal_withdraw") : t.type === "income"));
    const total = mt.reduce((a, t) => a + t.amount, 0);
    const biggest = mt.slice().sort((a, b) => b.amount - a.amount)[0] || null;
    const byCat = {};
    mt.forEach((t) => { const k = t.catName || t.catId || "Other"; (byCat[k] = byCat[k] || { name: k, sum: 0, sample: t }).sum += t.amount; });
    const cats = Object.values(byCat).sort((a, b) => b.sum - a.sum);
    return { total, biggest, cats };
  }, [txns, cm, mode]);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Breakdown</div><div className="grow" /><div className="hchip" style={{ background: "var(--heroChip)", color: "var(--heroText)", border: "none" }}><Ico name="cal" size={14} /> {MONTHS[+cm.split("-")[1] - 1]}</div></div>
        <div className="lbl">{mode === "expense" ? "Total spent" : "Total income"}</div>
        <div className="big tnum">{fmt(total)}</div>
        <div className="sub">Across {cats.length} {cats.length === 1 ? "category" : "categories"}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div className="seg" style={{ flex: 1, marginBottom: 0 }}>
          <b className={mode === "expense" ? "on" : ""} onClick={() => setMode("expense")}>Spending</b>
          <b className={mode === "income" ? "on" : ""} onClick={() => setMode("income")}>Income</b>
        </div>
        <div onClick={onFilter} role="button" aria-label="filter" style={{ width: 48, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--acDim)", border: "1px solid var(--ac)", borderRadius: 13, color: "var(--acText)" }}><Funnel /></div>
      </div>

      {cats.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>No {mode === "expense" ? "spending" : "income"} this month.</div>
      ) : (
        <>
          {biggest && <>
            <div className="over">Biggest {mode === "expense" ? "expense" : "deposit"}</div>
            <div className="icard">
              <CatTile txn={biggest} size={44} />
              <div><div className="nm">{biggest.note || biggest.catName || "—"}</div><div className="mt">{bankName(biggest.bankId)}{biggest.date ? " · " + rowDate(biggest.date) : ""}</div></div>
              <div className={`amt ${mode === "expense" ? "out" : "in"} tnum`}>{mode === "expense" ? "−" : "+"}{fmt(biggest.amount)}</div>
            </div>
          </>}

          <div className="over" style={{ marginTop: 14 }}>Top categories</div>
          <div className="tile" style={{ padding: 16 }}>
            {cats.map((c, i) => {
              const pct = total > 0 ? Math.round((c.sum / total) * 100) : 0;
              return (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: i === cats.length - 1 ? 0 : 13 }}>
                  <CatTile txn={c.sample} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 5 }}><span>{c.name}</span><span className="tnum">{fmt(c.sum)} · {pct}%</span></div>
                    <div className="pbar bar"><i style={{ width: `${pct}%`, background: BARC[i % BARC.length] }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
