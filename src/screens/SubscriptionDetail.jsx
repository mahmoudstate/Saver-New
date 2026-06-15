// Saver — Subscription detail: ported 1:1 from showcase 15 (brand hero + logo, our layout).
import Ico from "../ui/Ico.jsx";
import { fmt, currentMonth, cardGradient, MONTHS } from "../lib/format.js";

export default function SubscriptionDetail({ store, bill, back }) {
  const { banks } = store;
  const col = bill.color || "#0e9f6e";
  const cm = currentMonth();
  const day = new Date().getDate();
  const bankName = banks.find((b) => b.id === bill.bankId)?.name || "—";
  const paidThis = bill.payments?.some((p) => p.month === cm);
  const dueIn = bill.dueDay ? bill.dueDay - day : null;
  const renews = paidThis ? "Renewed this month" : dueIn == null ? "Monthly" : dueIn < 0 ? `Overdue ${Math.abs(dueIn)}d` : dueIn === 0 ? "Renews today" : dueIn === 1 ? "Renews tomorrow" : `Renews in ${dueIn} days`;
  const history = [...(bill.payments || [])].sort((a, b) => (b.month || "").localeCompare(a.month || ""));
  const nextMonthLabel = MONTHS[(+cm.split("-")[1]) % 12];

  return (
    <div className="content padnav">
      <div className="hero" style={{ position: "relative", overflow: "hidden", background: cardGradient(col), color: "#fff" }}>
        <span className="bc-orb" style={{ width: 130, height: 130, top: -44, right: -34 }} /><span className="bc-orb" style={{ width: 60, height: 60, bottom: 16, right: 44, opacity: .45 }} /><span className="bc-shine" />
        <div className="toprow" style={{ position: "relative", zIndex: 2 }}>
          <div className="hib" onClick={back} style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="back" size={20} /></div>
          <div className="grow" />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.2)", padding: "6px 12px", borderRadius: 99, fontSize: 12, fontWeight: 800 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />Active</span>
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 13, marginTop: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 15, background: "#fff", color: col, fontWeight: 800, fontSize: 20, boxShadow: "0 8px 18px rgba(0,0,0,.2)", flexShrink: 0 }}>{(bill.name || "?").slice(0, 1).toUpperCase()}</span>
          <div><div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.3 }}>{bill.name}</div><div style={{ fontSize: 12, opacity: .85, fontWeight: 600 }}>Subscription · monthly</div></div>
        </div>
        <div className="big tnum" style={{ color: "#fff", marginTop: 12 }}>{fmt(bill.amount)}</div>
        <div className="sub" style={{ color: "rgba(255,255,255,.85)" }}>{renews} · from {bankName}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        <span className="chip">{fmt(bill.amount * 12)} / year</span>
        {bill.reminderDays != null && <span className="chip">Reminder · {bill.reminderDays}d</span>}
        <span className="chip">{(bill.payments || []).length} payments</span>
      </div>

      <div className="over">Payment history</div>
      {history.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "12px 2px" }}>No payments yet.</div>
        : history.map((p) => (
          <div className="icard" key={p.month}>
            <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: col, color: "#fff", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{(bill.name || "?").slice(0, 1).toUpperCase()}</span>
            <div><div className="nm">{MONTHS[+p.month.split("-")[1] - 1]} {p.month.split("-")[0]}</div><div className="mt">Paid{p.date ? " " + p.date : ""} · {bankName}</div></div>
            <div className="amtb"><b className="tnum">{fmt(bill.amount)}</b><small style={{ color: "var(--success)" }}>Paid</small></div>
          </div>
        ))}
      <div className="cta"><div className="btn btn-primary btn-full"><Ico name="check" size={18} />Record payment for {nextMonthLabel}</div></div>
    </div>
  );
}
