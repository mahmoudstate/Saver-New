// Saver — global overlays: blocking AlertModal + ConfirmModal + transient Toast.
// Ported 1:1 from the showcase .dialog / .toast helpers. Friendly hybrid messaging.
import Ico from "./Ico.jsx";
import ConfettiBurst from "./ConfettiBurst.jsx";

const tile = (color) => ({ background: `color-mix(in srgb, ${color} 16%, transparent)`, color });

export function AlertModal({ data, onClose }) {
  if (!data) return null;
  const color = data.color || "var(--ac)";
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="dialog" role="alertdialog" aria-label={data.title}>
        <div className="dico" style={tile(color)}><Ico name={data.icon || "bell"} size={26} color={color} /></div>
        <div className="dttl">{data.title}</div>
        <div className="dmsg">{data.message}</div>
        <div className="drow">
          <button className="btn btn-primary btn-full" onClick={onClose}>{data.okText || "Got it"}</button>
        </div>
      </div>
    </>
  );
}

export function ConfirmModal({ data, onClose }) {
  if (!data) return null;
  const color = data.color || "var(--red)";
  const run = () => { data.onConfirm?.(); onClose(); };
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="dialog" role="alertdialog" aria-label={data.title}>
        <div className="dico" style={tile(color)}><Ico name={data.icon || (data.danger ? "trash" : "bell")} size={26} color={color} /></div>
        <div className="dttl">{data.title}</div>
        <div className="dmsg">{data.message}</div>
        <div className="drow">
          <button className="btn btn-ghost btn-full" onClick={onClose}>{data.cancelText || "Cancel"}</button>
          <button className={`btn btn-full ${data.danger ? "btn-danger" : "btn-primary"}`} onClick={run}>{data.confirmText || "Confirm"}</button>
        </div>
      </div>
    </>
  );
}

export function Toast({ data }) {
  if (!data) return null;
  const color = data.color || "var(--success)";
  return (
    <div className="toast" role="status">
      <span className="ic" style={{ background: color }}><Ico name={data.icon || "check"} size={18} color="#fff" /></span>
      <div><div className="tx">{data.title}</div>{data.sub && <div className="ts">{data.sub}</div>}</div>
    </div>
  );
}

// Single mount point: renders whichever overlay the store currently holds.
export default function Overlays({ store }) {
  return (
    <>
      <Toast data={store.toast} />
      <ConfirmModal data={store.confirm} onClose={() => store.setConfirm(null)} />
      <AlertModal data={store.alert} onClose={() => store.setAlert(null)} />
      {store.confetti > 0 && <ConfettiBurst key={store.confetti} />}
    </>
  );
}
