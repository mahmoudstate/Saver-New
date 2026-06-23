// Saver — Privacy & Backup: ported from showcase 25 + 39 (on-device · export/restore).
import { useRef } from "react";
import Ico from "../ui/Ico.jsx";
import { today } from "../lib/format.js";
import { KEYS, loadKey } from "../lib/store.js";

export default function PrivacyBackup({ store, back }) {
  const fileRef = useRef(null);

  const download = () => {
    const payload = { _app: "Saver", _version: 3, _exported: today() };
    for (const k in KEYS) payload[k] = loadKey(KEYS[k], null);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Saver_Backup_${today()}.json`; a.click();
    URL.revokeObjectURL(url);
    store.flash({ title: "Backup downloaded", sub: "Saver_Backup.json", color: "var(--success)", icon: "download" });
  };

  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        store.setConfirm({
          title: "Restore this backup?", message: "This overwrites your current data with the file's contents.",
          color: "var(--acText)", confirmText: "Restore", icon: "download",
          onConfirm: () => { if (store.restore(data)) store.flash({ title: "Backup restored", color: "var(--acText)", icon: "check" }); },
        });
      } catch { store.setAlert({ title: "Couldn't read file", message: "That doesn't look like a Saver backup.", color: "var(--red)" }); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Factory reset — always exports a backup first, then wipes everything.
  const reset = () => {
    store.setConfirm({
      title: "Reset all data?",
      message: "A backup file is saved to your device first, then accounts, categories, transactions and settings are erased and the app starts fresh. This can't be undone.",
      confirmText: "Back up & reset", danger: true, icon: "trash",
      onConfirm: () => { download(); store.resetAll(); },
    });
  };

  const Row = ({ icon, bg, color, nm, mt, right, onClick }) => (
    <div className="icard" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: bg, color }}><Ico name={icon} size={20} /></span>
      <div><div className="nm">{nm}</div><div className="mt">{mt}</div></div>
      <span style={{ marginLeft: "auto" }}>{right}</span>
    </div>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Privacy</div><div className="grow" /></div>
        <div className="lbl">Your data</div><div className="big" style={{ fontSize: 34 }}>Private</div><div className="sub">Everything stays on this device</div>
      </div>

      <div className="over">Security</div>
      <Row icon="lock" bg="var(--blueDim)" color="var(--blue)" nm="App lock" mt="Require Face ID to open" />
      <div className="frozen" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "var(--acDim)", color: "var(--acText)", borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 13 }}>
        <Ico name="shield" size={15} color="var(--ac)" />On-device only · No tracking, no ads
      </div>

      <div className="over" style={{ marginTop: 16 }}>Backup</div>
      <Row icon="download" bg="var(--purpleDim)" color="var(--purple)" nm="Download backup" mt="Saver_Backup.json" right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={download} />
      <Row icon="download" bg="var(--blueDim)" color="var(--blue)" nm="Restore from file" mt="Overwrites current data" right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={() => fileRef.current?.click()} />
      <Row icon="trash" bg="var(--redDim)" color="var(--red)" nm="Reset all data" mt="Backs up first, then starts fresh" right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={reset} />
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: "none" }} />
    </div>
  );
}
