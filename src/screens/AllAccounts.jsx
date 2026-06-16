// Saver — All Accounts: total in the hero + every bank as its gradient card (same design).
import Ico from "../ui/Ico.jsx";
import { BankCard } from "./Home.jsx";
import { fmt } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank, totalBalance, totalFrozen } from "../lib/calc.js";

export default function AllAccounts({ store, back, onOpenBank, onAdd }) {
  const { banks = [], txns = [], savings = [] } = store;
  const total = totalBalance(banks, txns);
  const frozen = totalFrozen(banks, txns, savings);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">All accounts</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">Total balance</div>
        <div className="big tnum">{fmt(total)}</div>
        <div className="sub">{banks.length} account{banks.length === 1 ? "" : "s"}{frozen > 0 ? ` · ${fmt(frozen)} frozen in goals` : ""}</div>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {banks.map((b) => {
          const bal = calcBankBalance(b.id, txns), fr = Math.max(0, calcFrozenForBank(b.id, savings, txns)), avail = bal - fr;
          const low = b.lowBalanceThreshold && avail <= b.lowBalanceThreshold && avail >= 0;
          return <BankCard key={b.id} wide bank={b} available={avail} frozen={fr} low={low} money={fmt} onClick={() => onOpenBank?.(b)} />;
        })}
        <div className="icard" onClick={onAdd} style={{ cursor: "pointer", borderStyle: "dashed" }}>
          <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="plus" size={22} /></span>
          <div className="nm" style={{ color: "var(--acText)" }}>Add account</div>
        </div>
      </div>
    </div>
  );
}
