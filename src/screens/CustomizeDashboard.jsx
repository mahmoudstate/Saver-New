// Saver — Customize Dashboard: ported from showcase 22 (drag to reorder · eye to hide).
import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Ico from "../ui/Ico.jsx";
import { DASH_SECTIONS, DASH_DEFAULT } from "../lib/store.js";

const META = Object.fromEntries(DASH_SECTIONS.map((s) => [s.id, s]));

function SortRow({ id, hidden, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const s = META[id];
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? .85 : hidden ? .5 : 1, ...(isDragging ? { boxShadow: "0 14px 30px rgba(0,0,0,.22)", border: "1.5px solid var(--ac)" } : {}) };
  return (
    <div className="icard" ref={setNodeRef} style={style}>
      <span ref={undefined} {...attributes} {...listeners} style={{ color: "var(--faint)", cursor: "grab", touchAction: "none", display: "flex" }}><Ico name="grip" size={19} /></span>
      <span className="circ" style={{ width: 34, height: 34, borderRadius: 10, background: hidden ? "var(--surface2)" : s.bg, color: hidden ? "var(--faint)" : s.color }}><Ico name={s.icon} size={17} /></span>
      <div className="nm">{s.label}</div>
      <span style={{ marginLeft: "auto", color: hidden ? "var(--faint)" : "var(--ac)", cursor: "pointer" }} onClick={() => onToggle(id)}><Ico name={hidden ? "eyeOff" : "eye"} size={19} /></span>
    </div>
  );
}

export default function CustomizeDashboard({ store, back }) {
  const init = store.dashboard?.order ? store.dashboard : DASH_DEFAULT;
  // keep saved order, then append any newer sections not yet present (e.g. installments/projects)
  const mergedOrder = [...init.order.filter((id) => META[id]), ...DASH_SECTIONS.map((s) => s.id).filter((id) => !init.order.includes(id))];
  const [order, setOrder] = useState(mergedOrder);
  const [hidden, setHidden] = useState(init.hidden || []);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = ({ active, over }) => { if (over && active.id !== over.id) setOrder((o) => arrayMove(o, o.indexOf(active.id), o.indexOf(over.id))); };
  const toggle = (id) => setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  const save = () => { store.set("dashboard", { order, hidden }); store.flash({ title: "Layout saved", color: "var(--ac)", icon: "check" }); back(); };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Customize</div><div className="grow" /></div>
        <div className="lbl">Home sections</div><div className="big" style={{ fontSize: 34 }}>Layout</div><div className="sub">Drag to reorder · tap eye to hide</div>
      </div>
      <div className="over">Home sections</div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id) => <SortRow key={id} id={id} hidden={hidden.includes(id)} onToggle={toggle} />)}
        </SortableContext>
      </DndContext>
      <div className="cta"><div className="btn btn-primary btn-full" onClick={save}><Ico name="check" size={18} />Save layout</div></div>
    </div>
  );
}
