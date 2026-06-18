// Saver — animated segmented control. A single thumb slides between options
// instead of the background snapping per-button. Drop-in for 2+ equal options.
export default function SegToggle({ options, value, onChange, style }) {
  const n = options.length;
  const idx = Math.max(0, options.findIndex((o) => o.id === value));
  return (
    <div className="segx" style={style}>
      <span className="seg-thumb" style={{ width: `calc((100% - 10px) / ${n})`, transform: `translateX(${idx * 100}%)` }} />
      {options.map((o) => (
        <b key={o.id} className={o.id === value ? "on" : ""} onClick={() => onChange(o.id)}>{o.label}</b>
      ))}
    </div>
  );
}
