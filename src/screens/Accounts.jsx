// Saver — Accounts list: ported 1:1 from showcase 40 (manage banks & cash).
import Ico from "../ui/Ico.jsx";
import { fmt } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank, totalBalance, totalFrozen } from "../lib/calc.js";

export default function Accounts({ store, back, onOpen, onAdd }) {
  const { banks = [], txns = [], savings = [] } = store;
  const total = totalBalance(banks, txns);
  const frozen = totalFrozen(banks, txns, savings);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Accounts</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">Total balance</div>
        <div className="big tnum">{fmt(total)}</div>
        <div className="sub">{banks.filter((b) => !b.archived).length} accounts{frozen > 0 ? ` · ${fmt(frozen)} frozen in goals` : ""}</div>
      </div>

      {banks.filter((b) => !b.archived).map((b) => {
        const fr = Math.max(0, calcFrozenForBank(b.id, savings, txns));
        const sub = b.lowBalanceThreshold ? `Low-balance alert ${fmt(b.lowBalanceThreshold)}` : fr > 0 ? `${fmt(fr)} frozen · goals` : "Account";
        return (
          <div className="icard" key={b.id} onClick={() => onOpen?.(b)} style={{ cursor: "pointer" }}>
            <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: b.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 15 }}>{(b.name || "?").slice(0, 1).toUpperCase()}</span>
            <div><div className="nm">{b.name}</div><div className="mt">{sub}</div></div>
            <div className="amt tnum">{fmt(calcBankBalance(b.id, txns))}</div>
          </div>
        );
      })}

      <div className="icard" onClick={onAdd} style={{ cursor: "pointer", borderStyle: "dashed" }}>
        <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="plus" size={22} /></span>
        <div className="nm" style={{ color: "var(--acText)" }}>Add account</div>
      </div>
    </div>
  );
}
