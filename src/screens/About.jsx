// Saver — About us: our story, told simply, with a co-creation invite.
// Opened from Profile → About us.
import Ico from "../ui/Ico.jsx";
import logo from "../../icon.png";

const MAIL = "hello@savertrack.app";
const MAILTO = `mailto:${MAIL}?subject=An idea for Saver&body=Hi Saver team,%0A%0AHere is my idea:%0A`;

// One step in the "how it works" sequence: numbered icon + a short, plain line.
function Step({ icon, title, text, last }) {
  return (
    <div style={{ display: "flex", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ width: 42, height: 42, borderRadius: 14, background: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 10px -3px var(--ac)" }}><Ico name={icon} size={20} color="#fff" /></span>
        {!last && <span style={{ flex: 1, width: 2, background: "var(--line)", marginTop: 4, minHeight: 20 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 20 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: -.2 }}>{title}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--muted)", fontWeight: 600, marginTop: 4 }}>{text}</div>
      </div>
    </div>
  );
}

// A benefit card: category-coloured icon tile, a friendly headline, one plain line.
function Perk({ icon, color, title, text }) {
  return (
    <div className="icard" style={{ alignItems: "flex-start", gap: 12 }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in srgb, ${color} 16%, transparent)`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico name={icon} size={20} /></span>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: -.2 }}>{title}</div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{text}</div>
      </div>
    </div>
  );
}

// A small trust badge in the privacy row.
function Badge({ icon, label }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "16px 8px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16 }}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={19} /></span>
      <div style={{ fontSize: 12, fontWeight: 800, textAlign: "center" }}>{label}</div>
    </div>
  );
}

const Title = ({ children }) => <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -.3, marginTop: 28, marginBottom: 14 }}>{children}</div>;

export default function About({ back }) {
  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">About us</div><div className="grow" /></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1, paddingTop: 4, paddingBottom: 6 }}>
          <img src={logo} alt="Saver" style={{ width: 78, height: 78, borderRadius: 20, boxShadow: "0 10px 24px rgba(0,0,0,.28)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -.5 }}>Saver</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heroSub)", marginTop: 2 }}>Spend clearly and save calmly</div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 15.5, lineHeight: 1.7, fontWeight: 700, letterSpacing: -.2, margin: "22px 0 0", textWrap: "pretty" }}>
        Most money apps made us feel like we were doing something wrong. We wanted the opposite.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--muted)", fontWeight: 600, margin: "10px 0 0", textWrap: "pretty" }}>
        So we built Saver to feel like a calm friend who has your back. It shows you what your money is really doing, in plain words, and helps you save without the guilt. We made it for ourselves first. Now it is yours too.
      </p>

      <Title>How Saver helps you</Title>
      <Step icon="eye" title="See it clearly" text="Open the app and know what is safe to spend today. No mental maths." />
      <Step icon="layers" title="Keep it in one place" text="Your bills, budgets and goals all live together, so nothing catches you off guard." />
      <Step icon="target" title="Save your way" text="Set a goal, add a little when you can, and watch it grow at your own pace." last />

      <Title>What you get</Title>
      <Perk icon="eye" color="var(--blue)" title="You always know where you stand" text="A real safe to spend number, not just a balance." />
      <Perk icon="bills" color="var(--purple)" title="Nothing slips through" text="Bills and payments stay on your radar before they hit." />
      <Perk icon="target" color="var(--ac)" title="Saving feels good, not painful" text="Small steps that actually add up to something." />
      <Perk icon="lock" color="var(--orange)" title="It stays between you and your phone" text="Your numbers never leave your device." />

      <Title>Yours, and only yours</Title>
      <div style={{ display: "flex", gap: 10 }}>
        <Badge icon="lock" label="On your phone" />
        <Badge icon="close" label="No ads" />
        <Badge icon="eyeOff" label="No tracking" />
      </div>

      <div className="card" style={{ marginTop: 28, padding: 18, background: "var(--acDim)", boxShadow: "none", border: "none" }}>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.3 }}>Build it with us</div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted)", fontWeight: 600, margin: "8px 0 0", textWrap: "pretty" }}>
          Saver keeps getting better because of people like you. If something is missing or something bugs you, just tell us. We read every message, and we build it with you, not only for you.
        </p>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <div className="btn btn-primary btn-full" style={{ marginTop: 14 }}><Ico name="sparkles" size={17} />Share an idea</div>
        </a>
        <a href={`mailto:${MAIL}`} style={{ textDecoration: "none" }}>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="mail" size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>Email us</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{MAIL}</div>
            </div>
            <Ico name="chev" size={18} color="var(--faint)" />
          </div>
        </a>
      </div>

      <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 11.5, fontWeight: 700, margin: "24px 0 4px", lineHeight: 1.6 }}>Made with care for people who want a little more calm with their money.</div>
    </div>
  );
}
