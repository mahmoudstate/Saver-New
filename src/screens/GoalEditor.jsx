// Saver — Add / Edit goal: ported from showcase 19 (target · icon · mode).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt } from "../lib/format.js";

const COLORS = ["#16BFA6", "#FBBF24", "#A78BFA", "#3B82F6", "#0E9F6E", "#EC4899"];
const goalCat = (g) => resolveCat({ catGlyph: g?.glyph, catName: g?.name }) || "goal";

export default function GoalEditor({ store, goal, onClose }) {
  const editing = !!goal;
  const [name, setName] = useState(goal?.name || "");
  const [target, setTarget] = useState(goal?.goal || 0);
  const [color, setColor] = useState(goal?.color || COLORS[0]);
  const [spending, setSpending] = useState(!!goal?.spendingMode);
  const [sheet, setSheet] = useState(null);
  const canSave = name.trim().length > 0 && target > 0;

  const save = () => {
    if (!canSave) return;
    if (editing) store.set("savings", (list) => list.map((s) => (s.id === goal.id ? { ...s, name: name.trim(), goal: target, color, spendingMode: spending } : s)));
    else store.set("savings", (list) => [...list, { id: Date.now().toString(), name: name.trim(), goal: target, status: "active", spendingMode: spending, color }]);
    store.flash({ title: editing ? "Goal saved" : "Goal created", sub: name.trim(), color: "var(--acText)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? "Edit goal" : "New goal"}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">Target amount</div>
        <div className="big tnum" onClick={() => setSheet("target")} style={{ cursor: "pointer" }}>{target > 0 ? fmt(target) : <span style={{ opacity: .6 }}>{fmt(0)}</span>}</div>
        <div className="sub">{name.trim() || "Name your goal"}</div>
      </div>

      <label className="field">
        <CatTile cat={goalCat({ name, glyph: goal?.glyph })} name={name} size={42} />
        <div style={{ flex: 1 }}><div className="fl">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Travel fund" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <div className="tile" style={{ margin: "13px 0", display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <div className="fl">Colour</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 11 }}>
          {COLORS.map((c) => <span key={c} onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />)}
        </div>
      </div>

      <div className="field">
        <div style={{ flex: 1 }}><div className="fl">Spending goal</div><div className="fv" style={{ color: "var(--muted)", fontWeight: 600, fontSize: 12.5 }}>Spend from this pot</div></div>
        <span className={`switch ${spending ? "on" : ""}`} onClick={() => setSpending((v) => !v)}><i /></span>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save goal" : "Create goal"}</div></div>

      {sheet === "target" && <AmountSheet title="Target amount" confirmLabel="Set target" onConfirm={(v) => { setTarget(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
