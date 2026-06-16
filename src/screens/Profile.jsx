// Saver — Profile/Settings: ported 1:1 from showcase 23. Wired to store.
import Ico from "../ui/Ico.jsx";
import { APP_VERSION } from "../lib/format.js";

function Row({ icon, bg, color, label, value, onClick }) {
  return (
    <div className="icard" onClick={onClick} style={{ cursor: "pointer" }}>
      <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={19} /></span>
      <div className="nm">{label}</div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, color: "var(--faint)" }}>
        {value != null && <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}>{value}</span>}
        <Ico name="chev" size={18} />
      </div>
    </div>
  );
}

export default function Profile({ store, go }) {
  const { username, banks = [], theme } = store;
  const initial = (username || "Y").slice(0, 1).toUpperCase();
  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">Profile</div><div className="grow" /><div className="hib"><Ico name="search" size={20} /></div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,.28)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 21, color: "var(--heroText)" }}>{initial}</div>
          <div><div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -.3 }}>{username || "Your name"}</div><div style={{ fontSize: 12.5, color: "var(--heroSub)", fontWeight: 600 }}>Free plan · Saver One</div></div>
        </div>
      </div>

      <div className="over">Your money</div>
      <Row icon="wallet" bg="var(--blueDim)" color="var(--blue)" label="Accounts" value={banks.length} onClick={() => go?.("accounts")} />
      <Row icon="layers" bg="var(--purpleDim)" color="var(--purple)" label="Categories & groups" onClick={() => go?.("categories")} />
      <Row icon="zap" bg="var(--yellowDim)" color="var(--yellow)" label="Quick actions" onClick={() => go?.("quickactions")} />
      <Row icon="grip" bg="var(--surface2)" color="var(--muted)" label="Customize home" onClick={() => go?.("customize")} />

      <div className="over">App</div>
      <Row icon="palette" bg="var(--acDim)" color="var(--ac)" label="Appearance" value={`Mint · ${theme === "dark" ? "Dark" : "Light"}`} onClick={() => go?.("appearance")} />
      <Row icon="shield" bg="var(--blueDim)" color="var(--blue)" label="Privacy & backup" onClick={() => go?.("privacy")} />
      <Row icon="note" bg="var(--surface2)" color="var(--muted)" label="Guide" onClick={() => go?.("manual")} />

      <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", marginTop: 22 }}>Saver One V{APP_VERSION} · Offline & private · Powered by Mahmoud</div>
    </div>
  );
}
