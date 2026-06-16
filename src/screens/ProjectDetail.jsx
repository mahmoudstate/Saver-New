// Saver — Project detail (cross-month): ported 1:1 from showcase 42 (long-term tracking).
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, currentMonth, MONTHS, fmtDate } from "../lib/format.js";
import { projectSpent, budgetTxns } from "../lib/calc.js";

const monthsBetween = (start, end) => { if (!start) return 1; const [sy, sm] = start.split("-").map(Number); const [ey, em] = end.split("-").map(Number); return Math.max(1, (ey - sy) * 12 + (em - sm) + 1); };

export default function ProjectDetail({ store, projectId, back }) {
  const { budgets = [], txns = [], banks = [] } = store;
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

  const complete = () => store.setConfirm({
    title: "Mark project complete?", message: `This closes "${project.name}" and moves it to completed projects. Its transactions stay in your history.`,
    color: "var(--acText)", confirmText: "Mark complete", icon: "check",
    onConfirm: () => { store.set("budgets", (list) => list.map((b) => (b.id === projectId ? { ...b, status: "archived" } : b))); store.flash({ title: "Project completed", sub: project.name, color: "var(--success)" }); back(); },
  });

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{project.name}</div><div className="grow" /><div className="hib"><Ico name="note" size={20} /></div></div>
        <div className="lbl">Spent so far</div>
        <div className="big tnum">{fmt(spent)}</div>
        <div className="sub">of {fmt(total)} · {Math.round(pct)}%{range ? ` · ${range}` : ""}</div>
      </div>

      <div className="tile" style={{ marginBottom: 16, padding: 14 }}>
        <div className="pbar bar"><i style={{ width: `${pct}%`, background: "var(--ac)" }} /></div>
        <div className="caption" style={{ marginTop: 9 }}>{fmt(left)} to go · ~{fmt(perMonth)} / month</div>
      </div>

      <div className="over">Spending</div>
      {rows.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px" }}>No spending yet.</div>
        : rows.map((t) => (
          <div className="icard" key={t.id}>
            <CatTile txn={t} size={44} />
            <div><div className="nm">{t.catName || t.note || "Expense"}</div><div className="mt">{bankName(t.bankId)} · {t.date ? fmtDate(t.date).split(":")[0] : ""}</div></div>
            <div className="amtb"><b className="tnum" style={{ color: "var(--red)" }}>−{fmt(t.amount)}</b></div>
          </div>
        ))}

      <div className="cta"><div className="btn btn-primary btn-full" onClick={complete}><Ico name="check" size={18} />Mark project complete</div></div>
    </div>
  );
}
