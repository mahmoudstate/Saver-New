# Saver — Project Handoff & Context (send this to a new session to continue)

> Purpose: full context so any new session can continue the **redesign + code migration** without losing what we agreed.
> Two repos (branch **`claude/file-transfer-k1kui7`** in both):
> - **`saver-site`** = design system + **showcase of ~55 screens** (`screens.html`, `ds.css`, `ds.js`) → live: https://mahmoudstate.github.io/saver-site/screens.html . Also holds **`APP-LOGIC.md`** (LOCKED logic + message catalog + validation rules).
> - **`saver-test`** = the working **React/Vite** app being re-skinned to the new design. This is a **sandbox** (not live users) — clean rebuild is OK.

---

## 0. Golden rules (do NOT break)
1. **Logic is LOCKED.** All money maths/data come from the old app verbatim (see `saver-site/APP-LOGIC.md`). Never change a formula without asking. (Verified: calc matches real backup.)
2. **Don't redesign while porting — copy the showcase markup 1:1.** The bug we hit: re-authoring styles by hand → drift. Fix/Method: copy each showcase screen's HTML → convert mechanically to JSX (`class`→`className`, `style="…"`→object, `data-ico`→`<Ico>`, `data-cat`→`<CatTile>`) → inject data. `ds.css` is the single styling source.
3. **New icons only** — our showcase icons (`Ico` + `CATS`). NO legacy lucide set, NO emoji anywhere (use our drawn icons).
4. **Visual verification uses CLEAN demo data** (`saver-test/demo.json`), NOT the real user backup. Real bank colours are random and make it look “off”; the backup is only for later functional testing. (Real backup is local only, never committed.)
5. **Unify the mint hero (“cover”) size** across screens (currently `min-height:252px` via `.app .hero`). Keep covers consistent.
6. **Uniform fields/chips** — same size, consistent label↔value layout (no 2-line vs 1-line mix). Chips are single-line.
7. Work locally + verify with screenshots; push/deploy only when asked.

---

## 1. Locked logic (summary — full text in `saver-site/APP-LOGIC.md`)
Txn types: `income, expense, saving, goal_withdraw, goal_return, transfer`.
- bankBalance = Σ(income + / expense − / goal_withdraw − / transfer in+ / transfer out−)
- goalSaved = max(0, Σ saving + / goal_withdraw − / goal_return −)
- frozenForBank = max(0, per-bank Σ saving + / goal_withdraw − / goal_return −)
- safeToSpend(bank) = bankBalance − frozenForBank ; totalBalance = Σ bankBalance ; safeTotal = total − Σ frozen
- Spend blocked when amt > safeToSpend(bank); saving blocked likewise; goal spend blocked when amt > goalSaved.
- Storage = localStorage, keys `et_*` (txns, banks, expCats, incCats, groups, savings, bills, budgets, installments, currency, username, theme…). Existing user backups restore unchanged.
APP-LOGIC.md also has: full **AlertModal / ConfirmModal** message catalog (verbatim), **GoalToast** encouragement tiers, **EmptyState** messages, and the **input-validation rule** (§7).

---

## 2. Agreed design decisions (whole project)
**Brand:** Saver · mint/teal accent · rounded-square motif · “Powered by Mahmoud”. Matte text (`--text:#2B2E35` light; hero text `#1B332C`) — not glossy black.
**Nav:** bottom = Home · Activity · **[＋ squircle]** · Bills · Profile. Budgets/Goals reached from Home cards / Profile. Settings under Profile.
**Home (screen 01):**
- Greeting + **eye (privacy)** + bell. **Swipe balance** (Total ⇄ Safe, page **dots**, Apple-widget style — NO toggle buttons).
- **Accounts**: horizontal **gradient brand cards** (bank colour gradient + shine animation + contactless icon). Each shows **Available** (big) + small **“£X locked · goals”** (frozen) OR “Fully available” OR low-balance (amber down-arrow + “Below your £X alert”). Negative = dot. “All accounts” + an “All” tile.
- **“{Month} · this month”** card: Income ↑ (green) / Spent ↓ (red), divider.
- Calm section cards: **Bills** (blue icon), **Goals** (teal, mini progress bars), **Budgets** (purple, progress). 
- **Colour hierarchy:** ONLY bank cards are full-colour; everything else is calm/neutral surface + a small coloured icon. (This was a key fix — avoid rainbow.)
- Customize Dashboard = drag-reorder sections + eye-hide (sections: Accounts, Income&Expenses, Bills, Installments, Budgets, Savings goals). Also reorder cards **within** a section (long-press drag).
**Account ledger / Accounts page:** hero = the **bank’s gradient card** (continuity from tapping its card on Home). Calm ledger below.
**Subscription/Bill detail:** brand-colour hero **in OUR layout** (not a clone): left-aligned hero = back + “Active” chip + **logo tile** + name + amount + “Renews …”; then chips (£/yr · reminder · payments) + Payment history rows + “Record payment” CTA.
**Bills tab:** view-selector **Timeline / Categories / History**; month + status filters.
**Smart Filter** (entry from Activity search + funnel): compose **When** (Today/Week/Month/LastMonth/Year/**Custom from→to**) × **Show** (All/Expenses/Income/Savings/Transfers/**Bills**/**Installments**, multi-select; empty=All) × **Categories** (multi) × **Accounts** (multi). **Results** screen = summary insight (“£X · {cat} · {month} · N txns · avg”) + removable filter chips + list. Filtering Bills/Installments returns their **payment transactions**.
**Add:** segmented stays **3** (Expense/Income/Saving). **Transfer = separate screen** opened from an account’s “Move”. **Quick Add** sheet. **Source picker**: banks + **goal vaults** (a goal appears as a spend source **only when its Spending mode is ON**; money stays frozen in its banks — not double-counted).
**Installment add:** **grouped Next-step wizard** (light; group inputs by meaning, not 1-field-per-page) + **focused edit sheet**. **Smart number entry** = numeric keypad + quick-pick chips (no long +/− steppers).
**Goal detail:** **Return to bank** (returns to the banks it was frozen from) + **Spending mode** toggle (vault) + per-bank **frozen breakdown**.
**Validation (app-wide, APP-LOGIC §7):** quiet helper line + clear **inline error**; **button always tappable** (never dead); constrained controls (day **1–28**, count steppers/keypad). 
**Messages:** **hybrid** — light **friendly toasts** for success/info + **centre modals** for blocks/confirms + **GoalToast** celebration. Tone = **friendly/playful** (“Boom — logged it!”, “Whoa, hold up!”) but clear; **NO emoji**, use our icons. Insufficient-balance = **strong blocking modal + inline error**. Full real-text catalog in APP-LOGIC.md → to be rewritten in the friendly voice.
**Notifications:** system/push **lock-screen banners** + **gentle daily reminders** (e.g. “Spent anything today? Log it”, bill/installment due-soon) — no emoji.
**Scope:** Projects included; legacy Groups folded into Budgets. Deferred to LAST (finalise with latest content): Onboarding/Guide, Story Tour, Coach Tour, Help/FAQ, PWA-install, What’s New. App version bumped to **3.0**.

---

## 3. Migration (Phase C) — clean architecture in `saver-test`
**Done & verified (screenshots), pushed to branch:** foundation + logic layer (calc/store, verified vs real backup) · **all 4 tabs**: Home, Activity, Bills (Subscriptions+Installments), Profile · **Account ledger** (bank-gradient hero) · **Subscription detail** (brand hero+logo) · new icons (Ico+CATS) · hero unified 252px · v3.0 · **push-navigation** (App `view` state: tapping a Home bank card → Account ledger; a Bills subscription → Subscription detail; back returns to tab).
Latest commit: `8839513` (branch `claude/file-transfer-k1kui7`).
```
src/
  lib/format.js   – fmt, currency, dates, MONTHS, darken/cardGradient, HAPTICS
  lib/calc.js     – bankBalance/goalSaved/frozenForBank/safeToSpend/totals (VERBATIM, verified vs backup)
  lib/store.js    – useStore hook: load/persist all et_* keys + restore(backup)
  ui/Ico.jsx      – icon set (paths = showcase ds.js ICONS)
  ui/cats.js      – CATS category icons (new design) + resolveCat(txn) mapper
  ui/CatTile.jsx  – neutral tile + coloured glyph (matches showcase catTile)
  ui/BottomNav.jsx– Home·Activity·[+]·Bills·Profile (squircle FAB)
  screens/Home.jsx     – ported 1:1 from showcase 01 (bank cards tap → ledger)
  screens/Activity.jsx – ported 1:1 from showcase 02 (per-type rows: saving/goal/transfer)
  screens/Bills.jsx    – ported 1:1 from 05/06 (Subscriptions+Installments seg; rows tap → sub detail)
  screens/Profile.jsx  – ported 1:1 from 23 (wired username/accounts/theme)
  screens/AccountLedger.jsx   – showcase 11 (bank-gradient hero + month ledger)
  screens/SubscriptionDetail.jsx – showcase 15 (brand hero + logo + history)
  App.jsx         – shell: useStore + tab switch + BottomNav + `view` push-nav (account/sub) + Placeholder
  saver-ui.css    – copy of ds.css + app overrides (.app shell full-screen, body=--bg, .hero min-height:252, .hscroll)
  _legacy/App.reference.jsx – OLD app, REFERENCE ONLY (not imported/built)
demo.json         – clean showcase-style data for visual verification
REWORK.md         – per-screen checklist
```
**Local verify workflow:**
```
cd saver-test && npm install
npm run build
(cd dist && python3 -m http.server 8099 &)
# puppeteer screenshot (shot.cjs, local tool — gitignored): seeds demo.json into localStorage
BK=./demo.json [TAB=activity] node shot.cjs http://localhost:8099 out.png
```
(`shot.cjs` + puppeteer are dev-only, gitignored. To screenshot a tab, click `[aria-label="activity|bills|profile"]`.)

---

## 4. Remaining work (port each 1:1 from showcase, then verify)
- [x] All 4 tabs · Account ledger · Subscription detail (DONE)
- [ ] **Installment detail** (ring, schedule, pay/undo) — wire from Bills installment rows
- [ ] **Budgets** + Budget detail · **Projects** + Project detail
- [ ] **Goals** + Goal detail (return-to-bank, spending-mode, frozen breakdown)
- [ ] **Accounts list** (gradient cards, reorder) — from Profile→Accounts
- [ ] **Add** Expense/Income/Saving · **Transfer** · **Quick Add** · **Source picker** (vault) · **Edit txn**
- [ ] **Installment add** wizard + focused sheet · smart number entry
- [ ] **Editors**: account/category/goal/budget · **Quick Actions** · **Customize Dashboard** (dnd + hide)
- [ ] **Profile/Settings** · Appearance · Privacy · **Backup & Restore**
- [ ] **Messages**: friendly toasts + centre dialogs + GoalToast + inline validation (apply friendly catalog)
- [ ] **Smart Filter** sheet + **Results**
- [ ] System (LAST, latest content): Onboarding · Help/FAQ · What’s New · Empty/Celebration · Notifications
- [ ] **Design QA pass**: uniform field/chip sizes + consistent label↔value layout
- [ ] Wire real **CRUD/actions** from legacy into `lib/store.js` (addTxn split logic, delTxn, updateTxn, bill/installment pay/undo, goal spend/return) — port verbatim, keep validation messages
- [ ] Final functional test with the **real backup**, then user deploys

---

## 5. Quick status one-liner
Clean React rebuild on the new design: **4 tabs + Account ledger + Subscription detail done & verified**, push-navigation working, logic layer verified vs real backup, hero unified 252px, new icons only, v3.0. Continue porting the remaining detail/add/editor/filter/message screens **1:1 from the showcase** (method in §0). Logic locked. No emoji. Verify each screen by screenshot (local server + shot.cjs) before moving on. Work locally; push at checkpoints.

## 6. How to resume in a NEW session
1. Clone `saver-test`, checkout `claude/file-transfer-k1kui7`, `npm install`.
2. Read this file + `saver-site/APP-LOGIC.md` (locked logic/messages) + open the showcase https://mahmoudstate.github.io/saver-site/screens.html.
3. Pick the next screen from §4 → open its showcase markup in `saver-site/screens.html` → port 1:1 to a React screen (classes + `<Ico>`/`<CatTile>`) → wire to `store` → verify: `npm run build`, serve `dist` (`python3 -m http.server 8099`), screenshot with puppeteer seeding `demo.json` into localStorage (click `[aria-label="…"]` / `.seg b` / `.bankcard` to reach a view).
4. Keep heroes at 252px, new icons only, no emoji, logic untouched.
