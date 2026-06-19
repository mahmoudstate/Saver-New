// Saver — company/service picker. Inline row of popular brand logos + an "All"
// tile that opens a searchable sheet with every service grouped by category
// (same anatomy as the category icon picker). A "Custom" tile lets the user pick
// their own icon + colour instead of a brand. Logos are offline (ServiceLogo).
import { useState, useMemo } from "react";
import Ico from "./Ico.jsx";
import ServiceLogo from "./ServiceLogo.jsx";
import { SUBSCRIPTION_SERVICES, SERVICE_CATEGORIES, POPULAR_SERVICE_IDS } from "../lib/services.js";

const popular = POPULAR_SERVICE_IDS.map((id) => SUBSCRIPTION_SERVICES.find((s) => s.id === id)).filter(Boolean);

function ServiceSheet({ activeDomain, onPick, onCustom, onClose }) {
  const [q, setQ] = useState("");
  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SERVICE_CATEGORIES.map((cat) => ({
      cat,
      items: SUBSCRIPTION_SERVICES.filter((s) => s.category === cat && (!query || s.name.toLowerCase().includes(query))),
    })).filter((g) => g.items.length);
  }, [q]);

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>Choose a service</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 14px" }}>Tap a logo, or make your own.</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <Ico name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" style={{ flex: 1, border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 600 }} />
          {q && <span className="chev" onClick={() => setQ("")}><Ico name="close" size={16} /></span>}
        </div>
        <div style={{ maxHeight: "52vh", overflowY: "auto", paddingBottom: 4 }}>
          <div onClick={() => { onCustom(); onClose(); }} className="icard" style={{ cursor: "pointer", marginBottom: 14 }}>
            <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--acDim)", color: "var(--acText)" }}><Ico name="pencil" size={20} /></span>
            <div style={{ flex: 1 }}><div className="nm">Custom service</div><div className="mt">Pick your own icon &amp; colour</div></div>
            <span className="chev"><Ico name="chev" size={18} /></span>
          </div>
          {groups.map((g) => (
            <div key={g.cat} style={{ marginBottom: 16 }}>
              <div className="over" style={{ marginTop: 0 }}>{g.cat}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px 8px" }}>
                {g.items.map((s) => (
                  <div key={s.id} onClick={() => { onPick(s); onClose(); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <ServiceLogo domain={s.domain} name={s.name} color={s.color} size={52} />
                      {activeDomain === s.domain && <span className="circ" style={{ position: "absolute", right: -3, bottom: -3, width: 19, height: 19, borderRadius: "50%", background: "var(--ac)", color: "var(--onacc)", border: "2px solid var(--surface)" }}><Ico name="check" size={11} /></span>}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, textAlign: "center", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", color: "var(--text)" }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {groups.length === 0 && <div style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, padding: "24px 0" }}>No services match — use Custom above.</div>}
        </div>
        <div style={{ marginTop: 14 }}><div className="btn btn-secondary btn-full" onClick={onClose}>Done</div></div>
      </div>
    </>
  );
}

// Inline strip used inside the editor: an even row of popular logos + All + Custom.
// `onPick(svc)`, `onCustom()`, `customActive` highlights the Custom tile.
export default function ServicePicker({ activeDomain, customActive, onPick, onCustom }) {
  const [open, setOpen] = useState(false);
  const Tile = ({ children, onClick, dashed, active, label }) => (
    <div onClick={onClick} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", width: 52 }}>
      <span className="circ" style={{ position: "relative", width: 50, height: 50, borderRadius: 15, background: dashed ? "var(--surface2)" : "transparent", border: dashed ? "1px dashed var(--border)" : "none", color: "var(--muted)", boxShadow: active ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }}>{children}</span>
      {label && <span style={{ fontSize: 9.5, fontWeight: 700, color: active ? "var(--acText)" : "var(--muted)" }}>{label}</span>}
    </div>
  );
  return (
    <>
      <div className="hscroll" style={{ display: "flex", gap: 12, alignItems: "flex-start", overflowX: "auto", paddingBottom: 2 }}>
        {popular.map((s) => (
          <Tile key={s.id} onClick={() => onPick(s)} active={activeDomain === s.domain}>
            <ServiceLogo domain={s.domain} name={s.name} color={s.color} size={50} />
          </Tile>
        ))}
        <Tile onClick={() => setOpen(true)} dashed label="All"><Ico name="layers" size={18} /></Tile>
        <Tile onClick={() => onCustom()} dashed active={customActive} label="Custom"><Ico name="pencil" size={17} /></Tile>
      </div>
      {open && <ServiceSheet activeDomain={activeDomain} onPick={onPick} onCustom={onCustom} onClose={() => setOpen(false)} />}
    </>
  );
}
