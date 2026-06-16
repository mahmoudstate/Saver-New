// Saver — Onboarding / Welcome: ported 1:1 from showcase 27.
import Ico from "../ui/Ico.jsx";
import iconUrl from "../../icon.png";

const ROWS = [
  { icon: "wallet", bg: "var(--acDim)", color: "var(--acText)", nm: "See everything at a glance", mt: "Switch between Total and Safe to spend" },
  { icon: "target", bg: "var(--yellowDim)", color: "var(--yellow)", nm: "Reach your goals", mt: "Freeze money — or spend from a goal vault" },
  { icon: "shield", bg: "var(--blueDim)", color: "var(--blue)", nm: "Private & offline", mt: "Your data never leaves the device" },
];

export default function Onboarding({ onDone }) {
  return (
    <div className="content" style={{ paddingBottom: 96 }}>
      <div className="hero" style={{ paddingBottom: 34 }}>
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", paddingTop: 6 }}>
          <img src={iconUrl} alt="" style={{ width: 72, height: 72, borderRadius: 20, boxShadow: "0 12px 28px rgba(0,0,0,.25)" }} />
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, marginTop: 18 }}>Welcome to Saver</div>
          <div style={{ fontSize: 14, color: "var(--heroSub)", fontWeight: 600, marginTop: 8 }}>Clear money, calmly. All on your phone.</div>
        </div>
      </div>
      {ROWS.map((r, i) => (
        <div className="icard" key={i}>
          <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: r.bg, color: r.color }}><Ico name={r.icon} size={20} /></span>
          <div><div className="nm">{r.nm}</div><div className="mt">{r.mt}</div></div>
        </div>
      ))}
      <div className="cta"><div className="btn btn-primary btn-full" onClick={onDone}>Get started</div></div>
    </div>
  );
}
