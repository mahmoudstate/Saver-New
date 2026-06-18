// Saver — Edit profile (opened from the Profile gear): name, photo, plan, currency, about.
import { useState, useRef } from "react";
import Ico from "../ui/Ico.jsx";
import { APP_VERSION, CURRENCIES } from "../lib/format.js";

// Downscale + centre-crop an uploaded image to a small square JPEG so it fits in localStorage.
function fileToAvatar(file, cb) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const S = 256, c = document.createElement("canvas");
      c.width = S; c.height = S;
      const ctx = c.getContext("2d");
      const scale = Math.max(S / img.width, S / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      cb(c.toDataURL("image/jpeg", 0.82));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function CurrencySheet({ value, onPick, onClose }) {
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>Currency</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 14px" }}>Used to format every amount.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "52vh", overflowY: "auto" }}>
          {CURRENCIES.map((cur) => (
            <div key={cur.code} className="icard" onClick={() => { onPick(cur.code); onClose(); }} style={{ cursor: "pointer", border: value === cur.code ? "1.5px solid var(--ac)" : "1px solid var(--catTileBorder)" }}>
              <span className="circ" style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface2)", color: "var(--text)", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>{cur.code}</span>
              <div><div className="nm">{cur.name}</div><div className="mt">{cur.code}</div></div>
              {value === cur.code && <span className="amtb"><Ico name="check" size={18} color="var(--ac)" /></span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}><div className="btn btn-secondary btn-full" onClick={onClose}>Done</div></div>
      </div>
    </>
  );
}

export default function ProfileEdit({ store, back }) {
  const { username, avatar, currency } = store;
  const [name, setName] = useState(username || "");
  const [curOpen, setCurOpen] = useState(false);
  const fileRef = useRef(null);
  const initial = (name || username || "Y").slice(0, 1).toUpperCase();

  const onFile = (e) => { const f = e.target.files?.[0]; if (f) fileToAvatar(f, (d) => store.set("avatar", d)); e.target.value = ""; };
  const save = () => { store.set("username", name.trim()); store.flash({ title: "Profile saved", sub: name.trim() || "Your name", color: "var(--success)", icon: "check" }); back(); };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Edit profile</div><div className="grow" /></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1, paddingTop: 6 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,.28)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 34, color: "var(--heroText)" }}>
              {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
            </div>
            <div onClick={() => fileRef.current?.click()} style={{ position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: "50%", background: "var(--ac)", color: "var(--onAcc, #11231d)", display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid var(--hero)", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }}><Ico name="camera" size={15} color="#11231d" /></div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          {avatar
            ? <div onClick={() => store.set("avatar", "")} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--heroSub)", cursor: "pointer" }}>Remove photo</div>
            : <div onClick={() => fileRef.current?.click()} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--heroSub)", cursor: "pointer" }}>Add a photo</div>}
        </div>
      </div>

      <div className="over">Your name</div>
      <label className="field" style={{ marginBottom: 18 }}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface2)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="user" size={19} /></span>
        <div style={{ flex: 1 }}><div className="fl">Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <div className="over">Preferences</div>
      <div className="icard" onClick={() => setCurOpen(true)} style={{ cursor: "pointer" }}>
        <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="coins" size={19} /></span>
        <div className="nm">Currency</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, color: "var(--faint)" }}><span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}>{currency}</span><Ico name="chev" size={18} /></div>
      </div>

      <div className="over">Plan</div>
      <div className="card" style={{ padding: 16, boxShadow: "none", display: "flex", alignItems: "center", gap: 13 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="sparkles" size={21} /></span>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15 }}>Free plan · Saver One</div><div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Offline & private — every feature included.</div></div>
      </div>

      <div className="over">About</div>
      <div className="icard" style={{ cursor: "default" }}>
        <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: "var(--surface2)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="info" size={19} /></span>
        <div className="nm">Saver One</div>
        <div style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--muted)", fontWeight: 700 }}>v{APP_VERSION}</div>
      </div>
      <div style={{ textAlign: "center", color: "var(--faint)", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", marginTop: 14 }}>Powered by Mahmoud</div>

      <div className="cta"><div className="btn btn-primary btn-full" onClick={save}><Ico name="check" size={18} />Save</div></div>

      {curOpen && <CurrencySheet value={currency} onPick={(c) => store.set("currency", c)} onClose={() => setCurOpen(false)} />}
    </div>
  );
}
