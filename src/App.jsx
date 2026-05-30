// ─── Saver One V1.2 - Full Masterpiece ───
import React, { useState, useEffect, useCallback, useRef, createContext, useContext, useMemo } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";

// ─── Haptics ─────────────────────────────────────────────────────────────────
const vibrate = (pattern) => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    try { window.navigator.vibrate(pattern); } catch(e){}
  }
};
const HAPTICS = {
  light: () => vibrate(10),
  medium: () => vibrate(20),
  heavy: () => vibrate(50),
  success: () => vibrate([30, 50, 30]),
  warning: () => vibrate(100),
};

// ─── Currency Context ────────────────────────────────────────────────────────
const CurrencyContext = createContext("EGP");
const useCurrency = () => useContext(CurrencyContext);

const fmt = (n, overrideCurrency) => {
  const cur = overrideCurrency || "EGP";
  try {
    const rounded = Math.round(n * 100) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: cur,
      minimumFractionDigits: rounded % 1 === 0 ? 0 : 1, maximumFractionDigits: 2
    }).format(rounded);
  } catch {
    return `${cur} ${n}`;
  }
};

const useFmt = () => {
  const currency = useCurrency();
  return useCallback((n, override) => fmt(n, override || currency), [currency]);
};

// ─── Drag state ref ─────────────────────────────────────────────────────────
const isDraggingRef = { current: false };

// ─── Constants ───────────────────────────────────────────────────────────────
const C = {
  bg: "#0f0f13", surface: "#17171f", card: "#1e1e28", border: "#2a2a38",
  accent: "#6ee7b7", accentDim: "#1a3d30",
  red: "#f87171", redDim: "#3d1a1a",
  blue: "#60a5fa", blueDim: "#1a2d3d",
  yellow: "#fbbf24", yellowDim: "#3d2e0a",
  purple: "#a78bfa", purpleDim: "#2a1a3d",
  text: "#e8e8f0", muted: "#8888a8", faint: "#444460",
};

const CURRENCIES = [
  { code: "EGP", name: "Egyptian Pound" }, { code: "GBP", name: "British Pound" },
  { code: "USD", name: "US Dollar" }, { code: "EUR", name: "Euro" },
  { code: "SAR", name: "Saudi Riyal" }, { code: "AED", name: "UAE Dirham" },
];

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const fmtDate = (d) => {
  const dt = new Date(d + "T12:00:00");
  return `${DAYS[dt.getDay()]}: ${dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
};

const today = () => new Date().toISOString().split("T")[0];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ICONS = {
  dashboard:"◈", add:"＋", settings:"⚙", saving:"◎", bills_nav:"☷", budget:"📊",
  income:"↑", expense:"↓", transfer:"→",
  food:"🍽", coffee:"☕", transport:"🚗", bills:"⚡",
  personal:"👤", health:"💊", entertainment:"🎬", shopping:"🛍",
  rent:"🏠", education:"📚", tech:"💻", others:"📌",
  salary:"💼", freelance:"💡", gift:"🎁", investment:"📈", other_income:"💰",
  bank:"🏦", cash:"💵", goal:"🎯", trash:"🗑", edit:"✎", close:"✕", check:"✓",
  parking:"🅿️", fuel:"⛽", car_repair:"🔧", takeaway:"🍕",
  barber:"💈", pets:"🐾", travel:"✈️", gaming:"🎮",
  pharmacy:"💊", laundry:"🧺", tuition:"🎓", gym:"🏋️",
};

const DEFAULT_BANKS = [
  { id:"b1", name:"CIB", color:C.blue, isArchived: false }, 
  { id:"b2", name:"NBE", color:C.accent, isArchived: false }, 
  { id:"b3", name:"Cash", color:C.yellow, isArchived: false }
];
const DEFAULT_EXP_CATS = [
  { id: "food", name: "Food", icon: "food", group: "daily", isArchived: false }, 
  { id: "coffee", name: "Coffee", icon: "coffee", group: "daily", isArchived: false },
  { id: "transport", name: "Transport", icon: "transport", group: "daily", isArchived: false }, 
  { id: "bills", name: "Bills", icon: "bills", group: "fixed", isArchived: false },
  { id: "shopping", name: "Shopping", icon: "shopping", group: "lifestyle", isArchived: false }, 
  { id: "entertainment", name: "Fun", icon: "entertainment", group: "lifestyle", isArchived: false }
];
const DEFAULT_INC_CATS = [
  { id: "salary", name: "Salary", icon: "salary", isArchived: false }, 
  { id: "freelance", name: "Freelance", icon: "freelance", isArchived: false }
];
const DEFAULT_GROUPS = [
  { id:"daily", name:"Daily Life", color:C.accent, cats:["food","coffee","transport"] },
  { id:"fixed", name:"Fixed Costs", color:C.red, cats:["bills"] }
];

const DEFAULT_QUICK_ACTIONS = [
  { id: "q1", catId: "coffee", amount: "50", bankId: "b3" }, { id: "q2", catId: "transport", amount: "50", bankId: "b3" },
  { id: "q3", catId: "", amount: "", bankId: "" }, { id: "q4", catId: "", amount: "", bankId: "" }
];

const KEYS = {
  txns:"et_txns", banks:"et_banks", expCats:"et_expCats", incCats:"et_incCats",
  groups:"et_groups", savings:"et_savings", currency:"et_currency",
  username:"et_username", lastBackup:"et_lastBackup", bills:"et_bills",
  budgets:"et_budgets", quickActions: "et_quick_actions", seenWelcome: "et_seenWelcome"
};

async function load(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
async function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function Pill({ color, children, style }) {
  return <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:99, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:0.5, ...style }}>{children}</span>;
}

function Card({ children, style, onClick, ...props }) {
  return (
    <div {...props} onClick={(e) => { if (!isDraggingRef.current && onClick) onClick(e); }}
      style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, fontFamily: "'DM Sans', sans-serif", ...style }}>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, center }) {
  const alignVal = center ? "center" : "flex-end";
  const radiusVal = center ? "20px" : "20px 20px 0 0";
  const animVal = center ? "popCenter 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)" : "slideUp 0.3s ease-out";
  return (
    <div style={{ position:"fixed", inset:0, background:"#000a", zIndex:100, display:"flex", alignItems:alignVal, justifyContent:"center", padding:center?"0 20px":"0", fontFamily: "'DM Sans', sans-serif" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:radiusVal, width:"100%", maxWidth:520, maxHeight:"85vh", overflow:"auto", padding:24, animation:animVal }}>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } @keyframes popCenter { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ color:C.text, fontWeight:700, fontSize:18, margin:0, padding:0 }}>{title}</span>
          <button onClick={onClose} style={{ background:C.border, border:"none", color:C.muted, width:38, height:38, borderRadius:99, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", padding:0, margin:0 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onClose, confirmColor }) {
  return (
    <Modal title={title} onClose={onClose} center={false}>
      <p style={{ color:C.muted, marginBottom:20, lineHeight:1.6, fontSize:14 }}>{message}</p>
      <div style={{ display:"flex", gap:10 }}>
        <Btn outline color={C.muted} full onClick={onClose}>Cancel</Btn>
        <Btn color={confirmColor||C.red} full onClick={() => { HAPTICS.warning(); onConfirm(); }}>Confirm</Btn>
      </div>
    </Modal>
  );
}

function AlertModal({ title, message, onClose, btnColor=C.accent }) {
  return (
    <Modal title={title} onClose={onClose} center={true}>
      <p style={{ color:C.text, marginBottom:20, lineHeight:1.6, fontSize:14 }}>{message}</p>
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <Btn color={btnColor} onClick={onClose} style={{ minWidth:100 }}>Close</Btn>
      </div>
    </Modal>
  );
}

function AppFooter() {
  return (
    <div style={{textAlign: "center", marginTop: 40, marginBottom: 20, width: "100%"}}>
      <div style={{marginBottom: "6px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"}}>
        <span style={{color: "#60a5fa", opacity: 0.8, fontSize: "13px", fontWeight: "700"}}>Saver One V1.2</span>
      </div>
      <div style={{color: "#60a5fa", opacity: 0.6, fontSize: "10px", fontWeight: "500"}}>Offline & 100% Private · Powered by Mahmoud © 2026</div>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ color:C.muted, fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:6, textTransform:"uppercase" }}>{label}</div>}
      <input {...props} style={{ width:"100%", background:C.bg, border:`1px solid ${error ? C.red : C.border}`, borderRadius:10, padding:"10px 12px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", fontFamily: "'DM Sans', sans-serif", ...props.style }} />
      {error && <div style={{ color:C.red, fontSize:11, marginTop:4 }}>{error}</div>}
    </div>
  );
}

function MonthSelect({ value, onChange, availMonths }) {
  const groupedMonths = useMemo(() => {
    const groups = {};
    const monthsToUse = availMonths.length > 0 ? availMonths : [new Date().toISOString().slice(0, 7)];
    
    monthsToUse.forEach(m => {
      const [year, month] = m.split("-");
      if (!groups[year]) groups[year] = [];
      groups[year].push({ value: m, label: `${MONTHS[+month - 1]} ${year}` });
    });

    return Object.keys(groups).sort((a, b) => b - a).map(year => ({
      year,
      months: groups[year]
    }));
  }, [availMonths]);

  return (
    <div style={{ position:"relative", display:"inline-block" }}>
      <select value={value} onChange={onChange} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.text, borderRadius:10, padding:"8px 32px 8px 12px", fontSize:13, fontWeight:600, outline:"none", appearance:"none", cursor:"pointer", fontFamily: "'DM Sans', sans-serif" }}>
        <option value="all">All Time</option>
        {groupedMonths.map(group => (
          <optgroup key={group.year} label={`--- ${group.year} ---`}>
            {group.months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:10, pointerEvents:"none" }}>▼</span>
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ color:C.muted, fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>{label}</div>}
      <select {...props} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", fontFamily: "'DM Sans', sans-serif", ...props.style }}>{children}</select>
    </div>
  );
}

function Btn({ children, color=C.accent, outline, full, small, ...props }) {
  return (
    <button {...props} style={{ background:outline?"transparent":color, border:`1.5px solid ${color}`, color:outline?color:C.bg, borderRadius:10, padding:small?"7px 14px":"11px 20px", fontWeight:700, fontSize:small?13:15, cursor:"pointer", width:full?"100%":"auto", transition:"opacity .15s", fontFamily: "'DM Sans', sans-serif", ...props.style }}
      onMouseOver={e=>e.currentTarget.style.opacity=".8"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>
      {children}
    </button>
  );
}

function ProgressBar({ value, max, color }) {
  const pct = max ? Math.min(100,(value/max)*100) : 0;
  return <div style={{ height:6, background:C.border, borderRadius:99, overflow:"hidden" }}><div style={{ height:"100%", width:`${pct}%`, background:color||C.accent, borderRadius:99, transition:"width .4s" }} /></div>;
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px", opacity:0.5 }}>
      <div style={{ fontSize:38, marginBottom:12 }}>{icon}</div>
      <div style={{ color:C.muted, fontSize:14, fontWeight:500 }}>{message}</div>
    </div>
  );
}

let globalActiveSwipeClose = null;

function SwipeRow({ onEdit, onDelete, children }) {
  const [slide, setSlide] = useState(0);
  const rowRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isHorizontal = useRef(false);
  const isVertical = useRef(false);
  const slideRef = useRef(0);

  const closeSwipe = useCallback(() => {
    setSlide(0);
    slideRef.current = 0;
    currentX.current = 0;
    if (rowRef.current) {
      rowRef.current.style.transform = `translateX(0px)`;
      rowRef.current.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15)";
    }
    if (globalActiveSwipeClose === closeSwipe) globalActiveSwipeClose = null;
  }, []);

  useEffect(() => {
    const el = rowRef.current; if (!el) return;
    const handleTouchStart = (e) => {
      if (globalActiveSwipeClose && globalActiveSwipeClose !== closeSwipe) globalActiveSwipeClose();
      startX.current = e.touches[0].clientX; startY.current = e.touches[0].clientY;
      currentX.current = slideRef.current; isHorizontal.current = false; isVertical.current = false; el.style.transition = "none";
    };
    const handleTouchMove = (e) => {
      if (isVertical.current) return;
      const touchX = e.touches[0].clientX; const touchY = e.touches[0].clientY;
      const diffX = touchX - startX.current; const diffY = Math.abs(touchY - startY.current);
      if (!isHorizontal.current) {
        if (diffY > Math.abs(diffX) && diffY > 3) { isVertical.current = true; return; }
        if (Math.abs(diffX) > 10 && Math.abs(diffX) > diffY) isHorizontal.current = true;
      }
      if (isHorizontal.current) {
        e.preventDefault();
        let target = currentX.current + diffX;
        if (target < -95) target = -95; if (target > 95) target = 95;
        el.style.transform = `translateX(${target}px)`;
        setSlide(target);
        slideRef.current = target;
      }
    };
    const handleTouchEnd = () => {
      if (isVertical.current) return;
      el.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15)";
      const s = slideRef.current;
      if (s < -35) { setSlide(-85); slideRef.current = -85; currentX.current = -85; el.style.transform = `translateX(-85px)`; HAPTICS.light(); globalActiveSwipeClose = closeSwipe; }
      else if (s > 35) { setSlide(85); slideRef.current = 85; currentX.current = 85; el.style.transform = `translateX(85px)`; HAPTICS.light(); globalActiveSwipeClose = closeSwipe; }
      else { setSlide(0); slideRef.current = 0; currentX.current = 0; el.style.transform = `translateX(0px)`; if (globalActiveSwipeClose === closeSwipe) globalActiveSwipeClose = null; }
    };
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [closeSwipe]);

  return (
    <div style={{ position:"relative", overflow:"hidden", borderRadius:12, marginBottom:8, userSelect:"none", WebkitUserSelect:"none" }}>
      <div style={{ position:"absolute", inset:0, display:"flex", justifyContent:"space-between", zIndex:0 }}>
        <button onClick={()=>{closeSwipe(); onEdit&&onEdit();}} style={{ width:85, background:C.blueDim, border:"none", color:C.blue, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily: "'DM Sans', sans-serif" }}>✎ Edit</button>
        <button onClick={()=>{closeSwipe(); onDelete&&onDelete();}} style={{ width:85, background:C.redDim, border:"none", color:C.red, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily: "'DM Sans', sans-serif" }}>🗑 Delete</button>
      </div>
      <div ref={rowRef} style={{ touchAction: slide !== 0 ? "none" : "pan-y", background:C.card, border:`1px solid ${C.border}`, borderRadius:12, position:"relative", zIndex:1, width:"100%", boxSizing:"border-box" }}>
        {children}
      </div>
    </div>
  );
}
// ─── SortableList ─────────────────────────────────────────────────────────────
function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(id) });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 100 : "auto",
    position: isDragging ? "relative" : "static",
    touchAction: isDragging ? "none" : "auto",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function SortableList({ items, onReorder, renderItem, grid, gap = 10 }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = () => {
    isDraggingRef.current = true;
    HAPTICS.heavy();
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  };

  const cleanupDrag = () => {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    setTimeout(() => { isDraggingRef.current = false; }, 100);
  };

  const handleDragEnd = (event) => {
    HAPTICS.heavy();
    cleanupDrag();
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => String(i.id) === String(active.id));
      const newIndex = items.findIndex((i) => String(i.id) === String(over.id));
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={cleanupDrag}>
      <SortableContext items={items.map(i => String(i.id))} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}>
        <div style={{ display: grid ? "grid" : "flex", gridTemplateColumns: grid ? "1fr 1fr" : "none", flexDirection: grid ? "row" : "column", gap }}>
          {items.map((item, idx) => (
            <SortableItem key={item.id} id={item.id}>
              {renderItem(item, idx)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ─── Welcome & Splash ─────────────────────────────────────────────────────────
function WelcomeScreen({ onStart }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:900,background:C.bg,display:"flex",flexDirection:"column",padding:"40px 24px",boxSizing:"border-box",overflow:"auto", fontFamily:"'DM Sans', sans-serif"}}>
      <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center"}}>
        <div style={{textAlign:"center", marginBottom:30}}>
          <h1 style={{color:C.text, fontSize:28, fontWeight:800, margin:"0 0 10px 0"}}>Welcome to Saver</h1>
          <h2 style={{color:C.accent, fontSize:16, fontWeight:600, margin:0}}>Your Personal Finance, Mastered.</h2>
        </div>
        <p style={{color:C.muted, fontSize:15, lineHeight:1.6, marginBottom:24, textAlign:"center"}}>
          Enjoy a simple, fast way to track your daily earnings and expenses.
        </p>
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:12, marginTop:"auto"}}>
        <Btn full onClick={onStart} style={{padding:"14px", fontSize:16}}>Start Using Saver</Btn>
      </div>
    </div>
  );
}

function SplashScreen() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:"#0f0f13",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:phase===2?0:1,transition:phase===2?"opacity 0.7s ease":"none",userSelect:"none",fontFamily:"'DM Sans', sans-serif"}}>
      <div style={{color:"#e8e8f0",fontSize:32,fontWeight:800,letterSpacing:10,textTransform:"uppercase",marginBottom:6}}>SAVER</div>
      <div style={{color:"#444460", fontSize:10, position:"absolute", bottom:24, fontWeight:700, letterSpacing:1}}>Saver One V1.2</div>
    </div>
  );
}

// ─── V1.2 Read-Only Transaction Modal ───
function TransactionDetailsModal({ txn, onClose, currency }) {
  if (!txn) return null;
  return (
    <Modal title="Transaction Details" onClose={onClose} center={false}>
      <Input label="Amount" value={`${fmt(txn.amount, currency)}`} disabled />
      <Input label="Type" value={txn.type.toUpperCase()} disabled />
      <Input label="Account / Source" value={txn.type === "transfer" ? `${txn.bankName} ➔ ${txn.toBankName}` : txn.bankName} disabled />
      {txn.type !== "transfer" && <Input label="Category" value={txn.catName || "Uncategorized"} disabled />}
      <Input label="Date" value={txn.date} disabled />
      {txn.clientName && <Input label="Client Name" value={txn.clientName} disabled />}
      {txn.note && (
        <div style={{ marginBottom:14 }}>
          <div style={{ color:C.muted, fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:6, textTransform:"uppercase" }}>Notes</div>
          <textarea value={txn.note} disabled rows="3" style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", fontFamily: "'DM Sans', sans-serif" }} />
        </div>
      )}
      <Btn full onClick={onClose} style={{ marginTop: 10 }}>Done</Btn>
    </Modal>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function SaverApp() {
  const [tab, setTab] = useState("dashboard");
  const [scrollState, setScrollState] = useState({ y: 0, restore: false });
  const [txns, setTxns] = useState([]);
  const [banks, setBanks] = useState(DEFAULT_BANKS);
  const [expCats, setExpCats] = useState(DEFAULT_EXP_CATS);
  const [incCats, setIncCats] = useState(DEFAULT_INC_CATS);
  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [savings, setSavings] = useState([]);
  const [bills, setBills] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [quickActions, setQuickActions] = useState(DEFAULT_QUICK_ACTIONS);
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);
  const [filterMonth, setFilterMonth] = useState("all");
  const [currency, setCurrencyState] = useState("EGP");
  const [username, setUsernameState] = useState("");
  const [lastBackup, setLastBackup] = useState(null);
  const [appAlert, setAppAlert] = useState(null);
  const [hideTotal, setHideTotal] = useState(true);
  
  // V1.2 States
  const [toast, setToast] = useState(null);
  const [showV12Welcome, setShowV12Welcome] = useState(false);
  const [pendingOverBudgetTxn, setPendingOverBudgetTxn] = useState(null);
  const [viewTxn, setViewTxn] = useState(null); // Read-only modal state

  const [ledgerBank, setLedgerBank] = useState(null);
  const [ledgerGroup, setLedgerGroup] = useState(null);
  const [ledgerSaving, setLedgerSaving] = useState(null);
  const [ledgerBudget, setLedgerBudget] = useState(null);

  const triggerToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    (async () => {
      const [t,b,ec,ic,g,s,cur,uname,bl,bdg,lb,qa,seen] = await Promise.all([
        load(KEYS.txns,[]), load(KEYS.banks,DEFAULT_BANKS), load(KEYS.expCats,DEFAULT_EXP_CATS),
        load(KEYS.incCats,DEFAULT_INC_CATS), load(KEYS.groups,DEFAULT_GROUPS), load(KEYS.savings,[]),
        load(KEYS.currency,"EGP"), load(KEYS.username,""), load(KEYS.bills,[]), load(KEYS.budgets,[]),
        load(KEYS.lastBackup, null), load(KEYS.quickActions, DEFAULT_QUICK_ACTIONS), load(KEYS.seenWelcome, false)
      ]);

      // Migrate Data to V1.2 Standard
      const migratedSavings = s.map(goal => ({
        ...goal,
        status: goal.hasOwnProperty("status") ? goal.status : "active",
        spendingMode: goal.hasOwnProperty("spendingMode") ? goal.spendingMode : false
      }));

      if (JSON.stringify(s) !== JSON.stringify(migratedSavings)) {
        setSavings(migratedSavings);
        save(KEYS.savings, migratedSavings);
      } else {
        setSavings(s);
      }

      setTxns(t); setBanks(b); setExpCats(ec); setIncCats(ic); setGroups(g);
      setCurrencyState(cur); setUsernameState(uname); setBills(bl); setBudgets(bdg); setLastBackup(lb);
      setQuickActions(qa); setHasSeenWelcome(seen);

      const curMonth = new Date().toISOString().slice(0,7);
      const hasCurMonth = t.some(tx => tx.date.startsWith(curMonth));
      setFilterMonth(hasCurMonth ? curMonth : "all");
      setReady(true);
      setTimeout(() => setShowSplash(false), 2700);
    })();
  }, []);

  const navigateTo = useCallback((newTab, saveScroll = false) => {
    if (saveScroll) setScrollState({ y: window.scrollY, restore: true });
    else { setScrollState({ y: 0, restore: false }); window.scrollTo(0, 0); }
    setTab(newTab);
  }, []);

  const persist = useCallback(async (key,val) => { await save(key,val); }, []);

  const getGoalCurrent = (goal) => goal.contributions?.reduce((sum,c)=>sum+c.amount,0) || 0;

  const getBankMetrics = useCallback((bankId) => {
    const inc = txns.filter(t=>t.bankId===bankId&&t.type==="income").reduce((a,t)=>a+t.amount,0);
    const exp = txns.filter(t=>t.bankId===bankId&&t.type==="expense").reduce((a,t)=>a+t.amount,0);
    const transferIn = txns.filter(t=>t.toBankId===bankId&&t.type==="transfer").reduce((a,t)=>a+t.amount,0);
    const transferOut = txns.filter(t=>t.fromBankId===bankId&&t.type==="transfer").reduce((a,t)=>a+t.amount,0);
    const actualBalance = inc - exp + transferIn - transferOut;
    const lockedAmount = savings.filter(g => g.status === "active").reduce((a, g) => {
      return a + (g.contributions?.filter(c => c.bankId === bankId).reduce((sum,c)=>sum+c.amount,0) || 0);
    }, 0);
    const safeToSpend = actualBalance - lockedAmount;
    return { actualBalance, lockedAmount, safeToSpend };
  }, [txns, savings]);

  const bankBalance = useCallback((bankId) => getBankMetrics(bankId).safeToSpend, [getBankMetrics]);

  // Savings Logic
  const toggleGoalSpendingMode = async (goalId) => {
    const updated = savings.map(g => g.id === goalId ? { ...g, spendingMode: !g.spendingMode } : g);
    setSavings(updated);
    await persist(KEYS.savings, updated);
    triggerToast(updated.find(g => g.id === goalId).spendingMode ? "Spending mode enabled 🟢" : "Spending mode disabled 🔴");
  };

  const handleEmergencyWithdrawal = async (goalId, amountToWithdraw) => {
    const targetGoal = savings.find(g => g.id === goalId);
    if (!targetGoal) return;
    if (amountToWithdraw > getGoalCurrent(targetGoal)) {
      triggerToast("Insufficient funds in target goal! ⚠️");
      return;
    }
    const withdrawalContribution = {
      id: Date.now().toString(), amount: -Math.abs(amountToWithdraw),
      date: today(), bankId: targetGoal.contributions?.[0]?.bankId || banks[0]?.id
    };
    const updatedSavings = savings.map(g => g.id === goalId ? { ...g, contributions: [...(g.contributions||[]), withdrawalContribution] } : g);
    setSavings(updatedSavings);
    await persist(KEYS.savings, updatedSavings);
    triggerToast(`Emergency withdrawal completed 💸`);
  };

  const handleArchiveGoal = async (goalId) => {
    const updated = savings.map(g => g.id === goalId ? { ...g, status: "archived" } : g);
    setSavings(updated);
    await persist(KEYS.savings, updated);
    triggerToast("Goal moved to archive 🗄️");
    setLedgerSaving(null);
  };

  const executeSaveTransaction = async (t) => {
    const generatedId = Date.now().toString();
    const next = [{...t, id: generatedId}, ...txns];
    setTxns(next);
    await persist(KEYS.txns, next);
    HAPTICS.success();
    return generatedId;
  };

  const addTxn = async (t) => {
    if (t.bankId && t.bankId.startsWith("goal_")) {
      const goalId = t.bankId.replace("goal_", "");
      const targetGoal = savings.find(g => g.id === goalId);
      if (targetGoal) {
        const currentSaved = getGoalCurrent(targetGoal);
        if (t.type === "expense" && t.amount > currentSaved) {
          setPendingOverBudgetTxn({ txnData: t, targetGoal, currentSaved });
          return false;
        }
        const baseBankId = targetGoal.contributions?.[0]?.bankId || banks[0]?.id;
        const withdrawal = { id: Date.now().toString(), amount: -Math.abs(t.amount), date: t.date, bankId: baseBankId };
        const updatedSavings = savings.map(g => g.id === goalId ? {...g, contributions: [...(g.contributions||[]), withdrawal]} : g);
        setSavings(updatedSavings);
        await persist(KEYS.savings, updatedSavings);

        const modifiedTxn = { ...t, bankId: baseBankId, bankName: banks.find(b=>b.id===baseBankId)?.name, note: `${t.note || ""} (Paid from Goal: ${targetGoal.name})` };
        return await executeSaveTransaction(modifiedTxn);
      }
    }

    if (t.type === "expense" || t.type === "saving" || t.type === "transfer") {
      const checkBankId = t.type === "transfer" ? t.fromBankId : t.bankId;
      if (bankBalance(checkBankId) < t.amount) {
        HAPTICS.warning();
        setAppAlert({ title: "Insufficient Balance", message: "⚠️ Safe to Spend balance is insufficient!", color: C.red });
        return false;
      }
    }

    return await executeSaveTransaction(t);
  };

  const confirmAndDeductFromBaseBank = async () => {
    if (!pendingOverBudgetTxn) return;
    const { txnData, targetGoal, currentSaved } = pendingOverBudgetTxn;
    const baseBankId = targetGoal.contributions?.[0]?.bankId || banks[0]?.id;
    const wipeContribution = { id: Date.now().toString(), amount: -Math.abs(currentSaved), date: txnData.date, bankId: baseBankId };
    const updatedSavings = savings.map(g => g.id === targetGoal.id ? { ...g, contributions: [...(g.contributions||[]), wipeContribution] } : g);
    setSavings(updatedSavings);
    await persist(KEYS.savings, updatedSavings);

    const finalTxn = {
      ...txnData, bankId: baseBankId, bankName: banks.find(b=>b.id === baseBankId)?.name,
      note: `${txnData.note || ""} (Goal depleted. Deficit covered by base bank)`
    };
    setPendingOverBudgetTxn(null);
    triggerToast("Deficit automatically covered by base bank ✔️");
    await executeSaveTransaction(finalTxn);
  };

  const delTxn = async (id) => { const next = txns.filter(t=>t.id!==id); setTxns(next); await persist(KEYS.txns, next); return next; };
  const updateTxn = async (id, data) => {
    const next = txns.map(t=>t.id===id?{...t,...data}:t);
    setTxns(next); await persist(KEYS.txns, next); return true;
  };

  const saveBanks = async (b) => { setBanks(b); await persist(KEYS.banks,b); };
  const saveExpCats = async (c) => { setExpCats(c); await persist(KEYS.expCats,c); };
  const saveIncCats = async (c) => { setIncCats(c); await persist(KEYS.incCats,c); };
  const saveGroups = async (g) => { setGroups(g); await persist(KEYS.groups,g); };
  const saveSavings = async (s) => { setSavings(s); await persist(KEYS.savings,s); };
  const saveBills = async (b) => { setBills(b); await persist(KEYS.bills,b); };
  const saveBudgets = async (bdg) => { setBudgets(bdg); await persist(KEYS.budgets,bdg); };
  const saveQuickActions = async (qa) => { setQuickActions(qa); await persist(KEYS.quickActions,qa); };
  if (showSplash) return <SplashScreen />;
  if (!hasSeenWelcome) return <WelcomeScreen onStart={() => {save(KEYS.seenWelcome, true); setHasSeenWelcome(true);}} />;

  const filteredTxns = filterMonth==="all" ? txns : txns.filter(t=>t.date.startsWith(filterMonth));
  const activeMonths = [...new Set(txns.map(t=>t.date.slice(0,7)))].sort().reverse();
  const isSubPageActive = ledgerBank || ledgerGroup || ledgerSaving || ledgerBudget || tab === "savings" || tab === "budgets" || tab === "quickactions" || tab === "settings" || tab === "monthly" || tab === "manual";

  return (
    <CurrencyContext.Provider value={currency}>
      <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'DM Sans', sans-serif",maxWidth:520,margin:"0 auto",paddingBottom:isSubPageActive?0:130, position:"relative", userSelect:"none", WebkitUserSelect:"none"}}>
        
        {!ledgerBank && !ledgerGroup && !ledgerSaving && !ledgerBudget ? (
          <>
            {tab==="dashboard" && <Dashboard txns={filteredTxns} bills={bills} budgets={budgets} banks={banks} groups={groups} expCats={expCats} savings={savings} filterMonth={filterMonth} setFilterMonth={setFilterMonth} availMonths={activeMonths} username={username} bankBalance={bankBalance} getBankMetrics={getBankMetrics} txnsAll={txns} onDeleteTxn={delTxn} onUpdateTxn={updateTxn} onOpenBank={(b)=>{ setScrollState({y:window.scrollY, restore:true}); setLedgerBank(b); }} onOpenGroup={(g)=>{ setScrollState({y:window.scrollY, restore:true}); setLedgerGroup(g); }} onOpenSaving={(s)=>{ setScrollState({y:window.scrollY, restore:true}); setLedgerSaving(s); }} onOpenBudget={(bdg)=>{ setScrollState({y:window.scrollY, restore:true}); setLedgerBudget(bdg); }} hideTotal={hideTotal} setHideTotal={setHideTotal} navigateTo={navigateTo} scrollState={scrollState} setScrollState={setScrollState} onBanks={saveBanks} onBudgets={saveBudgets} onSavings={saveSavings} onGroups={saveGroups} onRowClick={setViewTxn} />}
            {tab==="add" && <AddTransaction banks={banks.filter(b=>!b.isArchived)} expCats={expCats} incCats={incCats} savings={savings} onAdd={addTxn} onSaveSavings={saveSavings} onDone={()=>navigateTo("dashboard")} bankBalance={bankBalance} setAppAlert={setAppAlert}/>}
            {tab==="history" && <History txns={txns} onDelete={delTxn} onUpdate={updateTxn} banks={banks} expCats={expCats} incCats={incCats} availMonths={activeMonths} onRowClick={setViewTxn}/>}
            {tab==="monthly" && <MonthlyBills bills={bills} onSave={saveBills} banks={banks} expCats={expCats} onAddTxn={addTxn} delTxn={delTxn} setAppAlert={setAppAlert} availMonths={activeMonths} />}
            {tab==="settings" && <Settings banks={banks} expCats={expCats} incCats={incCats} groups={groups} onBanks={saveBanks} onExpCats={saveExpCats} onIncCats={saveIncCats} onGroups={saveGroups} currency={currency} onCurrency={setCurrencyState} username={username} onUsername={setUsernameState} bankBalance={bankBalance} onOpenSavings={()=>navigateTo("savings")} onOpenBudgets={()=>navigateTo("budgets")} onOpenQuickActions={()=>navigateTo("quickactions")} setLastBackup={setLastBackup} txns={txns} bills={bills} savings={savings} budgets={budgets} setAppAlert={setAppAlert} navigateTo={navigateTo} />}
            {tab==="savings" && <SavingsPage savings={savings} onSave={saveSavings} txns={txns} onBack={()=>navigateTo("settings")} handleEmergencyWithdrawal={handleEmergencyWithdrawal} handleArchiveGoal={handleArchiveGoal} toggleGoalSpendingMode={toggleGoalSpendingMode} />}
            {tab==="budgets" && <BudgetsPage budgets={budgets} expCats={expCats} onSave={saveBudgets} onBack={()=>navigateTo("settings")} txnsAll={txns}/>}
            {tab==="quickactions" && <QuickActionsSetup quickActions={quickActions} expCats={expCats} banks={banks.filter(b=>!b.isArchived)} onSave={saveQuickActions} onBack={()=>navigateTo("settings")} />}
            <BottomNav tab={tab} navigateTo={navigateTo} expCats={expCats} banks={banks} onAdd={addTxn} bankBalance={bankBalance} setAppAlert={setAppAlert} quickActions={quickActions} />
          </>
        ) : (
          <>
            {ledgerBank && <DeepLedgerView title={ledgerBank.name} headerType="bank" headerData={{balance: bankBalance(ledgerBank.id)}} txns={txns.filter(t=>t.bankId===ledgerBank.id || t.fromBankId===ledgerBank.id || t.toBankId===ledgerBank.id)} onDelete={delTxn} onUpdate={updateTxn} banks={banks} expCats={expCats} onClose={()=>setLedgerBank(null)} onRowClick={setViewTxn} />}
            {ledgerGroup && <DeepLedgerView title={ledgerGroup.name} headerType="group" headerData={{spent: txns.filter(t=>t.type==="expense"&&ledgerGroup.cats.includes(t.catId)).reduce((a,t)=>a+t.amount,0), color:ledgerGroup.color}} txns={txns.filter(t=>t.type==="expense"&&ledgerGroup.cats.includes(t.catId))} onDelete={delTxn} onUpdate={updateTxn} banks={banks} expCats={expCats} onClose={()=>setLedgerGroup(null)} onRowClick={setViewTxn} />}
            {ledgerSaving && <DeepLedgerView title={ledgerSaving.name} headerType="saving" headerData={{saved: ledgerSaving.contributions?.reduce((a,c)=>a+c.amount,0)||0, goal:ledgerSaving.goal}} txns={txns.filter(t=>t.type==="saving"&&t.catName===ledgerSaving.name)} onDelete={delTxn} onUpdate={updateTxn} banks={banks} expCats={expCats} onClose={()=>setLedgerSaving(null)} onRowClick={setViewTxn} />}
            {ledgerBudget && <DeepLedgerView title={ledgerBudget.name} headerType="budget" headerData={{spent: txns.filter(t=>t.type==="expense"&&ledgerBudget.cats.includes(t.catId)).reduce((a,t)=>a+t.amount,0), limit:ledgerBudget.amount}} txns={txns.filter(t=>t.type==="expense"&&ledgerBudget.cats.includes(t.catId))} onDelete={delTxn} onUpdate={updateTxn} banks={banks} expCats={expCats} onClose={()=>setLedgerBudget(null)} onRowClick={setViewTxn} />}
          </>
        )}

        {appAlert && <AlertModal title={appAlert.title} message={appAlert.message} btnColor={appAlert.color} onClose={()=>setAppAlert(null)} />}
        {viewTxn && <TransactionDetailsModal txn={viewTxn} onClose={()=>setViewTxn(null)} currency={currency} />}
        {toast && (
          <div style={{ position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1e1e28", border: `1px solid ${C.accent}`, color: "#ffffff", padding: "12px 24px", borderRadius: "12px", fontSize: "14px", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", zIndex: 99999, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✨</span> {toast}
          </div>
        )}
        {pendingOverBudgetTxn && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100000 }}>
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, padding: "24px", borderRadius: "24px", maxWidth: "400px", width: "90%", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
              <h3 style={{ color: "#ffffff", fontSize: "18px", marginBottom: "12px" }}>⚠️ تجاوز رصيد الهدف</h3>
              <p style={{ color: "#aaa", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>الهدف لا يمتلك رصيداً كافياً. سيتم سحب الفارق من الحساب الأساسي.</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={() => setPendingOverBudgetTxn(null)} style={{ flex: 1, padding: "10px", borderRadius: "12px", backgroundColor: "#2a2a38", color: "#fff", border: "none" }}>إلغاء</button>
                <button onClick={confirmAndDeductFromBaseBank} style={{ flex: 1, padding: "10px", borderRadius: "12px", backgroundColor: C.accent, color: "#000", fontWeight: "bold", border: "none" }}>موافق، سحب</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CurrencyContext.Provider>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ txns, bills, budgets, banks, groups, expCats, savings, filterMonth, setFilterMonth, availMonths, username, bankBalance, getBankMetrics, txnsAll, onDeleteTxn, onUpdateTxn, onOpenBank, onOpenGroup, onOpenSaving, onOpenBudget, hideTotal, setHideTotal, navigateTo, scrollState, setScrollState, onBanks, onBudgets, onSavings, onGroups, onRowClick }) {
  const fmtC = useFmt();
  const [recentFilter, setRecentFilter] = useState("all");

  useEffect(() => {
    if (scrollState.restore) { setTimeout(() => window.scrollTo(0, scrollState.y), 50); setScrollState(s => ({ ...s, restore: false })); }
    else window.scrollTo(0, 0);
  }, []);

  const activeBanks = banks.filter(b => !b.isArchived);
  const totalBalance = activeBanks.reduce((s,b)=>s+bankBalance(b.id),0);
  const totalIncome = txns.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
  const totalExp = txns.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
  const currentMonthStr = new Date().toISOString().slice(0,7);
  
  const isCurrentMonth = filterMonth === currentMonthStr || filterMonth === "all";
  const billsForMonth = isCurrentMonth ? currentMonthStr : filterMonth;
  const paidBillsCount = bills.filter(b=>b.payments?.some(p=>p.month===billsForMonth)).length;
  const totalBillsCount = bills.length;
  const remainingBillsAmount = bills.filter(b=>!b.payments?.some(p=>p.month===billsForMonth)).reduce((sum,b)=>sum+b.amount,0);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate() + 1);

  const spendingGroups = groups.filter(g=>{ const t=txns.filter(tx=>tx.type==="expense"&&g.cats.includes(tx.catId)).reduce((a,tx)=>a+tx.amount,0); return t>0; });
  const recentsFiltered = txns.filter(t => { if (recentFilter === "expenses") return t.type === "expense"; if (recentFilter === "income") return t.type === "income"; return true; }).slice(0, 5);

  return (
    <div style={{padding:"24px 16px 0"}}>
      {username && (
        <div style={{marginBottom:18}}>
          <div style={{color:C.text,fontSize:24,fontWeight:800,letterSpacing:-0.5}}>Hello, {username} 💰</div>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{color:C.text,fontSize:20,fontWeight:800}}>Overview</div>
        <MonthSelect value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} availMonths={availMonths} />
      </div>

      <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Accounts</div>
      <Card style={{padding:"16px 18px",marginBottom:10,background:"linear-gradient(135deg,#1e1e28 0%,#23232f 100%)",borderColor:C.faint}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Total Balance (Safe to Spend)</div>
            <div style={{color:C.text,fontSize:30,fontWeight:800,letterSpacing:-1}}>{hideTotal?"••••••":fmtC(totalBalance)}</div>
          </div>
          <button onClick={()=>setHideTotal(v=>!v)} style={{background:C.border,border:"none",color:C.muted,width:36,height:36,borderRadius:99,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{hideTotal?"🙈":"🐵"}</button>
        </div>
      </Card>

      <div style={{marginBottom:20}}>
        <SortableList grid items={activeBanks} onReorder={onBanks} renderItem={(b) => {
          const { lockedAmount, safeToSpend } = getBankMetrics(b.id);
          return (
            <Card onClick={()=>onOpenBank(b)} className="interactive-card" style={{padding:"14px 14px 12px", cursor:"pointer", transition:"transform 0.1s ease", height:"100%", boxSizing:"border-box"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:99,background:b.color,flexShrink:0}}/><span style={{color:C.muted,fontSize:12,fontWeight:600}}>{b.name}</span></div>
                {b.lowBalanceThreshold && safeToSpend <= b.lowBalanceThreshold && safeToSpend >= 0 && <span style={{fontSize:14}}>🔻</span>}
                {safeToSpend < 0 && <span style={{fontSize:14}}>🔴</span>}
              </div>
              <div style={{color:safeToSpend<0?C.red:b.lowBalanceThreshold&&safeToSpend<=b.lowBalanceThreshold?C.yellow:C.text,fontSize:17,fontWeight:800}}>{hideTotal?"••••":fmtC(safeToSpend)}</div>
              {lockedAmount > 0 && !hideTotal && (
                <div style={{ fontSize: "11px", color: C.faint, marginTop: "6px" }}>🔒 Locked: {fmtC(lockedAmount)}</div>
              )}
            </Card>
          );
        }} />
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        <Card style={{padding:"14px 14px 12px"}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Income</div>
          <div style={{color:C.accent,fontSize:20,fontWeight:800,marginBottom:4}}>{hideTotal?"••••":fmtC(totalIncome)}</div>
        </Card>
        <Card style={{padding:"14px 14px 12px"}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Expenses</div>
          <div style={{color:C.red,fontSize:20,fontWeight:800,marginBottom:4}}>{hideTotal?"••••":fmtC(totalExp)}</div>
        </Card>
      </div>

      {bills.length > 0 && (
        <>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Monthly Bills</div>
          {filterMonth === "all" ? (
            <Card className="interactive-card" style={{padding:"14px", marginBottom:20}}>
              <div style={{ fontSize: "13px", color: "#888899", marginBottom: "8px" }}>📅 Upcoming this month:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {bills.filter(bill => bill.dueDay && bill.dueDay >= new Date().getDate()).sort((a, b) => a.dueDay - b.dueDay).slice(0, 3).map(bill => (
                  <div key={bill.id} style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#1e1e28", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: "13px", color: "#ffffff" }}>{bill.name}</span>
                    <span style={{ fontSize: "13px", color: C.yellow, fontWeight: "500" }}>Day {bill.dueDay} ({fmtC(bill.amount)})</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card onClick={() => navigateTo("monthly", true)} className="interactive-card" style={{padding:"14px", marginBottom:20, cursor:"pointer"}}>
              {(()=>{ const allPaid = paidBillsCount === totalBillsCount; const billColor = allPaid ? C.accent : C.red; return (<>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{color:C.text,fontWeight:700,fontSize:14}}>{allPaid?"✅ All Paid":"⚡ Upcoming"}</span>
                  <Pill color={billColor}>{paidBillsCount}/{totalBillsCount} Paid</Pill>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{color:billColor,fontSize:18,fontWeight:800}}>{hideTotal?"••••":allPaid?fmtC(0):fmtC(remainingBillsAmount)}</span>
                  <span style={{color:C.muted,fontSize:13}}>{allPaid?"cleared ✓":"remaining"}</span>
                </div>
                <ProgressBar value={paidBillsCount} max={totalBillsCount} color={billColor}/>
              </>); })()}
            </Card>
          )}
        </>
      )}

      {budgets.length > 0 && (
        <>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Monthly Budgets</div>
          <div style={{marginBottom:20}}>
            <SortableList items={budgets} onReorder={onBudgets} renderItem={(bdg) => {
              if (filterMonth === "all") {
                const totalHist = txnsAll.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);
                const catHist = txnsAll.filter(t => t.type === "expense" && bdg.cats.includes(t.catId)).reduce((a, t) => a + t.amount, 0);
                const pct = totalHist > 0 ? ((catHist / totalHist) * 100).toFixed(1) : 0;
                return (
                  <Card onClick={()=>onOpenBudget(bdg)} className="interactive-card" style={{padding:"14px", cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <span style={{color:C.text,fontSize:14,fontWeight:700}}>{bdg.name}</span>
                      <span style={{ fontSize: "12px", color: C.accent }}>Avg: {pct}%</span>
                    </div>
                    <div style={{color:C.muted,fontSize:11}}>Historical Total: <span style={{color:C.text,fontWeight:700}}>{hideTotal?"••••":fmtC(catHist)}</span></div>
                  </Card>
                );
              }
              const spent = txnsAll.filter(t=>t.type==="expense"&&t.date.startsWith(currentMonthStr)&&bdg.cats.includes(t.catId)).reduce((a,t)=>a+t.amount,0);
              const remaining = Math.max(0, bdg.amount - spent);
              const pct = bdg.amount > 0 ? Math.min(100, Math.round((spent/bdg.amount)*100)) : 0;
              const barColor = pct >= 90 ? C.red : pct >= 70 ? C.yellow : C.accent;
              return (
                <Card onClick={()=>onOpenBudget(bdg)} className="interactive-card" style={{padding:"14px", cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{color:C.text,fontSize:14,fontWeight:700}}>{bdg.name}</span>
                    <Pill color={barColor}>{pct}%</Pill>
                  </div>
                  <div style={{color:C.muted,fontSize:11,marginBottom:6}}>Spent <span style={{color:C.text,fontWeight:700}}>{hideTotal?"••••":fmtC(spent)}</span> of {hideTotal?"••••":fmtC(bdg.amount)}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{color:remaining===0?C.red:C.accent,fontSize:18,fontWeight:800}}>{hideTotal?"••••":fmtC(remaining)} left</span>
                  </div>
                  <ProgressBar value={spent} max={bdg.amount} color={barColor}/>
                </Card>
              );
            }}/>
          </div>
        </>
      )}

      {savings.filter(s => s.status === "active").length > 0 && (
        <>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>Savings Goals</div>
          <div style={{marginBottom:20}}>
            <SortableList items={savings.filter(s => s.status === "active")} onReorder={onSavings} renderItem={(s) => {
              const saved = s.contributions?.reduce((a,c)=>a+c.amount,0) || 0;
              const pct = s.goal ? Math.min(100, Math.round((saved/s.goal)*100)) : 0;
              return (
                <Card onClick={()=>onOpenSaving(s)} className="interactive-card" style={{padding:"14px", cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{color:C.text,fontWeight:700,fontSize:14}}>🎯 {s.name}</span>
                    <div style={{display:"flex", gap:"6px", alignItems:"center"}}>
                      {s.spendingMode && <span style={{fontSize:"12px"}} title="Spending Mode">🟢</span>}
                      <Pill color={C.yellow}>{pct}%</Pill>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{color:C.yellow,fontSize:18,fontWeight:800}}>{hideTotal?"••••":fmtC(saved)}</span>
                    <span style={{color:C.muted,fontSize:13}}>of {fmtC(s.goal)}</span>
                  </div>
                  <ProgressBar value={saved} max={s.goal} color={C.yellow}/>
                </Card>
              );
            }}/>
          </div>
        </>
      )}
      {spendingGroups.length > 0 && (
        <>
          <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>
            {filterMonth === "all" ? "المتوسط الشهري للإنفاق" : "Spending"}
          </div>
          <div style={{marginBottom:20}}>
            <SortableList grid items={spendingGroups} onReorder={(orderedGroups) => {
              const merged = [...groups];
              orderedGroups.forEach((og, i) => { const idx = merged.findIndex(g=>g.id===og.id); if(idx>-1) { merged.splice(idx,1); merged.splice(i,0,og); } });
              onGroups(merged);
            }} renderItem={(g) => {
              const total = txns.filter(t=>t.type==="expense"&&g.cats.includes(t.catId)).reduce((a,t)=>a+t.amount,0);
              let displayAmount = total;
              let subText = totalExp ? Math.round((total/totalExp)*100) + "% of total" : "0% of total";
              
              if (filterMonth === "all") {
                 const uniqueMonths = [...new Set(txnsAll.map(t => t.date.slice(0, 7)))];
                 const monthsCount = uniqueMonths.length || 1;
                 displayAmount = total / monthsCount;
                 subText = "المتوسط الشهري التاريخي";
              }

              return (
                <Card onClick={()=>onOpenGroup(g)} className="interactive-card" style={{padding:"14px", cursor:"pointer", height:"100%", boxSizing:"border-box"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><div style={{width:8,height:8,borderRadius:99,background:g.color}}/><span style={{color:C.muted,fontSize:12,fontWeight:600}}>{g.name}</span></div>
                  <div style={{color:g.color,fontSize:17,fontWeight:800,marginBottom:6}}>{hideTotal?"••••":fmtC(displayAmount)}</div>
                  {filterMonth !== "all" && <ProgressBar value={total} max={totalExp} color={g.color}/>}
                  <div style={{color:C.faint,fontSize:10,fontWeight:700,marginTop:4}}>{subText}</div>
                </Card>
              );
            }}/>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Settings / Soft Delete Logic V1.2 ────────────────────────────────────────
function Settings({ banks, expCats, incCats, groups, onBanks, onExpCats, onIncCats, onGroups, currency, onCurrency, username, onUsername, bankBalance, onOpenSavings, onOpenBudgets, onOpenQuickActions, setLastBackup, txns, bills, savings, budgets, setAppAlert, navigateTo }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [section, setSection] = useState("profile");
  const [modal, setModal] = useState(null);
  const [inputName, setInputName] = useState("");
  const [inputColor, setInputColor] = useState(C.accent);
  const [inputGroup, setInputGroup] = useState("daily");
  const [inputIcon, setInputIcon] = useState("others");
  const [groupCats, setGroupCats] = useState([]);
  const [inputThreshold, setInputThreshold] = useState("");
  const [nameInput, setNameInput] = useState(username||"");
  const [confirmDel, setConfirmDel] = useState(null);

  const openAdd = (type, item=null) => { setModal({type,item}); setInputName(item?.name||""); setInputColor(item?.color||C.accent); setInputGroup(item?.group||"daily"); setInputIcon(item?.icon||"others"); setGroupCats(item?.cats||[]); setInputThreshold(item?.lowBalanceThreshold?String(item.lowBalanceThreshold):""); };

  const handleSave = async () => {
    if(!inputName.trim()) return;
    const id = modal.item?.id||Date.now().toString();
    const thresh = parseFloat(inputThreshold); const threshVal = !isNaN(thresh)&&thresh>0?thresh:undefined;
    
    if(modal.type==="bank") {
      await onBanks(modal.item ? banks.map(b=>b.id===id?{...b,name:inputName,color:inputColor,lowBalanceThreshold:threshVal}:b) : [...banks,{id,name:inputName,color:inputColor,lowBalanceThreshold:threshVal, isArchived: false}]);
    } else if(modal.type==="expCat") {
      await onExpCats(modal.item ? expCats.map(c=>c.id===id?{...c,name:inputName,icon:inputIcon,group:inputGroup}:c) : [...expCats,{id,name:inputName,icon:inputIcon,group:inputGroup, isArchived: false}]);
    } else if(modal.type==="incCat") {
      await onIncCats(modal.item ? incCats.map(c=>c.id===id?{...c,name:inputName,icon:inputIcon}:c) : [...incCats,{id,name:inputName,icon:inputIcon, isArchived: false}]);
    } else if(modal.type==="group") {
      await onGroups(modal.item ? groups.map(g=>g.id===id?{id,name:inputName,color:inputColor,cats:groupCats}:g) : [...groups,{id,name:inputName,color:inputColor,cats:groupCats}]);
    }
    setModal(null);
  };

  const getDelBankError = (b) => {
    if (bankBalance(b.id) !== 0) return `Cannot archive "${b.name}" — it has a balance of ${fmt(bankBalance(b.id), currency)}. Clear balance first.`;
    const usedInBills = bills.some(bill => bill.sourceId === b.id && !bill.isArchived);
    if (usedInBills) return `Cannot archive "${b.name}" — it is used in active bills.`;
    return null;
  };

  const doDelete = async () => {
    const {type,item} = confirmDel;
    if(type==="bank") await onBanks(banks.map(b => b.id === item.id ? { ...b, isArchived: true } : b));
    else if(type==="expCat") await onExpCats(expCats.map(c => c.id === item.id ? { ...c, isArchived: true } : c));
    else if(type==="incCat") await onIncCats(incCats.map(c => c.id === item.id ? { ...c, isArchived: true } : c));
    else if(type==="group") await onGroups(groups.filter(g=>g.id!==item.id));
    setConfirmDel(null);
  };

  const iconKeys = Object.keys(ICONS).filter(k=>!["dashboard","add","settings","saving","bills_nav","income","expense","transfer","close","check","trash","edit","bank","cash","goal","budget"].includes(k));

  return (
    <div style={{padding:"24px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{color:C.text,fontSize:22,fontWeight:800}}>Settings</div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
        {[{id:"profile",label:"👤 General"},{id:"currency",label:"💱 Currency"},{id:"banks",label:"🏦 Accounts"},{id:"expCats",label:"📤 Exp. Cat."},{id:"incCats",label:"💰 Inc. Cat."},{id:"groups",label:"📊 Groups"}].map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)} style={{whiteSpace:"nowrap",padding:"8px 14px",borderRadius:10,border:`1px solid ${section===s.id?C.accent:C.border}`,background:section===s.id?C.accentDim:"transparent",color:section===s.id?C.accent:C.muted,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans', sans-serif"}}>{s.label}</button>
        ))}
      </div>

      {section==="profile" && (
        <div style={{paddingBottom:20}}>
          <div onClick={onOpenSavings} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18,color:C.yellow}}>◎</span><span style={{color:C.text,fontWeight:600,fontSize:14}}>Savings Goals</span></div><span style={{color:C.muted}}>❯</span></div>
          <div onClick={onOpenBudgets} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18,color:C.accent}}>📊</span><span style={{color:C.text,fontWeight:600,fontSize:14}}>Monthly Budgets</span></div><span style={{color:C.muted}}>❯</span></div>
          <div onClick={onOpenQuickActions} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",marginBottom:20}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18,color:C.blue}}>⚡</span><span style={{color:C.text,fontWeight:600,fontSize:14}}>Quick Actions</span></div><span style={{color:C.muted}}>❯</span></div>
          <Card style={{marginBottom:16}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Your Name</div>
            <input value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="Enter name..." style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:12,fontFamily:"'DM Sans', sans-serif"}}/>
            <Btn full onClick={()=>{onUsername(nameInput.trim());setAppAlert({title:"Profile Updated",message:"Name updated successfully!",color:C.accent});}}>Save Name</Btn>
          </Card>
          <AppFooter />
        </div>
      )}

      {section==="banks" && (
        <>
          <div style={{display:"flex",flexDirection:"column"}}>
            {banks.filter(b => !b.isArchived).map(b=>(
              <SwipeRow key={b.id} onEdit={()=>openAdd("bank",b)} onDelete={()=>{
                const err = getDelBankError(b);
                if (err) setAppAlert({title:"Action Blocked", message:err, color:C.red});
                else setConfirmDel({type:"bank",item:b});
              }}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:10,height:10,borderRadius:99,background:b.color}}/><span style={{color:C.text,fontWeight:600,fontSize:14}}>{b.name}</span></div>
                  <span style={{color:bankBalance(b.id)<0?C.red:C.muted,fontSize:13,fontWeight:700}}>{fmt(bankBalance(b.id), currency)}</span>
                </div>
              </SwipeRow>
            ))}
          </div>
          <Btn outline full onClick={()=>openAdd("bank")} style={{marginTop:8}}>+ Add Account</Btn>
        </>
      )}

      {section==="expCats" && (
        <>
          <div style={{display:"flex",flexDirection:"column"}}>
            {expCats.filter(c => !c.isArchived).map(c=>(
              <SwipeRow key={c.id} onEdit={()=>openAdd("expCat",c)} onDelete={()=>setConfirmDel({type:"expCat",item:c})}>
                <div style={{display:"flex",alignItems:"center",padding:"14px 16px"}}><span style={{fontSize:18,marginRight:10}}>{ICONS[c.icon]||"📌"}</span><span style={{color:C.text,fontWeight:600,fontSize:14}}>{c.name}</span></div>
              </SwipeRow>
            ))}
          </div>
          <Btn outline full onClick={()=>openAdd("expCat")} style={{marginTop:8}}>+ Add Expense Category</Btn>
        </>
      )}

      {section==="incCats" && (
        <>
          <div style={{display:"flex",flexDirection:"column"}}>
            {incCats.filter(c => !c.isArchived).map(c=>(
              <SwipeRow key={c.id} onEdit={()=>openAdd("incCat",c)} onDelete={()=>setConfirmDel({type:"incCat",item:c})}>
                <div style={{display:"flex",alignItems:"center",padding:"14px 16px"}}><span style={{fontSize:18,marginRight:10}}>{ICONS[c.icon]||"💰"}</span><span style={{color:C.text,fontWeight:600,fontSize:14}}>{c.name}</span></div>
              </SwipeRow>
            ))}
          </div>
          <Btn outline full onClick={()=>openAdd("incCat")} style={{marginTop:8}}>+ Add Income Category</Btn>
        </>
      )}

      {section==="groups" && (
        <>
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {groups.map(g=>(
              <SwipeRow key={g.id} onEdit={()=>openAdd("group",g)} onDelete={()=>setConfirmDel({type:"group",item:g})}>
                <div style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><div style={{width:10,height:10,borderRadius:99,background:g.color,flexShrink:0}}/><span style={{color:C.text,fontWeight:700,fontSize:14}}>{g.name}</span></div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,paddingLeft:20}}>
                    {g.cats.map(cid=>{const cat=expCats.find(c=>c.id===cid);return cat?<span key={cid} style={{background:g.color+"22",color:g.color,border:`1px solid ${g.color}44`,borderRadius:99,padding:"2px 8px",fontSize:11,fontWeight:700}}>{cat.name}</span>:null;})}
                  </div>
                </div>
              </SwipeRow>
            ))}
          </div>
          <Btn outline full onClick={()=>openAdd("group")} style={{marginTop:8}}>+ Add Group</Btn>
        </>
      )}

      {modal && (
        <Modal title={`${modal.item?"Edit":"Add"} ${modal.type==="bank"?"Account":modal.type==="expCat"?"Expense Category":modal.type==="incCat"?"Income Category":"Group"}`} onClose={()=>setModal(null)} center={false}>
          <Input label="Name" value={inputName} onChange={e=>setInputName(e.target.value)}/>
          {modal.type==="bank" && (<>
            <div style={{marginBottom:14}}><div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>Color</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[C.accent,C.red,C.blue,C.yellow,C.purple,"#fb923c","#34d399","#f472b6"].map(col=>(<button key={col} onClick={()=>setInputColor(col)} style={{width:28,height:28,borderRadius:99,background:col,border:inputColor===col?"3px solid white":"3px solid transparent",cursor:"pointer"}}/>))}</div></div>
            <div style={{marginBottom:14}}><div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>Low Balance Alert</div><input type="number" min="0" placeholder="e.g. 200" value={inputThreshold} onChange={e=>setInputThreshold(e.target.value)} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans', sans-serif"}}/><div style={{color:C.faint,fontSize:11,marginTop:4}}>Show 🔻 when balance falls below this amount (0 = disabled)</div></div>
          </>)}
          {(modal.type==="expCat"||modal.type==="incCat") && (<div style={{marginBottom:14}}><div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:8,textTransform:"uppercase"}}>Icon</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{iconKeys.map(k=><button key={k} onClick={()=>setInputIcon(k)} style={{width:36,height:36,borderRadius:8,background:inputIcon===k?C.accentDim:C.bg,border:`1px solid ${inputIcon===k?C.accent:C.border}`,cursor:"pointer",fontSize:18,fontFamily:"'DM Sans', sans-serif"}}>{ICONS[k]}</button>)}</div></div>)}
          {modal.type==="expCat" && (<Select label="Group Tag" value={inputGroup} onChange={e=>setInputGroup(e.target.value)}>{["daily","fixed","lifestyle","growth","other"].map(g=><option key={g} value={g}>{g}</option>)}</Select>)}
          {modal.type==="group" && (<>
            <div style={{marginBottom:14}}><div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Color</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{[C.accent,C.red,C.blue,C.yellow,C.purple,"#fb923c","#34d399","#f472b6"].map(col=>(<button key={col} onClick={()=>setInputColor(col)} style={{width:28,height:28,borderRadius:99,background:col,border:inputColor===col?"3px solid white":"3px solid transparent",cursor:"pointer"}}/>))}</div></div>
            <div style={{marginBottom:14}}><div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Categories</div><div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflow:"auto",background:C.bg,padding:10,borderRadius:10,border:`1px solid ${C.border}`}}>{expCats.filter(c => !c.isArchived).map(c=>{const checked=groupCats.includes(c.id);return(<label key={c.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"4px 0",userSelect:"none"}}><div onClick={()=>setGroupCats(checked?groupCats.filter(x=>x!==c.id):[...groupCats,c.id])} style={{width:18,height:18,borderRadius:4,border:`2px solid ${checked?C.accent:C.faint}`,background:checked?C.accentDim:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{checked&&<span style={{color:C.accent,fontSize:12}}>✓</span>}</div><span style={{color:C.text,fontSize:14}}>{ICONS[c.icon]||"📌"} {c.name}</span></label>);})}</div></div>
          </>)}
          <Btn full onClick={handleSave} style={{marginTop:8}}>Save</Btn>
        </Modal>
      )}
      {confirmDel && <ConfirmModal title="Archive?" message="This action will hide this item from future use." onClose={()=>setConfirmDel(null)} onConfirm={doDelete}/>}
    </div>
  );
}
// ─── SavingsPage V1.2 ─────────────────────────────────────────────────────────
function SavingsPage({ savings, onSave, txns, onBack, handleEmergencyWithdrawal, handleArchiveGoal, toggleGoalSpendingMode }) {
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const fmtC = useFmt();
  const [viewTab, setViewTab] = useState("active");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [editId, setEditId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [nameError, setNameError] = useState("");
  const [goalError, setGoalError] = useState("");
  
  const [withdrawGoal, setWithdrawGoal] = useState(null);
  const [withdrawAmt, setWithdrawAmt] = useState("");

  const handleAdd = async () => {
    let valid = true;
    if (!name.trim()) { setNameError("Goal name is required"); valid = false; }
    const parsedGoal = parseFloat(goal);
    if (!goal || isNaN(parsedGoal) || parsedGoal <= 0) { setGoalError("Please enter a valid target amount"); valid = false; }
    if (!valid) return;
    if (editId) await onSave(savings.map(s=>s.id===editId?{...s,name,goal:parsedGoal}:s));
    else await onSave([...savings,{id:Date.now().toString(),name,goal:parsedGoal,contributions:[],status:"active",spendingMode:false}]);
    setName(""); setGoal(""); setNameError(""); setGoalError(""); setShowAdd(false); setEditId(null);
  };

  const startEdit = (s) => { setEditId(s.id); setName(s.name); setGoal(s.goal); setNameError(""); setGoalError(""); setShowAdd(true); };

  const displayedGoals = savings.filter(s => viewTab === "active" ? s.status === "active" : s.status === "archived");

  return (
    <div style={{padding:"24px 16px", minHeight:"100vh", background:C.bg, boxSizing:"border-box"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:C.muted,fontSize:22,cursor:"pointer",padding:"10px 15px 10px 0",display:"flex",alignItems:"center",marginRight:4}}><span style={{display:"block",transform:"translateY(-1px)"}}>❮</span></button>
          <div style={{color:C.text,fontSize:22,fontWeight:800}}>Saving Goals</div>
        </div>
        <Btn small onClick={()=>{setEditId(null);setName("");setGoal("");setNameError("");setGoalError("");setShowAdd(true);}}>+ New Goal</Btn>
      </div>

      <div style={{display:"flex", gap:8, marginBottom:20}}>
        <button onClick={()=>setViewTab("active")} style={{flex:1, padding:"8px", borderRadius:"10px", border:`1px solid ${viewTab==="active"?C.accent:C.border}`, background:viewTab==="active"?C.accentDim:"transparent", color:viewTab==="active"?C.accent:C.muted, fontWeight:700, fontSize:13, fontFamily:"'DM Sans', sans-serif"}}>Active</button>
        <button onClick={()=>setViewTab("archived")} style={{flex:1, padding:"8px", borderRadius:"10px", border:`1px solid ${viewTab==="archived"?C.accent:C.border}`, background:viewTab==="archived"?C.accentDim:"transparent", color:viewTab==="archived"?C.accent:C.muted, fontWeight:700, fontSize:13, fontFamily:"'DM Sans', sans-serif"}}>Archived</button>
      </div>

      {displayedGoals.length===0 && <EmptyState icon="◎" message={`No ${viewTab} saving goals.`} />}
      
      <div style={{marginBottom:20}}>
        <SortableList items={displayedGoals} onReorder={onSave} renderItem={(s) => {
          const contributions = s.contributions||[];
          const saved = contributions.reduce((a,c)=>a+(c.amount||0),0);
          const pct = s.goal ? Math.min(100,Math.round((saved/s.goal)*100)) : 0;
          return (
            <SwipeRow key={s.id} onEdit={()=>startEdit(s)} onDelete={()=>setConfirmId(s.id)}>
              <div style={{padding:16, opacity: s.status==="archived"?0.6:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div><div style={{color:C.text,fontWeight:700,fontSize:17}}>{s.name}</div><div style={{color:C.muted,fontSize:12,marginTop:2}}>Goal: {fmtC(s.goal)}</div></div>
                  <Pill color={C.yellow}>{pct}%</Pill>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:C.yellow,fontSize:18,fontWeight:800}}>{fmtC(saved)}</span><span style={{color:C.muted,fontSize:13}}>{fmtC(Math.max(0,s.goal-saved))} left</span></div>
                <ProgressBar value={saved} max={s.goal} color={C.yellow}/>
                
                {viewTab === "active" && (
                  <div style={{display:"flex", gap:"8px", marginTop:"16px", flexWrap:"wrap"}}>
                    <button onClick={(e)=>{ e.stopPropagation(); toggleGoalSpendingMode(s.id); }} style={{flex:1, background:"transparent", border:`1px solid ${s.spendingMode?C.yellow:C.border}`, color:s.spendingMode?C.yellow:C.muted, borderRadius:"8px", padding:"6px", fontSize:"11px", fontWeight:"bold", cursor:"pointer", fontFamily:"'DM Sans', sans-serif"}}>
                      {s.spendingMode ? "🟢 Spending ON" : "🔴 Spending OFF"}
                    </button>
                    <button onClick={(e)=>{ e.stopPropagation(); setWithdrawGoal(s); }} style={{flex:1, background:"transparent", border:`1px solid ${C.redDim}`, color:C.red, borderRadius:"8px", padding:"6px", fontSize:"11px", fontWeight:"bold", cursor:"pointer", fontFamily:"'DM Sans', sans-serif"}}>
                      Withdraw 💸
                    </button>
                    <button onClick={(e)=>{ e.stopPropagation(); handleArchiveGoal(s.id); }} style={{flex:1, background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:"8px", padding:"6px", fontSize:"11px", fontWeight:"bold", cursor:"pointer", fontFamily:"'DM Sans', sans-serif"}}>
                      Archive 🗄️
                    </button>
                  </div>
                )}
              </div>
            </SwipeRow>
          );
        }} />
      </div>

      {showAdd && (
        <Modal title={editId?"Edit Goal":"New Saving Goal"} onClose={()=>{setShowAdd(false);setEditId(null);}} center={false}>
          <Input label="Goal Name" placeholder="e.g. Travel Fund..." value={name} onChange={e=>{setName(e.target.value);setNameError("");}} error={nameError}/>
          <Input label="Target Amount" type="number" step="any" value={goal} onChange={e=>{setGoal(e.target.value);setGoalError("");}} error={goalError}/>
          <Btn full onClick={handleAdd}>{editId?"Update Goal":"Create Goal"}</Btn>
        </Modal>
      )}
      
      {withdrawGoal && (
        <Modal title={`Withdraw from ${withdrawGoal.name}`} onClose={()=>{setWithdrawGoal(null);setWithdrawAmt("");}} center={true}>
          <Input label="Amount to Withdraw" type="number" step="any" value={withdrawAmt} onChange={e=>setWithdrawAmt(e.target.value)} placeholder="0.00" />
          <Btn full color={C.red} onClick={()=>{ handleEmergencyWithdrawal(withdrawGoal.id, parseFloat(withdrawAmt)); setWithdrawGoal(null); setWithdrawAmt(""); }}>Confirm Withdrawal</Btn>
        </Modal>
      )}

      {confirmId && <ConfirmModal title="Delete Goal?" message="This will permanently delete this saving goal." onClose={()=>setConfirmId(null)} onConfirm={async()=>{await onSave(savings.filter(s=>s.id!==confirmId));setConfirmId(null);}} />}
    </div>
  );
}

// ─── BudgetsPage ──────────────────────────────────────────────────────────────
function BudgetsPage({ budgets, expCats, onSave, onBack }) {
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const currency = useCurrency();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [confirmId, setConfirmId] = useState(null);

  const startEdit = (b) => { setEditId(b.id); setName(b.name); setAmount(b.amount); setSelectedCats(b.cats||[]); setShowAdd(true); };

  const handleAdd = async () => {
    if (!name.trim() || !amount || selectedCats.length === 0) return;
    const parsedAmt = parseFloat(amount);
    if (editId) await onSave(budgets.map(b=>b.id===editId?{...b,name,amount:parsedAmt,cats:selectedCats}:b));
    else await onSave([...budgets,{id:Date.now().toString(),name,amount:parsedAmt,cats:selectedCats}]);
    setShowAdd(false); setEditId(null); setName(""); setAmount(""); setSelectedCats([]);
  };

  return (
    <div style={{padding:"24px 16px", minHeight:"100vh", background:C.bg, boxSizing:"border-box"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:C.muted,fontSize:22,cursor:"pointer",padding:"10px 15px 10px 0"}}><span style={{display:"block",transform:"translateY(-1px)"}}>❮</span></button>
          <div style={{color:C.text,fontSize:22,fontWeight:800}}>Budgets</div>
        </div>
        <Btn small onClick={()=>{setEditId(null);setName("");setAmount("");setSelectedCats([]);setShowAdd(true);}}>+ Add Budget</Btn>
      </div>
      {budgets.length===0 && <EmptyState icon="📊" message="Set custom budgeting categories for precise monthly guardrails." />}
      <div style={{marginBottom:20}}>
        <SortableList items={budgets} onReorder={onSave} renderItem={(b) => (
          <SwipeRow key={b.id} onEdit={()=>startEdit(b)} onDelete={()=>setConfirmId(b.id)}>
            <div style={{padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{color:C.text,fontWeight:700,fontSize:17}}>{b.name}</div>
                <div style={{color:C.accent,fontSize:18,fontWeight:800}}>{fmt(b.amount, currency)}</div>
              </div>
              <div style={{color:C.muted,fontSize:12,marginBottom:10}}>Monitoring {b.cats.length} expense categories</div>
            </div>
          </SwipeRow>
        )} />
      </div>
      {showAdd && (
        <Modal title={editId?"Modify Budget":"Configure Budget"} onClose={()=>{setShowAdd(false);setEditId(null);}} center={false}>
          <Input label="Budget Name" value={name} onChange={e=>setName(e.target.value)} />
          <Input label={`Monthly Limit (${currency})`} type="number" step="any" value={amount} onChange={e=>setAmount(e.target.value)} />
          <div style={{marginBottom:14}}>
            <div style={{color:C.muted,fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Categories</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:160,overflow:"auto",background:C.bg,padding:10,borderRadius:10,border:`1px solid ${C.border}`}}>
              {expCats.filter(c => !c.isArchived).map(c=>{
                const checked = selectedCats.includes(c.id);
                return (
                  <label key={c.id} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"5px 0",userSelect:"none"}}>
                    <div onClick={()=>{setSelectedCats(checked?selectedCats.filter(x=>x!==c.id):[...selectedCats,c.id]);}} style={{width:18,height:18,borderRadius:4,border:`2px solid ${checked?C.accent:C.faint}`,background:checked?C.accentDim:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{checked&&<span style={{color:C.accent,fontSize:12}}>✓</span>}</div>
                    <span style={{color:C.text,fontSize:14}}>{ICONS[c.icon]||"📌"} {c.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <Btn full onClick={handleAdd}>Save Budget</Btn>
        </Modal>
      )}
      {confirmId && <ConfirmModal title="Delete Budget?" message="This removes the budget limit." onClose={()=>setConfirmId(null)} onConfirm={async()=>{await onSave(budgets.filter(b=>b.id!==confirmId));setConfirmId(null);}}/>}
    </div>
  );
}

// ─── QuickActionsSetup ────────────────────────────────────────────────────────
function QuickActionsSetup({ quickActions, expCats, banks, onSave, onBack }) {
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const [editingId, setEditingId] = useState(null);
  const [catId, setCatId] = useState("");
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState("");

  const openConfigure = (q) => { setEditingId(q.id); setCatId(q.catId||(expCats[0]?.id||"")); setAmount(q.amount||"50"); setBankId(q.bankId||(banks[0]?.id||"")); };
  const handleCommitShortcut = async () => { await onSave(quickActions.map(q=>q.id===editingId?{...q,catId,amount,bankId}:q)); setEditingId(null); };
  const handleClearShortcut = async (id) => { await onSave(quickActions.map(q=>q.id===id?{...q,catId:"",amount:"",bankId:""}:q)); };

  return (
    <div style={{padding:"24px 16px", minHeight:"100vh", background:C.bg, boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",gap:8, marginBottom:20}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:C.muted,fontSize:22,cursor:"pointer",padding:"10px 15px 10px 0"}}><span style={{display:"block",transform:"translateY(-1px)"}}>❮</span></button>
        <div style={{color:C.text,fontSize:22,fontWeight:800}}>Quick Actions Slots</div>
      </div>
      <p style={{color:C.muted, fontSize:13, lineHeight:1.5, marginBottom:18}}>Configure up to 4 shortcuts available when long pressing the + button.</p>
      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        {quickActions.map((q, idx) => {
          const cat = expCats.find(c=>c.id===q.catId);
          const bank = banks.find(b=>b.id===q.bankId);
          return (
            <Card key={q.id} style={{padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <div style={{color:C.text, fontWeight:700, fontSize:15}}>Slot #{idx+1}: {cat?`${ICONS[cat.icon]} ${cat.name}`:"Disabled / Empty"}</div>
                {cat && <div style={{color:C.muted, fontSize:12, marginTop:4}}>Amount: {fmt(parseFloat(q.amount))} · Account: {bank?.name}</div>}
              </div>
              <div style={{display:"flex", gap:8}}>
                <Btn small onClick={()=>openConfigure(q)} color={C.blue} outline>Setup</Btn>
                {q.catId && <Btn small onClick={()=>handleClearShortcut(q.id)} color={C.red} outline style={{padding:"5px 10px"}}>✕</Btn>}
              </div>
            </Card>
          );
        })}
      </div>
      {editingId && (
        <Modal title="Configure Shortcut" onClose={()=>setEditingId(null)} center={false}>
          <Select label="Expense Category" value={catId} onChange={e=>setCatId(e.target.value)}>{expCats.filter(c=>!c.isArchived).map(c=><option key={c.id} value={c.id}>{ICONS[c.icon]} {c.name}</option>)}</Select>
          <Input label="Default Amount" type="number" step="any" value={amount} onChange={e=>setAmount(e.target.value)} />
          <Select label="Default Account" value={bankId} onChange={e=>setBankId(e.target.value)}>{banks.filter(b=>!b.isArchived).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</Select>
          <Btn full onClick={handleCommitShortcut} style={{marginTop:8}}>Save Shortcut</Btn>
        </Modal>
      )}
    </div>
  );
}

// ─── MonthlyBills ─────────────────────────────────────────────────────────────
function MonthlyBills({ bills, onSave, banks, expCats, onAddTxn, delTxn, setAppAlert, availMonths }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const fmtC = useFmt();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [bankId, setBankId] = useState(banks[0]?.id||"");
  const [catId, setCatId] = useState(expCats[0]?.id||"");
  const [dueDay, setDueDay] = useState("1");
  const defaultMonth = new Date().toISOString().slice(0,7);
  const [filterMonth, setFilterMonth] = useState(defaultMonth);
  const payingRef = useRef({});

  const isPaid = (bill) => bill.payments?.some(p=>p.month===filterMonth);

  const openAdd = (item=null) => { setEditItem(item); setName(item?.name||""); setAmount(item?.amount?String(item.amount):""); setBankId(item?.bankId||banks[0]?.id||""); setCatId(item?.catId||expCats[0]?.id||""); setDueDay(item?.dueDay?String(item.dueDay):"1"); setShowAdd(true); };

  const handleSave = async () => {
    if (!name.trim() || !amount) return;
    const parsedAmt = parseFloat(amount);
    const dd = Math.min(28, Math.max(1, parseInt(dueDay)||1));
    if (editItem) await onSave(bills.map(b=>b.id===editItem.id?{...b,name,amount:parsedAmt,bankId,catId,dueDay:dd}:b));
    else await onSave([...bills,{id:Date.now().toString(),name,amount:parsedAmt,bankId,catId,dueDay:dd,payments:[]}]);
    setShowAdd(false); setEditItem(null); setName(""); setAmount("");
  };

  const handlePay = async (bill) => {
    if (payingRef.current[bill.id] || isPaid(bill)) return; 
    payingRef.current[bill.id] = true;
    try {
      const bank = banks.find(b=>b.id===bill.bankId);
      const cat = expCats.find(c=>c.id===bill.catId);
      const dateStr = today();
      const txnIdToken = await onAddTxn({ type:"expense", amount:bill.amount, date:dateStr, bankId:bill.bankId, bankName:bank?.name, catId:bill.catId, catName:cat?.name||bill.name, catIcon:cat?.icon||"bills", note:`Monthly Bill: ${bill.name}` });
      if (txnIdToken !== false) {
        HAPTICS.success();
        await onSave(bills.map(b=>b.id===bill.id?{...b,payments:[...(b.payments||[]),{month:filterMonth,date:dateStr,txnId:txnIdToken}]}:b));
      }
    } finally { setTimeout(() => { payingRef.current[bill.id] = false; }, 1000); }
  };

  return (
    <div style={{padding:"24px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{color:C.text,fontSize:22,fontWeight:800}}>Monthly Bills</div>
        <Btn small onClick={()=>openAdd()}>+ Add Bill</Btn>
      </div>
      <div style={{marginBottom:16}}><MonthSelect value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} availMonths={availMonths} /></div>
      {bills.length===0 && <EmptyState icon="📋" message="No monthly bills added yet." />}
      {bills.length>0 && (
        <div style={{border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
          <SortableList gap={0} items={bills} onReorder={onSave} renderItem={(bill, idx) => {
            const paid = isPaid(bill);
            return (
              <SwipeRow key={bill.id} onEdit={()=>openAdd(bill)} onDelete={()=>setConfirmDelete(bill.id)}>
                <div style={{background:paid?C.accentDim+"55":C.card, padding:"12px 14px", borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                    <span style={{color:C.text, fontWeight:700}}>{bill.name}</span>
                    <span style={{color:paid?C.accent:C.red, fontWeight:800}}>{fmtC(bill.amount)}</span>
                  </div>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <span style={{color:C.muted, fontSize:12}}>Due Day: {bill.dueDay}</span>
                    {!paid ? (
                      <button onClick={()=>handlePay(bill)} style={{background:C.accent, color:C.bg, borderRadius:8, padding:"6px 12px", border:"none", fontWeight:700}}>Pay</button>
                    ) : (
                      <span style={{color:C.accent, fontSize:12, fontWeight:700}}>✓ Paid</span>
                    )}
                  </div>
                </div>
              </SwipeRow>
            );
          }} />
        </div>
      )}
      {showAdd && (
        <Modal title={editItem?"Edit Bill":"New Monthly Bill"} onClose={()=>{setShowAdd(false);setEditItem(null);}} center={false}>
          <Input label="Bill Name" value={name} onChange={e=>setName(e.target.value)} />
          <Input label="Amount" type="number" step="any" value={amount} onChange={e=>setAmount(e.target.value)} />
          <Select label="Pay from Account" value={bankId} onChange={e=>setBankId(e.target.value)}>{banks.filter(b=>!b.isArchived).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</Select>
          <Select label="Category" value={catId} onChange={e=>setCatId(e.target.value)}>{expCats.filter(c=>!c.isArchived).map(c=><option key={c.id} value={c.id}>{ICONS[c.icon]||"📌"} {c.name}</option>)}</Select>
          <Input label="Due Day (1-28)" type="number" min="1" max="28" value={dueDay} onChange={e=>setDueDay(e.target.value)} />
          <Btn full onClick={handleSave} style={{marginTop:12}}>{editItem?"Update Bill":"Add Bill"}</Btn>
        </Modal>
      )}
      {confirmDelete && <ConfirmModal title="Delete Bill?" message="This will remove the bill." onClose={()=>setConfirmDelete(null)} onConfirm={async()=>{await onSave(bills.filter(b=>b.id!==confirmDelete));setConfirmDelete(null);}}/>}
    </div>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
function History({ txns, onDelete, onUpdate, banks, expCats, incCats, availMonths, onRowClick }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [confirmId, setConfirmId] = useState(null);
  const [editTxn, setEditTxn] = useState(null);

  const filtered = React.useMemo(() => {
    return txns.filter(t => {
      if (filterType!=="all" && t.type!==filterType) return false;
      if (filterMonth!=="all" && !t.date.startsWith(filterMonth)) return false;
      if (search) {
        const q = search.toLowerCase();
        return (t.catName?.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q) || t.bankName?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [txns, filterType, filterMonth, search]);

  return (
    <div style={{padding:"24px 16px 0"}}>
      <div style={{color:C.text,fontSize:22,fontWeight:800,marginBottom:16}}>History</div>
      <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12,fontFamily:"'DM Sans', sans-serif"}}/>
      <div style={{marginBottom:16}}><MonthSelect value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} availMonths={availMonths} /></div>
      <div style={{display:"flex",flexDirection:"column"}}>
        {filtered.length===0 && <EmptyState icon="💸" message="No transactions found." />}
        {filtered.map(t=>(
          <SwipeRow key={t.id} onEdit={t.type!=="transfer"?()=>setEditTxn(t):null} onDelete={()=>setConfirmId(t.id)}>
            <div onClick={() => onRowClick(t)} style={{cursor: "pointer"}}>
              <TxnRow txn={t} hideTotal={false} />
            </div>
          </SwipeRow>
        ))}
      </div>
      {confirmId && <ConfirmModal title="Delete Transaction?" message="Action cannot be undone." onClose={()=>setConfirmId(null)} onConfirm={()=>{onDelete(confirmId);setConfirmId(null);}}/>}
      {editTxn && <EditTxnModal txn={editTxn} banks={banks} expCats={expCats} incCats={incCats} onSave={async(data)=>{const ok=await onUpdate(editTxn.id,data); if(ok)setEditTxn(null);}} onClose={()=>setEditTxn(null)}/>}
    </div>
  );
}

// ─── EditTxnModal ─────────────────────────────────────────────────────────────
function EditTxnModal({ txn, banks, expCats, incCats, onSave, onClose }) {
  const currency = useCurrency();
  const [amount, setAmount] = useState(String(txn.amount));
  const [date, setDate] = useState(txn.date);
  const [bankId, setBankId] = useState(txn.bankId);
  const [catId, setCatId] = useState(txn.catId||"");
  const [note, setNote] = useState(txn.note||"");
  const cats = txn.type==="expense" ? expCats : txn.type==="income" ? incCats : [];

  const handleSave = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) return;
    const bank = banks.find(b=>b.id===bankId) || {name: txn.bankName}; 
    const cat = cats.find(c=>c.id===catId);
    await onSave({amount:parsed, date, bankId, bankName:bank?.name, catId, catName:cat?.name||txn.catName, catIcon:cat?.icon||txn.catIcon, note});
  };

  return (
    <Modal title="Edit Transaction" onClose={onClose} center={false}>
      <Input label={`Amount (${currency})`} type="number" step="any" value={amount} onChange={e=>setAmount(e.target.value)} />
      <Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <Select label="Account" value={bankId} onChange={e=>setBankId(e.target.value)}>
        {banks.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        {bankId.startsWith("goal_") && <option value={bankId}>{txn.bankName}</option>}
      </Select>
      {cats.length>0 && <Select label="Category" value={catId} onChange={e=>setCatId(e.target.value)}>{cats.map(c=><option key={c.id} value={c.id}>{ICONS[c.icon]||"📌"} {c.name}</option>)}</Select>}
      <Input label="Note" value={note} onChange={e=>setNote(e.target.value)}/>
      <Btn full onClick={handleSave}>Save Changes</Btn>
    </Modal>
  );
}

// ─── LedgerHeader ─────────────────────────────────────────────────────────────
function LedgerHeader({ type, data }) {
  const fmtC = useFmt();
  if (!type || !data) return null;
  if (type === "bank") return <div style={{marginBottom:20,padding:"16px 18px",background:C.card,border:`1px solid ${C.border}`,borderRadius:16}}><div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>Account Balance</div><div style={{color:data.balance<0?C.red:C.accent,fontSize:32,fontWeight:800,letterSpacing:-1}}>{fmtC(data.balance)}</div></div>;
  if (type === "group") return <div style={{marginBottom:20,padding:"16px 18px",background:C.card,border:`1px solid ${C.border}`,borderRadius:16}}><div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>Total Spent</div><div style={{color:data.color||C.purple,fontSize:32,fontWeight:800,letterSpacing:-1}}>{fmtC(data.spent)}</div></div>;
  if (type === "saving") return <div style={{marginBottom:20,padding:"16px 18px",background:C.card,border:`1px solid ${C.border}`,borderRadius:16}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div><div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>Saved</div><div style={{color:C.yellow,fontSize:28,fontWeight:800,letterSpacing:-0.5}}>{fmtC(data.saved)}</div></div></div><ProgressBar value={data.saved} max={data.goal} color={C.yellow}/></div>;
  if (type === "budget") return <div style={{marginBottom:20,padding:"16px 18px",background:C.card,border:`1px solid ${C.border}`,borderRadius:16}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}><div><div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>Spent</div><div style={{color:C.red,fontSize:28,fontWeight:800,letterSpacing:-0.5}}>{fmtC(data.spent)}</div></div></div><ProgressBar value={data.spent} max={data.limit} color={data.spent>=data.limit?C.red:C.accent}/></div>;
  return null;
}

// ─── DeepLedgerView ───────────────────────────────────────────────────────────
function DeepLedgerView({ title, headerType, headerData, txns, onDelete, onUpdate, banks, expCats, onClose, onRowClick }) {
  const [filter, setFilter] = useState("all");
  const [confirmId, setConfirmId] = useState(null);
  const [editTxn, setEditTxn] = useState(null);
  useEffect(() => { requestAnimationFrame(() => window.scrollTo(0, 0)); }, [title]);
  const list = txns.filter(t => { if (filter==="in") return t.type==="income"; if (filter==="out") return t.type==="expense"||t.type==="saving"; return true; });
  
  return (
    <div style={{padding:"24px 16px", minHeight:"100vh", background:C.bg, boxSizing:"border-box"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
        <span style={{color:C.text, fontWeight:800, fontSize:22}}>{title}</span>
        <button onClick={onClose} style={{background:C.card, border:`1px solid ${C.border}`, color:C.muted, width:44, height:44, borderRadius:99, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center"}}>✕</button>
      </div>
      <LedgerHeader type={headerType} data={headerData} />
      <div style={{display:"flex", flexDirection:"column", gap:2}}>
        {list.length===0 && <div style={{padding:"40px 0", textAlign:"center", color:C.faint, fontSize:13}}>No transactions found.</div>}
        {list.map(t => (
          <SwipeRow key={t.id} onEdit={t.type!=="transfer"?()=>setEditTxn(t):null} onDelete={()=>setConfirmId(t.id)}>
            <div onClick={() => onRowClick(t)} style={{cursor: "pointer"}}>
              <TxnRow txn={t} hideTotal={false} />
            </div>
          </SwipeRow>
        ))}
      </div>
      {confirmId && <ConfirmModal title="Delete Transaction?" message="Action cannot be undone." onClose={()=>setConfirmId(null)} onConfirm={()=>{onDelete(confirmId);setConfirmId(null);}} />}
      {editTxn && <EditTxnModal txn={editTxn} banks={banks} expCats={expCats} onSave={async(data)=>{const ok=await onUpdate(editTxn.id,data); if(ok)setEditTxn(null);}} onClose={()=>setEditTxn(null)} />}
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
function BottomNav({ tab, navigateTo, expCats, banks, onAdd, bankBalance, setAppAlert, quickActions }) {
  const [showQuick, setShowQuick] = useState(false);
  const [quickForm, setQuickForm] = useState(null);
  const pressTimer = useRef(null);
  const activeShortcuts = quickActions.filter(q => q.catId);
  const currency = useCurrency();

  const handlePressStart = (e) => { e.preventDefault(); pressTimer.current = setTimeout(() => { HAPTICS.medium(); setShowQuick(true); }, 450); };
  const handlePressEnd = (e) => { e.preventDefault(); clearTimeout(pressTimer.current); if(!showQuick && !quickForm) navigateTo("add"); };

  const handleQuickSelect = (shortcut) => {
    setShowQuick(false);
    setQuickForm({
      catId: shortcut.catId, amount: shortcut.amount || "50",
      bankId: shortcut.bankId && banks.some(b=>b.id===shortcut.bankId) ? shortcut.bankId : (banks[0]?.id || ""),
      note: "", date: today(),
    });
  };

  const handleQuickSave = async () => {
    const parsedAmt = parseFloat(quickForm.amount);
    if(!quickForm.amount || isNaN(parsedAmt) || parsedAmt <= 0) return;
    const cat = expCats.find(c=>c.id===quickForm.catId);
    const bank = banks.find(b=>b.id===quickForm.bankId);
    const success = await onAdd({ type:"expense", amount:parsedAmt, date:quickForm.date, bankId:quickForm.bankId, bankName:bank?.name, catId:quickForm.catId, catName:cat?.name, catIcon:cat?.icon, note:quickForm.note });
    if (success !== false) { setQuickForm(null); navigateTo("dashboard"); }
  };

  return (
    <>
      <nav style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:520, zIndex:50 }}>
        <div style={{ position:"absolute", bottom:0, width:"100%", height:95, background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", padding:"0 12px" }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"space-around", paddingRight:48, marginBottom:16 }}>
            <NavBtn id="dashboard" icon={ICONS.dashboard} label="Home" tab={tab} navigateTo={navigateTo} />
            <NavBtn id="monthly" icon={ICONS.bills_nav} label="Bills" tab={tab} navigateTo={navigateTo} />
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"space-around", paddingLeft:48, marginBottom:16 }}>
            <NavBtn id="history" icon="☰" label="History" tab={tab} navigateTo={navigateTo} />
            <NavBtn id="settings" icon={ICONS.settings} label="Settings" tab={tab} navigateTo={navigateTo} />
          </div>
        </div>
        <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", bottom:38, width:84, height:84, borderRadius:"50%", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <button onTouchStart={handlePressStart} onTouchEnd={handlePressEnd} onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={()=>clearTimeout(pressTimer.current)} onContextMenu={e=>e.preventDefault()}
            style={{ width:68, height:68, borderRadius:"50%", background:C.accent, color:C.bg, fontSize:36, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"transform 0.1s", userSelect:"none", WebkitUserSelect:"none" }}>
            +
          </button>
        </div>
        {showQuick && activeShortcuts.length > 0 && (
          <div style={{ position:"fixed", bottom:135, left:"50%", transform:"translateX(-50%)", background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:"12px", width:"auto", maxWidth:"90%", zIndex:60, display:"flex", justifyContent:"center" }}>
            <div style={{ display:"flex", gap:10 }}>
              {activeShortcuts.map(q => {
                const cat = expCats.find(c=>c.id===q.catId);
                return (
                  <button key={q.id} onClick={()=>handleQuickSelect(q)} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, width:90, height:90, color:C.text, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, cursor:"pointer", padding:"4px" }}>
                    <span style={{fontSize:26}}>{ICONS[cat?.icon]||"📌"}</span>
                    <span style={{fontSize:10, fontWeight:700}}>{cat?.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {quickForm && (
        <Modal title="Quick Insertion" onClose={()=>setQuickForm(null)} center={false}>
          <Input label={`Amount (${currency})`} type="number" step="any" value={quickForm.amount} onChange={e=>setQuickForm({...quickForm, amount:e.target.value})}/>
          <Select label="Account" value={quickForm.bankId} onChange={e=>setQuickForm({...quickForm, bankId:e.target.value})}>{banks.filter(b=>!b.isArchived).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</Select>
          <Btn full onClick={handleQuickSave}>Save</Btn>
        </Modal>
      )}
      {showQuick && <div onClick={()=>setShowQuick(false)} style={{position:"fixed", inset:0, zIndex:40}} />}
    </>
  );
}

function NavBtn({ id, icon, label, tab, navigateTo }) {
  const active = tab === id;
  return (
    <button onClick={()=>navigateTo(id, false)} style={{ background:"none", border:"none", color:active?C.accent:C.muted, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 0", cursor:"pointer", width:55, fontFamily:"'DM Sans', sans-serif" }}>
      <span style={{fontSize:22}}>{icon}</span>
      <span style={{fontSize:10, fontWeight:700, textTransform:"uppercase"}}>{label}</span>
    </button>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Saver App Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:40, textAlign:"center", color:C.text, background:C.bg, minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", fontFamily:"'DM Sans', sans-serif"}}>
          <div style={{fontSize:50, marginBottom:20}}>⚠️</div>
          <h2 style={{margin:"0 0 10px 0"}}>Oops! Something went wrong.</h2>
          <p style={{color:C.muted, marginBottom:20}}>A technical glitch occurred. Don't worry, your data is safe.</p>
          <Btn onClick={()=>window.location.reload()}>Reload App</Btn>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SaverApp />
    </ErrorBoundary>
  );
}
