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
import GoalEditor from "./screens/GoalEditor.jsx";
import BudgetEditor from "./screens/BudgetEditor.jsx";
import Categories from "./screens/Categories.jsx";
import CategoryEditor from "./screens/CategoryEditor.jsx";
import SmartFilter from "./screens/SmartFilter.jsx";
import FilterResults from "./screens/FilterResults.jsx";
import Appearance from "./screens/Appearance.jsx";
import PrivacyBackup from "./screens/PrivacyBackup.jsx";
import Manual from "./screens/Manual.jsx";
import QuickActions from "./screens/QuickActions.jsx";
import QuickActionEditor from "./screens/QuickActionEditor.jsx";
import QuickAddSheet from "./ui/QuickAddSheet.jsx";
import SubscriptionEditor from "./screens/SubscriptionEditor.jsx";
import InstallmentEditor from "./screens/InstallmentEditor.jsx";
import Notifications from "./screens/Notifications.jsx";
import CustomizeDashboard from "./screens/CustomizeDashboard.jsx";
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
  const [quickAdd, setQuickAdd] = useState(false);
  const back = () => setView(null);

  let screen;
  if (view?.type === "add") screen = <Add store={store} onClose={back} />;
  else if (view?.type === "transfer") screen = <Transfer store={store} fromBankId={view.fromBankId} onClose={back} />;
  else if (view?.type === "edit") screen = <EditTxn store={store} txn={view.txn} onClose={back} />;
  else if (view?.type === "accounts") screen = <Accounts store={store} back={back} onOpen={(b) => setView({ type: "account", bank: b })} onAdd={() => setView({ type: "editAccount", account: null })} />;
  else if (view?.type === "editAccount") screen = <AccountEditor store={store} account={view.account} onClose={() => setView(view.account ? { type: "account", bank: view.account } : { type: "accounts" })} />;
  else if (view?.type === "categories") screen = <Categories store={store} back={back} onAdd={() => setView({ type: "editCategory", category: null })} onEdit={(c) => setView({ type: "editCategory", category: c })} />;
  else if (view?.type === "editCategory") screen = <CategoryEditor store={store} category={view.category} onClose={() => setView({ type: "categories" })} />;
  else if (view?.type === "appearance") screen = <Appearance store={store} back={back} />;
  else if (view?.type === "privacy") screen = <PrivacyBackup store={store} back={back} />;
  else if (view?.type === "manual") screen = <Manual store={store} back={back} />;
  else if (view?.type === "notifications") screen = <Notifications store={store} back={back} />;
  else if (view?.type === "customize") screen = <CustomizeDashboard store={store} back={back} />;
  else if (view?.type === "quickactions") screen = <QuickActions store={store} back={back} onEdit={(q) => setView({ type: "editQuick", action: q })} />;
  else if (view?.type === "editQuick") screen = <QuickActionEditor store={store} action={view.action} onClose={() => setView({ type: "quickactions" })} />;
  else if (view?.type === "account") screen = <AccountLedger store={store} bank={view.bank} back={back} onMove={(b) => setView({ type: "transfer", fromBankId: b.id })} onEdit={(b) => setView({ type: "editAccount", account: b })} />;
  else if (view?.type === "sub") screen = <SubscriptionDetail store={store} bill={view.bill} back={back} onEdit={(b) => setView({ type: "editSub", bill: b })} />;
  else if (view?.type === "editSub") screen = <SubscriptionEditor store={store} bill={view.bill} onClose={back} />;
  else if (view?.type === "editInst") screen = <InstallmentEditor store={store} plan={view.plan} onClose={back} />;
  else if (view?.type === "inst") screen = <InstallmentDetail store={store} instId={view.instId} back={back} />;
  else if (view?.type === "goals") screen = <Goals store={store} back={back} onAdd={() => setView({ type: "editGoal", goal: null })} onOpenGoal={(g) => setView({ type: "goal", goalId: g.id })} />;
  else if (view?.type === "goal") screen = <GoalDetail store={store} goalId={view.goalId} back={() => setView({ type: "goals" })} />;
  else if (view?.type === "editGoal") screen = <GoalEditor store={store} goal={view.goal} onClose={() => setView({ type: "goals" })} />;
  else if (view?.type === "budgets") screen = <Budgets store={store} back={back} onAdd={() => setView({ type: "editBudget", budget: null })} onOpenBudget={(b) => setView({ type: "budget", budgetId: b.id })} onOpenProject={(p) => setView({ type: "project", projectId: p.id })} />;
  else if (view?.type === "editBudget") screen = <BudgetEditor store={store} budget={view.budget} onClose={() => setView({ type: "budgets" })} />;
  else if (view?.type === "budget") screen = <BudgetDetail store={store} budgetId={view.budgetId} back={() => setView({ type: "budgets" })} />;
  else if (view?.type === "project") screen = <ProjectDetail store={store} projectId={view.projectId} back={() => setView({ type: "budgets" })} />;
  else if (tab === "home") screen = <Home store={store} onTab={setTab} onOpenBank={(bank) => setView({ type: "account", bank })} onOpenGoals={() => setView({ type: "goals" })} onOpenBudgets={() => setView({ type: "budgets" })} onOpenNotifications={() => setView({ type: "notifications" })} />;
  else if (view?.type === "filter") screen = <SmartFilter store={store} initial={view.filter} back={back} onApply={(f) => setView({ type: "results", filter: f })} />;
  else if (view?.type === "results") screen = <FilterResults store={store} filter={view.filter} back={() => setView(null)} onEditFilter={() => setView({ type: "filter", filter: view.filter })} onEdit={(t) => setView({ type: "edit", txn: t })} />;
  else if (tab === "activity") screen = <Activity store={store} onFilter={() => setView({ type: "filter" })} onEdit={(t) => setView({ type: "edit", txn: t })} />;
  else if (tab === "bills") screen = <Bills store={store} onAdd={(seg) => setView(seg === "inst" ? { type: "editInst", plan: null } : { type: "editSub", bill: null })} onOpenSub={(bill) => setView({ type: "sub", bill })} onOpenInst={(i) => setView({ type: "inst", instId: i.id })} />;
  else if (tab === "profile") screen = <Profile store={store} go={(d) => { if (d === "accounts") setView({ type: "accounts" }); else if (d === "goals") setView({ type: "goals" }); else if (d === "budgets") setView({ type: "budgets" }); else if (d === "categories") setView({ type: "categories" }); else if (d === "appearance") setView({ type: "appearance" }); else if (d === "privacy") setView({ type: "privacy" }); else if (d === "manual") setView({ type: "manual" }); else if (d === "quickactions") setView({ type: "quickactions" }); else if (d === "customize") setView({ type: "customize" }); }} />;
  else screen = <Placeholder tab={tab} />;

  return (
    <div className="app">
      {screen}
      {!view && <BottomNav active={tab} onTab={setTab} onAdd={() => setView({ type: "add" })} onQuickAdd={() => setQuickAdd(true)} />}
      {quickAdd && <QuickAddSheet store={store} onClose={() => setQuickAdd(false)} onSetup={() => { setQuickAdd(false); setView({ type: "quickactions" }); }} />}
      <Overlays store={store} />
    </div>
  );
}
