// Saver — Goal detail: ported 1:1 from showcase 13 (savings ledger).
// Actions use the LOCKED engine: Add money = saving txn; Return to bank = goal_return
// (auto-splits across the banks it was frozen in); spending-mode/archive per legacy.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import Money from "../ui/Money.jsx";
import { fmt, today, fmtDate } from "../lib/format.js";
import { calcGoalSaved, goalBalancesPerBank } from "../lib/calc.js";

const goalCat = (g) => resolveCat({ catGlyph: g.glyph, catName: g.name }) || "goal";

export default function GoalDetail({ store, goalId, back, onReached, onEdit }) {
  const { savings = [], banks = [], txns = [] } = store;
  const goal = savings.find((s) => s.id === goalId);
  const [sheet, setSheet] = useState(null); // "add" | "return"
  const [menu, setMenu] = useState(false);
  if (!goal) return null;

  const saved = Math.max(0, calcGoalSaved(goalId, txns));
  const target = goal.goal || 0;
  const left = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const spending = !!goal.spendingMode;
  const bankOf = (id) => banks.find((b) => b.id === id);

  const perBank = Object.entries(goalBalancesPerBank(goalId, txns)).filter(([, v]) => v > 0.0001);
  const contributions = txns.filter((t) => t.goalId === goalId).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const addMoney = (amount, bankId) => {
    const bank = bankOf(bankId);
    const id = store.addTxn({ type: "saving", amount, date: today(), bankId, bankName: bank?.name, goalId, catName: goal.name, catIcon: "saving", note: "" });
    if (id === false) return;
    setSheet(null);
    if (saved + amount >= target && target > 0 && onReached) onReached(goal, saved + amount);
    else { store.fireConfetti(); store.flash({ title: `${fmt(amount)} added`, sub: `${goal.name} · from ${bank?.name || "bank"}`, color: "var(--success)" }); }
  };

  const returnToBank = (amount) => {
    const id = store.addTxn({ type: "goal_return", amount, date: today(), bankId: banks[0]?.id, goalId, goalName: goal.name, catName: "Returned to bank", catIcon: "saving" });
    if (id === false) return;
    setSheet(null);
    store.flash({ title: `${fmt(amount)} returned`, sub: `Back to your accounts`, color: "var(--muted)", icon: "back" });
  };

  const toggleSpending = () => {
    store.setConfirm({
      title: spending ? "Turn off spending mode?" : "Use this goal as a source?",
      message: spending ? "It'll be removed from your payment sources. Your saved balance stays safe." : "The goal appears in Accounts like a vault, so you can spend straight from it.",
      color: spending ? "var(--yellow)" : "var(--ac)", confirmText: spending ? "Turn off" : "Turn on", icon: "wallet",
      onConfirm: () => store.set("savings", (list) => list.map((s) => (s.id === goalId ? { ...s, spendingMode: !spending } : s))),
    });
  };

  const archive = () => {
    store.setConfirm({
      title: "Complete & archive goal?",
      message: saved > 0 ? `This closes "${goal.name}" and returns the remaining ${fmt(saved)} to your accounts.` : `This closes "${goal.name}". It moves to your archived goals.`,
      color: "var(--acText)", confirmText: "Complete goal", icon: "check",
      onConfirm: () => {
        if (saved > 0) store.addTxn({ type: "goal_return", amount: saved, date: today(), bankId: banks[0]?.id, goalId, goalName: goal.name, catName: "Goal archived", catIcon: "saving" });
        store.set("savings", (list) => list.map((s) => (s.id === goalId ? { ...s, status: "archived", spendingMode: false } : s)));
        store.flash({ title: "Goal completed", sub: goal.name, color: "var(--success)" });
        back();
      },
    });
  };

  // Delete: releases any frozen money back to the banks (so balances stay correct),
  // removes the goal from the list, but the saving/return transactions stay in the data.
  const remove = () => {
    store.setConfirm({
      title: `Delete "${goal.name}"?`,
      message: saved > 0
        ? `The goal is removed and its frozen ${fmt(saved)} returns to your accounts. Its past contributions stay recorded in your history.`
        : `The goal is removed. Any past contributions stay recorded in your history.`,
      danger: true, confirmText: "Delete goal", icon: "trash",
      onConfirm: () => {
        if (saved > 0) store.addTxn({ type: "goal_return", amount: saved, date: today(), bankId: banks[0]?.id, goalId, goalName: goal.name, catName: "Goal deleted", catIcon: "saving" });
        store.set("savings", (list) => list.filter((s) => s.id !== goalId));
        store.flash({ title: "Goal deleted", sub: goal.name, color: "var(--muted)" });
        back();
      },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{goal.name}</div><div className="grow" /><div className="hib" onClick={() => onEdit?.(goal)} style={{ marginRight: 8 }}><Ico name="pencil" size={18} /></div><div className="hib" onClick={() => setMenu(true)}><Ico name="more" size={20} /></div></div>
        <div className="lbl">Saved</div>
        <Money className="big tnum" v={saved} />
        <div className="sub">{left > 0 ? `${fmt(left)} left · ${Math.round(pct)}% of ${fmt(target)}` : `Reached · ${fmt(target)}`}</div>
      </div>

      <div className="tile" style={{ marginBottom: 14, padding: 14 }}><div className="pbar bar"><i style={{ width: `${pct}%`, background: "linear-gradient(90deg,var(--ac),var(--ac2))" }} /></div></div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-primary" style={{ flex: 1, height: 46, fontSize: 14 }} onClick={() => setSheet("add")}><Ico name="plus" size={17} />Add money</button>
        <button className="btn btn-secondary" style={{ flex: 1, height: 46, fontSize: 14, opacity: saved > 0 ? 1 : .5 }} disabled={saved <= 0} onClick={() => setSheet("return")}><Ico name="back" size={16} />Return to bank</button>
      </div>

      <div className="tile" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, padding: 14, cursor: "pointer" }} onClick={toggleSpending}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="wallet" size={20} /></span>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14 }}>Spending mode</div><div className="caption" style={{ marginTop: 2 }}>Use this goal as a source — appears in Accounts like a vault</div></div>
        <span className={`switch ${spending ? "on" : ""}`}><i /></span>
      </div>

      {perBank.length > 0 && <>
        <div className="over">Frozen across accounts</div>
        {perBank.map(([bid, amt]) => { const b = bankOf(bid); return (
          <div className="icard" key={bid}>
            <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: b?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(b?.name || "?").slice(0, 1).toUpperCase()}</span>
            <div><div className="nm">{b?.name || "Account"}</div><div className="mt">Frozen for this goal</div></div>
            <div className="amtb"><b className="tnum">{fmt(amt)}</b></div>
          </div>
        ); })}
      </>}

      <div className="over" style={{ marginTop: 14 }}>Contributions</div>
      {contributions.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px" }}>No contributions yet.</div>
        : contributions.map((t) => {
          const positive = t.type === "saving";
          const labels = { saving: "Added to goal", goal_withdraw: "Spent from goal", goal_return: "Returned to bank" };
          return (
            <div className="icard" key={t.id}>
              <CatTile cat={positive ? goalCat(goal) : null} color={positive ? goal.color : undefined} name={positive ? goal.name : "↩"} size={44} />
              <div><div className="nm">{labels[t.type] || t.catName}</div><div className="mt">{(bankOf(t.bankId)?.name || "—")} · {t.date ? fmtDate(t.date).split(":")[0] : ""}</div></div>
              <div className="amtb"><b className="tnum" style={{ color: positive ? "var(--success)" : "var(--muted)" }}>{positive ? "+" : "−"}{fmt(t.amount)}</b></div>
            </div>
          );
        })}

      <button className="btn btn-secondary btn-full" style={{ marginTop: 18, marginBottom: 8, height: 48, fontSize: 14.5 }} onClick={archive}><Ico name="check" size={17} />Complete &amp; archive goal</button>

      {menu && <MenuSheet title={goal.name} onClose={() => setMenu(false)} items={[
        { label: "Delete", icon: "trash", danger: true, sub: "Past contributions stay in history", onClick: remove },
      ]} />}

      {sheet === "add" && <AmountSheet title="Add money" sub={`to ${goal.name}`} confirmLabel="Add to goal" banks={banks} onConfirm={addMoney} onClose={() => setSheet(null)} />}
      {sheet === "return" && <AmountSheet title="Return to bank" sub={`from ${goal.name}`} confirmLabel="Return money" max={saved} onConfirm={returnToBank} onClose={() => setSheet(null)} />}
    </div>
  );
}
