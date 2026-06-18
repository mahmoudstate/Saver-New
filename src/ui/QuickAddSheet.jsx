// Saver — Quick Add sheet: ported from showcase 10. Expense shortcuts that open the
// Add screen pre-filled (so the amount/bank can be tweaked before saving).
import Ico from "./Ico.jsx";
import CatTile from "./CatTile.jsx";
import { resolveCat } from "./cats.js";
import { fmt } from "../lib/format.js";

const catKeyOf = (c) => (c ? resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) : null);

export default function QuickAddSheet({ store, onClose, onSetup, onPick }) {
  const { quickActions = [], expCats = [] } = store;
  const active = quickActions.filter((q) => q.catId);
  const catOf = (id) => expCats.find((c) => c.id === id);

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="Quick add">
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", margin: "0 2px 14px" }}>
          <div><div style={{ fontSize: 16, fontWeight: 800 }}>Quick add</div><div className="caption" style={{ marginTop: 1 }}>Pick one to log fast</div></div>
          <div style={{ flex: 1 }} /><div className="hchip" onClick={onSetup} style={{ background: "var(--surface2)", color: "var(--muted)", cursor: "pointer" }}>Set up</div>
        </div>
        {active.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, padding: "20px 10px 26px" }}>
            <Ico name="zap" size={28} color="var(--ac)" style={{ margin: "0 auto 10px" }} />No shortcuts yet. Tap “Set up” to add up to 4.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {active.map((q) => { const c = catOf(q.catId); return (
              <div key={q.id} onClick={() => onPick?.(q)} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--surface)", border: "var(--cardBorder)", boxShadow: "var(--cardShadow)", borderRadius: 16, padding: 13, cursor: "pointer" }}>
                <CatTile cat={catKeyOf(c)} name={c?.name} size={40} />
                <div><div className="nm" style={{ fontSize: 13.5, fontWeight: 700 }}>{c?.name}</div><div className="tnum" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>{fmt(+q.amount)}</div></div>
              </div>
            ); })}
          </div>
        )}
      </div>
    </>
  );
}
