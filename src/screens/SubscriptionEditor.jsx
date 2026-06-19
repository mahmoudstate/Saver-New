// Saver — Add / Edit subscription (bill). Pick a real brand logo (colour locked to
// the brand) or make a Custom icon+colour. The hero takes the chosen colour. Plan
// fields, then the bill Category (built-in types + your own custom categories).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import NumberSheet from "../ui/NumberSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import ServicePicker from "../ui/ServicePicker.jsx";
import ServiceLogo from "../ui/ServiceLogo.jsx";
import CustomIconSheet from "../ui/CustomIconSheet.jsx";
import { loadColors } from "../ui/ColorSheet.jsx";
import { fmt, currentMonth, cardGradient } from "../lib/format.js";
import { SERVICE_CAT_TO_TYPE, BILL_TYPES } from "../lib/services.js";

const clampDay = (d) => Math.min(28, Math.max(1, d || 1));
// Built-in bill-type glyphs mapped to the new app's CATS icon set.
const TYPE_GLYPH = { streaming: "movie", software: "electronics", telecom: "wifi", shopping: "shopping", utilities: "electricity", other: "subscription" };

// Brand tile: bundled logo for a preset service, else a custom icon, else monogram.
function Brand({ domain, glyph, name, color, size = 42 }) {
  if (domain) return <ServiceLogo domain={domain} name={name} color={color} size={size} />;
  if (glyph) return <CatTile cat={glyph} name={name} color={color} size={size} />;
  return <span className="circ" style={{ width: size, height: size, borderRadius: size * 0.3, background: color, color: "#fff", fontWeight: 800, fontSize: size * 0.34 }}>{(name || "?").slice(0, 1).toUpperCase()}</span>;
}

export default function SubscriptionEditor({ store, bill, onClose }) {
  const { banks = [], billTypes = [] } = store;
  const editing = !!bill;
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount || 0);
  const [dueDay, setDueDay] = useState(bill?.dueDay || 1);
  const [reminderDays, setReminderDays] = useState(bill?.reminderDays ?? 2);
  const [bankId, setBankId] = useState(bill?.bankId || banks[0]?.id || null);
  const [color, setColor] = useState(bill?.color || loadColors()[0]);
  const [domain, setDomain] = useState(bill?.domain || "");
  const [glyph, setGlyph] = useState(bill?.glyph || "");
  const [typeId, setTypeId] = useState(bill?.typeId || "other");
  const [custom, setCustom] = useState(!!bill?.glyph && !bill?.domain);
  const [sheet, setSheet] = useState(null);

  const bank = banks.find((b) => b.id === bankId);
  const canSave = name.trim() && amount > 0;
  const allTypes = [...BILL_TYPES, ...billTypes];
  const typeGlyph = (t) => TYPE_GLYPH[t.id] || t.glyph || "subscription";

  // Picking a brand: name + brand colour (locked) + auto category; clears custom.
  const pickService = (svc) => { setName((n) => n.trim() || svc.name); setColor(svc.color); setDomain(svc.domain); setGlyph(""); setTypeId(SERVICE_CAT_TO_TYPE[svc.category] || "other"); setCustom(false); };

  const save = () => {
    if (!canSave) return;
    const base = { name: name.trim(), amount, dueDay: clampDay(dueDay), reminderDays: Math.min(7, Math.max(0, reminderDays | 0)), bankId, color, domain: custom ? "" : domain, glyph: custom ? glyph : "", typeId };
    if (editing) store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, ...base } : b)));
    else store.set("bills", (list) => [...list, { id: Date.now().toString(), ...base, payments: [], startMonth: currentMonth() }]);
    store.flash({ title: editing ? "Subscription saved" : "Subscription added", sub: name.trim(), color: "var(--success)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero" style={{ background: cardGradient(color), color: "#fff" }}>
        <div className="toprow"><div className="ttl">{editing ? "Edit subscription" : "New subscription"}</div><div className="grow" /><div className="hib" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }} onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
          <span style={{ display: "inline-flex", padding: 5, borderRadius: 16, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.42)", boxShadow: "0 6px 16px rgba(0,0,0,.16)" }}>
            <Brand domain={custom ? "" : domain} glyph={custom ? glyph : ""} name={name} color={color} size={42} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: -.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name.trim() || "Name the service"}</div>
            <div className="lbl" style={{ color: "rgba(255,255,255,.82)", marginTop: 2 }}>Monthly · {store.currency}</div>
          </div>
        </div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer", color: "#fff", marginTop: 12 }}><span style={{ opacity: amount > 0 ? 1 : .6 }}>{fmt(amount)}</span></div>
      </div>

      {/* ── Service ── */}
      <div className="over">Service</div>
      <ServicePicker activeDomain={custom ? "" : domain} customActive={custom} onPick={pickService} onCustom={() => setSheet("custom")} />

      <label className="field" style={{ marginTop: 10 }}>
        <Brand domain={custom ? "" : domain} glyph={custom ? glyph : ""} name={name} color={color} size={42} />
        <div style={{ flex: 1 }}><div className="fl">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div>
      </label>

      {/* ── Plan ── */}
      <div className="over" style={{ marginTop: 20 }}>Plan</div>
      <div className="field" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>
        <div style={{ flex: 1 }}><div className="fl">Monthly amount</div><div className="fv tnum">{amount > 0 ? fmt(amount) : "Set"}</div></div><span className="chev"><Ico name="pencil" size={17} /></span>
      </div>
      <div className="field" onClick={() => setSheet("day")} style={{ cursor: "pointer", marginTop: 10 }}>
        <div style={{ flex: 1 }}><div className="fl">Billing day</div><div className="fv tnum">Day {clampDay(dueDay)}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>
      <div className="field" onClick={() => setSheet("remind")} style={{ cursor: "pointer", marginTop: 10 }}>
        <div style={{ flex: 1 }}><div className="fl">Remind me</div><div className="fv tnum">{reminderDays === 0 ? "Off" : `${reminderDays} day${reminderDays === 1 ? "" : "s"} before`}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>
      <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer", marginTop: 10 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>
        <div><div className="fl">Pays from</div><div className="fv">{bank?.name || "Pick"}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      {/* ── Category (last) ── */}
      <div className="over" style={{ marginTop: 20 }}>Category</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {allTypes.map((t) => {
          const on = typeId === t.id;
          return (
            <div key={t.id} onClick={() => setTypeId(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "12px 4px", borderRadius: 14, border: on ? "1.5px solid var(--ac)" : "1px solid var(--line)", background: on ? "var(--acDim)" : "var(--surface)", cursor: "pointer" }}>
              <CatTile cat={typeGlyph(t)} color={t.color} size={32} />
              <span style={{ fontSize: 10.5, fontWeight: 700, textAlign: "center", lineHeight: 1.15, color: on ? "var(--acText)" : "var(--text)" }}>{t.name}</span>
            </div>
          );
        })}
        <div onClick={() => setSheet("newcat")} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 4px", borderRadius: 14, border: "1px dashed var(--border)", background: "var(--surface2)", cursor: "pointer", color: "var(--muted)" }}>
          <span className="circ" style={{ width: 32, height: 32, borderRadius: 11, background: "var(--surface)", border: "1px solid var(--line)" }}><Ico name="plus" size={17} /></span>
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>New</span>
        </div>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save subscription" : "Add subscription"}</div></div>

      {sheet === "custom" && <CustomIconSheet title="Custom icon" glyph={glyph || "subscription"} color={color} onDone={({ glyph, color }) => { setGlyph(glyph); setColor(color); setDomain(""); setCustom(true); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "newcat" && <CustomIconSheet title="New category" withName glyph="subscription" doneLabel="Add category" onDone={({ glyph, color, name }) => { const id = "custom_" + Date.now(); store.set("billTypes", (list) => [...list, { id, name, glyph, color }]); setTypeId(id); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "amount" && <AmountSheet title="Monthly amount" confirmLabel="Set" onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "day" && <NumberSheet title="Billing day of month" value={clampDay(dueDay)} picks={[1, 5, 10, 15, 25]} min={1} max={28} onConfirm={(v) => { setDueDay(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "remind" && <NumberSheet title="Remind me before" sub="Days earlier (0 = off)" value={reminderDays} picks={[0, 1, 2, 3, 7]} min={0} max={7} onConfirm={(v) => { setReminderDays(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "account" && <PickerSheet title="Pays from" selectedId={bankId} onPick={setBankId} onClose={() => setSheet(null)} options={banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, bankColor: b.color }))} />}
    </div>
  );
}
