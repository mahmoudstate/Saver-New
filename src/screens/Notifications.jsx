// Saver — Notifications inbox screen. Logic lives in lib/notifications.js so the
// Home bell badge stays in sync. This file just renders the list + read controls.
import Ico from "../ui/Ico.jsx";
import { buildNotifications } from "../lib/notifications.js";

export default function Notifications({ store, back }) {
  const items = buildNotifications(store);
  const newCount = items.filter((n) => n.unread).length;
  const markAllRead = () => store.set("notifReadKeys", [...new Set([...(store.notifReadKeys || []), ...items.filter((n) => n.unread).map((n) => n.key)])]);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Notifications</div><div className="grow" />{newCount > 0 && <div className="hchip" onClick={markAllRead} style={{ cursor: "pointer" }}><Ico name="check" size={14} />Mark all read</div>}</div>
        <div className="lbl">Inbox</div><div className="big" style={{ fontSize: 34 }}>{newCount} new</div><div className="sub">Bills, installments, budgets &amp; account alerts</div>
      </div>
      {items.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>All caught up.</div>
        : items.map((n) => (
          <div className="icard" key={n.key} style={{ opacity: n.unread ? 1 : .7 }}>
            <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, color: n.col }}><Ico name={n.icon} size={19} /></span>
            <div><div className="nm">{n.nm}</div><div className="mt">{n.mt}</div></div>
            {n.unread && <span style={{ marginLeft: "auto", width: 9, height: 9, borderRadius: "50%", background: "var(--ac)" }} />}
          </div>
        ))}
    </div>
  );
}
