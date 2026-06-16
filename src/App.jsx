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
import Onboarding from "./screens/Onboarding.jsx";
import Celebration from "./screens/Celebration.jsx";
import WhatsNew from "./ui/WhatsNew.jsx";
import AllAccounts from "./screens/AllAccounts.jsx";
import Breakdown from "./screens/Breakdown.jsx";
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
  // Navigation stack of pushed detail screens; the top one renders as an overlay.
  // A real stack (not a single slot) so Back always returns to the previous screen.
  const [stack, setStack] = useState([]);
  const view = stack[stack.length - 1] || null;
  const [tabKey, setTabKey] = useState(0); // bump to force-remount the current tab (nav re-tap → fresh from top)
  const [billsSeg, setBillsSeg] = useState(null); // initial Bills segment when arriving from a Home shortcut
  const [quickAdd, setQuickAdd] = useState(false);
  const [whatsNew, setWhatsNew] = useState(false);
  const push = (v) => setStack((s) => [...s, v]);          // open a deeper screen
  // NOTE: back is wired straight to onClick/onClose in screens, so it must take NO
  // numeric arg (the click event would land there). Use popN for multi-level pops.
  const back = () => setStack((s) => s.slice(0, -1));       // pop back to the previous screen
  const popN = (n) => setStack((s) => s.slice(0, -n));      // pop several at once
  const replace = (v) => setStack((s) => [...s.slice(0, -1), v]); // swap the top (sideways nav)
  // Bottom-nav tap: clear the stack and land on a fresh tab (re-tapping Home resets it to the top).
  const navTab = (t) => { setBillsSeg(null); setStack([]); setTab(t); setTabKey((k) => k + 1); };
  // Switch tab from inside a screen (e.g. Home's Bills card) without forcing a reset.
  const openTab = (t) => { setBillsSeg(null); setStack([]); setTab(t); };

  if (!store.seenWelcome) return <div className="app"><Onboarding onDone={() => { store.set("seenWelcome", true); setWhatsNew(true); }} /></div>;

  // The underlying tab — stays mounted under any pushed view so returning restores scroll/state.
  let tabScreen;
  if (tab === "home") tabScreen = <Home store={store} onTab={openTab} onOpenBank={(bank) => push({ type: "account", bank })} onOpenGoals={() => push({ type: "goals" })} onOpenBudgets={() => push({ type: "budgets" })} onOpenProjects={() => push({ type: "budgets", seg: "projects" })} onOpenInstallments={() => { setBillsSeg("inst"); setTab("bills"); }} onOpenNotifications={() => push({ type: "notifications" })} onOpenAllAccounts={() => push({ type: "allAccounts" })} onOpenBreakdown={() => push({ type: "breakdown" })} onCustomize={() => push({ type: "customize" })} />;
  else if (tab === "activity") tabScreen = <Activity store={store} onFilter={() => push({ type: "filter" })} onEdit={(t) => push({ type: "edit", txn: t })} onAdd={() => push({ type: "add" })} />;
  else if (tab === "bills") tabScreen = <Bills store={store} initialSeg={billsSeg} onAdd={(seg) => push(seg === "inst" ? { type: "editInst", plan: null } : { type: "editSub", bill: null })} onOpenSub={(bill) => push({ type: "sub", bill })} onOpenInst={(i) => push({ type: "inst", instId: i.id })} />;
  else if (tab === "profile") tabScreen = <Profile store={store} go={(d) => { if (d === "accounts") push({ type: "accounts" }); else if (d === "goals") push({ type: "goals" }); else if (d === "budgets") push({ type: "budgets" }); else if (d === "categories") push({ type: "categories" }); else if (d === "appearance") push({ type: "appearance" }); else if (d === "privacy") push({ type: "privacy" }); else if (d === "manual") push({ type: "manual" }); else if (d === "quickactions") push({ type: "quickactions" }); else if (d === "customize") push({ type: "customize" }); else if (d === "whatsnew") setWhatsNew(true); }} />;
  else tabScreen = <Placeholder tab={tab} />;

  // The pushed detail screen (overlay) — top of the stack. back() pops to the previous one.
  let viewScreen = null;
  if (view?.type === "add") viewScreen = <Add store={store} onClose={back} />;
  else if (view?.type === "transfer") viewScreen = <Transfer store={store} fromBankId={view.fromBankId} onClose={back} />;
  else if (view?.type === "edit") viewScreen = <EditTxn store={store} txn={view.txn} onClose={back} />;
  else if (view?.type === "accounts") viewScreen = <Accounts store={store} back={back} onOpen={(b) => push({ type: "account", bank: b })} onAdd={() => push({ type: "editAccount", account: null })} />;
  else if (view?.type === "editAccount") viewScreen = <AccountEditor store={store} account={view.account} onClose={back} onDeleted={() => popN(2)} />;
  else if (view?.type === "categories") viewScreen = <Categories store={store} back={back} onAdd={() => push({ type: "editCategory", category: null })} onEdit={(c) => push({ type: "editCategory", category: c })} />;
  else if (view?.type === "editCategory") viewScreen = <CategoryEditor store={store} category={view.category} onClose={back} />;
  else if (view?.type === "appearance") viewScreen = <Appearance store={store} back={back} />;
  else if (view?.type === "privacy") viewScreen = <PrivacyBackup store={store} back={back} />;
  else if (view?.type === "manual") viewScreen = <Manual store={store} back={back} />;
  else if (view?.type === "notifications") viewScreen = <Notifications store={store} back={back} />;
  else if (view?.type === "customize") viewScreen = <CustomizeDashboard store={store} back={back} />;
  else if (view?.type === "celebrate") viewScreen = <Celebration goal={view.goal} saved={view.saved} onKeep={() => back()} onArchive={() => { if (view.saved > 0) store.addTxn({ type: "goal_return", amount: view.saved, date: new Date().toISOString().slice(0, 10), bankId: store.banks[0]?.id, goalId: view.goalId, goalName: view.goal, catName: "Goal archived", catIcon: "saving" }); store.set("savings", (l) => l.map((s) => (s.id === view.goalId ? { ...s, status: "archived", spendingMode: false } : s))); popN(2); }} />;
  else if (view?.type === "quickactions") viewScreen = <QuickActions store={store} back={back} onEdit={(q) => push({ type: "editQuick", action: q })} />;
  else if (view?.type === "editQuick") viewScreen = <QuickActionEditor store={store} action={view.action} onClose={back} />;
  else if (view?.type === "account") viewScreen = <AccountLedger store={store} bank={view.bank} back={back} onMove={(b) => push({ type: "transfer", fromBankId: b.id })} onEdit={(b) => push({ type: "editAccount", account: b })} />;
  else if (view?.type === "sub") viewScreen = <SubscriptionDetail store={store} bill={view.bill} back={back} onEdit={(b) => push({ type: "editSub", bill: b })} />;
  else if (view?.type === "editSub") viewScreen = <SubscriptionEditor store={store} bill={view.bill} onClose={back} />;
  else if (view?.type === "editInst") viewScreen = <InstallmentEditor store={store} plan={view.plan} onClose={back} />;
  else if (view?.type === "inst") viewScreen = <InstallmentDetail store={store} instId={view.instId} back={back} />;
  else if (view?.type === "goals") viewScreen = <Goals store={store} back={back} onAdd={() => push({ type: "editGoal", goal: null })} onOpenGoal={(g) => push({ type: "goal", goalId: g.id })} />;
  else if (view?.type === "goal") viewScreen = <GoalDetail store={store} goalId={view.goalId} back={back} onReached={(g, saved) => push({ type: "celebrate", goalId: g.id, goal: g.name, saved })} />;
  else if (view?.type === "editGoal") viewScreen = <GoalEditor store={store} goal={view.goal} onClose={back} />;
  else if (view?.type === "budgets") viewScreen = <Budgets store={store} initialSeg={view.seg} back={back} onAdd={() => push({ type: "editBudget", budget: null })} onOpenBudget={(b) => push({ type: "budget", budgetId: b.id })} onOpenProject={(p) => push({ type: "project", projectId: p.id })} />;
  else if (view?.type === "editBudget") viewScreen = <BudgetEditor store={store} budget={view.budget} onClose={back} />;
  else if (view?.type === "budget") viewScreen = <BudgetDetail store={store} budgetId={view.budgetId} back={back} />;
  else if (view?.type === "project") viewScreen = <ProjectDetail store={store} projectId={view.projectId} back={back} />;
  else if (view?.type === "allAccounts") viewScreen = <AllAccounts store={store} back={back} onOpenBank={(b) => push({ type: "account", bank: b })} onAdd={() => push({ type: "editAccount", account: null })} />;
  else if (view?.type === "breakdown") viewScreen = <Breakdown store={store} back={back} onFilter={() => push({ type: "filter" })} />;
  else if (view?.type === "filter") viewScreen = <SmartFilter store={store} initial={view.filter} back={back} onApply={(f) => replace({ type: "results", filter: f })} />;
  else if (view?.type === "results") viewScreen = <FilterResults store={store} filter={view.filter} back={back} onEditFilter={() => replace({ type: "filter", filter: view.filter })} onEdit={(t) => push({ type: "edit", txn: t })} />;

  return (
    <div className="app">
      <div key={tab + tabKey} className="tabhost">{tabScreen}</div>
      {viewScreen && <div className="pushview">{viewScreen}</div>}
      {!view && <BottomNav active={tab} onTab={navTab} onAdd={() => setView({ type: "add" })} onQuickAdd={() => setQuickAdd(true)} />}
      {quickAdd && <QuickAddSheet store={store} onClose={() => setQuickAdd(false)} onSetup={() => { setQuickAdd(false); setView({ type: "quickactions" }); }} />}
      {whatsNew && <WhatsNew onClose={() => setWhatsNew(false)} />}
      <Overlays store={store} />
    </div>
  );
}
