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
  if (view?.type === "account") screen = <AccountLedger store={store} bank={view.bank} back={back} />;
  else if (view?.type === "sub") screen = <SubscriptionDetail store={store} bill={view.bill} back={back} />;
  else if (view?.type === "inst") screen = <InstallmentDetail store={store} instId={view.instId} back={back} />;
  else if (tab === "home") screen = <Home store={store} onTab={setTab} onOpenBank={(bank) => setView({ type: "account", bank })} />;
  else if (tab === "activity") screen = <Activity store={store} onFilter={() => {}} />;
  else if (tab === "bills") screen = <Bills store={store} onAdd={() => {}} onOpenSub={(bill) => setView({ type: "sub", bill })} onOpenInst={(i) => setView({ type: "inst", instId: i.id })} />;
  else if (tab === "profile") screen = <Profile store={store} go={() => {}} />;
  else screen = <Placeholder tab={tab} />;

  return (
    <div className="app">
      {screen}
      {!view && <BottomNav active={tab} onTab={setTab} onAdd={() => {}} />}
      <Overlays store={store} />
    </div>
  );
}
