// Saver — What's New sheet: ported 1:1 from showcase 28.
import Ico from "./Ico.jsx";
import { APP_VERSION } from "../lib/format.js";

const ITEMS = [
  { icon: "wallet", bg: "var(--acDim)", color: "var(--acText)", nm: "Total / Safe balance toggle", mt: "One tap to see what’s really spendable" },
  { icon: "target", bg: "var(--yellowDim)", color: "var(--yellow)", nm: "Goal vaults", mt: "Turn on spending mode & pay from a goal" },
  { icon: "note", bg: "var(--blueDim)", color: "var(--blue)", nm: "New Bills views", mt: "Timeline · Categories · History" },
];

export default function WhatsNew({ onClose }) {
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="What's new">
        <div className="grab" />
        <div style={{ textAlign: "center", padding: "4px 6px 8px" }}>
          <span className="circ" style={{ width: 54, height: 54, borderRadius: 17, background: "linear-gradient(135deg,var(--ac),var(--ac2))", color: "var(--onacc)", margin: "0 auto 14px" }}><Ico name="sparkles" size={26} /></span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.4 }}>What’s new · v{APP_VERSION}</div>
        </div>
        {ITEMS.map((it, i) => (
          <div className="icard" key={i} style={{ marginTop: i === 0 ? 6 : undefined }}>
            <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: it.bg, color: it.color }}><Ico name={it.icon} size={18} /></span>
            <div><div className="nm">{it.nm}</div><div className="mt">{it.mt}</div></div>
          </div>
        ))}
        <div className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={onClose}>Got it</div>
      </div>
    </>
  );
}
