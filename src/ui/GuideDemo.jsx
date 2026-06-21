// Saver — Guide live demos: real app components rendered with safe sample data
// inside a small framed stage. Some are interactive (tap the eye, toggle type).
// Everything is theme-aware via CSS vars; nothing is a static picture.
import { useState } from "react";
import { BankCard } from "../screens/Home.jsx";
import CatTile from "./CatTile.jsx";
import SegToggle from "./SegToggle.jsx";
import BudgetRing from "./BudgetRing.jsx";
import ServiceLogo from "./ServiceLogo.jsx";
import Money from "./Money.jsx";
import Ico from "./Ico.jsx";
import InstallSteps from "./InstallSteps.jsx";
import { fmt, CURRENCIES } from "../lib/format.js";

const Stage = ({ children, label = "Live preview" }) => (
  <div className="gsap-demo" style={{ background: "var(--stage)", borderRadius: 22, padding: 16, border: "1px solid var(--line)" }}>
    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Ico name="sparkles" size={13} color="var(--ac)" />{label}</div>
    {children}
  </div>
);

function HomeDemo() {
  const [hide, setHide] = useState(false);
  const money = (v) => (hide ? "••••" : fmt(v));
  return (
    <Stage label="Tap the eye to try it">
      <div style={{ background: "var(--heroGrad)", color: "var(--heroText)", borderRadius: 18, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", opacity: .72 }}>Safe to spend</div>
          <span onClick={() => setHide((h) => !h)} style={{ cursor: "pointer", display: "flex" }}><Ico name={hide ? "eyeOff" : "eye"} size={17} /></span>
        </div>
        <Money className="tnum" style={{ fontSize: 27, fontWeight: 800, letterSpacing: -.5 }} v={1446} masked={hide} />
      </div>
      <BankCard bank={{ id: "demo", name: "Main account", color: "#0e9f6e" }} available={426} frozen={200} money={money} masked={hide} grid />
    </Stage>
  );
}

function AddDemo() {
  const [mode, setMode] = useState("expense");
  const out = mode === "expense";
  return (
    <Stage label="Pick a type, see it change">
      <SegToggle value={mode} onChange={setMode} options={[{ id: "expense", label: "Expense" }, { id: "income", label: "Income" }]} />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Money style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.5, color: out ? "var(--red)" : "var(--success)" }} v={250} sign={out ? "−" : "+"} curSize={0.5} />
      </div>
    </Stage>
  );
}

function GoalsDemo() {
  return (
    <Stage label="A goal filling up">
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <BudgetRing spent={1200} total={1800} size={104} stroke={12} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>Saved so far</div>
          <Money style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3 }} v={1200} curSize={0.5} />
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}><Ico name="lock" size={12} color="var(--ac)" />{fmt(1800)} target</div>
        </div>
      </div>
    </Stage>
  );
}

function BillsDemo() {
  return (
    <Stage label="A bill on your radar">
      <div className="icard" style={{ margin: 0 }}>
        <ServiceLogo domain="netflix" name="Netflix" color="#E50914" size={44} />
        <div><div className="nm">Netflix</div><div className="mt" style={{ color: "var(--yellow)" }}>Due in 3 days</div></div>
        <Money className="tnum" style={{ marginLeft: "auto", fontWeight: 800, fontSize: 15 }} v={10} curSize={0.6} />
      </div>
    </Stage>
  );
}

function CategoriesDemo() {
  const cats = ["groceries", "fuel", "gift", "music", "fitness"];
  return (
    <Stage label="Real category icons">
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {cats.map((c) => <CatTile key={c} cat={c} size={48} />)}
      </div>
    </Stage>
  );
}

function AccountsDemo() {
  return (
    <Stage label="An account card">
      <BankCard bank={{ id: "demo", name: "Cash wallet", color: "#f59e0b", lowBalanceThreshold: 200 }} available={120} frozen={0} low money={fmt} grid />
      <div className="btn btn-secondary btn-full" style={{ marginTop: 12, pointerEvents: "none" }}><Ico name="transfer" size={17} />Move money</div>
    </Stage>
  );
}

function ActivityDemo() {
  return (
    <Stage label="Your activity">
      <div className="icard" style={{ margin: 0 }}>
        <CatTile cat="groceries" size={44} />
        <div><div className="nm">Groceries</div><div className="mt">HSBC · Fri, 12 Jun</div></div>
        <Money className="tnum" style={{ marginLeft: "auto", fontWeight: 800, fontSize: 15, color: "var(--red)" }} v={160} sign="−" curSize={0.6} />
      </div>
      <div className="icard" style={{ margin: "10px 0 0" }}>
        <CatTile cat="goal" color="var(--ac)" size={44} />
        <div><div className="nm">Saved · New laptop</div><div className="mt">HSBC · Tue, 9 Jun</div></div>
        <Money className="tnum" style={{ marginLeft: "auto", fontWeight: 800, fontSize: 15, color: "var(--success)" }} v={600} sign="+" curSize={0.6} />
      </div>
    </Stage>
  );
}

function BudgetsDemo() {
  return (
    <Stage label="This month's budget">
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <BudgetRing spent={420} total={500} size={104} stroke={12} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>Spent</div>
          <Money style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3 }} v={420} curSize={0.5} />
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>of {fmt(500)} budget</div>
        </div>
      </div>
    </Stage>
  );
}

function BreakdownDemo() {
  const bars = [{ cat: "groceries", name: "Groceries", pct: 62, color: "var(--purple)" }, { cat: "fuel", name: "Fuel", pct: 38, color: "var(--orange)" }];
  return (
    <Stage label="Where it went">
      {bars.map((b, i) => (
        <div key={b.cat} style={{ display: "flex", alignItems: "center", gap: 11, marginTop: i ? 13 : 0 }}>
          <CatTile cat={b.cat} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 5 }}><span>{b.name}</span><span className="tnum">{b.pct}%</span></div>
            <div className="pbar bar"><i style={{ width: `${b.pct}%`, background: b.color }} /></div>
          </div>
        </div>
      ))}
    </Stage>
  );
}

function NotificationsDemo() {
  return (
    <Stage label="A heads up">
      <div className="icard" style={{ margin: 0 }}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--yellowDim)", color: "var(--yellow)" }}><Ico name="bell" size={19} /></span>
        <div><div className="nm">Netflix is due in 3 days</div><div className="mt">Bills</div></div>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--ac)" }} /><Ico name="chev" size={18} color="var(--faint)" /></span>
      </div>
    </Stage>
  );
}

function PrivacyDemo() {
  const items = [{ icon: "lock", label: "On your phone" }, { icon: "close", label: "No ads" }, { icon: "eyeOff", label: "No tracking" }];
  return (
    <Stage label="Private by default">
      <div style={{ display: "flex", gap: 10 }}>
        {items.map((it) => (
          <div key={it.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "14px 6px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={it.icon} size={18} /></span>
            <div style={{ fontSize: 11.5, fontWeight: 800, textAlign: "center" }}>{it.label}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
}

function AppearanceDemo() {
  const swatches = ["#5FE3C0", "#7DD3FC", "#C4B5FD", "#FCA5A5", "#FDBA74"];
  return (
    <Stage label="Make it yours">
      <SegToggle value="system" onChange={() => {}} options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }, { id: "system", label: "System" }]} />
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
        {swatches.map((c, i) => <span key={c} style={{ width: 34, height: 34, borderRadius: "50%", background: c, boxShadow: i === 0 ? "0 0 0 3px var(--stage), 0 0 0 5px var(--ac)" : "none" }} />)}
      </div>
    </Stage>
  );
}

function CurrencyDemo() {
  const list = CURRENCIES.slice(0, 2);
  return (
    <Stage label="Pick your currency">
      {list.map((c, i) => (
        <div className="icard" key={c.code} style={{ margin: i ? "10px 0 0" : 0 }}>
          <span className="circ" style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, lineHeight: 1 }}>{c.flag}</span>
          <div className="nm">{c.code}</div>
        </div>
      ))}
    </Stage>
  );
}

const InstallDemo = () => <Stage label="On your home screen"><InstallSteps /></Stage>;

const DEMOS = { home: HomeDemo, add: AddDemo, goals: GoalsDemo, bills: BillsDemo, categories: CategoriesDemo, accounts: AccountsDemo, activity: ActivityDemo, budgets: BudgetsDemo, breakdown: BreakdownDemo, notifications: NotificationsDemo, privacy: PrivacyDemo, appearance: AppearanceDemo, currency: CurrencyDemo, install: InstallDemo };

export default function GuideDemo({ demo }) {
  const C = DEMOS[demo];
  return C ? <C /> : null;
}
