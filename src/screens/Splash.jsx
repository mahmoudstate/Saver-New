// Saver — Splash: shows on every app open for ~2s, then hands off to the app.
// Logo with a theme-coloured glow, version + maker line, and a loading bar.
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import logo from "../../icon.png";
import { APP_VERSION } from "../lib/format.js";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Splash({ onDone }) {
  const scope = useRef(null);

  useGSAP(() => {
    // proceed to the app after the splash beat, animated or not
    const t = setTimeout(() => onDone?.(), REDUCED ? 700 : 2200);
    if (REDUCED) return () => clearTimeout(t);

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".sp-glow", { opacity: 0, scale: 0.6, duration: 0.7 })
      .from(".sp-logo", { opacity: 0, scale: 0.82, y: 10, duration: 0.7 }, "-=0.45")
      .from(".sp-meta", { opacity: 0, y: 12, duration: 0.5 }, "-=0.3")
      .fromTo(".sp-fill", { scaleX: 0 }, { scaleX: 1, duration: 1.45, ease: "power1.inOut" }, "-=0.55");
    // living details: a soft float on the logo and a breathing glow
    gsap.to(".sp-logo", { y: -5, duration: 1.3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".sp-glow", { opacity: 0.9, scale: 1.08, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 });

    return () => clearTimeout(t);
  }, { scope });

  return (
    <div ref={scope} style={{ position: "fixed", inset: 0, background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999, overflow: "hidden" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="sp-glow" style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--ac) 55%, transparent) 0%, transparent 68%)", filter: "blur(8px)", opacity: 0.7 }} />
        <img className="sp-logo" src={logo} alt="Saver" style={{ position: "relative", width: 104, height: 104, borderRadius: 26, boxShadow: "0 24px 60px -14px var(--ac), 0 8px 22px rgba(0,0,0,.25)" }} />
      </div>

      <div className="sp-meta" style={{ position: "absolute", bottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)", left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div className="sp-fill-track" style={{ width: 132, height: 4, borderRadius: 999, background: "var(--surface2)", overflow: "hidden" }}>
          <i className="sp-fill" style={{ display: "block", height: "100%", borderRadius: 999, background: "var(--ac)", transformOrigin: "left center" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", letterSpacing: ".02em" }}>Saver One v{APP_VERSION}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--faint)", marginTop: 3, letterSpacing: ".04em" }}>Powered by Mahmoud</div>
        </div>
      </div>
    </div>
  );
}
