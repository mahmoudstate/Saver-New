// Saver — first-run activation nudge. Shows on Home only until the user logs
// their first transaction, pointing at the two "aha" actions: add a transaction
// + set a goal. Self-removes once there's any activity. Uses existing design tokens.
import Ico from "./Ico.jsx";

export default function ActivationCard({ store, onAdd, onOpenGoals }) {
  const { txns = [], savings = [] } = store;
  if (txns.length > 0) return null; // activated → hide for good

  const hasGoal = savings.some((s) => s.status !== "archived");

  return (
    <div className="icard" style={{ flexDirection: "column", alignItems: "stretch", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 38, height: 38, borderRadius: 12, background: "color-mix(in srgb, var(--ac) 16%, transparent)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ico name="sparkles" size={20} />
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.2 }}>Let's set you up</div>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Two quick steps to see Saver work.</div>
        </div>
      </div>

      <div className="btn btn-primary btn-full" onClick={onAdd} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
        <Ico name="plus" size={18} /> Add your first transaction
      </div>

      {!hasGoal && (
        <div className="btn btn-full" onClick={onOpenGoals} style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", background: "var(--surface2)", color: "var(--acText)" }}>
          <Ico name="target" size={18} /> Set your first goal
        </div>
      )}
    </div>
  );
}
