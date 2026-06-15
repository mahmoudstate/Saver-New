// Saver — Bills: ported 1:1 from showcase 05/06 (Subscriptions + Installments seg).
import { useState, useMemo } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, currentMonth, MONTHS } from "../lib/format.js";

function BrandChip({ name, color }) {
  return <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: color || "var(--surface2)", color: "#fff", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{(name || "?").slice(0, 1).toUpperCase()}</span>;
}
const guessCat = (t = "") => /phone|iphone|mobile|tablet|ipad/i.test(t) ? "phone" : /car|loan|auto|vehicle/i.test(t) ? "transport" : /laptop|pc|mac/i.test(t) ? "phone" : null;

export default function Bills({ store, onAdd }) {
  const { bills = [], installments = [] } = store;
  const [seg, setSeg] = useState("subs");
  const cm = currentMonth();
  const day = new Date().getDate();

  const subs = useMemo(() => {
    const active = (b) => (!b.startMonth || cm >= b.startMonth) && (!b.stoppedMonth || cm < b.stoppedMonth);
    const paid = (b) => b.payments?.some((p) => p.month === cm);
    const list = bills.filter((b) => active(b) || paid(b));
    const rows = list.map((b) => {
      const isPaid = paid(b);
      const dueIn = b.dueDay ? b.dueDay - day : null;
      let status = "Paid", color = "var(--success)";
      if (!isPaid) {
        if (dueIn == null) { status = "Due"; color = "var(--yellow)"; }
        else if (dueIn < 0) { status = `Overdue ${Math.abs(dueIn)}d`; color = "var(--red)"; }
        else if (dueIn === 0) { status = "Due today"; color = "var(--orange)"; }
        else if (dueIn === 1) { status = "Tomorrow"; color = "var(--yellow)"; }
        else { status = `Due in ${dueIn}d`; color = dueIn <= 3 ? "var(--yellow)" : "var(--muted)"; }
      }
      return { ...b, isPaid, status, statusColor: color, dueIn };
    });
    const unpaid = rows.filter((r) => !r.isPaid);
    return { rows, due: unpaid.reduce((s, r) => s + r.amount, 0), active: list.length, soon: unpaid.filter((r) => r.dueIn != null && r.dueIn >= 0 && r.dueIn <= 3).length, overdue: unpaid.filter((r) => r.dueIn != null && r.dueIn < 0).length };
  }, [bills, cm, day]);

  const inst = useMemo(() => {
    const paidOf = (i) => (i.payments ? i.payments.length : (i.paidInstallments || 0));
    const done = (i) => paidOf(i) >= i.totalInstallments;
    const paidThisMonth = (i) => i.payments?.some((p) => p.month === cm);
    const active = installments.filter((i) => !done(i));
    const rows = installments.map((i) => ({ ...i, paid: paidOf(i), remaining: Math.max(0, i.totalAmount - paidOf(i) * i.installmentAmount), pct: i.totalInstallments ? (paidOf(i) / i.totalInstallments) * 100 : 0, done: done(i), dueThis: !paidThisMonth(i) && !done(i) }));
    return { rows, remaining: active.reduce((s, i) => s + Math.max(0, i.totalAmount - paidOf(i) * i.installmentAmount), 0), plans: active.length, dueAmt: rows.filter((r) => r.dueThis).reduce((s, r) => s + r.installmentAmount, 0) };
  }, [installments, cm]);

  const isSubs = seg === "subs";

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">Bills</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        {isSubs
          ? <><div className="lbl">Due this month</div><div className="big tnum">{fmt(subs.due)}</div><div className="sub">{subs.active} active &nbsp;·&nbsp; {subs.soon} due soon &nbsp;·&nbsp; {subs.overdue} overdue</div></>
          : <><div className="lbl">Remaining to pay</div><div className="big tnum">{fmt(inst.remaining)}</div><div className="sub">{inst.plans} plans &nbsp;·&nbsp; {fmt(inst.dueAmt)} due this month</div></>}
      </div>

      <div className="seg" style={{ marginBottom: 18 }}>
        <b className={isSubs ? "on" : ""} onClick={() => setSeg("subs")}>Subscriptions</b>
        <b className={!isSubs ? "on" : ""} onClick={() => setSeg("inst")}>Installments</b>
      </div>

      {isSubs ? (
        subs.rows.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>No subscriptions yet.</div>
          : subs.rows.map((b) => (
            <div className="icard" key={b.id}>
              <BrandChip name={b.name} color={b.color} />
              <div><div className="nm">{b.name}</div><div className="mt">{b.note ? b.note + " · " : ""}monthly{b.dueDay ? " · day " + b.dueDay : ""}</div></div>
              <div className="amtb"><b className="tnum">{fmt(b.amount)}</b><small style={{ color: b.statusColor }}>{b.status}</small></div>
            </div>
          ))
      ) : (
        inst.rows.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>No installment plans yet.</div>
          : inst.rows.map((i) => (
            <div className="bcard" key={i.id}>
              <div className="top"><CatTile cat={guessCat(i.itemType || i.company)} name={i.itemType || i.company} color={i.color} size={40} /><div className="nm">{i.itemType || i.company}</div><div className="rt tnum">{fmt(i.installmentAmount)}/mo</div></div>
              <div className="nums"><div className="a tnum" style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>{i.paid} of {i.totalInstallments} paid</div><div className="b tnum">{fmt(i.remaining)} left</div></div>
              <div className="pbar bar"><i style={{ width: `${Math.min(100, i.pct)}%`, background: "var(--ac)" }} /></div>
            </div>
          ))
      )}
    </div>
  );
}
