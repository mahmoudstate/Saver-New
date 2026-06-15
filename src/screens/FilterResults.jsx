// Saver — Filter Results: ported from showcase 55 (summary insight + list).
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, fmtDate } from "../lib/format.js";
import { PERIODS, SHOWS, applyFilter, summarize } from "../lib/filter.js";

export default function FilterResults({ store, filter, back, onEditFilter, onEdit }) {
  const { txns = [], banks = [], expCats = [], incCats = [] } = store;
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "";
  const catName = (id) => [...expCats, ...incCats].find((c) => c.id === id)?.name;

  const list = applyFilter(txns, filter).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const { count, total, avg } = summarize(list);

  const chips = [];
  if (filter.period && filter.period !== "all") chips.push(PERIODS.find((p) => p.id === filter.period)?.label);
  (filter.shows || []).forEach((s) => chips.push(SHOWS.find((x) => x.id === s)?.label));
  (filter.cats || []).forEach((c) => chips.push(catName(c)));
  (filter.accounts || []).forEach((a) => chips.push(bankName(a)));

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Results</div><div className="grow" /><div className="hib" onClick={onEditFilter}><Ico name="funnel" size={18} /></div></div>
        <div className="lbl">Your view</div>
        <div className="big tnum">{fmt(total)}</div>
        <div className="sub">{count} transaction{count === 1 ? "" : "s"}{count ? ` · avg ${fmt(avg)}` : ""}</div>
      </div>

      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {chips.filter(Boolean).map((c, i) => <span key={i} className="chip" style={{ background: "var(--acDim)", color: "var(--ac)", borderColor: "transparent" }}>{c}</span>)}
          <span className="chip" onClick={onEditFilter} style={{ cursor: "pointer" }}>Edit</span>
        </div>
      )}

      <div className="over">Transactions</div>
      {list.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "30px", fontWeight: 600 }}>Nothing matches this view.</div>
        : list.map((t) => {
          const out = t.type === "expense" || t.type === "goal_withdraw" || t.type === "transfer";
          const sign = t.type === "income" || t.type === "goal_return" ? "+" : out ? "−" : "+";
          return (
            <div className="icard" key={t.id} onClick={() => onEdit?.(t)} style={{ cursor: "pointer" }}>
              <CatTile txn={t} size={44} />
              <div><div className="nm">{t.catName || t.type}</div><div className="mt">{bankName(t.bankId)}{t.date ? " · " + fmtDate(t.date).split(":")[0] : ""}</div></div>
              <div className={`amt ${out ? "out" : "in"} tnum`}>{sign}{fmt(t.amount)}</div>
            </div>
          );
        })}
    </div>
  );
}
