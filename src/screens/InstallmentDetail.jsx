// Saver — Installment detail: ported 1:1 from showcase 37 (ring · schedule · pay).
// Pay / undo behaviour is the LOCKED legacy lifecycle (creates/removes an expense txn,
// appends/removes a {month,date,txnId,num} payment, updates status).
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, today, currentMonth, MONTHS } from "../lib/format.js";

const RING_C = 2 * Math.PI * 40; // r = 40

const addMonths = (m, n) => { const [y, mo] = m.split("-").map(Number); const d = new Date(y, mo - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const monthLabel = (m) => { if (!m) return ""; const [y, mo] = m.split("-"); return `${MONTHS[+mo - 1]} ${y}`; };

const guessCat = (t = "") => /phone|iphone|mobile|tablet|ipad/i.test(t) ? "phone" : /car|loan|auto|vehicle/i.test(t) ? "transport" : /laptop|pc|mac/i.test(t) ? "phone" : null;

export default function InstallmentDetail({ store, instId, back }) {
  const { installments = [], banks = [] } = store;
  const inst = installments.find((i) => i.id === instId);
  if (!inst) return null;

  const label = inst.itemType || inst.company || inst.name || "Installment";
  const color = inst.color || "var(--ac)";
  const bankName = banks.find((b) => b.id === inst.bankId)?.name || "—";
  const cm = currentMonth();

  // payments[] is the source of truth (synthesise from legacy paidInstallments count if missing)
  const ensurePayments = () => {
    if (inst.payments) return inst.payments;
    const n = inst.paidInstallments || 0, arr = [];
    for (let k = 0; k < n; k++) arr.push({ month: addMonths(inst.startDate?.slice(0, 7) || cm, k), date: null, txnId: null, num: k + 1 });
    return arr;
  };
  const payments = ensurePayments();
  const paid = payments.length;
  const total = inst.totalInstallments;
  const paidAmt = paid * inst.installmentAmount;
  const remaining = Math.max(0, inst.totalAmount - paidAmt);
  const pct = total ? paid / total : 0;
  const done = paid >= total;
  const paidThisMonth = payments.some((p) => p.month === cm);

  const startMonth = inst.startDate?.slice(0, 7) || payments[0]?.month || cm;
  // a row per installment 1..total
  const rows = Array.from({ length: total }, (_, i) => {
    const num = i + 1;
    const p = payments[i];
    const month = p?.month || addMonths(startMonth, i);
    const isPaid = i < paid;
    const isNext = !isPaid && i === paid && !done;
    return { num, month, isPaid, isNext, txnId: p?.txnId || null };
  });

  const persist = (newPayments) => {
    const newStatus = newPayments.length >= total ? "completed" : "active";
    store.set("installments", (list) => list.map((x) => (x.id === inst.id ? { ...x, payments: newPayments, paidInstallments: newPayments.length, status: newStatus } : x)));
    return newStatus;
  };

  const pay = () => {
    if (done) { store.setAlert({ title: "All paid off", message: "Every installment on this plan is already paid.", color: "var(--acText)", icon: "check" }); return; }
    if (paidThisMonth) { store.setAlert({ title: "Already paid", message: `An installment is already recorded for ${MONTHS[+cm.split("-")[1] - 1]}.`, color: "var(--yellow)" }); return; }
    const num = paid + 1;
    const id = store.addTxn({ type: "expense", amount: inst.installmentAmount, date: today(), bankId: inst.bankId, bankName, catId: "installment", catName: "Installments", catIcon: "installment", catColor: color, note: `Installment ${num}/${total}: ${label}` });
    if (id === false) return; // blocked (insufficient balance) — alert already shown
    const newPayments = [...payments, { month: cm, date: today(), txnId: id, num }];
    const status = persist(newPayments);
    if (status === "completed") store.setAlert({ title: "Paid off!", message: `Nice — "${label}" is fully paid. That's one less thing.`, color: "var(--acText)", icon: "check" });
    else store.flash({ title: `Payment ${num} of ${total} logged`, sub: `${fmt(inst.installmentAmount)} · ${label}`, color: "var(--success)" });
  };

  const undo = (row) => {
    store.setConfirm({
      title: `Undo payment ${row.num}?`,
      message: `This removes the recorded payment for ${monthLabel(row.month)} and its expense.`,
      confirmText: "Undo payment", danger: true, icon: "back",
      onConfirm: () => {
        if (row.txnId) store.delTxn(row.txnId);
        persist(payments.filter((p) => p.month !== row.month));
        store.flash({ title: "Payment removed", sub: `${label} · ${monthLabel(row.month)}`, color: "var(--muted)" });
      },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{label}</div><div className="grow" /><div className="hib"><Ico name="note" size={20} /></div></div>
        <div className="lbl">{inst.company ? inst.company + " · " : ""}{fmt(inst.installmentAmount)}/mo</div>
        <div className="big tnum">{fmt(remaining)}</div>
        <div className="sub">{done ? "fully paid" : "left to pay"} · {bankName}</div>
      </div>

      <div className="card ringcard r" style={{ "--d": ".16s", display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <div className="ring" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--track)" strokeWidth="10" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--ac)" strokeWidth="10" strokeLinecap="round" strokeDasharray={RING_C.toFixed(1)} strokeDashoffset={(RING_C * (1 - pct)).toFixed(1)} />
          </svg>
          <div className="v"><b className="tnum" style={{ fontSize: 20 }}>{paid}/{total}</b><small>paid</small></div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div><div className="over" style={{ margin: 0 }}>Paid</div><div className="title tnum">{fmt(paidAmt)}</div></div>
          <div><div className="over" style={{ margin: 0 }}>Remaining</div><div className="title tnum" style={{ color: "var(--muted)" }}>{fmt(remaining)}</div></div>
        </div>
      </div>

      <div className="over r" style={{ "--d": ".2s" }}>Schedule</div>
      {rows.map((r) => (
        <div className="icard r" key={r.num} style={{ "--d": ".24s", opacity: r.isPaid || r.isNext ? 1 : .6 }} onClick={r.isPaid ? () => undo(r) : undefined}>
          <span className="circ" style={{ width: 38, height: 38, borderRadius: 12, background: "var(--catTile)", border: "1px solid var(--catTileBorder)", color: r.isPaid ? "var(--success)" : r.isNext ? "var(--ac)" : "var(--faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico name={r.isPaid ? "check" : "card"} size={18} color={r.isPaid ? "var(--success)" : r.isNext ? "var(--ac)" : "var(--faint)"} />
          </span>
          <div><div className="nm">Payment {r.num}</div><div className="mt">{monthLabel(r.month)}{r.isPaid ? " · tap to undo" : ""}</div></div>
          <div className="amtb"><b className="tnum">{fmt(inst.installmentAmount)}</b><small style={{ color: r.isPaid ? "var(--success)" : r.isNext ? "var(--ac)" : "var(--faint)" }}>{r.isPaid ? "Paid" : r.isNext ? "Next" : "Upcoming"}</small></div>
        </div>
      ))}

      {!done && (
        <div className="cta">
          <div className="btn btn-primary btn-full" onClick={pay}><Ico name="check" size={18} />{paidThisMonth ? `Paid for ${MONTHS[+cm.split("-")[1] - 1]}` : `Pay ${paid + 1} of ${total} · ${fmt(inst.installmentAmount)}`}</div>
        </div>
      )}
    </div>
  );
}
