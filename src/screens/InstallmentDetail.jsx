// Saver — Installment detail: ring · schedule · pay (showcase 37). Pay / pay-ahead
// / undo are the LOCKED legacy lifecycle (each creates/removes an expense txn and a
// {month,date,txnId,num} payment). Stop keeps history; delete keeps past txns.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import NumberSheet from "../ui/NumberSheet.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import { fmt, today, currentMonth, MONTHS } from "../lib/format.js";

const RING_C = 2 * Math.PI * 40; // r = 40

const addMonths = (m, n) => { const [y, mo] = m.split("-").map(Number); const d = new Date(y, mo - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const monthLabel = (m) => { if (!m) return ""; const [y, mo] = m.split("-"); return `${MONTHS[+mo - 1]} ${y}`; };

export default function InstallmentDetail({ store, instId, back, onEdit }) {
  const { installments = [], banks = [] } = store;
  const inst = installments.find((i) => i.id === instId);
  const [sheet, setSheet] = useState(false);
  const [menu, setMenu] = useState(false);
  if (!inst) return null;

  const label = inst.itemType || inst.company || inst.name || "Installment";
  const color = inst.color || "var(--ac)";
  const bankName = banks.find((b) => b.id === inst.bankId)?.name || "—";
  const cm = currentMonth();

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
  const left = total - paid;

  const startMonth = inst.startDate?.slice(0, 7) || payments[0]?.month || cm;
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

  const mkTxn = (num) => ({ type: "expense", amount: inst.installmentAmount, date: today(), bankId: inst.bankId, bankName, catId: "installment", catName: "Installments", catIcon: inst.glyph || "installment", catColor: color, note: `Installment ${num}/${total}: ${label}` });

  // Pay the next N installments at once (default 1). Tags each with its scheduled month.
  const payN = (n) => {
    if (done) { store.setAlert({ title: "All paid off", message: "Every installment on this plan is already paid.", color: "var(--acText)", icon: "check" }); return; }
    n = Math.min(left, Math.max(1, n));
    const batch = [], newPays = [];
    for (let k = 0; k < n; k++) batch.push(mkTxn(paid + k + 1));
    const ids = store.addTxns(batch);
    if (ids === false) return; // blocked (insufficient balance) — alert shown
    for (let k = 0; k < n; k++) newPays.push({ month: addMonths(startMonth, paid + k), date: today(), txnId: ids[k], num: paid + k + 1 });
    const status = persist([...payments, ...newPays]);
    if (status === "completed") store.setAlert({ title: "Paid off!", message: `Nice — "${label}" is fully paid. That's one less thing.`, color: "var(--acText)", icon: "check" });
    else store.flash({ title: n === 1 ? `Payment ${paid + 1} of ${total} logged` : `${n} payments logged`, sub: `${fmt(inst.installmentAmount * n)} · ${label}`, color: "var(--success)" });
  };

  const undo = (row) => {
    store.setConfirm({
      title: `Undo payment ${row.num}?`, message: `This removes the recorded payment for ${monthLabel(row.month)} and its expense.`, confirmText: "Undo payment", danger: true, icon: "back",
      onConfirm: () => { if (row.txnId) store.delTxn(row.txnId); persist(payments.filter((p) => p.month !== row.month)); store.flash({ title: "Payment removed", sub: `${label} · ${monthLabel(row.month)}`, color: "var(--muted)" }); },
    });
  };

  const toggleStop = () => {
    if (inst.stopped) { store.set("installments", (list) => list.map((x) => { if (x.id !== inst.id) return x; const { stopped, ...rest } = x; return rest; })); store.flash({ title: "Resumed", sub: label, color: "var(--success)", icon: "check" }); return; }
    store.setConfirm({ title: `Stop ${label}?`, message: "Marks the plan stopped and hides it from active. Your paid installments stay in history.", confirmText: "Stop plan", icon: "back",
      onConfirm: () => { store.set("installments", (list) => list.map((x) => (x.id === inst.id ? { ...x, stopped: true } : x))); store.flash({ title: "Plan stopped", sub: label, color: "var(--muted)" }); } });
  };

  const remove = () => {
    const has = payments.length > 0;
    store.setConfirm({
      title: `Delete ${label}?`, message: has ? "The plan is removed, but its paid installments stay in your history." : "This plan will be removed. It has no payments yet.", confirmText: "Delete", danger: true, icon: "trash",
      onConfirm: () => { store.set("installments", (list) => list.filter((x) => x.id !== inst.id)); store.flash({ title: "Plan deleted", sub: label, color: "var(--muted)" }); back(); },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{label}</div><div className="grow" /><div className="hib" onClick={() => onEdit?.(inst)} style={{ marginRight: 8 }}><Ico name="pencil" size={18} /></div><div className="hib" onClick={() => setMenu(true)}><Ico name="more" size={20} /></div></div>
        <div className="lbl">{inst.company ? inst.company + " · " : ""}{fmt(inst.installmentAmount)}/mo</div>
        <div className="big tnum">{fmt(remaining)}</div>
        <div className="sub">{inst.stopped ? "stopped" : done ? "fully paid" : "left to pay"} · {bankName}</div>
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
          {inst.downPayment > 0 && <div><div className="over" style={{ margin: 0 }}>Deposit</div><div className="title tnum" style={{ color: "var(--acText)" }}>{fmt(inst.downPayment)}{inst.downPaymentTxnId ? "" : " · info"}</div></div>}
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
        <div className="cta" style={{ display: "flex", gap: 10 }}>
          {inst.stopped
            ? <div className="btn btn-primary btn-full" onClick={toggleStop}><Ico name="check" size={18} />Resume plan</div>
            : <>
                <div className="btn btn-primary" style={{ flex: 1 }} onClick={() => payN(1)}><Ico name="check" size={18} />Pay {paid + 1} · {fmt(inst.installmentAmount)}</div>
                {left > 1 && <div className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={() => setSheet(true)}>Pay ahead</div>}
              </>}
        </div>
      )}

      {menu && <MenuSheet title={label} onClose={() => setMenu(false)} items={[
        { label: "Edit plan", icon: "pencil", onClick: () => onEdit?.(inst) },
        ...(!done ? [{ label: inst.stopped ? "Resume" : "Stop plan", icon: inst.stopped ? "check" : "back", sub: inst.stopped ? "Mark active again" : "Keeps your paid installments", onClick: toggleStop }] : []),
        { label: "Delete", icon: "trash", danger: true, sub: "Paid installments stay in history", onClick: remove },
      ]} />}

      {sheet && <NumberSheet title="Pay how many ahead?" sub={`Up to ${left} left`} value={1} picks={[...new Set([1, 2, 3, 6, left].filter((n) => n >= 1 && n <= left))]} min={1} max={left} onConfirm={(n) => { setSheet(false); payN(n); }} onClose={() => setSheet(false)} />}
    </div>
  );
}
