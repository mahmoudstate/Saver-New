// Saver — Manual / Guide. DEFERRED: page scaffold only, content to be added later.
import Ico from "../ui/Ico.jsx";

export default function Manual({ store, back }) {
  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Guide</div><div className="grow" /></div>
        <div className="lbl">Manual</div><div className="big" style={{ fontSize: 30 }}>How Saver works</div><div className="sub">Coming soon</div>
      </div>
      {/* TODO: Manual / Guide content — deferred, build with the latest content later. */}
    </div>
  );
}
