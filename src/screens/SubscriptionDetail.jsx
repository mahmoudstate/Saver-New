// Saver — Subscription detail: brand hero + logo (our layout). Record payment,
// stop/resume, and delete are the LOCKED legacy lifecycle (record = expense txn +
// {month,date,txnId}; stop = soft end keeping history; delete keeps past txns).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import ServiceLogo from "../ui/ServiceLogo.jsx";
import CatTile from "../ui/CatTile.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import { fmt, today, currentMonth, cardGradient, MONTHS } from "../lib/format.js";

export default function SubscriptionDetail({ store, bill: billProp, back, onEdit }) {
  const [menu, setMenu] = useState(false);
  const { banks = [], bills = [] } = store;
  const bill = bills.find((b) => b.id === billProp.id) || billProp;
  const col = bill.color || "#0e9f6e";
  const cm = currentMonth();
  const day = new Date().getDate();
  const bank = banks.find((b) => b.id === bill.bankId);
  const bankName = bank?.name || "—";
  const paidThis = bill.payments?.some((p) => p.month === cm);
  const stopped = !!bill.stoppedMonth && cm >= bill.stoppedMonth;
  const dueIn = bill.dueDay ? bill.dueDay - day : null;
  const renews = stopped ? "Stopped" : paidThis ? "Renewed this month" : dueIn == null ? "Monthly" : dueIn < 0 ? `Overdue ${Math.abs(dueIn)}d` : dueIn === 0 ? "Renews today" : dueIn === 1 ? "Renews tomorrow" : `Renews in ${dueIn} days`;
  const history = [...(bill.payments || [])].sort((a, b) => (b.month || "").localeCompare(a.month || ""));
  const nextMonthLabel = MONTHS[(+cm.split("-")[1]) % 12];

  const Logo = ({ size }) => bill.domain ? <ServiceLogo domain={bill.domain} name={bill.name} color={col} size={size} /> : bill.glyph ? <CatTile cat={bill.glyph} name={bill.name} color={col} size={size} /> : <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size * 0.3, background: "#fff", color: col, fontWeight: 800, fontSize: size * 0.42 }}>{(bill.name || "?").slice(0, 1).toUpperCase()}</span>;

  const record = () => {
    if (paidThis) { store.setAlert({ title: "Already paid", message: `${bill.name} is already recorded for ${MONTHS[+cm.split("-")[1] - 1]}.`, color: "var(--yellow)" }); return; }
    const id = store.addTxn({ type: "expense", amount: bill.amount, date: today(), bankId: bill.bankId, bankName, catId: `bill_${bill.typeId || "other"}`, catName: bill.name, catIcon: bill.glyph || "subscription", catColor: col, note: `Bill: ${bill.name} ${MONTHS[+cm.split("-")[1] - 1]} ${cm.split("-")[0]}` });
    if (id === false) return;
    store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, payments: [...(b.payments || []), { month: cm, date: today(), txnId: id }] } : b)));
    store.flash({ title: "Payment logged", sub: `${bill.name} · ${fmt(bill.amount)}`, color: "var(--success)", icon: "check" });
  };

  const undo = (p) => {
    store.setConfirm({
      title: "Undo this payment?", message: `Removes the recorded payment for ${MONTHS[+p.month.split("-")[1] - 1]} ${p.month.split("-")[0]} and its expense.`, confirmText: "Undo payment", danger: true, icon: "back",
      onConfirm: () => { if (p.txnId) store.delTxn(p.txnId); store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, payments: (b.payments || []).filter((x) => x.month !== p.month) } : b))); store.flash({ title: "Payment removed", sub: bill.name, color: "var(--muted)" }); },
    });
  };

  const toggleStop = () => {
    if (stopped) { store.set("bills", (list) => list.map((b) => { if (b.id !== bill.id) return b; const { stoppedMonth, ...rest } = b; return rest; })); store.flash({ title: "Resumed", sub: bill.name, color: "var(--success)", icon: "check" }); return; }
    store.setConfirm({ title: `Stop ${bill.name}?`, message: "It stops showing in this and future months. Your payment history is kept.", confirmText: "Stop subscription", icon: "back",
      onConfirm: () => { store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, stoppedMonth: cm } : b))); store.flash({ title: "Subscription stopped", sub: bill.name, color: "var(--muted)" }); } });
  };

  const remove = () => {
    const hasPayments = (bill.payments || []).length > 0;
    store.setConfirm({
      title: `Delete ${bill.name}?`,
      message: hasPayments ? "The subscription is removed, but its past payments stay in your history." : "This subscription will be removed. It has no payments yet.",
      confirmText: "Delete", danger: true, icon: "trash",
      onConfirm: () => { store.set("bills", (list) => list.filter((b) => b.id !== bill.id)); store.flash({ title: "Subscription deleted", sub: bill.name, color: "var(--muted)" }); back(); },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero" style={{ position: "relative", overflow: "hidden", background: cardGradient(col), color: "#fff" }}>
        <span className="bc-orb" style={{ width: 130, height: 130, top: -44, right: -34 }} /><span className="bc-orb" style={{ width: 60, height: 60, bottom: 16, right: 44, opacity: .45 }} /><span className="bc-shine" />
        <div className="toprow" style={{ position: "relative", zIndex: 2 }}>
          <div className="hib" onClick={back} style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="back" size={20} /></div>
          <div className="grow" />
          <div className="hib" onClick={() => onEdit?.(bill)} style={{ background: "rgba(255,255,255,.2)", color: "#fff", marginRight: 8 }}><Ico name="pencil" size={18} /></div>
          <div className="hib" onClick={() => setMenu(true)} style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="more" size={20} /></div>
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 13, marginTop: 4 }}>
          <span style={{ background: "#fff", borderRadius: 15, padding: 4, display: "inline-flex", boxShadow: "0 8px 18px rgba(0,0,0,.2)" }}><Logo size={44} /></span>
          <div><div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.3 }}>{bill.name}</div><div style={{ fontSize: 12, opacity: .85, fontWeight: 600 }}>Subscription · monthly</div></div>
        </div>
        <div className="big tnum" style={{ color: "#fff", marginTop: 12 }}>{fmt(bill.amount)}</div>
        <div className="sub" style={{ color: "rgba(255,255,255,.85)" }}>{renews} · from {bankName}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        <span className="chip">{fmt(bill.amount * 12)} / year</span>
        {bill.reminderDays != null && <span className="chip">Reminder · {bill.reminderDays === 0 ? "off" : bill.reminderDays + "d"}</span>}
        <span className="chip">{(bill.payments || []).length} payments</span>
      </div>

      <div className="over">Payment history</div>
      {history.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "12px 2px" }}>No payments yet.</div>
        : history.map((p) => (
          <div className="icard" key={p.month} onClick={() => undo(p)} style={{ cursor: "pointer" }}>
            <span style={{ display: "inline-flex" }}><Logo size={42} /></span>
            <div><div className="nm">{MONTHS[+p.month.split("-")[1] - 1]} {p.month.split("-")[0]}</div><div className="mt">Paid{p.date ? " " + p.date : ""} · {bankName} · tap to undo</div></div>
            <div className="amtb"><b className="tnum">{fmt(bill.amount)}</b><small style={{ color: "var(--success)" }}>Paid</small></div>
          </div>
        ))}

      <div className="cta">
        {stopped
          ? <div className="btn btn-primary btn-full" onClick={toggleStop}><Ico name="check" size={18} />Resume subscription</div>
          : <div className="btn btn-primary btn-full" onClick={record} style={{ opacity: paidThis ? .5 : 1 }}><Ico name="check" size={18} />{paidThis ? `Paid for ${MONTHS[+cm.split("-")[1] - 1]}` : `Record payment for ${nextMonthLabel}`}</div>}
      </div>

      {menu && <MenuSheet title={bill.name} onClose={() => setMenu(false)} items={[
        { label: stopped ? "Resume" : "Stop subscription", icon: stopped ? "check" : "back", sub: stopped ? "Show it again this month" : "Keeps your payment history", onClick: toggleStop },
        { label: "Delete", icon: "trash", danger: true, sub: "Past payments stay in history", onClick: remove },
      ]} />}
    </div>
  );
}
