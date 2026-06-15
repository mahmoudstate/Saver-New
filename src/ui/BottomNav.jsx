// Saver — new bottom nav: Home · Activity · [+] · Bills · Profile (squircle FAB)
import Ico from "./Ico.jsx";

const TABS = [
  { id: "home", icon: "home" },
  { id: "activity", icon: "activity" },
  { id: "bills", icon: "bills" },
  { id: "profile", icon: "you" },
];

export default function BottomNav({ active, onTab, onAdd }) {
  const out = [];
  TABS.forEach((t, i) => {
    if (i === 2) out.push(<div key="fab" className="fab" onClick={onAdd} role="button" aria-label="Add"><Ico name="plus" size={24} stroke={2.4} /></div>);
    out.push(<div key={t.id} className={`it ${active === t.id ? "on" : ""}`} onClick={() => onTab(t.id)} role="button" aria-label={t.id}><Ico name={t.icon} size={22} /></div>);
  });
  return <div className="nav">{out}</div>;
}
