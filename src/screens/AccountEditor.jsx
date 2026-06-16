// Saver — Add / Edit account: ported from showcase 17 (bank or cash · colour · alert).
// New account optionally seeds an opening-balance income txn (existing income path).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { fmt, today, cardGradient } from "../lib/format.js";
import { loadKey, saveKey } from "../lib/store.js";

const COLORS = ["#E5544E", "#2563EB", "#0E9F6E", "#D97706", "#7C3AED", "#0D9488", "#EC4899", "#3a3f66"];

export default function AccountEditor({ store, account, onClose }) {
  const editing = !!account;
  const [kind, setKind] = useState(account?.glyph === "banknote" ? "cash" : "bank");
  const [name, setName] = useState(account?.name || "");
  const [color, setColor] = useState(account?.color || COLORS[0]);
  const [opening, setOpening] = useState(0);
  const [alertOn, setAlertOn] = useState(account?.lowBalanceThreshold != null);
  const [threshold, setThreshold] = useState(account?.lowBalanceThreshold || 0);
  const [sheet, setSheet] = useState(null); // opening | threshold
  // User-added colours persist locally so they show up as swatches next time.
  const [custom, setCustom] = useState(() => loadKey("et_bankColors", []));

  const canSave = name.trim().length > 0;
  const swatches = [...COLORS, ...custom.filter((c) => !COLORS.includes(c))];

  const pickCustom = (c) => {
    if (!c) return;
    setColor(c);
    if (!COLORS.includes(c) && !custom.includes(c)) {
      const nl = [...custom, c];
      setCustom(nl);
      saveKey("et_bankColors", nl);
    }
  };

  // toggling the alert on with no amount yet jumps straight to the keypad
  const toggleAlert = () => setAlertOn((v) => { const nv = !v; if (nv && !threshold) setSheet("threshold"); return nv; });

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
      {/* Live preview: the hero takes the selected colour so you see the card before saving */}
      <div className="hero" style={{ background: cardGradient(color), color: "#fff" }}>
        <div className="toprow"><div className="ttl" style={{ color: "#fff" }}>{editing ? "Edit account" : "New account"}</div><div className="grow" /><div className="hib" style={{ background: "rgba(255,255,255,.18)" }} onClick={onClose}><Ico name="close" size={20} color="#fff" /></div></div>
        <div className="lbl" style={{ color: "rgba(255,255,255,.82)" }}>{editing ? "Account" : "Opening balance"}</div>
        <div className="big tnum" onClick={() => !editing && setSheet("opening")} style={{ color: "#fff", cursor: editing ? "default" : "pointer" }}>{editing ? (name || "—") : (opening > 0 ? fmt(opening) : <span style={{ opacity: .65 }}>{fmt(0)}</span>)}</div>
        <div className="sub" style={{ color: "rgba(255,255,255,.85)" }}>{kind === "cash" ? "Cash wallet" : "Bank account"}</div>
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

      <div className="tile" style={{ margin: "13px 0", padding: 14 }}>
        <div className="fl" style={{ marginBottom: 11 }}>Colour</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 11 }}>
          {swatches.map((c) => <span key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />)}
          {/* colour wheel: pick any colour; it's remembered as a swatch */}
          <label style={{ width: 28, height: 28, borderRadius: "50%", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)", boxShadow: !swatches.includes(color) ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "inset 0 0 0 2px rgba(255,255,255,.5)" }}>
            <Ico name="plus" size={13} color="#fff" />
            <input type="color" value={color} onChange={(e) => pickCustom(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
          </label>
        </div>
      </div>

      <div className="field">
        <div style={{ flex: 1 }}><div className="fl">Low-balance alert</div><div className="fv">{alertOn ? "On" : "Off"}</div></div>
        <span className={`switch ${alertOn ? "on" : ""}`} onClick={toggleAlert}><i /></span>
      </div>
      {alertOn && (
        <label className="field" style={{ marginTop: 11 }} onClick={() => setSheet("threshold")}>
          <div style={{ flex: 1 }}><div className="fl">Alert me below</div><div className="fv" style={threshold > 0 ? null : { color: "var(--faint)" }}>{threshold > 0 ? fmt(threshold) : "Tap to set amount"}</div></div>
          <span className="chev"><Ico name="pencil" size={17} /></span>
        </label>
      )}

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? "Save account" : "Add account"}</div></div>

      {sheet === "opening" && <AmountSheet title="Opening balance" confirmLabel="Set" onConfirm={(v) => { setOpening(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "threshold" && <AmountSheet title="Low-balance alert" sub="Warn me below this" confirmLabel="Set" onConfirm={(v) => { setThreshold(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
