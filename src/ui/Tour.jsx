// Saver — interactive coach-mark tour. Spotlights real on-screen elements one by
// one with a moving cutout + a tooltip. Targets are CSS selectors on the live UI,
// so the highlight lands on the actual app, not a picture. Theme-aware via vars.
import { useState, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import Ico from "./Ico.jsx";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Tour({ steps = [], onClose, onNavigate }) {
  const [i, setI] = useState(0);
  const holeRef = useRef(null);
  const tipRef = useRef(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  useLayoutEffect(() => {
    const place = () => {
      const el = document.querySelector(step.selector);
      if (!el) { last ? onClose?.() : setI((n) => n + 1); return; }
      const r = el.getBoundingClientRect();
      const pad = step.pad ?? 8;
      const box = { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 };
      const move = { left: box.x, top: box.y, width: box.w, height: box.h };
      if (REDUCED) gsap.set(holeRef.current, move);
      else gsap.to(holeRef.current, { ...move, duration: 0.5, ease: "power3.inOut" });
      // place the tooltip below the target, or above if there is no room
      const below = box.y + box.h + 180 < window.innerHeight;
      gsap.set(tipRef.current, { top: below ? box.y + box.h + 14 : "auto", bottom: below ? "auto" : window.innerHeight - box.y + 14 });
      if (!REDUCED) gsap.fromTo(tipRef.current, { opacity: 0, y: below ? 10 : -10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.12, ease: "power3.out" });
    };
    // a step may switch tab/screen first, then we measure once it has rendered
    if (step.goto) { onNavigate?.(step.goto); const t = setTimeout(place, step.gotoDelay ?? 340); return () => clearTimeout(t); }
    place();
  }, [i]); // eslint-disable-line

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000 }}>
      {/* click-blocker so the app underneath is not tappable mid-tour */}
      <div style={{ position: "absolute", inset: 0 }} />
      {/* the moving spotlight: its huge box-shadow darkens everything else */}
      <div ref={holeRef} style={{ position: "fixed", borderRadius: 18, boxShadow: "0 0 0 9999px rgba(8,10,14,.66)", border: "2px solid var(--ac)", pointerEvents: "none" }} />

      <div ref={tipRef} style={{ position: "fixed", left: 16, right: 16, background: "var(--card)", borderRadius: 20, padding: 18, boxShadow: "0 20px 50px rgba(0,0,0,.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={step.icon || "sparkles"} size={17} /></span>
          <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -.2 }}>{step.title}</div>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--muted)", fontWeight: 600 }}>{step.text}</div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 16, gap: 10 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {steps.map((_, n) => <span key={n} style={{ width: n === i ? 16 : 6, height: 6, borderRadius: 3, background: n === i ? "var(--ac)" : "var(--line)", transition: "width .2s" }} />)}
          </div>
          <div style={{ flex: 1 }} />
          <div onClick={onClose} style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", cursor: "pointer", padding: "8px 6px" }}>Skip</div>
          <div className="btn btn-primary" style={{ padding: "10px 18px", height: "auto" }} onClick={() => (last ? onClose?.() : setI((n) => n + 1))}>{last ? "Done" : "Next"}</div>
        </div>
      </div>
    </div>
  );
}

// A full walk across the app for a first-time user. Each step can switch tab
// first (goto), then spotlight a live element on that screen.
export const APP_TOUR = [
  { goto: { tab: "home" }, selector: ".tabhost .hero", icon: "wallet", pad: 4, title: "Your money at a glance", text: "The top shows your balance and what is safe to spend after the money you set aside. Swipe it to switch between them." },
  { selector: ".tabhost .hero .hib", icon: "eye", pad: 6, title: "Hide your numbers", text: "Tap the eye and every amount turns into dots. Tap again to bring them back." },
  { selector: ".tabhost .bankcard", icon: "wallet", pad: 6, title: "Your accounts", text: "Each account is a card with its balance. Tap one to open it or move money between them." },
  { selector: ".tabhost .tile", icon: "target", pad: 6, title: "This month so far", text: "Your income and spending for the month. Tap it for the full breakdown by category." },
  { selector: '[aria-label="Add"]', icon: "plus", pad: 10, title: "Add anything", text: "The plus is where you record money in, money out, and savings. That is the whole loop." },
  { goto: { tab: "bills" }, selector: ".tabhost .segx", icon: "bills", pad: 6, title: "Bills and installments", text: "Keep every subscription and installment here. Saver reminds you before each one is due." },
  { goto: { tab: "activity" }, selector: '.tabhost [aria-label="filter"]', icon: "funnel", pad: 8, title: "Find anything", text: "Activity lists every transaction. Search, pick a date, or use the filter to narrow it down." },
  { goto: { tab: "profile" }, selector: ".tabhost .icard", icon: "layers", pad: 6, title: "All your tools", text: "Accounts, categories, goals, budgets, privacy and more all live under Profile." },
  { selector: '[aria-label="profile"]', icon: "book", pad: 10, title: "You are all set", text: "Come back to Profile anytime for the full Guide, where you can replay this tour whenever you like." },
];
