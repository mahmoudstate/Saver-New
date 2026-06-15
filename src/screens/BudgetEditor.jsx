// Saver — Add / Edit budget: showcase 20 adapted to this app's model
// (a budget = name + monthly amount + the expense categories it covers).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt } from "../lib/format.js";

const catKeyOf = (c) => resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) || null;

export default function BudgetEditor({ store, budget, onClose }) {
  const { expCats = [] } = store;
  const editing = !!budget;
  const [name, setName] = useState(budget?.name || "");
  const [amount, setAmount] = useState(budget?.amount || 0);
  const [cats, setCats] = useState(budget?.cats || []);
  const [sheet, setSheet] = useState(false);
  const canSave = name.trim().length > 0 && amount > 0;
  const toggle = (id) => setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const save = () => {
    if (!canSave) return;
    if (editing) store.set("budgets", (list) => list.map((b) => (b.id === budget.id ? { ...b, name: name.trim(), amount, cats } : b)));
    else store.set("budgets", (list) => [...list, { id: Date.now().toString(), name: name.trim(), amount, cats }]);
    store.flash({ title: editing ? "Budget saved" : "Budget created", sub: name.trim(), color: "var(--purple)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? "Edit budget" : "New budget"}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">Monthly limit</div>
        <div className="big tnum" onClick={() => setSheet(true)} style={{ cursor: "pointer" }}>{amount > 0 ? fmt(amount) : <span style={{ opacity: .6 }}>{fmt(0)}</span>}</div>
        <div className="sub">{name.trim() || "Name your budget"}</div>
      </div>

      <label className="field">
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--purpleDim)", color: "var(--purple)" }}><Ico name="layers" size={20} /></span>
        <div style={{ flex: 1 }}><div className="fl">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Everyday spending" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <div className="over" style={{ marginTop: 18 }}>Categories covered</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {expCats.map((c) => {
          const on = cats.includes(c.id);
          return (
            <button key={c.id} onClick={() => toggle(c.id)} className="chip" style={on ? { background: "var(--acDim)", color: "var(--ac)", borderColor: "transparent" } : {}}>
              <CatTile cat={catKeyOf(c)} name={c.name} size={20} style={{ borderRadius: 7 }} />{c.name}
            </button>
          );
        })}
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save budget" : "Create budget"}</div></div>

      {sheet && <AmountSheet title="Monthly limit" confirmLabel="Set limit" onConfirm={(v) => { setAmount(v); setSheet(false); }} onClose={() => setSheet(false)} />}
    </div>
  );
}
