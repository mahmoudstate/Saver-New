// Saver — Appearance: ported 1:1 from showcase 24 (light/dark + 6 calm accents).
import Ico from "../ui/Ico.jsx";
import { fmt } from "../lib/format.js";
import { ACCENTS } from "../lib/store.js";
import { totalBalance } from "../lib/calc.js";

const NAMES = { mint: "Mint", sage: "Sage", ocean: "Ocean", lavender: "Lavender", rose: "Rose", honey: "Honey" };

export default function Appearance({ store, back }) {
  const { theme, accent, banks = [], txns = [] } = store;
  const total = totalBalance(banks, txns);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Appearance</div><div className="grow" /></div>
        <div className="lbl">Total balance</div><div className="big tnum">{fmt(total)}</div><div className="sub">Live preview — your theme &amp; colour</div>
      </div>

      <div className="over">Theme</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {[["system", "device", "var(--blue)", "System"], ["light", "sun", "var(--yellow)", "Light"], ["dark", "moon", "var(--ac)", "Dark"]].map(([t, ico, col, label]) => (
          <div key={t} className="card" onClick={() => store.set("theme", t)} style={{ flex: 1, padding: "16px 8px", textAlign: "center", boxShadow: "none", cursor: "pointer", border: `2px solid ${theme === t ? "var(--ac)" : "var(--border)"}` }}>
            <Ico name={ico} size={22} color={col} style={{ margin: "0 auto" }} /><div style={{ fontWeight: 800, fontSize: 13.5, marginTop: 8 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="caption" style={{ marginBottom: 20 }}>{theme === "system" ? "Follows your phone’s light / dark setting." : `Always ${theme}.`}</div>

      <div className="over">Accent colour</div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "space-between", padding: "0 4px" }}>
        {Object.entries(ACCENTS).map(([name, [c]]) => (
          <span key={name} onClick={() => store.set("accent", name)} title={NAMES[name]} style={{ width: 40, height: 40, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: accent === name ? "0 0 0 3px var(--bg),0 0 0 5px var(--ac)" : "none" }} />
        ))}
      </div>
      <div className="caption" style={{ textAlign: "center", marginTop: 18 }}>{NAMES[accent] || "Mint"} · the whole app re-tints instantly</div>
    </div>
  );
}
