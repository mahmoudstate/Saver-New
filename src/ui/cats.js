// Saver — category icons (NEW design, ported from showcase ds.js CATS). [color, innerSVG]
export const CATS = {
  food: ["#F59E0B", `<path d="M5 3v7a3 3 0 0 0 3 3v8M8 3v7M18 3c-1.5 0-2.5 2-2.5 5v4H18V3Zm0 11v7"/>`],
  coffee: ["#B07A4A", `<path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8ZM16 9h2a2 2 0 0 1 0 6h-2M8 3v2M11 3v2"/>`],
  salary: ["#0E9F6E", `<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.3"/>`],
  shopping: ["#8B5CF6", `<path d="M6 8h12l-1 12H7L6 8ZM9 8V6a3 3 0 0 1 6 0v2"/>`],
  transport: ["#3B82F6", `<path d="M5 13l1.5-5h11L19 13M5 13h14v5H5zM5 18v2M19 18v2"/>`],
  bill: ["#3B82F6", `<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>`],
  phone: ["#A78BFA", `<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>`],
  travel: ["#16BFA6", `<path d="M2 16l9-3 7-7a2 2 0 0 1 3 3l-7 7-3 9-2-6-7-3Z"/>`],
  home: ["#E5544E", `<path d="M4 11 12 5l8 6M6 10v9h12v-9"/>`],
};

// map a transaction's category (glyph / id / icon) → one of our new category keys
const MAP = {
  utensils: "food", food: "food", pizza: "food", sandwich: "food", soup: "food",
  coffee: "coffee", "cup-soda": "coffee",
  "shopping-bag": "shopping", shopping: "shopping", shirt: "shopping",
  briefcase: "salary", salary: "salary", freelance: "salary", lightbulb: "salary",
  car: "transport", transport: "transport", fuel: "transport", "square-parking": "transport", parking: "transport", bus: "transport",
  zap: "bill", bills: "bill", bill: "bill", receipt: "bill",
  house: "home", rent: "home", home: "home",
  wifi: "phone", laptop: "phone", phone: "phone", smartphone: "phone",
  plane: "travel", "plane-takeoff": "travel", travel: "travel",
};

export function resolveCat(t) {
  const cands = [t.cat, t.catId, t.catGlyph, t.catIcon, (t.catName || "").toLowerCase()];
  for (const c of cands) { if (c && CATS[c]) return c; if (c && MAP[c]) return MAP[c]; }
  return null;
}
