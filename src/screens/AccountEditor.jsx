// Saver — Add / Edit account: ported from showcase 17 (bank or cash · colour · alert).
// New account optionally seeds an opening-balance income txn (existing income path).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { fmt, today } from "../lib/format.js";

const COLORS = ["#E5544E", "#2563EB", "#0E9F6E", "#D97706", "#7C3AED", "#0D9488", "#EC4899"];

export default function AccountEditor({ store, account, onClose }) {
  const editing = !!account;
  const [kind, setKind] = useState(account?.glyph === "banknote" ? "cash" : "bank");
  const [name, setName] = useState(account?.name || "");
  const [color, setColor] = useState(account?.color || COLORS[0]);
  const [opening, setOpening] = useState(0);
  const [alertOn, setAlertOn] = useState(account?.lowBalanceThreshold != null);
  const [threshold, setThreshold] = useState(account?.lowBalanceThreshold || 0);
  const [sheet, setSheet] = useState(null); // opening | threshold

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const lowBalanceThreshold = alertOn && threshold > 0 ? threshold : undefined;
    const glyph = kind === "cash" ? "banknote" : "landmark";
    if (editing) {
      store.set("banks", (list) => list.map((b) => (b.id === account.id ? { ...b, name: name.trim(), color, glyph, lowBalanceThreshold } : b)));
    } else {
      const id = Date.now().toString();
      store.set("banks", (list) => [...list, { id, name: name.trim(), color, glyph, lowBalanceThreshold }]);
      if (opening > 0) store.addTxn({ type: "income", amount: opening, date: today(), bankId: id, bankName: name.trim(), catName: "Opening balance", catIcon: "wallet" });
    }
    store.flash({ title: editing ? "Account saved" : "Account added", sub: name.trim(), color: "var(--success)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? "Edit account" : "New account"}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">{editing ? "Account" : "Opening balance"}</div>
        <div className="big tnum" onClick={() => !editing && setSheet("opening")} style={{ cursor: editing ? "default" : "pointer" }}>{editing ? name || "—" : (opening > 0 ? fmt(opening) : <span style={{ opacity: .6 }}>{fmt(0)}</span>)}</div>
        <div className="sub">{kind === "cash" ? "Cash wallet" : "Bank account"}</div>
      </div>

      <div className="seg" style={{ marginBottom: 16 }}>
        <b className={kind === "bank" ? "on" : ""} onClick={() => setKind("bank")}>Bank</b>
        <b className={kind === "cash" ? "on" : ""} onClick={() => setKind("cash")}>Cash wallet</b>
      </div>

      <label className="field">
        <div style={{ flex: 1 }}><div className="fl">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "cash" ? "Cash wallet" : "e.g. HSBC"} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <div className="tile" style={{ margin: "13px 0", display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <div className="fl">Colour</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 11 }}>
          {COLORS.map((c) => <span key={c} onClick={() => setColor(c)} style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />)}
        </div>
      </div>

      <div className="field">
        <div style={{ flex: 1 }} onClick={() => alertOn && setSheet("threshold")}><div className="fl">Low-balance alert</div><div className="fv">{alertOn && threshold > 0 ? fmt(threshold) : "Off"}</div></div>
        <span className={`switch ${alertOn ? "on" : ""}`} onClick={() => setAlertOn((v) => !v)}><i /></span>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save account" : "Add account"}</div></div>

      {sheet === "opening" && <AmountSheet title="Opening balance" confirmLabel="Set" onConfirm={(v) => { setOpening(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "threshold" && <AmountSheet title="Low-balance alert" sub="Warn me below this" confirmLabel="Set" onConfirm={(v) => { setThreshold(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
