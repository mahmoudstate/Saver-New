// Saver — Bills: Subscriptions + Installments. Subscriptions show Active (grouped
// by category, each with a header) / History (by month). Installments split
// Active / Completed. Segmented controls slide between options.
import { useState, useMemo } from "react";
import Ico from "../ui/Ico.jsx";
import ServiceLogo from "../ui/ServiceLogo.jsx";
import CatTile from "../ui/CatTile.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import Money from "../ui/Money.jsx";
import { fmt, currentMonth, MONTHS } from "../lib/format.js";
import { getBillType, BILL_TYPES } from "../lib/services.js";

const monthLabel = (m) => `${MONTHS[+m.split("-")[1] - 1]} ${m.split("-")[0]}`;
const guessCat = (t = "") => /phone|iphone|mobile|tablet|ipad/i.test(t) ? "phone" : /car|loan|auto|vehicle/i.test(t) ? "transport" : /laptop|pc|mac/i.test(t) ? "phone" : null;

// Map a status color to the app's themed pill class (handles dark/light + theme).
const statusPill = (c = "") => /red/.test(c) ? "pill pill-red" : /orange|yellow/.test(c) ? "pill pill-yellow" : /success/.test(c) ? "pill pill-green" : "chip";

// Small status dot (drawn, not an emoji) — same size as the Active dot.
const Dot = ({ color, size = 8 }) => <span style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />;

function BillLogo({ bill, size = 44 }) {
  if (bill.domain) return <ServiceLogo domain={bill.domain} name={bill.name} color={bill.color} size={size} />;
  if (bill.glyph) return <CatTile cat={bill.glyph} name={bill.name} color={bill.color} size={size} />;
  return <span className="circ" style={{ width: size, height: size, borderRadius: size * 0.3, background: bill.color || "var(--surface2)", color: "#fff", fontWeight: 800, fontSize: size * 0.34, flexShrink: 0 }}>{(bill.name || "?").slice(0, 1).toUpperCase()}</span>;
}

function SubCard({ bill, onOpen }) {
  return (
    <div className="icard" onClick={() => onOpen?.(bill)} style={{ cursor: "pointer" }}>
      <BillLogo bill={bill} />
      <div><div className="nm">{bill.name}</div><div className="mt">{bill.note ? bill.note + " · " : ""}monthly{bill.dueDay ? " · day " + bill.dueDay : ""}</div></div>
      <div className="amtb">
        <b className="tnum">{fmt(bill.amount)}</b>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 5 }}><Dot color={bill.statusColor} size={7} /><small style={{ color: "var(--muted)", fontWeight: 700, fontSize: 11 }}>{bill.status}</small></div>
      </div>
    </div>
  );
}

export default function Bills({ store, onAdd, onOpenSub, onOpenInst, initialSeg }) {
  const { bills = [], installments = [] } = store;
  const resolveType = (id) => BILL_TYPES.find((t) => t.id === id) || getBillType(id);
  const [seg, setSeg] = useState(initialSeg || "subs");
  const [subView, setSubView] = useState("active"); // active | history
  const [instView, setInstView] = useState("active"); // active | done
  const cm = currentMonth();
  const day = new Date().getDate();

  const statusOf = (b) => {
    const isPaid = b.payments?.some((p) => p.month === cm);
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
  };

  const subs = useMemo(() => {
    const active = (b) => (!b.startMonth || cm >= b.startMonth) && (!b.stoppedMonth || cm < b.stoppedMonth);
    const paid = (b) => b.payments?.some((p) => p.month === cm);
    const rows = bills.filter((b) => active(b) || paid(b)).map(statusOf);
    const unpaid = rows.filter((r) => !r.isPaid);
    const paidRows = rows.filter((r) => r.isPaid);
    const total = rows.reduce((s, r) => s + r.amount, 0);
    return {
      rows, active: rows.length,
      due: unpaid.reduce((s, r) => s + r.amount, 0),
      soon: unpaid.filter((r) => r.dueIn != null && r.dueIn >= 0 && r.dueIn <= 3).length,
      overdue: unpaid.filter((r) => r.dueIn != null && r.dueIn < 0).length,
      total, yearly: total * 12,
      paidCount: paidRows.length, paidAmt: paidRows.reduce((s, r) => s + r.amount, 0),
      unpaidCount: unpaid.length,
    };
  }, [bills, cm, day]);

  // Active = grouped by category. Within a group: unpaid first (soonest due), paid sink.
  const catGroups = useMemo(() => {
    const by = {};
    subs.rows.forEach((b) => { const t = resolveType(b.typeId); (by[t.id] = by[t.id] || { type: t, items: [] }).items.push(b); });
    Object.values(by).forEach((g) => g.items.sort((a, b) => { const pa = a.isPaid ? 1 : 0, pb = b.isPaid ? 1 : 0; if (pa !== pb) return pa - pb; return (a.dueIn ?? 99) - (b.dueIn ?? 99); }));
    // Order groups by urgency: soonest-due / overdue first; fully-paid groups sink
    // to the bottom; ties broken by the larger monthly total.
    const total = (g) => g.items.reduce((s, x) => s + x.amount, 0);
    const urgency = (g) => { const unpaid = g.items.filter((x) => !x.isPaid); return unpaid.length ? Math.min(...unpaid.map((x) => x.dueIn ?? 9999)) : Infinity; };
    return Object.values(by).sort((a, b) => { const d = urgency(a) - urgency(b); return d !== 0 ? d : total(b) - total(a); });
  }, [subs.rows]);

  const histGroups = useMemo(() => {
    const byMonth = {};
    bills.forEach((b) => (b.payments || []).forEach((p) => { (byMonth[p.month] = byMonth[p.month] || []).push({ bill: b, p }); }));
    return Object.keys(byMonth).sort().reverse().map((m) => ({ month: m, items: byMonth[m], total: byMonth[m].reduce((s, x) => s + x.bill.amount, 0) }));
  }, [bills]);

  const inst = useMemo(() => {
    const paidOf = (i) => (i.payments ? i.payments.length : (i.paidInstallments || 0));
    const done = (i) => paidOf(i) >= i.totalInstallments;
    const paidThisMonth = (i) => i.payments?.some((p) => p.month === cm);
    const rows = installments.map((i) => ({ ...i, paid: paidOf(i), remaining: Math.max(0, i.totalAmount - paidOf(i) * i.installmentAmount), pct: i.totalInstallments ? (paidOf(i) / i.totalInstallments) * 100 : 0, done: done(i), stopped: !!i.stopped, dueThis: !paidThisMonth(i) && !done(i) && !i.stopped }));
    const live = rows.filter((r) => !r.done && !r.stopped);
    const paidAmtOf = (r) => r.paid * r.installmentAmount;
    return {
      rows, plans: live.length,
      remaining: live.reduce((s, r) => s + r.remaining, 0),
      dueAmt: rows.filter((r) => r.dueThis).reduce((s, r) => s + r.installmentAmount, 0),
      total: live.reduce((s, r) => s + r.totalAmount, 0),
      paidAmt: live.reduce((s, r) => s + paidAmtOf(r), 0),
    };
  }, [installments, cm]);

  const isSubs = seg === "subs";
  const instActive = inst.rows.filter((r) => !r.done && !r.stopped);
  const instDone = inst.rows.filter((r) => r.done || r.stopped);
  const instRows = instView === "active" ? instActive : instDone;

  const InstCard = (i) => (
    <div className="bcard" key={i.id} onClick={() => onOpenInst?.(i)} style={{ cursor: "pointer", opacity: i.stopped ? .7 : 1 }}>
      <div className="top"><CatTile cat={i.glyph || guessCat(i.itemType || i.company)} name={i.itemType || i.company} color={i.color} size={40} /><div className="nm">{i.itemType || i.company}</div><div className="rt tnum">{fmt(i.installmentAmount)}/mo</div></div>
      <div className="nums"><div className="a tnum" style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>{i.stopped ? "Stopped · " : ""}{i.paid} of {i.totalInstallments} paid</div><div className="b tnum">{i.done ? "Done" : fmt(i.remaining) + " left"}</div></div>
      <div className="pbar bar"><i style={{ width: `${Math.min(100, i.pct)}%`, background: i.done ? "var(--success)" : "var(--ac)" }} /></div>
    </div>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{isSubs ? "Bills" : "Installments"}</div><div className="grow" /><div className="hib" onClick={() => onAdd?.(seg)}><Ico name="plus" size={20} /></div></div>
        {isSubs
          ? <><div className="lbl">Total bills this month</div><Money className="big tnum" v={subs.total} />
            <div className="sub" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Dot color={subs.overdue > 0 ? "var(--red)" : subs.due > 0 ? "var(--yellow)" : "var(--success)"} />
              <span>{subs.due > 0 && <>{fmt(subs.due)} {subs.overdue > 0 ? "overdue" : "due"} &nbsp;·&nbsp; </>}{subs.paidCount} of {subs.active} paid &nbsp;·&nbsp; {fmt(subs.yearly)}/yr</span>
            </div></>
          : <><div className="lbl">Remaining</div><Money className="big tnum" v={inst.remaining} />
            <div className="sub" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Dot color={inst.dueAmt > 0 ? "var(--yellow)" : "var(--success)"} />
              <span>{inst.dueAmt > 0 && <>{fmt(inst.dueAmt)} due &nbsp;·&nbsp; </>}{inst.total > 0 ? Math.round((inst.paidAmt / inst.total) * 100) : 0}% paid &nbsp;·&nbsp; {inst.plans} plans</span>
            </div></>}
      </div>

      <SegToggle style={{ marginBottom: 14 }} value={seg} onChange={setSeg} options={[{ id: "subs", label: "Subscriptions" }, { id: "inst", label: "Installments" }]} />

      {isSubs ? (
        <>
          <SegToggle style={{ marginBottom: 16 }} value={subView} onChange={setSubView} options={[{ id: "active", label: "Active" }, { id: "history", label: "History" }]} />

          {subView === "active" && (catGroups.length === 0 ? <Empty msg="No subscriptions yet." /> : catGroups.map((g) => (
            <div key={g.type.id} style={{ marginBottom: 10 }}>
              <div className="over">{g.type.name} &nbsp;·&nbsp; {fmt(g.items.reduce((s, b) => s + b.amount, 0))}/mo</div>
              {g.items.map((b) => <SubCard key={b.id} bill={b} onOpen={onOpenSub} />)}
            </div>
          )))}

          {subView === "history" && (histGroups.length === 0 ? <Empty msg="No payments yet." /> : histGroups.map((g) => (
            <div key={g.month} style={{ marginBottom: 10 }}>
              <div className="over">{monthLabel(g.month)} &nbsp;·&nbsp; {fmt(g.total)}</div>
              {g.items.map(({ bill, p }) => (
                <div className="icard" key={bill.id + p.month} onClick={() => onOpenSub?.(bill)} style={{ cursor: "pointer" }}>
                  <BillLogo bill={bill} size={42} />
                  <div><div className="nm">{bill.name}</div><div className="mt">Paid{p.date ? " " + p.date : ""}</div></div>
                  <div className="amtb">
                    <b className="tnum">{fmt(bill.amount)}</b>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 5 }}><Dot color="var(--success)" size={7} /><small style={{ color: "var(--muted)", fontWeight: 700, fontSize: 11 }}>Paid</small></div>
                  </div>
                </div>
              ))}
            </div>
          )))}
        </>
      ) : (
        <>
          <SegToggle style={{ marginBottom: 16 }} value={instView} onChange={setInstView} options={[{ id: "active", label: "Active" }, { id: "done", label: "Completed" }]} />
          {instRows.length === 0 ? <Empty msg={instView === "active" ? "No active plans." : "Nothing completed yet."} /> : instRows.map(InstCard)}
        </>
      )}
    </div>
  );
}

function Empty({ msg }) {
  return <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{msg}</div>;
}
