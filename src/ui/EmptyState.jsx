// Saver — friendly empty state (showcase 32). Reusable across lists.
import Ico from "./Ico.jsx";

export default function EmptyState({ icon = "sparkles", title = "Nothing here… yet!", message, cta, onCta }) {
  return (
    <div className="empty" style={{ padding: "40px 30px 0" }}>
      <span className="ei"><Ico name={icon} size={36} color="var(--ac)" /></span>
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -.3 }}>{title}</div>
      {message && <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500, margin: "8px 0 22px", lineHeight: 1.5 }}>{message}</div>}
      {cta && <button className="btn btn-primary" onClick={onCta}><Ico name="plus" size={18} />{cta}</button>}
    </div>
  );
}
