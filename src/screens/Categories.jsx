// Saver — Categories list (showcase 41-style): expense / income, tap to edit, + to add.
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { resolveCat } from "../ui/cats.js";

const catKeyOf = (c) => resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) || null;

export default function Categories({ store, back, onEdit, onAdd }) {
  const { expCats = [], incCats = [] } = store;
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
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">Categories</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">Organise</div>
        <div className="big" style={{ fontSize: 30 }}>{expCats.length + incCats.length} categories</div>
        <div className="sub">{expCats.length} expense · {incCats.length} income</div>
      </div>
      {section("Expense", expCats, "expense")}
      {section("Income", incCats, "income")}
    </div>
  );
}
