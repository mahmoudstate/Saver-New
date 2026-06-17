// Saver — reusable colour picker sheet (shared by every "pick a colour" surface:
// accounts, category icons, goals, budgets, projects, bills, installments).
// Pattern follows world-class apps (Apple Reminders/Calendar, Notion, Things):
// a curated preset palette to tap + an in-app Custom picker (HSL sliders, no OS
// screen). Custom colours are persisted (shared) and removable. App-styled.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { loadKey, saveKey } from "../lib/store.js";

// curated, calm palette — reads well on light + dark, spans the spectrum
export const PRESETS = ["#E5544E", "#EC4899", "#7C3AED", "#6366F1", "#2563EB", "#0EA5E9", "#0D9488", "#0E9F6E", "#84CC16", "#D97706", "#EA580C", "#64748B"];
const CUSTOM_KEY = "et_customColors"; // shared across all sections

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12; const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(255 * c).toString(16).padStart(2, "0"); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function Swatch({ c, sel, onClick, onRemove }) {
  return (
    <span style={{ position: "relative", width: 36, height: 36 }}>
      <span onClick={onClick} style={{ display: "block", width: 36, height: 36, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: sel ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />
      {onRemove && <span onClick={onRemove} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--cardShadow)" }}>×</span>}
    </span>
  );
}

export default function ColorSheet({ value, onChange, onClose }) {
  const [customs, setCustoms] = useState(() => { const c = loadKey(CUSTOM_KEY, []); return Array.isArray(c) ? c.slice(0, 24) : []; });
  const [adding, setAdding] = useState(false);
  const [hue, setHue] = useState(210);
  const [light, setLight] = useState(50);
  const draft = hslToHex(hue, 72, light);

  const persist = (c) => { setCustoms(c); saveKey(CUSTOM_KEY, c); };
  const addDraft = () => { if (!customs.includes(draft) && !PRESETS.includes(draft)) persist([...customs, draft]); onChange(draft); setAdding(false); };
  const remove = (c) => persist(customs.filter((x) => x !== c));

  const range = { WebkitAppearance: "none", appearance: "none", width: "100%", height: 14, borderRadius: 999, outline: "none", cursor: "pointer" };
  const hueGrad = "linear-gradient(to right,#ff0000,#ffff00,#00ff00,#00ffff,#0000ff,#ff00ff,#ff0000)";
  const lightGrad = `linear-gradient(to right,${hslToHex(hue, 72, 18)},${hslToHex(hue, 72, 50)},${hslToHex(hue, 72, 86)})`;

  return (
    <>
      {/* scoped slider-thumb styling (new component only — doesn't touch app styles) */}
      <style>{`.cs-range::-webkit-slider-thumb{-webkit-appearance:none;width:24px;height:24px;border-radius:50%;background:#fff;border:2px solid rgba(0,0,0,.15);box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer}.cs-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:2px solid rgba(0,0,0,.15);box-shadow:0 2px 6px rgba(0,0,0,.3);cursor:pointer}`}</style>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>Colour</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 16px" }}>Tap to choose. Add your own with +.</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
          {PRESETS.map((c) => <Swatch key={c} c={c} sel={value === c} onClick={() => onChange(c)} />)}
          {customs.map((c) => <Swatch key={c} c={c} sel={value === c} onClick={() => onChange(c)} onRemove={() => remove(c)} />)}
          <span onClick={() => setAdding((a) => !a)} style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: adding ? "var(--ac)" : "var(--acDim)", color: adding ? "var(--onacc)" : "var(--acText)", cursor: "pointer", transition: "background .15s" }}><Ico name="plus" size={19} /></span>
        </div>

        {adding && (
          <div style={{ marginTop: 18, padding: 14, background: "var(--surface2)", borderRadius: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 14, background: draft, flexShrink: 0, boxShadow: "inset 0 0 0 2px rgba(255,255,255,.4)" }} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14 }}>Custom colour</div><div className="tnum" style={{ color: "var(--muted)", fontSize: 12.5, fontWeight: 600, textTransform: "uppercase" }}>{draft}</div></div>
              <button className="btn btn-primary" style={{ height: 42, padding: "0 18px" }} onClick={addDraft}><Ico name="plus" size={16} />Add</button>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>Hue</div>
            <input className="cs-range" type="range" min="0" max="360" value={hue} onChange={(e) => setHue(+e.target.value)} style={{ ...range, background: hueGrad, marginBottom: 14 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>Shade</div>
            <input className="cs-range" type="range" min="20" max="80" value={light} onChange={(e) => setLight(+e.target.value)} style={{ ...range, background: lightGrad }} />
          </div>
        )}

        <div style={{ marginTop: 20 }}><div className="btn btn-secondary btn-full" onClick={onClose}>Done</div></div>
      </div>
    </>
  );
}
