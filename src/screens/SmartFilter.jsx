// Saver — Smart Filter: ported from showcase 54 (compose any view of your money).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import { fmt } from "../lib/format.js";
import { PERIODS, SHOWS, applyFilter, summarize } from "../lib/filter.js";

function Chip({ on, children, onClick }) {
  return <span onClick={onClick} style={{ padding: "8px 14px", borderRadius: 11, cursor: "pointer", fontWeight: on ? 800 : 700, fontSize: 13, ...(on ? { background: "var(--acDim)", border: "1px solid var(--ac)", color: "var(--acText)" } : { background: "var(--surface)", border: "var(--cardBorder)", color: "var(--muted)" }) }}>{children}</span>;
}
const row = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 };

export default function SmartFilter({ store, initial, onApply, back }) {
  const { txns = [], banks = [], expCats = [], incCats = [] } = store;
  const cats = [...expCats, ...incCats];
  const [period, setPeriod] = useState(initial?.period || "month");
  const [shows, setShows] = useState(initial?.shows || []);
  const [catSel, setCatSel] = useState(initial?.cats || []);
  const [accSel, setAccSel] = useState(initial?.accounts || []);

  const toggle = (arr, set, id) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const filter = { period, shows, cats: catSel, accounts: accSel };
  const { count, total } = summarize(applyFilter(txns, filter));

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Filter</div><div className="grow" /><div className="hchip" onClick={() => { setPeriod("all"); setShows([]); setCatSel([]); setAccSel([]); }}>Reset</div></div>
        <div className="lbl">Build your view</div><div className="big" style={{ fontSize: 28 }}>Smart filter</div><div className="sub">Any period · category · account</div>
      </div>

      <div className="over">When</div>
      <div style={row}>{PERIODS.map((p) => <Chip key={p.id} on={period === p.id} onClick={() => setPeriod(p.id)}>{p.label}</Chip>)}</div>

      <div className="over">Show</div>
      <div style={{ ...row, marginBottom: 7 }}><Chip on={shows.length === 0} onClick={() => setShows([])}>All</Chip>{SHOWS.map((s) => <Chip key={s.id} on={shows.includes(s.id)} onClick={() => toggle(shows, setShows, s.id)}>{s.label}</Chip>)}</div>
      <div className="caption" style={{ marginBottom: 18 }}>Pick one or more — or leave “All”.</div>

      {cats.length > 0 && <>
        <div className="over">Categories</div>
        <div style={row}><Chip on={catSel.length === 0} onClick={() => setCatSel([])}>All</Chip>{cats.map((c) => <Chip key={c.id} on={catSel.includes(c.id)} onClick={() => toggle(catSel, setCatSel, c.id)}>{c.name}</Chip>)}</div>
      </>}

      <div className="over">Accounts</div>
      <div style={{ ...row, marginBottom: 8 }}><Chip on={accSel.length === 0} onClick={() => setAccSel([])}>All</Chip>{banks.map((b) => <Chip key={b.id} on={accSel.includes(b.id)} onClick={() => toggle(accSel, setAccSel, b.id)}>{b.name}</Chip>)}</div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: count ? 1 : .5 }} onClick={() => count && onApply(filter)}><Ico name="search" size={17} />Show {count} result{count === 1 ? "" : "s"} · {fmt(total)}</div></div>
    </div>
  );
}
