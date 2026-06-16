// Saver — Add / Edit installment plan (grouped form; showcase 49–51 simplified).
// Saves to installments. Amount/total/count auto-derive like the legacy form.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import { fmt, today } from "../lib/format.js";

export default function InstallmentEditor({ store, plan, onClose }) {
  const { banks = [] } = store;
  const editing = !!plan;
  const [name, setName] = useState(plan?.itemType || plan?.company || "");
  const [count, setCount] = useState(plan?.totalInstallments || 12);
  const [monthly, setMonthly] = useState(plan?.installmentAmount || 0);
  const [dueDay, setDueDay] = useState(plan?.dueDay || 1);
  const [bankId, setBankId] = useState(plan?.bankId || banks[0]?.id || null);
  const [sheet, setSheet] = useState(null);
  const bank = banks.find((b) => b.id === bankId);
  const total = +(count * monthly).toFixed(2);
  const canSave = name.trim() && count > 0 && monthly > 0;
  const clampDay = (d) => Math.min(28, Math.max(1, d));

  const save = () => {
    if (!canSave) return;
    const base = { itemType: name.trim(), company: name.trim(), name: name.trim(), totalInstallments: count, installmentAmount: monthly, totalAmount: total, dueDay: clampDay(dueDay), bankId, startDate: today() };
    if (editing) store.set("installments", (list) => list.map((i) => (i.id === plan.id ? { ...i, ...base } : i)));
    else store.set("installments", (list) => [...list, { id: Date.now().toString(), ...base, payments: [], paidInstallments: 0, status: "active" }]);
    store.flash({ title: editing ? "Plan saved" : "Installment added", sub: `${name.trim()} · ${count}×${fmt(monthly)}`, color: "var(--acText)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? "Edit plan" : "New installment"}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">Total · {count} × {fmt(monthly)}</div>
        <div className="big tnum">{fmt(total)}</div>
        <div className="sub">{name.trim() || "Name the item"}</div>
      </div>

      <label className="field">
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--acDim)", color: "var(--acText)" }}><Ico name="card" size={20} /></span>
        <div style={{ flex: 1 }}><div className="fl">Item</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. iPhone 15" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div>
      </label>

      <div className="field" style={{ marginTop: 12 }}>
        <div style={{ flex: 1 }}><div className="fl">Months</div><div className="fv tnum">{count} payments</div></div>
        <span className="stepper"><button onClick={() => setCount((c) => Math.max(1, c - 1))}>−</button><span className="val">{count}</span><button onClick={() => setCount((c) => c + 1)}>+</button></span>
      </div>

      <div className="field" onClick={() => setSheet("monthly")} style={{ cursor: "pointer", marginTop: 12 }}>
        <div style={{ flex: 1 }}><div className="fl">Monthly amount</div><div className="fv tnum">{monthly > 0 ? fmt(monthly) : "Set"}</div></div><span className="chev"><Ico name="pencil" size={17} /></span>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <div style={{ flex: 1 }}><div className="fl">Due day</div><div className="fv tnum">Day {clampDay(dueDay)}</div></div>
        <span className="stepper"><button onClick={() => setDueDay((d) => clampDay(d - 1))}>−</button><span className="val">{clampDay(dueDay)}</span><button onClick={() => setDueDay((d) => clampDay(d + 1))}>+</button></span>
      </div>

      <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer", marginTop: 12 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>
        <div><div className="fl">Pays from</div><div className="fv">{bank?.name || "Pick"}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save plan" : "Add installment"}</div></div>

      {sheet === "monthly" && <AmountSheet title="Monthly amount" confirmLabel="Set" onConfirm={(v) => { setMonthly(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "account" && <PickerSheet title="Pays from" selectedId={bankId} onPick={setBankId} onClose={() => setSheet(null)} options={banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, bankColor: b.color }))} />}
    </div>
  );
}
