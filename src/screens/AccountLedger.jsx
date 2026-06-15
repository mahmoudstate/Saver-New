// Saver — Account ledger: ported 1:1 from showcase 11. Bank-gradient hero + this-month ledger.
import { useMemo } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, currentMonth, cardGradient } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank } from "../lib/calc.js";

function Row({ t, bankNameOf }) {
  let cls = "", sign = "", nm, sub, cat = null, color;
  if (t.type === "income") { cls = "in"; sign = "+"; nm = t.note || t.catName || "Income"; sub = t.catName || "Income"; }
  else if (t.type === "expense") { cls = "out"; sign = "−"; nm = t.note || t.catName || "Expense"; sub = t.catName || "Expense"; }
  else if (t.type === "saving") { cat = "goal"; color = "var(--ac)"; nm = t.goalName ? "Saved · " + t.goalName : "Saving"; sub = "To goal"; }
  else if (t.type === "goal_withdraw") { cls = "out"; sign = "−"; cat = "goal"; nm = t.goalName ? "Spent from " + t.goalName : "Goal spend"; sub = "Goal"; }
  else if (t.type === "goal_return") { cls = "in"; sign = "+"; cat = "goal"; nm = t.goalName ? "Returned · " + t.goalName : "Goal return"; sub = "Goal"; }
  else if (t.type === "transfer") { cat = "transfer"; color = "var(--blue)"; nm = "Transfer"; sub = `${bankNameOf(t.fromBankId || t.bankId)} → ${bankNameOf(t.toBankId)}`; }
  else { nm = t.catName || t.type; sub = ""; }
  return (
    <div className="icard">
      <CatTile txn={t} cat={cat} size={44} />
      <div><div className="nm">{nm}</div><div className="mt">{sub}</div></div>
      <div className={`amt ${cls} tnum`} style={!cls && color ? { color } : undefined}>{sign}{fmt(t.amount)}</div>
    </div>
  );
}

export default function AccountLedger({ store, bank, back, onMove }) {
  const { txns, banks } = store;
  const cm = currentMonth();
  const bankNameOf = (id) => banks.find((b) => b.id === id)?.name || "";
  const bal = calcBankBalance(bank.id, txns), frozen = Math.max(0, calcFrozenForBank(bank.id, [], txns)), avail = bal - frozen;
  const list = useMemo(() => txns
    .filter((t) => (t.bankId === bank.id || t.toBankId === bank.id || t.fromBankId === bank.id) && (t.date || "").startsWith(cm))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "")), [txns, bank.id, cm]);

  return (
    <div className="content padnav">
      <div className="hero" style={{ position: "relative", overflow: "hidden", background: cardGradient(bank.color || "#0e9f6e"), color: "#fff" }}>
        <span className="bc-orb" style={{ width: 130, height: 130, top: -44, right: -34 }} /><span className="bc-orb" style={{ width: 60, height: 60, bottom: 18, right: 42, opacity: .5 }} /><span className="bc-shine" />
        <div className="toprow" style={{ position: "relative", zIndex: 2 }}>
          <div className="hib" onClick={back} style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="back" size={20} /></div>
          <div className="ttl">{bank.name}</div><div className="grow" />
          <Ico name="contactless" size={20} color="#fff" stroke={2} style={{ opacity: .9, marginRight: 8 }} />
          <div className="hib" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="note" size={18} /></div>
        </div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="lbl" style={{ color: "rgba(255,255,255,.82)" }}>Available</div>
          <div className="big tnum" style={{ color: "#fff" }}>{fmt(avail)}</div>
          <div className="sub" style={{ color: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 6 }}>
            {frozen > 0 ? <><Ico name="lock" size={12} color="#fff" />{fmt(frozen)} locked · {fmt(bal)} total</> : <>{fmt(bal)} total balance</>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className="btn btn-secondary" style={{ flex: 1, height: 46, fontSize: 14 }} onClick={() => onMove?.(bank)}><Ico name="transfer" size={17} />Move money</button>
      </div>
      <div className="over">This month</div>
      {list.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>No transactions this month.</div>
        : list.map((t) => <Row key={t.id} t={t} bankNameOf={bankNameOf} />)}
    </div>
  );
}
