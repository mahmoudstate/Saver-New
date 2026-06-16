// Saver — Add transaction: ported from showcase 07/08/09 (Expense · Income · Saving).
// Amount via keypad sheet; account/category/goal via picker sheets; commits through the
// LOCKED store.addTxn (balance checks + goal freezing handled there).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt, today } from "../lib/format.js";
import { calcGoalSaved } from "../lib/calc.js";

const catKeyOf = (c) => (c ? resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) : null);

export default function Add({ store, onClose }) {
  const { banks = [], expCats = [], incCats = [], savings = [] } = store;
  const goals = savings.filter((s) => s.status !== "archived");

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState(0);
  const [bankId, setBankId] = useState(banks[0]?.id || null);
  const [srcGoal, setSrcGoal] = useState(null); // expense paid from a goal vault (spending mode)
  const vaults = goals.filter((g) => g.spendingMode);
  const [expCatId, setExpCatId] = useState(expCats[0]?.id || null);
  const [incCatId, setIncCatId] = useState(incCats[0]?.id || null);
  const [goalId, setGoalId] = useState(goals[0]?.id || null);
  const [note, setNote] = useState("");
  const [sheet, setSheet] = useState(null); // amount | account | category | goal

  const meta = {
    expense: { title: "New expense", sign: "−", sub: "Expense · today", accLabel: "Account", cta: "Add transaction", ctaIcon: "check" },
    income: { title: "New income", sign: "+", sub: "Income · today", accLabel: "To account", cta: "Add income", ctaIcon: "check" },
    saving: { title: "Move to goal", sign: "+", sub: "Saving · frozen & safe", accLabel: "From account", cta: "Move to goal", ctaIcon: "lock" },
  }[type];

  const vaultGoal = srcGoal ? goals.find((g) => g.id === srcGoal) : null;
  const bank = banks.find((b) => b.id === bankId);
  const cat = type === "income" ? incCats.find((c) => c.id === incCatId) : expCats.find((c) => c.id === expCatId);
  const goal = goals.find((g) => g.id === goalId);
  const sourceOk = type === "expense" && srcGoal ? true : !!bankId;
  const canSave = amount > 0 && sourceOk && (type === "saving" ? goalId : cat);

  const submit = () => {
    if (!canSave) {
      const why = amount <= 0 ? "Enter an amount first" : !sourceOk ? "Pick an account" : type === "saving" ? "Pick a goal" : "Pick a category";
      store.flash({ title: why, color: "var(--yellow)", icon: "bell" });
      return;
    }
    let txn;
    if (type === "saving") txn = { type: "saving", amount, date: today(), bankId, bankName: bank?.name, goalId, catName: goal?.name, catIcon: "saving", note };
    else if (type === "expense" && srcGoal) txn = { type: "goal_withdraw", amount, date: today(), goalId: srcGoal, goalName: vaultGoal?.name, catId: cat.id, catName: cat.name, catGlyph: cat.glyph, catColor: cat.color, note };
    else txn = { type, amount, date: today(), bankId, bankName: bank?.name, catId: cat.id, catName: cat.name, catGlyph: cat.glyph, catColor: cat.color, note };
    const id = store.addTxn(txn);
    if (id === false) return; // blocked (alert shown by store)
    const label = type === "saving" ? `to ${goal?.name}` : type === "income" ? `to ${bank?.name}` : srcGoal ? `from ${vaultGoal?.name} vault` : `${cat?.name}`;
    store.flash({ title: `${meta.sign}${fmt(amount)} ${type === "income" ? "in" : type === "saving" ? "saved" : "spent"}`, sub: label, color: type === "income" ? "var(--success)" : type === "saving" ? "var(--ac)" : "var(--muted)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{meta.title}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">Amount · {store.currency}</div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>{amount > 0 ? `${meta.sign}${fmt(amount)}` : <span style={{ opacity: .6 }}>{meta.sign}{fmt(0)}</span>}</div>
        <div className="sub">{meta.sub}</div>
      </div>

      <div className="seg" style={{ marginBottom: 16 }}>
        {["expense", "income", "saving"].map((t) => <b key={t} className={type === t ? "on" : ""} onClick={() => setType(t)} style={{ textTransform: "capitalize" }}>{t}</b>)}
      </div>

      <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer" }}>
        {vaultGoal
          ? <CatTile cat="goal" name={vaultGoal.name} size={42} />
          : <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>}
        <div><div className="fl">{vaultGoal ? "From vault" : meta.accLabel}</div><div className="fv">{vaultGoal ? vaultGoal.name : (bank?.name || "Pick an account")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      {type === "saving" ? (
        <div className="field" onClick={() => setSheet("goal")} style={{ cursor: "pointer", marginTop: 12 }}>
          <CatTile cat={goal ? catKeyOf({ name: goal.name, glyph: goal.glyph }) || "goal" : "goal"} name={goal?.name} size={42} />
          <div><div className="fl">To goal</div><div className="fv">{goal?.name || "Pick a goal"}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
        </div>
      ) : (
        <div className="field" onClick={() => setSheet("category")} style={{ cursor: "pointer", marginTop: 12 }}>
          <CatTile cat={catKeyOf(cat)} name={cat?.name} size={42} />
          <div><div className="fl">Category</div><div className="fv">{cat?.name || "Pick a category"}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
        </div>
      )}

      <label className="field note" style={{ marginTop: 12 }}>
        <Ico name="note" size={19} color="var(--faint)" style={{ marginRight: 2 }} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", flex: 1, minWidth: 0 }} />
      </label>

      <div className="cta"><div className={`btn btn-primary btn-full`} onClick={submit}><Ico name={meta.ctaIcon} size={19} />{meta.cta}</div></div>

      {sheet === "amount" && <AmountSheet title="Enter amount" sub={meta.title} confirmLabel="Set amount" onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "account" && <PickerSheet title={meta.accLabel} selectedId={srcGoal ? "vault:" + srcGoal : bankId} onPick={(id) => { if (id.startsWith?.("vault:")) setSrcGoal(id.slice(6)); else { setBankId(id); setSrcGoal(null); } }} onClose={() => setSheet(null)} options={[
        ...banks.map((b) => ({ id: b.id, label: b.name, bankColor: b.color })),
        ...(type === "expense" ? vaults.map((g) => ({ id: "vault:" + g.id, label: g.name, sub: "Goal vault · spend from here", catKey: "goal" })) : []),
      ]} />}
      {sheet === "category" && <PickerSheet title="Category" selectedId={type === "income" ? incCatId : expCatId} onPick={type === "income" ? setIncCatId : setExpCatId} onClose={() => setSheet(null)} options={(type === "income" ? incCats : expCats).map((c) => ({ id: c.id, label: c.name, sub: c.group, catKey: catKeyOf(c) }))} />}
      {sheet === "goal" && <PickerSheet title="To goal" selectedId={goalId} onPick={setGoalId} onClose={() => setSheet(null)} options={goals.map((g) => ({ id: g.id, label: g.name, sub: `${fmt(Math.max(0, calcGoalSaved(g.id, store.txns)))} saved`, catKey: catKeyOf({ name: g.name, glyph: g.glyph }) || "goal" }))} />}
    </div>
  );
}
