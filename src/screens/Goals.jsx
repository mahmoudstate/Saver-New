// Saver — Goals list: ported 1:1 from showcase 04 (savings · frozen funds).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import { resolveCat } from "../ui/cats.js";
import Money from "../ui/Money.jsx";
import { fmt } from "../lib/format.js";
import { calcGoalSaved, totalFrozen } from "../lib/calc.js";

const goalCat = (g) => resolveCat({ catGlyph: g.glyph, catName: g.name }) || "goal";

export default function Goals({ store, back, onAdd, onOpenGoal }) {
  const { savings = [], banks = [], txns = [] } = store;
  const [view, setView] = useState("active"); // active | archived
  const withSaved = (s) => ({ ...s, saved: Math.max(0, calcGoalSaved(s.id, txns)) });
  const goals = savings.filter((s) => s.status !== "archived").map(withSaved);
  const archived = savings.filter((s) => s.status === "archived").map(withSaved);
  const totalSaved = goals.reduce((a, g) => a + g.saved, 0);
  const frozen = totalFrozen(banks, txns, savings);
  const list = view === "active" ? goals : archived;

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Goals</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">Saved toward goals</div>
        <Money className="big tnum" v={totalSaved} />
        <div className="sub">{goals.length} active &nbsp;·&nbsp; frozen &amp; safe</div>
      </div>

      {archived.length > 0 && <SegToggle style={{ marginBottom: 16 }} value={view} onChange={setView} options={[{ id: "active", label: "Active" }, { id: "archived", label: `Archived` }]} />}

      {list.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{view === "active" ? "No goals yet. Tap + to start saving." : "No archived goals."}</div>
      ) : list.map((g) => {
        const pct = g.goal > 0 ? Math.min(100, (g.saved / g.goal) * 100) : 0;
        const left = Math.max(0, g.goal - g.saved);
        const isArch = view === "archived";
        return (
          <div className="bcard" key={g.id} onClick={() => onOpenGoal?.(g)} style={{ cursor: "pointer", opacity: isArch ? .75 : 1 }}>
            <div className="top"><CatTile cat={goalCat(g)} color={g.color} name={g.name} size={42} /><div className="nm">{g.name}</div><div className="pct">{isArch ? "Done" : `${Math.round(pct)}%`}</div></div>
            <div className="nums"><div className="a tnum">{fmt(g.saved)}</div><div className="b tnum">{isArch ? `Archived · ${fmt(g.goal)}` : left > 0 ? `${fmt(left)} left · ${fmt(g.goal)}` : `Reached · ${fmt(g.goal)}`}</div></div>
            <div className="pbar bar"><i style={{ width: `${pct}%`, background: isArch ? "var(--muted)" : "linear-gradient(90deg,var(--ac),var(--ac2))" }} /></div>
          </div>
        );
      })}

      {view === "active" && goals.length > 0 && (
        <div className="frozen" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, background: "var(--acDim)", color: "var(--acText)", borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 13 }}>
          <Ico name="lock" size={15} color="var(--ac)" />Frozen &amp; safe — <b>{fmt(frozen)}</b> set aside
        </div>
      )}
    </div>
  );
}
