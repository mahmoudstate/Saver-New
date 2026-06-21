// Saver — About us: the brand's story, vision and a co-creation invite.
// Opened from Profile → About us.
import Ico from "../ui/Ico.jsx";
import logo from "../../icon.png";

const MAIL = "hello@savertrack.app";
const MAILTO = `mailto:${MAIL}?subject=An%20idea%20for%20Saver&body=Hi%20Saver%20team%2C%0A%0AHere's%20my%20idea%3A%0A`;

// Section heading: small icon tile + eyebrow + title.
function Head({ icon, eyebrow, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 26 }}>
      <span className="circ" style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: 11, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={18} /></span>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--acText)" }}>{eyebrow}</div>
        <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: -.3, marginTop: 1 }}>{title}</div>
      </div>
    </div>
  );
}

const Body = ({ children }) => (
  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--muted)", fontWeight: 600, margin: "10px 0 0", textWrap: "pretty" }}>{children}</p>
);

// Infographic perk: icon tile + bold lead + one short supporting line.
function Perk({ icon, color, lead, sub }) {
  return (
    <div className="icard" style={{ alignItems: "flex-start", gap: 12 }}>
      <span className="circ" style={{ flex: "0 0 auto", width: 38, height: 38, borderRadius: 12, background: `color-mix(in srgb, ${color} 16%, transparent)`, color, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={icon} size={19} /></span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -.2 }}>{lead}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function About({ back }) {
  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">About us</div><div className="grow" /></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1, paddingTop: 4, paddingBottom: 6 }}>
          <img src={logo} alt="Saver" style={{ width: 78, height: 78, borderRadius: 20, boxShadow: "0 10px 24px rgba(0,0,0,.28)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -.5 }}>Saver</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--heroSub)", marginTop: 2 }}>Money, made calm.</div>
          </div>
        </div>
      </div>

      <Head icon="sparkles" eyebrow="Who we are" title="A calmer way to handle money" />
      <Body>An independent app for people tired of money tools that make them feel behind. No clutter, no pressure — just a clear view of where you stand.</Body>

      <Head icon="crown" eyebrow="The name" title="Why “Saver”?" />
      <Body>The name is the whole promise: a quiet helper on your side, here to help you keep more of what you earn — your way.</Body>

      <Head icon="shield" eyebrow="Our vision" title="Your money, your business" />
      <Body>Saver runs fully on your device. No ads, no tracking, nothing sold. Your numbers never leave your phone — private by default.</Body>

      <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 26, marginBottom: 4 }}>
        <span className="circ" style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: 11, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="target" size={18} /></span>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--acText)" }}>What it does for you</div>
          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: -.3, marginTop: 1 }}>Problems we quietly solve</div>
        </div>
      </div>
      <Perk icon="eye" color="var(--blue)" lead="Know what's safe to spend" sub="A real safe-to-spend number, not just a balance." />
      <Perk icon="bills" color="var(--purple)" lead="No end-of-month surprises" sub="Bills, installments and budgets, all in one place." />
      <Perk icon="target" color="var(--ac)" lead="Save without feeling deprived" sub="Goals that grow with you, at your own pace." />
      <Perk icon="lock" color="var(--orange)" lead="Your data stays yours" sub="Fully offline and private — always." />

      <div className="card" style={{ marginTop: 26, padding: 18, background: "var(--acDim)", boxShadow: "none", border: "none" }}>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.3 }}>Build it with us</div>
        <Body>Saver is shaped by the people who use it. Got an idea or something that bugs you? Tell us — we read every message and build <b style={{ color: "var(--text)" }}>with</b> our users.</Body>
        <a href={MAILTO} style={{ textDecoration: "none" }}>
          <div className="btn btn-primary btn-full" style={{ marginTop: 14 }}><Ico name="sparkles" size={17} />Share an idea</div>
        </a>
        <a href={`mailto:${MAIL}`} style={{ textDecoration: "none" }}>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)" }}>
            <span className="circ" style={{ width: 34, height: 34, borderRadius: 10, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="mail" size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>Email us</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{MAIL}</div>
            </div>
            <Ico name="chev" size={18} color="var(--faint)" />
          </div>
        </a>
      </div>

      <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", margin: "22px 0 4px" }}>Saver · Offline &amp; private · Made with care</div>
    </div>
  );
}
