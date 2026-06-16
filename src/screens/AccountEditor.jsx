// Saver — Add / Edit account: ported from showcase 17 (bank or cash · colour · alert).
// New account optionally seeds an opening-balance income txn (existing income path).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { fmt, today, cardGradient } from "../lib/format.js";
import { calcBankBalance } from "../lib/calc.js";
import { loadKey, saveKey } from "../lib/store.js";

// First-run seed only — the palette is fully user-managed after that (add via the
// wheel, remove via the × on each swatch). Nothing here is forced on the user.
const SEED = ["#E5544E", "#2563EB", "#0E9F6E", "#D97706", "#7C3AED", "#0D9488", "#EC4899", "#3a3f66"];

export default function AccountEditor({ store, account, onClose, onDeleted }) {
  const editing = !!account;
  const [kind, setKind] = useState(account?.glyph === "banknote" ? "cash" : "bank");
  const [name, setName] = useState(account?.name || "");
  const [color, setColor] = useState(account?.color || SEED[0]);
  const [opening, setOpening] = useState(0);
  const [alertOn, setAlertOn] = useState(account?.lowBalanceThreshold != null);
  const [threshold, setThreshold] = useState(account?.lowBalanceThreshold || 0);
  const [sheet, setSheet] = useState(null); // opening | threshold | palette
  const [draft, setDraft] = useState(account?.color || SEED[0]); // colour being picked in the palette sheet
  // User-managed colour palette (persisted). Show the bank's current colour too so it's selectable.
  const [palette, setPalette] = useState(() => {
    const base = loadKey("et_bankColors", SEED);
    return account?.color && !base.includes(account.color) ? [...base, account.color] : base;
  });

  const canSave = name.trim().length > 0;
  const persistPalette = (pl) => { setPalette(pl); saveKey("et_bankColors", pl); };
  const addColor = (c) => { if (!c) return; setColor(c); if (!palette.includes(c)) persistPalette([...palette, c]); };
  const removeColor = (c) => persistPalette(palette.filter((x) => x !== c));

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
        // go straight back to the accounts list (skip the now-deleted account's ledger)
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

      <div className="tile" style={{ margin: "13px 0", padding: 14 }}>
        <div className="fl" style={{ marginBottom: 11 }}>Colour</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 13, alignItems: "center" }}>
          {palette.map((c) => (
            <span key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />
          ))}
          {/* the one circle that opens the colour palette (add/remove happens inside) */}
          <span onClick={() => { setDraft(color); setSheet("palette"); }} style={{ width: 28, height: 28, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "conic-gradient(#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)", boxShadow: "inset 0 0 0 2px rgba(255,255,255,.55)" }}><Ico name="plus" size={14} color="#fff" /></span>
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

      {sheet === "palette" && (
        <>
          <div className="dim" onClick={() => setSheet(null)} />
          <div className="sheet">
            <div className="grab" />
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>Colours</div>
            <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 16px" }}>Pick a colour and add it to your set. Remove any below.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
              <label style={{ position: "relative", width: 52, height: 52, borderRadius: 16, cursor: "pointer", flexShrink: 0, background: draft, boxShadow: "inset 0 0 0 2px rgba(255,255,255,.5), 0 6px 16px -6px rgba(0,0,0,.4)" }}>
                <input type="color" value={draft} onChange={(e) => setDraft(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </label>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Pick a colour</div>
                <div className="tnum" style={{ color: "var(--muted)", fontSize: 12.5, fontWeight: 600, textTransform: "uppercase" }}>{draft}</div>
              </div>
              <button className="btn btn-primary" style={{ height: 44, padding: "0 18px" }} onClick={() => addColor(draft)}><Ico name="plus" size={17} />Add</button>
            </div>
            <div className="fl" style={{ marginBottom: 11 }}>Your colours</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 15, paddingBottom: 2 }}>
              {palette.length === 0 && <div style={{ color: "var(--faint)", fontSize: 13, fontWeight: 600 }}>No colours yet — pick one above and add it.</div>}
              {palette.map((c) => (
                <span key={c} style={{ position: "relative", width: 34, height: 34 }}>
                  <span onClick={() => setColor(c)} style={{ display: "block", width: 34, height: 34, borderRadius: "50%", background: c, cursor: "pointer", boxShadow: color === c ? "0 0 0 2px var(--surface),0 0 0 4px var(--ac)" : "none" }} />
                  <span onClick={() => removeColor(c)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--cardShadow)" }}>×</span>
                </span>
              ))}
            </div>
            <div className="cta"><div className="btn btn-secondary btn-full" onClick={() => setSheet(null)}>Done</div></div>
          </div>
        </>
      )}
      {sheet === "opening" && <AmountSheet title="Opening balance" confirmLabel="Set" onConfirm={(v) => { setOpening(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "threshold" && <AmountSheet title="Low-balance alert" sub="Warn me below this" confirmLabel="Set" onConfirm={(v) => { setThreshold(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
