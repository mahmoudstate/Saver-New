// Saver — Project detail (cross-month): ported 1:1 from showcase 42 (long-term tracking).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import Money from "../ui/Money.jsx";
import { fmt, currentMonth, MONTHS } from "../lib/format.js";
import { projectSpent, budgetTxns } from "../lib/calc.js";

const rowDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";

const monthsBetween = (start, end) => { if (!start) return 1; const [sy, sm] = start.split("-").map(Number); const [ey, em] = end.split("-").map(Number); return Math.max(1, (ey - sy) * 12 + (em - sm) + 1); };

export default function ProjectDetail({ store, projectId, back, onEdit, onEditTxn }) {
  const { budgets = [], txns = [], banks = [] } = store;
  const [menu, setMenu] = useState(false);
  const project = budgets.find((b) => b.id === projectId);
  if (!project) return null;
  const cm = currentMonth();
  const spent = projectSpent(project, txns);
  const total = project.amount || 0;
  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;
  const left = Math.max(0, total - spent);
  const months = monthsBetween(project.startMonth, cm);
  const perMonth = Math.round(spent / months);
  const range = project.startMonth ? `${MONTHS[+project.startMonth.split("-")[1] - 1]}–${MONTHS[+cm.split("-")[1] - 1]}` : "";
  const rows = budgetTxns(project, txns).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "—";

  const archived = project.status === "archived";
  const complete = () => store.setConfirm({
    title: "Mark project complete?", message: `This closes "${project.name}" and moves it to completed projects. Its transactions stay in your history.`,
    color: "var(--acText)", confirmText: "Mark complete", icon: "check",
    onConfirm: () => { store.set("budgets", (list) => list.map((b) => (b.id === projectId ? { ...b, status: "archived" } : b))); store.flash({ title: "Project completed", sub: project.name, color: "var(--success)" }); back(); },
  });
  const reopen = () => { store.set("budgets", (list) => list.map((b) => (b.id === projectId ? { ...b, status: undefined } : b))); store.flash({ title: "Project reopened", sub: project.name, color: "var(--success)", icon: "check" }); };
  const remove = () => store.setConfirm({
    title: `Delete "${project.name}"?`, message: "This removes the project tracker. The expenses in these categories stay recorded in your history.",
    danger: true, confirmText: "Delete project", icon: "trash",
    onConfirm: () => { store.set("budgets", (list) => list.filter((b) => b.id !== projectId)); store.flash({ title: "Project deleted", sub: project.name, color: "var(--muted)" }); back(); },
  });

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{project.name}</div><div className="grow" /><div className="hib" onClick={() => onEdit?.(project)} style={{ marginRight: 8 }}><Ico name="pencil" size={18} /></div><div className="hib" onClick={() => setMenu(true)}><Ico name="more" size={20} /></div></div>
        <div className="lbl">Spent so far</div>
        <Money className="big tnum" v={spent} />
        <div className="sub">of {fmt(total)} · {Math.round(pct)}%{range ? ` · ${range}` : ""}</div>
      </div>

      <div className="tile" style={{ marginBottom: 16, padding: 14 }}>
        <div className="pbar bar"><i style={{ width: `${pct}%`, background: "var(--ac)" }} /></div>
        <div className="caption" style={{ marginTop: 9 }}>{fmt(left)} to go · ~{fmt(perMonth)} / month</div>
      </div>

      <div className="over">Spending</div>
      {rows.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px" }}>No spending yet.</div>
        : rows.map((t) => (
          <div className="icard" key={t.id} onClick={onEditTxn ? () => onEditTxn(t) : undefined} style={onEditTxn ? { cursor: "pointer" } : undefined}>
            <CatTile txn={t} size={44} />
            <div><div className="nm">{t.catName || t.note || "Expense"}</div><div className="mt">{bankName(t.bankId)} · {rowDate(t.date)}</div></div>
            <div className="amtb"><b className="tnum" style={{ color: "var(--red)" }}>−{fmt(t.amount)}</b></div>
          </div>
        ))}

      <div className="cta">
        {archived
          ? <div className="btn btn-secondary btn-full" onClick={reopen}><Ico name="check" size={17} />Reopen project</div>
          : <div className="btn btn-primary btn-full" onClick={complete}><Ico name="check" size={18} />Mark project complete</div>}
      </div>

      {menu && <MenuSheet title={project.name} onClose={() => setMenu(false)} items={[
        ...(archived ? [{ label: "Reopen", icon: "check", sub: "Move back to active", onClick: reopen }] : []),
        { label: "Delete", icon: "trash", danger: true, sub: "Expenses stay in your history", onClick: remove },
      ]} />}
    </div>
  );
}
