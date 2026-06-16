// Saver — Home: PORTED 1:1 from showcase screen 01 (same classes/markup), data injected.
import { useState, useRef, useMemo, Fragment } from "react";
import Ico from "../ui/Ico.jsx";
import { fmt, currentMonth, MONTHS, cardGradient } from "../lib/format.js";
import { calcBankBalance, calcGoalSaved, calcFrozenForBank, totalBalance, totalSafe, totalFrozen, monthTxns, sumIncome, sumExpense, projectSpent } from "../lib/calc.js";
import { DASH_SECTIONS, DASH_DEFAULT } from "../lib/store.js";

const KNOWN_SECTIONS = DASH_SECTIONS.map((s) => s.id);

const Contactless = ({ s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ opacity: .9 }}><path d="M5 11a3 3 0 0 1 0 2M9 8.5a6.5 6.5 0 0 1 0 7M13 6a10 10 0 0 1 0 12" /></svg>;

export function BankCard({ bank, available, frozen, low, money, onClick, wide }) {
  const col = bank.color || "#0e9f6e";
  return (
    <div className="bankcard" onClick={onClick} style={{ background: cardGradient(col), cursor: "pointer", ...(wide ? { width: "100%", height: 168 } : {}) }}>
      <span className="bc-orb" style={{ width: 98, height: 98, top: -34, right: -26 }} />
      <span className="bc-orb" style={{ width: 44, height: 44, bottom: 30, right: 34, opacity: .5 }} />
      <span className="bc-shine" />
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 800, fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bank.name}</span>
        {available < 0 ? <span style={{ width: 9, height: 9, borderRadius: 99, background: "#fff", flexShrink: 0 }} />
          : low ? <span style={{ width: 27, height: 27, borderRadius: 9, background: "rgba(255,255,255,.24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg></span>
            : <Contactless />}
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 10, opacity: .85, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".09em" }}>{low && frozen <= 0 ? "Available · low" : "Available"}</div>
        <div className="tnum" style={{ fontSize: 27, fontWeight: 800, letterSpacing: -.6, lineHeight: 1.08 }}>{money(available)}</div>
        {frozen > 0
          ? <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}><Ico name="lock" size={11} color="#fff" /><span className="tnum" style={{ fontSize: 11.5, fontWeight: 700, opacity: .92 }}>{money(frozen)} locked · goals</span></div>
          : low
            ? <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}><Ico name="bell" size={11} color="#fff" /><span style={{ fontSize: 11.5, fontWeight: 700, opacity: .95 }}>Below your {fmt(bank.lowBalanceThreshold)} alert</span></div>
            : <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, opacity: .9 }}><Ico name="check" size={12} color="#fff" /><span style={{ fontSize: 11.5, fontWeight: 700 }}>Fully available</span></div>}
      </div>
    </div>
  );
}

const circ = (size = 42, r = 13, bg, color) => ({ width: size, height: size, borderRadius: r, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" });

export default function Home({ store, onTab, onOpenBank, onOpenGoals, onOpenBudgets, onOpenProjects, onOpenInstallments, onOpenNotifications, onOpenAllAccounts, onOpenBreakdown, onCustomize }) {
  const { banks, txns, savings, bills = [], budgets = [], installments = [], username } = store;
  const [hide, setHide] = useState(false);
  const [page, setPage] = useState(0);
  const pagerRef = useRef(null);
  const cm = currentMonth();
  const mName = MONTHS[+cm.split("-")[1] - 1];

  const d = useMemo(() => {
    const tb = totalBalance(banks, txns), ts = totalSafe(banks, txns, savings), tf = totalFrozen(banks, txns, savings);
    const mt = monthTxns(txns, cm), inc = sumIncome(mt), exp = sumExpense(mt);
    const goals = savings.filter((s) => s.status !== "archived").map((s) => ({ ...s, saved: Math.max(0, calcGoalSaved(s.id, txns)) }));
    const goalsSaved = goals.reduce((a, g) => a + g.saved, 0);
    const billActive = (b) => (!b.startMonth || cm >= b.startMonth) && (!b.stoppedMonth || cm < b.stoppedMonth);
    const billPaid = (b) => b.payments?.some((p) => p.month === cm);
    const mBills = bills.filter((b) => billActive(b) || billPaid(b));
    const unpaid = mBills.filter((b) => !billPaid(b));
    const mb = budgets.filter((b) => b.kind !== "project");
    const limit = mb.reduce((s, b) => s + (b.amount || 0), 0);
    const budCatIds = new Set(mb.flatMap((b) => b.cats || []));
    const spent = mt.filter((t) => t.type === "expense" && budCatIds.has(t.catId)).reduce((s, t) => s + t.amount, 0);
    // Installments: active plans (not fully paid / not archived), remaining + due-this-month
    const paidOf = (i) => i.payments?.length ?? i.paidInstallments ?? 0;
    const activeInst = installments.filter((i) => i.status !== "archived" && paidOf(i) < i.totalInstallments);
    const instRemaining = activeInst.reduce((s, i) => s + Math.max(0, i.totalAmount - paidOf(i) * i.installmentAmount), 0);
    const instDue = activeInst.filter((i) => !(i.payments || []).some((p) => p.month === cm)).reduce((s, i) => s + i.installmentAmount, 0);
    // Projects: long-term budgets (kind === "project"), accumulate spend across months
    const activeProj = budgets.filter((b) => b.kind === "project" && b.status !== "archived");
    const projSpent = activeProj.reduce((s, p) => s + projectSpent(p, txns), 0);
    const projLimit = activeProj.reduce((s, p) => s + (p.amount || 0), 0);
    return { tb, ts, tf, inc, exp, net: inc - exp, goals, goalsSaved, billsDue: unpaid.reduce((s, b) => s + b.amount, 0), unpaid: unpaid.length, paid: mBills.length - unpaid.length, limit, spent, instCount: activeInst.length, instRemaining, instDue, projCount: activeProj.length, projSpent, projLimit };
  }, [banks, txns, savings, bills, budgets, installments, cm]);

  const hh = new Date().getHours();
  const greet = hh < 12 ? "Good morning" : hh < 18 ? "Good afternoon" : "Good evening";
  const money = (v) => (hide ? "••••" : fmt(v));
  const onScroll = () => { const el = pagerRef.current; if (el) setPage(Math.round(el.scrollLeft / el.clientWidth)); };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow">
          <div><div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", opacity: .72, fontWeight: 700 }}>{greet}</div><div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>{username || "there"}</div></div>
          <div className="grow" />
          <div className="hib" onClick={() => setHide((v) => !v)}><Ico name={hide ? "eyeOff" : "eye"} size={20} /></div>
          <div className="hib" onClick={() => onOpenNotifications?.()}><Ico name="bell" size={20} /></div>
        </div>
        <div className="hscroll" ref={pagerRef} onScroll={onScroll} style={{ overflow: "hidden", marginTop: 2, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}>
          <div style={{ minWidth: "100%", scrollSnapAlign: "start" }}>
            <div className="lbl">Total balance</div><div className="big tnum">{money(d.tb)}</div>
            <div className="sub">{banks.length} account{banks.length === 1 ? "" : "s"}</div>
          </div>
          <div style={{ minWidth: "100%", scrollSnapAlign: "start" }}>
            <div className="lbl">Safe to spend</div><div className="big tnum">{money(d.ts)}</div>
            <div className="sub">{d.tf > 0 ? `${money(d.tf)} frozen in goals` : "Nothing frozen"}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", gap: 6, zIndex: 1 }}>
          <span style={{ width: page === 0 ? 18 : 6, height: 6, borderRadius: 3, background: page === 0 ? "#fff" : "rgba(255,255,255,.45)" }} />
          <span style={{ width: page === 1 ? 18 : 6, height: 6, borderRadius: 3, background: page === 1 ? "#fff" : "rgba(255,255,255,.45)" }} />
        </div>
      </div>

      {(() => {
      const saved = store.dashboard?.order ? store.dashboard : DASH_DEFAULT;
      // merge: keep saved order, then append any newer sections (e.g. installments/projects) not yet in it
      const order = [...saved.order.filter((id) => KNOWN_SECTIONS.includes(id)), ...KNOWN_SECTIONS.filter((id) => !saved.order.includes(id))];
      const dash = { order, hidden: saved.hidden || [] };
      const SEC = {};
      SEC.accounts = (<Fragment key="accounts">
      <div className="sectit"><div className="t">Accounts</div><div className="m" onClick={() => onOpenAllAccounts?.()}>All accounts</div></div>
      <div className="hscroll" style={{ display: "flex", gap: 13, overflowX: "auto", marginBottom: 16, paddingBottom: 2 }}>
        {banks.map((b) => {
          const bal = calcBankBalance(b.id, txns), frozen = Math.max(0, calcFrozenForBank(b.id, savings, txns)), avail = bal - frozen;
          const low = b.lowBalanceThreshold && avail <= b.lowBalanceThreshold && avail >= 0;
          return <BankCard key={b.id} bank={b} available={avail} frozen={frozen} low={low} money={money} onClick={() => onOpenBank?.(b)} />;
        })}
        <div style={{ minWidth: 84, background: "var(--surface2)", border: "var(--cardBorder)", borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--acText)" }} onClick={() => onOpenAllAccounts?.()}><Ico name="layers" size={20} /><div style={{ fontSize: 11, fontWeight: 800, textAlign: "center" }}>All</div></div>
      </div>

      </Fragment>);
      SEC.income = (<Fragment key="income">
      <div className="tile" style={{ marginBottom: 13, cursor: "pointer" }} onClick={() => onOpenBreakdown?.()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>{mName} · this month</div><Ico name="chev" size={16} color="var(--faint)" /></div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 11 }}><span style={circ(38, 12, "rgba(16,185,129,.15)", "var(--success)")}><Ico name="arrowUp" size={18} stroke={2.5} /></span><div><div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 700 }}>Income</div><div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: "var(--success)" }}>{hide ? "••••" : "+" + fmt(d.inc)}</div></div></div>
          <div style={{ width: 1, background: "var(--line)", alignSelf: "stretch", margin: "2px 16px" }} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 11 }}><span style={circ(38, 12, "rgba(229,84,78,.15)", "var(--red)")}><Ico name="arrowDown" size={18} stroke={2.5} /></span><div><div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 700 }}>Spent</div><div className="tnum" style={{ fontSize: 19, fontWeight: 800, color: "var(--red)" }}>{hide ? "••••" : "−" + fmt(d.exp)}</div></div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>Net this month</span>
          <span className="tnum" style={{ fontSize: 15, fontWeight: 800, color: d.net < 0 ? "var(--red)" : "var(--success)" }}>{hide ? "••••" : (d.net < 0 ? "−" : "+") + fmt(Math.abs(d.net))}</span>
        </div>
      </div>

      </Fragment>);
      SEC.bills = (<Fragment key="bills">{bills.length > 0 && (
        <div className="tile" style={{ marginBottom: 13 }} onClick={() => onTab?.("bills")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={circ(42, 13, "var(--blueDim)", "var(--blue)")}><Ico name="bills" size={21} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>Bills · {mName}</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.billsDue)} due</div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          <div style={{ display: "flex", gap: 7, marginTop: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--surface2)", padding: "5px 11px", borderRadius: 9, fontSize: 11.5, fontWeight: 700, color: "var(--muted)" }}><span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--yellow)" }} />{d.unpaid} due</span>
            <span style={{ background: "var(--surface2)", padding: "5px 11px", borderRadius: 9, fontSize: 11.5, fontWeight: 700, color: "var(--muted)" }}>{d.paid} paid</span>
          </div>
        </div>
      )}
      </Fragment>);
      SEC.installments = (<Fragment key="installments">{d.instCount > 0 && (
        <div className="tile" style={{ marginBottom: 13 }} onClick={() => onOpenInstallments?.()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={circ(42, 13, "var(--orangeDim)", "var(--orange)")}><Ico name="card" size={20} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>Installments · {d.instCount} active</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.instRemaining)} left</div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          {d.instDue > 0 && <div style={{ display: "flex", gap: 7, marginTop: 13 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--surface2)", padding: "5px 11px", borderRadius: 9, fontSize: 11.5, fontWeight: 700, color: "var(--muted)" }}><span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--orange)" }} />{money(d.instDue)} due this month</span>
          </div>}
        </div>
      )}
      </Fragment>);
      SEC.goals = (<Fragment key="goals">{d.goals.length > 0 && (
        <div className="tile" style={{ marginBottom: 13 }} onClick={() => onOpenGoals?.()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={circ(42, 13, "var(--acDim)", "var(--acText)")}><Ico name="target" size={21} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>Goals · {d.goals.length} active</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.goalsSaved)} saved</div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {d.goals.slice(0, 2).map((g) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, width: 74, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 4, background: "var(--surface2)" }}><i style={{ display: "block", width: `${g.goal > 0 ? Math.min(100, (g.saved / g.goal) * 100) : 0}%`, height: "100%", borderRadius: 4, background: "var(--ac)" }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
      </Fragment>);
      SEC.budgets = (<Fragment key="budgets">{d.limit > 0 && (
        <div className="tile" style={{ marginBottom: 13 }} onClick={() => onOpenBudgets?.()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={circ(42, 13, "var(--purpleDim)", "var(--purple)")}><Ico name="layers" size={20} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>Budgets · {mName}</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.spent)} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>of {fmt(d.limit)}</span></div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)" }}><i style={{ display: "block", width: `${d.limit > 0 ? Math.min(100, (d.spent / d.limit) * 100) : 0}%`, height: "100%", borderRadius: 4, background: "var(--purple)" }} /></div>
        </div>
      )}</Fragment>);
      SEC.projects = (<Fragment key="projects">{d.projCount > 0 && (
        <div className="tile" style={{ marginBottom: 13 }} onClick={() => onOpenProjects?.()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={circ(42, 13, "var(--purpleDim)", "var(--purple)")}><Ico name="sparkles" size={20} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>Projects · {d.projCount} active</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.projSpent)} {d.projLimit > 0 && <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>of {fmt(d.projLimit)}</span>}</div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          {d.projLimit > 0 && <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)" }}><i style={{ display: "block", width: `${Math.min(100, (d.projSpent / d.projLimit) * 100)}%`, height: "100%", borderRadius: 4, background: "var(--purple)" }} /></div>}
        </div>
      )}</Fragment>);
      return dash.order.filter((id) => !(dash.hidden || []).includes(id)).map((id) => SEC[id]);
      })()}

      <div className="icard" onClick={() => onCustomize?.()} style={{ cursor: "pointer", marginTop: 16, borderStyle: "dashed", background: "transparent", justifyContent: "center", gap: 9 }}>
        <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="grip" size={18} /></span>
        <div className="nm" style={{ color: "var(--acText)" }}>Customize home</div>
      </div>
    </div>
  );
}
