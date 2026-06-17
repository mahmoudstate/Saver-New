// Saver — Add / Edit category: ported from showcase 18 (icon · colour · type).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { CATS } from "../ui/cats.js";
import ColorField from "../ui/ColorField.jsx";
import { loadColors } from "../ui/ColorSheet.jsx";

const GLYPHS = ["food", "coffee", "shopping", "transport", "bill", "phone", "home", "travel", "salary", "income", "goal", "transfer"];

export default function CategoryEditor({ store, category, kind: initialKind, onClose }) {
  const editing = !!category;
  const [kind, setKind] = useState(category?._kind || initialKind || "expense");
  const [name, setName] = useState(category?.name || "");
  const [glyph, setGlyph] = useState(category?.glyph || GLYPHS[0]);
  const [color, setColor] = useState(category?.color || loadColors()[0]);
  const canSave = name.trim().length > 0;
  const listKey = kind === "income" ? "incCats" : "expCats";

  const save = () => {
    if (!canSave) return;
    const entry = { name: name.trim(), glyph, color, group: category?.group || "daily" };
    if (editing) store.set(listKey, (list) => list.map((c) => (c.id === category.id ? { ...c, ...entry } : c)));
    else store.set(listKey, (list) => [...list, { id: Date.now().toString(), ...entry }]);
    store.flash({ title: editing ? "Category saved" : "Category added", sub: name.trim(), color: "var(--success)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? "Edit category" : "New category"}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">Category</div>
        <div className="big" style={{ fontSize: 34 }}>{name.trim() || "Name it"}</div>
        <div className="sub" style={{ textTransform: "capitalize" }}>{kind} category</div>
      </div>

      {!editing && (
        <div className="seg" style={{ marginBottom: 16 }}>
          <b className={kind === "expense" ? "on" : ""} onClick={() => setKind("expense")}>Expense</b>
          <b className={kind === "income" ? "on" : ""} onClick={() => setKind("income")}>Income</b>
        </div>
      )}

      <label className="field" style={{ marginBottom: 16 }}>
        <CatTile cat={CATS[glyph] ? glyph : null} name={name} color={color} size={42} />
        <div style={{ flex: 1 }}><div className="fl">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Coffee" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <div className="over">Icon</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 18 }}>
        {GLYPHS.map((g) => (
          <span key={g} onClick={() => setGlyph(g)} className="circ" style={{ aspectRatio: "1", borderRadius: 14, background: "var(--catTile)", border: glyph === g ? "1.5px solid var(--ac)" : "1px solid var(--catTileBorder)", cursor: "pointer", color: CATS[g][0] }}>
            <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={glyph === g ? "var(--ac)" : CATS[g][0]} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: CATS[g][1] }} />
          </span>
        ))}
      </div>

      <ColorField value={color} onChange={setColor} />

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save category" : "Add category"}</div></div>
    </div>
  );
}
