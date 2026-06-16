// Saver — Transfer between accounts: ported from showcase 34. Uses locked store.addTxn
// (type:"transfer" → safeToSpend check on the source; from− / to+ in calc).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import { fmt, today } from "../lib/format.js";
import { calcBankBalance } from "../lib/calc.js";

export default function Transfer({ store, fromBankId: initialFrom, onClose }) {
  const { banks = [], txns = [] } = store;
  const [amount, setAmount] = useState(0);
  const [fromId, setFromId] = useState(initialFrom || banks[0]?.id || null);
  const [toId, setToId] = useState(banks.find((b) => b.id !== (initialFrom || banks[0]?.id))?.id || null);
  const [note, setNote] = useState("");
  const [sheet, setSheet] = useState(null); // amount | from | to

  const from = banks.find((b) => b.id === fromId);
  const to = banks.find((b) => b.id === toId);
  const bal = (id) => calcBankBalance(id, txns);
  const canSave = amount > 0 && from && to && fromId !== toId;

  const submit = () => {
    if (!canSave) return;
    const id = store.addTxn({ type: "transfer", amount, date: today(), fromBankId: fromId, toBankId: toId, bankName: from?.name, note });
    if (id === false) return;
    store.flash({ title: `${fmt(amount)} moved`, sub: `${from?.name} → ${to?.name}`, color: "var(--acText)", icon: "check" });
    onClose();
  };

  const acctRow = (label, color, b, onTap) => (
    <div className="field" onClick={onTap} style={{ cursor: "pointer", marginTop: 12 }}>
      <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: b?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(b?.name || "?").slice(0, 1).toUpperCase()}</span>
      <div><div className="fl" style={{ color }}>{label}</div><div className="fv">{b ? `${b.name} · ${fmt(bal(b.id))}` : "Pick an account"}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
    </div>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">Transfer</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">Amount · {store.currency}</div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>{amount > 0 ? fmt(amount) : <span style={{ opacity: .6 }}>{fmt(0)}</span>}</div>
        <div className="sub">Between your accounts</div>
      </div>

      {acctRow("From", "var(--red)", from, () => setSheet("from"))}
      {acctRow("To", "var(--success)", to, () => setSheet("to"))}

      <label className="field note" style={{ marginTop: 12 }}>
        <Ico name="note" size={19} color="var(--faint)" style={{ marginRight: 2 }} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", flex: 1, minWidth: 0 }} />
      </label>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={submit}><Ico name="check" size={18} />{amount > 0 ? `Transfer ${fmt(amount)}` : "Transfer"}</div></div>

      {sheet === "amount" && <AmountSheet title="Enter amount" sub="Transfer" confirmLabel="Set amount" max={from ? Math.max(0, bal(fromId)) : undefined} onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "from" && <PickerSheet title="From account" selectedId={fromId} onPick={(id) => { setFromId(id); if (id === toId) setToId(banks.find((b) => b.id !== id)?.id || null); }} onClose={() => setSheet(null)} options={banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, sub: fmt(bal(b.id)), bankColor: b.color }))} />}
      {sheet === "to" && <PickerSheet title="To account" selectedId={toId} onPick={(id) => { setToId(id); if (id === fromId) setFromId(banks.find((b) => b.id !== id)?.id || null); }} onClose={() => setSheet(null)} options={banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, sub: fmt(bal(b.id)), bankColor: b.color }))} />}
    </div>
  );
}
