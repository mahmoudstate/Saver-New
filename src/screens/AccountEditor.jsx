// Saver — Add / Edit account: ported from showcase 17 (bank or cash · colour · alert).
// New account optionally seeds an opening-balance income txn (existing income path).
import { useState, useRef } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { fmt, today, cardGradient } from "../lib/format.js";
import { calcBankBalance } from "../lib/calc.js";
import { loadKey, saveKey } from "../lib/store.js";

const DEFAULTS = ["#0E9F6E", "#2563EB", "#D97706", "#E5544E"]; // 4 base colours, always shown

export default function AccountEditor({ store, account, onClose, onDeleted }) {
  const editing = !!account;
  const [kind, setKind] = useState(account?.glyph === "banknote" ? "cash" : "bank");
  const [name, setName] = useState(account?.name || "");
  const [color, setColor] = useState(account?.color || DEFAULTS[0]);
  const [opening, setOpening] = useState(0);
  const [alertOn, setAlertOn] = useState(account?.lowBalanceThreshold != null);
  const [threshold, setThreshold] = useState(account?.lowBalanceThreshold || 0);
  const [sheet, setSheet] = useState(null); // opening | threshold
  // Only the colours the user deliberately added (persisted). Self-heals the old
  // pollution bug (a runaway list) by ignoring an unreasonably long saved array.
  const [custom, setCustom] = useState(() => { const c = loadKey("et_bankColors", []); return Array.isArray(c) && c.length <= 12 ? c.filter((x) => !DEFAULTS.includes(x)) : []; });
  const holdRef = useRef(null);

  const canSave = name.trim().length > 0;
  // row = 4 defaults + the user's added colours; plus the current colour if it's neither
  const base = [...DEFAULTS, ...custom];
  const shown = base.includes(color) ? base : [color, ...base];

  const persistCustom = (pl) => { setCustom(pl); saveKey("et_bankColors", pl); };
  // commit ONE colour when the picker closes (not on every scrub) — no more pollution
  const addCustom = (c) => { if (!c || DEFAULTS.includes(c) || custom.includes(c)) return; persistCustom([...custom, c]); };
  const removeCustom = (c) => { if (custom.includes(c)) persistCustom(custom.filter((x) => x !== c)); }; // defaults stay
  // long-press a user-added swatch to remove it (defaults can't be removed)
  const holdStart = (c) => { holdRef.current = setTimeout(() => removeCustom(c), 550); };
  const holdEnd = () => { clearTimeout(holdRef.current); };

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

  // Delete = soft delete: blocked while the account holds money; once empty it's hidden
  // from the UI but the record stays so historical transactions keep resolving.
  const del = () => {
    const bal = calcBankBalance(account.id, store.txns);
    if (Math.abs(bal) > 0.005) {
      store.setAlert({ title: "Empty it first", message: `This account still holds ${fmt(bal)}. Move or spend it down to ${fmt(0)}, then you can delete it.`, color: "var(--red)", icon: "lock" });
      return;
    }
    store.setConfirm({
      title: `Delete ${account.name}?`,
      message: "It'll be removed from your accounts. Past transactions stay so your history and totals don't change. This can't be undone.",
      confirmText: "Delete", danger: true, icon: "trash",
      onConfirm: () => {
        store.set("banks", (list) => list.map((b) => (b.id === account.id ? { ...b, archived: true } : b)));
        store.flash({ title: "Account removed", sub: account.name, color: "var(--red)", icon: "trash" });
        (onDeleted || onClose)();
      },
    });
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

      {/* original showcase look: a row of swatches. We add none — + opens the system
          picker (added colours show here), long-press a swatch to remove it. */}
      <div className="tile" style={{ margin: "13px 0", display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
        <div className="fl">Colour</div>
        <div style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 11, maxWidth: "76%" }}>
          {shown.map((c) => (
            <span key={c} onClick={() => setColor(c)} onPointerDown={() => holdStart(c)} onPointerUp={holdEnd} onPointerLeave={holdEnd} onContextMenu={(e) => { e.preventDefault(); removeCustom(c); }}
              style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />
          ))}
          <label style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", position: "relative" }}>
            <Ico name="plus" size={15} />
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} onBlur={(e) => addCustom(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
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

      {editing && <div className="btn btn-full" style={{ marginTop: 12, background: "transparent", color: "var(--red)", border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)" }} onClick={del}><Ico name="trash" size={17} />Delete account</div>}

      {sheet === "opening" && <AmountSheet title="Opening balance" confirmLabel="Set" onConfirm={(v) => { setOpening(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "threshold" && <AmountSheet title="Low-balance alert" sub="Warn me below this" confirmLabel="Set" onConfirm={(v) => { setThreshold(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
