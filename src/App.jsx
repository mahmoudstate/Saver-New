// Saver — clean app shell (new design). Logic from lib/*, UI rebuilt from the design showcase.
import { useState } from "react";
import { useStore } from "./lib/store.js";
import BottomNav from "./ui/BottomNav.jsx";
import Overlays from "./ui/Modal.jsx";
import Home from "./screens/Home.jsx";
import Activity from "./screens/Activity.jsx";
import Bills from "./screens/Bills.jsx";
import Profile from "./screens/Profile.jsx";
import AccountLedger from "./screens/AccountLedger.jsx";
import SubscriptionDetail from "./screens/SubscriptionDetail.jsx";
import InstallmentDetail from "./screens/InstallmentDetail.jsx";
import Goals from "./screens/Goals.jsx";
import GoalDetail from "./screens/GoalDetail.jsx";
import Budgets from "./screens/Budgets.jsx";
import BudgetDetail from "./screens/BudgetDetail.jsx";
import ProjectDetail from "./screens/ProjectDetail.jsx";
import Add from "./screens/Add.jsx";
import Transfer from "./screens/Transfer.jsx";
import EditTxn from "./screens/EditTxn.jsx";
import Accounts from "./screens/Accounts.jsx";
import AccountEditor from "./screens/AccountEditor.jsx";
import Ico from "./ui/Ico.jsx";

function Placeholder({ tab }) {
  const titles = { activity: "Activity", bills: "Bills", profile: "Profile" };
  return (
    <div className="content padnav">
      <div className="hero"><div className="toprow"><div className="ttl">{titles[tab]}</div></div><div className="lbl">Coming next</div><div className="big" style={{ fontSize: 26 }}>Rebuilding…</div></div>
      <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px 20px", fontWeight: 600 }}><Ico name="sparkles" size={32} color="var(--ac)" style={{ margin: "0 auto 12px" }} />This screen is being rebuilt in the new design.</div>
    </div>
  );
}

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState("home");
  const [view, setView] = useState(null); // pushed detail screen
  const back = () => setView(null);

  let screen;
  if (view?.type === "add") screen = <Add store={store} onClose={back} />;
  else if (view?.type === "transfer") screen = <Transfer store={store} fromBankId={view.fromBankId} onClose={back} />;
  else if (view?.type === "edit") screen = <EditTxn store={store} txn={view.txn} onClose={back} />;
  else if (view?.type === "accounts") screen = <Accounts store={store} back={back} onOpen={(b) => setView({ type: "account", bank: b })} onAdd={() => setView({ type: "editAccount", account: null })} />;
  else if (view?.type === "editAccount") screen = <AccountEditor store={store} account={view.account} onClose={() => setView(view.account ? { type: "account", bank: view.account } : { type: "accounts" })} />;
  else if (view?.type === "account") screen = <AccountLedger store={store} bank={view.bank} back={back} onMove={(b) => setView({ type: "transfer", fromBankId: b.id })} onEdit={(b) => setView({ type: "editAccount", account: b })} />;
  else if (view?.type === "sub") screen = <SubscriptionDetail store={store} bill={view.bill} back={back} />;
  else if (view?.type === "inst") screen = <InstallmentDetail store={store} instId={view.instId} back={back} />;
  else if (view?.type === "goals") screen = <Goals store={store} back={back} onAdd={() => {}} onOpenGoal={(g) => setView({ type: "goal", goalId: g.id })} />;
  else if (view?.type === "goal") screen = <GoalDetail store={store} goalId={view.goalId} back={() => setView({ type: "goals" })} />;
  else if (view?.type === "budgets") screen = <Budgets store={store} back={back} onAdd={() => {}} onOpenBudget={(b) => setView({ type: "budget", budgetId: b.id })} onOpenProject={(p) => setView({ type: "project", projectId: p.id })} />;
  else if (view?.type === "budget") screen = <BudgetDetail store={store} budgetId={view.budgetId} back={() => setView({ type: "budgets" })} />;
  else if (view?.type === "project") screen = <ProjectDetail store={store} projectId={view.projectId} back={() => setView({ type: "budgets" })} />;
  else if (tab === "home") screen = <Home store={store} onTab={setTab} onOpenBank={(bank) => setView({ type: "account", bank })} onOpenGoals={() => setView({ type: "goals" })} onOpenBudgets={() => setView({ type: "budgets" })} />;
  else if (tab === "activity") screen = <Activity store={store} onFilter={() => {}} onEdit={(t) => setView({ type: "edit", txn: t })} />;
  else if (tab === "bills") screen = <Bills store={store} onAdd={() => {}} onOpenSub={(bill) => setView({ type: "sub", bill })} onOpenInst={(i) => setView({ type: "inst", instId: i.id })} />;
  else if (tab === "profile") screen = <Profile store={store} go={(d) => { if (d === "accounts") setView({ type: "accounts" }); else if (d === "goals") setView({ type: "goals" }); else if (d === "budgets") setView({ type: "budgets" }); }} />;
  else screen = <Placeholder tab={tab} />;

  return (
    <div className="app">
      {screen}
      {!view && <BottomNav active={tab} onTab={setTab} onAdd={() => setView({ type: "add" })} />}
      <Overlays store={store} />
    </div>
  );
}
