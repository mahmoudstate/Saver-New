// Saver — Goal reached: a clean, friendly celebration (no decision buttons).
// Strong confetti rain + one fun fixed line with the goal's name. Tap anywhere to
// continue back to the goal, where Archive / Keep saving live calmly.
import Ico from "../ui/Ico.jsx";
import ConfettiBurst from "../ui/ConfettiBurst.jsx";
import { fmt } from "../lib/format.js";

export default function Celebration({ goal, saved, onKeep }) {
  return (
    <div className="content" style={{ padding: 0, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", position: "relative" }} onClick={onKeep}>
      <ConfettiBurst count={90} duration={3600} />
      <span className="circ" style={{ width: 92, height: 92, borderRadius: 30, background: "var(--acDim)", color: "var(--acText)", marginBottom: 24, position: "relative", zIndex: 1 }}>
        <Ico name="check" size={44} stroke={2.6} />
      </span>
      <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: -.6, padding: "0 28px", position: "relative", zIndex: 1 }}>Boom — {goal} is in the bag!</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ac)", marginTop: 10, position: "relative", zIndex: 1 }}>{fmt(saved)} saved — every penny home</div>
      <div className="caption" style={{ marginTop: 8, position: "relative", zIndex: 1 }}>Goal smashed. Go you.</div>
      <div className="caption" style={{ position: "absolute", bottom: 34, left: 0, right: 0, opacity: .7 }}>Tap anywhere to continue</div>
    </div>
  );
}
