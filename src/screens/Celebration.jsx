// Saver — Goal reached celebration: ported 1:1 from showcase 33.
import { fmt } from "../lib/format.js";

const DOTS = [
  { w: 10, h: 10, bg: "#fff", top: "14%", left: "18%", rot: 20 },
  { w: 8, h: 14, bg: "#E5544E", top: "20%", right: "16%", rot: -15 },
  { w: 9, h: 9, bg: "#3B82F6", top: "30%", left: "26%", rot: 0 },
  { w: 7, h: 13, bg: "#A78BFA", top: "12%", right: "30%", rot: 30 },
  { w: 8, h: 8, bg: "#FBBF24", top: "34%", right: "24%", rot: 0 },
  { w: 9, h: 9, bg: "#16BFA6", top: "24%", left: "40%", rot: 12 },
];

export default function Celebration({ goal, saved, onArchive, onKeep }) {
  return (
    <div className="content" style={{ padding: 0 }}>
      <div className="celebrate">
        {DOTS.map((d, i) => <span key={i} className="cdot" style={{ width: d.w, height: d.h, background: d.bg, top: d.top, left: d.left, right: d.right, transform: `rotate(${d.rot}deg)`, animationDelay: `${i * 0.25}s` }} />)}
        <div style={{ width: 96, height: 96, borderRadius: 32, background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 36px rgba(0,0,0,.18)", marginBottom: 22, position: "relative", zIndex: 1 }}>
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#0e9f6e" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="m20 6-11 11-5-5" /></svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -.8, position: "relative", zIndex: 1 }}>Goal reached!</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 8, position: "relative", zIndex: 1 }}>{goal} · {fmt(saved)} saved</div>
        <div style={{ fontSize: 13, color: "var(--heroSub)", fontWeight: 600, marginTop: 6, position: "relative", zIndex: 1 }}>Go enjoy it — you earned every penny</div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 30, zIndex: 1 }}>
          <button className="btn btn-full" style={{ background: "#fff", color: "#0c4f3c", marginBottom: 10 }} onClick={onArchive}>Archive &amp; release funds</button>
          <button className="btn btn-full" style={{ background: "rgba(255,255,255,.2)", color: "var(--heroText)" }} onClick={onKeep}>Keep saving</button>
        </div>
      </div>
    </div>
  );
}
