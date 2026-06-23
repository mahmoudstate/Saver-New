// Saver — Onboarding / Welcome (first run): new design + GSAP entrance.
// What you can do + how to add Saver to the home screen, then Get started.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Ico from "../ui/Ico.jsx";
import InstallSteps from "../ui/InstallSteps.jsx";
import iconUrl from "../../icon.png";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const ROWS = [
  { icon: "eye", color: "var(--blue)", nm: "Know what's safe to spend", mt: "Your real spendable number, right on the home screen." },
  { icon: "target", color: "var(--ac)", nm: "Reach your goals", mt: "Save a little at a time and watch it grow." },
  { icon: "shield", color: "var(--orange)", nm: "Private and offline", mt: "Everything stays on your phone." },
];

const Title = ({ children }) => <div className="gsap-title" style={{ fontSize: 18, fontWeight: 800, letterSpacing: -.3, marginTop: 28, marginBottom: 14 }}>{children}</div>;

// Trust badges — same look as About.jsx, surfaced at first run (privacy-first).
const TRUST = [
  { icon: "lock", label: "On your phone" },
  { icon: "close", label: "No ads" },
  { icon: "eyeOff", label: "No tracking" },
];
const Badge = ({ icon, label }) => (
  <div className="gsap-step" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "16px 8px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16 }}>
    <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={19} /></span>
    <div style={{ fontSize: 12, fontWeight: 800, textAlign: "center" }}>{label}</div>
  </div>
);

export default function Onboarding({ onDone }) {
  const scope = useRef(null);

  useGSAP(() => {
    if (REDUCED) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".gsap-hero", { opacity: 0, y: 24, duration: 0.7 })
      .from(".gsap-card", { opacity: 0, y: 24, duration: 0.6, stagger: 0.12 }, "-=0.3")
      .from(".gsap-title", { opacity: 0, y: 16, duration: 0.5, stagger: 0.2 }, "-=0.2")
      .from(".gsap-step", { opacity: 0, x: -18, duration: 0.5, stagger: 0.12 }, "-=0.2")
      .from(".gsap-cta", { opacity: 0, y: 16, duration: 0.5 }, "-=0.15");
  }, { scope });

  return (
    <div ref={scope} className="content" style={{ paddingBottom: 110 }}>
      <div className="hero" style={{ paddingBottom: 34 }}>
        <div className="gsap-hero" style={{ position: "relative", zIndex: 1, textAlign: "center", paddingTop: 6 }}>
          <img src={iconUrl} alt="Saver" style={{ width: 80, height: 80, borderRadius: 22, boxShadow: "0 16px 34px rgba(0,0,0,.28)" }} />
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1, marginTop: 18 }}>Welcome to Saver</div>
          <div style={{ fontSize: 14, color: "var(--heroSub)", fontWeight: 700, marginTop: 8 }}>Spend clearly and save calmly</div>
        </div>
      </div>

      <Title>What you can do</Title>
      {ROWS.map((r, i) => (
        <div className="icard gsap-card" key={i} style={{ alignItems: "flex-start", gap: 12 }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in srgb, ${r.color} 16%, transparent)`, color: r.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name={r.icon} size={20} /></span>
          <div><div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: -.2 }}>{r.nm}</div><div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{r.mt}</div></div>
        </div>
      ))}

      <Title>Private by design</Title>
      <div style={{ display: "flex", gap: 10 }}>
        {TRUST.map((b) => <Badge key={b.label} icon={b.icon} label={b.label} />)}
      </div>

      <Title>Add Saver to your home screen</Title>
      <InstallSteps />

      <div className="cta"><div className="btn btn-primary btn-full gsap-cta" onClick={onDone}>Get started</div></div>
    </div>
  );
}
