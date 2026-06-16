// Saver — Notifications: ported 1:1 from showcase 29. Derived live from bills, goals, accounts.
import Ico from "../ui/Ico.jsx";
import { fmt, currentMonth, MONTHS } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank, calcGoalSaved } from "../lib/calc.js";

export default function Notifications({ store, back }) {
  const { bills = [], installments = [], savings = [], banks = [], txns = [] } = store;
  const cm = currentMonth();
  const day = new Date().getDate();
  const items = [];

  // bills due soon (unpaid, within 3 days)
  bills.forEach((b) => {
    if (b.payments?.some((p) => p.month === cm)) return;
    if (b.dueDay == null) return;
    const dueIn = b.dueDay - day;
    if (dueIn >= 0 && dueIn <= 3) items.push({ icon: "bell", bg: "var(--yellowDim)", col: "var(--yellow)", nm: `${b.name}’s knocking — due ${dueIn === 0 ? "today" : dueIn === 1 ? "tomorrow" : `in ${dueIn} days`}`, mt: "Bills", unread: true });
  });
  // goals reached
  savings.filter((s) => s.status !== "archived").forEach((s) => {
    if (s.goal > 0 && calcGoalSaved(s.id, txns) >= s.goal) items.push({ icon: "target", bg: "var(--acDim)", col: "var(--ac)", nm: `You smashed it — ${s.name} goal done!`, mt: "Goals", unread: true });
  });
  // low-balance accounts
  banks.forEach((b) => {
    if (b.lowBalanceThreshold == null) return;
    const safe = calcBankBalance(b.id, txns) - Math.max(0, calcFrozenForBank(b.id, savings, txns));
    if (safe <= b.lowBalanceThreshold) items.push({ icon: "wallet", bg: "var(--redDim)", col: "var(--red)", nm: `${b.name}’s running low`, mt: `${fmt(safe)} left`, unread: true });
  });
  // backup nudge
  items.push({ icon: "download", bg: "var(--blueDim)", col: "var(--blue)", nm: "Your backup misses you", mt: "Keep a recent copy", unread: false });

  const newCount = items.filter((i) => i.unread).length;

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Notifications</div><div className="grow" /></div>
        <div className="lbl">Inbox</div><div className="big" style={{ fontSize: 34 }}>{newCount} new</div><div className="sub">Bills, goals &amp; account alerts</div>
      </div>
      {items.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>All caught up.</div>
        : items.map((n, i) => (
          <div className="icard" key={i} style={{ opacity: n.unread ? 1 : .7 }}>
            <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, color: n.col }}><Ico name={n.icon} size={19} /></span>
            <div><div className="nm">{n.nm}</div><div className="mt">{n.mt}</div></div>
            {n.unread && <span style={{ marginLeft: "auto", width: 9, height: 9, borderRadius: "50%", background: "var(--ac)" }} />}
          </div>
        ))}
    </div>
  );
}
