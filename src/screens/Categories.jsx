// Saver — Categories list (showcase 41-style): expense / income, tap to edit, + to add.
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { resolveCat } from "../ui/cats.js";
import { useT } from "../lib/i18n.js";

const catKeyOf = (c) => resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) || null;

export default function Categories({ store, back, onEdit, onAdd }) {
  const { expCats = [], incCats = [] } = store;
  const tr = useT();
  const section = (title, list, kind) => (
    <>
      <div className="over" style={{ marginTop: 18 }}>{title}</div>
      {list.map((c) => (
        <div className="icard" key={c.id} onClick={() => onEdit?.({ ...c, _kind: kind })} style={{ cursor: "pointer" }}>
          <CatTile cat={catKeyOf(c)} name={c.name} color={c.color} size={42} />
          <div><div className="nm">{c.name}</div></div>
          <span className="amtb"><Ico name="chev" size={18} color="var(--faint)" /></span>
        </div>
      ))}
    </>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("profile.categories")}</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">{tr("cats.organise")}</div>
        <div className="big" style={{ fontSize: 30 }}>{tr("cats.count", { n: expCats.length + incCats.length })}</div>
        <div className="sub">{tr("cats.breakdown", { e: expCats.length, i: incCats.length })}</div>
      </div>
      {section(tr("edit.type_expense"), expCats, "expense")}
      {section(tr("edit.type_income"), incCats, "income")}
    </div>
  );
}
