// Saver — clean app shell (new design). Logic from lib/*, UI rebuilt from the design showcase.
import { useState } from "react";
import { useStore } from "./lib/store.js";
import BottomNav from "./ui/BottomNav.jsx";
import Home from "./screens/Home.jsx";
import Activity from "./screens/Activity.jsx";
import Bills from "./screens/Bills.jsx";
import Profile from "./screens/Profile.jsx";
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

  return (
    <div className="app">
      {tab === "home" ? <Home store={store} onTab={setTab} onOpenBank={() => {}} />
        : tab === "activity" ? <Activity store={store} onFilter={() => {}} />
          : tab === "bills" ? <Bills store={store} onAdd={() => {}} />
          : tab === "profile" ? <Profile store={store} go={() => {}} />
          : <Placeholder tab={tab} />}
      <BottomNav active={tab} onTab={setTab} onAdd={() => {}} />
    </div>
  );
}
