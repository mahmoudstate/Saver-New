// Saver — single-day calendar sheet (app style). Used to back-date a transaction.
// Future days are disabled (max defaults to today); a "Today" chip jumps back.
import { useState } from "react";
import Ico from "./Ico.jsx";
import { MONTHS, today } from "../lib/format.js";

const pad = (n) => String(n).padStart(2, "0");
const lastDay = (y, m) => new Date(y, m, 0).getDate(); // m = 1..12
const monthLabel = (ym) => { const [y, m] = ym.split("-"); return `${MONTHS[+m - 1]} ${y}`; };

export default function DateSheet({ value, max = today(), onPick, onClose }) {
  const start = (value || today());
  const [sel, setSel] = useState(start);
  const [cal, setCal] = useState(start.slice(0, 7));

  const [cy, cmo] = cal.split("-").map(Number);
  const startDow = new Date(cy, cmo - 1, 1).getDay();
  const ndays = lastDay(cy, cmo);
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: ndays }, (_, i) => i + 1)];
  const shift = (delta) => { const d = new Date(cy, cmo - 1 + delta, 1); setCal(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); };
  const nextDisabled = cal >= max.slice(0, 7);

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="Pick a date">
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="hib" onClick={() => shift(-1)}><Ico name="back" size={18} /></div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{monthLabel(cal)}</div>
          <div className="hib" onClick={() => !nextDisabled && shift(1)} style={{ transform: "scaleX(-1)", opacity: nextDisabled ? .3 : 1, pointerEvents: nextDisabled ? "none" : "auto" }}><Ico name="back" size={18} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "var(--faint)", padding: "4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const ds = `${cal}-${pad(d)}`;
            const on = ds === sel, isToday = ds === today(), future = ds > max;
            return <div key={i} onClick={() => !future && setSel(ds)} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: on ? 800 : 600, borderRadius: 11, cursor: future ? "default" : "pointer", ...(on ? { background: "var(--ac)", color: "var(--onacc)" } : future ? { color: "var(--faint)", opacity: .4 } : { color: isToday ? "var(--acText)" : "var(--text)", background: isToday ? "var(--surface2)" : "transparent" }) }}>{d}</div>;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <span onClick={() => { setSel(today()); setCal(today().slice(0, 7)); }} style={{ padding: "8px 16px", borderRadius: 11, fontWeight: 800, fontSize: 13, cursor: "pointer", background: sel === today() ? "var(--ac)" : "var(--surface2)", color: sel === today() ? "var(--onacc)" : "var(--text)" }}>Today</span>
        </div>
        <div className="btn btn-primary btn-full" style={{ marginTop: 14 }} onClick={() => onPick(sel)}>Done</div>
      </div>
    </>
  );
}
