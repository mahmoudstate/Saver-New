// Saver — Add / Edit subscription (bill). Form per showcase 38→detail; saves to bills.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import { fmt } from "../lib/format.js";

const COLORS = ["#E50914", "#1DB954", "#E60000", "#2563EB", "#7C3AED", "#0E9F6E", "#F59E0B"];

export default function SubscriptionEditor({ store, bill, onClose }) {
  const { banks = [] } = store;
  const editing = !!bill;
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount || 0);
  const [dueDay, setDueDay] = useState(bill?.dueDay || 1);
  const [bankId, setBankId] = useState(bill?.bankId || banks[0]?.id || null);
  const [color, setColor] = useState(bill?.color || COLORS[0]);
  const [sheet, setSheet] = useState(null);
  const bank = banks.find((b) => b.id === bankId);
  const canSave = name.trim() && amount > 0;
  const clampDay = (d) => Math.min(28, Math.max(1, d));

  const save = () => {
    if (!canSave) return;
    const base = { name: name.trim(), amount, dueDay: clampDay(dueDay), bankId, color };
    if (editing) store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, ...base } : b)));
    else store.set("bills", (list) => [...list, { id: Date.now().toString(), ...base, payments: [], reminderDays: 2 }]);
    store.flash({ title: editing ? "Subscription saved" : "Subscription added", sub: name.trim(), color: "var(--success)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero" style={{ background: `linear-gradient(140deg, ${color}, ${color})`, color: "#fff" }}>
        <div className="toprow"><div className="ttl">{editing ? "Edit subscription" : "New subscription"}</div><div className="grow" /><div className="hib" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }} onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl" style={{ color: "rgba(255,255,255,.82)" }}>Monthly · {store.currency}</div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer", color: "#fff" }}>{amount > 0 ? fmt(amount) : <span style={{ opacity: .6 }}>{fmt(0)}</span>}</div>
        <div className="sub" style={{ color: "rgba(255,255,255,.85)" }}>{name.trim() || "Name the service"}</div>
      </div>

      <label className="field">
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: color, color: "#fff", fontWeight: 800, fontSize: 15 }}>{(name || "?").slice(0, 1).toUpperCase()}</span>
        <div style={{ flex: 1 }}><div className="fl">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div>
      </label>

      <div className="field" style={{ marginTop: 12 }}>
        <div style={{ flex: 1 }}><div className="fl">Billing day</div><div className="fv tnum">Day {clampDay(dueDay)}</div></div>
        <span className="stepper"><button onClick={() => setDueDay((d) => clampDay(d - 1))}>−</button><span className="val">{clampDay(dueDay)}</span><button onClick={() => setDueDay((d) => clampDay(d + 1))}>+</button></span>
      </div>

      <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer", marginTop: 12 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>
        <div><div className="fl">Pays from</div><div className="fv">{bank?.name || "Pick"}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      <div className="tile" style={{ margin: "13px 0", display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <div className="fl">Colour</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 11 }}>{COLORS.map((c) => <span key={c} onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />)}</div>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save subscription" : "Add subscription"}</div></div>

      {sheet === "amount" && <AmountSheet title="Monthly amount" confirmLabel="Set" onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "account" && <PickerSheet title="Pays from" selectedId={bankId} onPick={setBankId} onClose={() => setSheet(null)} options={banks.map((b) => ({ id: b.id, label: b.name, bankColor: b.color }))} />}
    </div>
  );
}
