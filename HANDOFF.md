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
- [x] **Installment detail** (ring, schedule, pay/undo) — DONE: showcase 37 ported (`screens/InstallmentDetail.jsx`), opens from Bills installment rows; pay logs an expense + advances the ring + success toast; tap a paid row to undo (confirm dialog). Verified light+dark, block + success paths.
- [x] **Budgets** + Budget detail · **Projects** + Project detail — DONE: `screens/Budgets.jsx` (tabbed Monthly/Projects, showcase 03+36), `screens/BudgetDetail.jsx` (showcase 12, monthly category ledger), `screens/ProjectDetail.jsx` (showcase 42, cross-month + mark-complete). Calc helpers `budgetSpentMonth/projectSpent/budgetTxns` in calc.js (spend = expense+goal_withdraw in the budget's cats; monthly resets per month, projects accumulate from startMonth). Opens from the Home Budgets card. Added one demo project ("Apartment setup") for verification. Verified light+dark.
- [x] **Goals** + Goal detail (return-to-bank, spending-mode, frozen breakdown) — DONE: `screens/Goals.jsx` (showcase 04) + `screens/GoalDetail.jsx` (showcase 13). Add money (saving) + Return to bank (goal_return, auto-splits across frozen banks) via reusable `ui/AmountSheet.jsx` (keypad + source picker); spending-mode toggle + complete/archive wired. Opens from the Home Goals card. Verified light+dark + a real add (£600→£800, progress + frozen + contribution + toast).
- [x] **Accounts list** — DONE: `screens/Accounts.jsx` (showcase 40), total/frozen hero + per-bank rows (frozen / low-balance) + dashed Add account; tap a row opens its ledger. (reorder still TODO)
- [x] **Add** Expense/Income/Saving · **Transfer** · **Quick Add** · **Source picker** (vault) · **Edit txn** — DONE: `screens/Add.jsx` (segmented, keypad via `AmountSheet`, account/category/goal via `PickerSheet`, vault sources for spending-mode goals → goal_withdraw), `screens/Transfer.jsx` (from Account ledger “Move”), `ui/QuickAddSheet.jsx` (long-press the + FAB), `screens/EditTxn.jsx` (amend/delete from Activity rows). Add CTA always tappable + inline helper.
- [~] **Installment add** — `screens/InstallmentEditor.jsx` (grouped form: item/months/amount/day/account → installments). Grouped multi-step wizard + back-fill (down payment / already-paid via addTxns) still TODO.
- [x] **Editors**: `AccountEditor` (17, opening-balance income), `CategoryEditor`+`Categories` (18/41), `GoalEditor` (19), `BudgetEditor` (20, name+amount+cats model), `SubscriptionEditor` (38), `InstallmentEditor`, **Quick Actions** (`QuickActions`+`QuickActionEditor`, 21), **Customize Dashboard** (`CustomizeDashboard`, 22, dnd-kit reorder + eye-hide; Home renders sections by saved order).
- [x] **Profile/Settings** · **Appearance** (`Appearance.jsx`, 24 — theme + 6 calm accents, live `--ac` retint, persisted) · **Privacy & Backup** (`PrivacyBackup.jsx`, 25+39 — real JSON download + restore-from-file via `store.restore`).
- [x] **Messages**: `ui/Modal.jsx` (`AlertModal` block + `ConfirmModal` + `Toast`) driven by store (`alert/confirm/toast/flash`); **GoalToast = `Celebration.jsx`** (goal-reached confetti, archive/keep); inline validation on Add. Full friendly copy catalog still a polish item.
- [x] **Smart Filter** sheet + **Results** — `lib/filter.js` (pure period/show/cats/accounts match + summary), `screens/SmartFilter.jsx` (live count·total), `screens/FilterResults.jsx` (summary hero + chips + list → edit). Activity search/funnel opens it.
- [x] System: **Onboarding** (27, first-run, gated on `seenWelcome`), **What’s New** (28, sheet, also Profile), **Empty state** (`ui/EmptyState.jsx`, 32, used in Activity), **Goal celebration** (33), **Notifications** (29, data-driven from bills/goals/low-balance/backup; Home bell). DEFERRED (per user): **Guide/Manual** (`Manual.jsx` empty scaffold) + Help/FAQ.
- [ ] **Design QA pass**: uniform field/chip sizes + consistent label↔value layout
- [x] Wire real **CRUD/actions** into `lib/store.js` — `addTxn` (incl. goal split), `addTxns`, `delTxn` (+ `reconcileLinked`), `updateTxn`, ported verbatim with locked validation; installment pay/undo, goal add/return/spend, transfer, quick-add all wired.
- [x] **Functional test (logic)**: 17/17 locked-math invariants pass (total=Σbank, safe=bal−frozen, expense/income/saving/goal_return/transfer/clamp); 0 console errors across all screens. **Still TODO: final test with the real backup, then user deploys.**

### Still open (next session)
- Installment grouped wizard + back-fill (down payment / already-paid); smart number entry quick-picks.
- Reorder accounts/cards within sections (53). Bills view-selector (Timeline/Categories/History) + month/status filters.
- Guide/Manual + Help/FAQ content (deferred). Friendly message copy catalog. Design QA pass (uniform fields/chips).
- Final functional test with the **real backup**, then deploy.

---

## 5. Quick status one-liner
Clean React rebuild on the new design — **largely feature-complete**: 4 tabs + all detail screens (account ledger, subscription, installment, budget/project, goal) + full Add/Transfer/Quick-Add/Edit + every editor (account/category/goal/budget/subscription/installment/quick-actions) + Smart Filter + Appearance (theme+accents) + Privacy & Backup + Notifications + Customize Dashboard + onboarding/what's-new/empty/celebration. Locked CRUD wired in `lib/store.js`; **17/17 logic invariants pass, 0 console errors**. Open: installment grouped wizard, reorder, Bills view-selector, Guide/Help content, design-QA pass, final test with the real backup. Method in §0. Logic locked. No emoji. Work locally; push at checkpoints.

## 6. How to resume in a NEW session
1. Clone `saver-test`, checkout `claude/file-transfer-k1kui7`, `npm install`.
2. Read this file + `saver-site/APP-LOGIC.md` (locked logic/messages) + open the showcase https://mahmoudstate.github.io/saver-site/screens.html.
3. Pick the next screen from §4 → open its showcase markup in `saver-site/screens.html` → port 1:1 to a React screen (classes + `<Ico>`/`<CatTile>`) → wire to `store` → verify: `npm run build`, serve `dist` (`python3 -m http.server 8099`), screenshot with puppeteer seeding `demo.json` into localStorage (click `[aria-label="…"]` / `.seg b` / `.bankcard` to reach a view).
4. Keep heroes at 252px, new icons only, no emoji, logic untouched.

---

## 7. Real-device QA & Sign-off Plan (LIVE — work top to bottom)

> **How this works:** Mahmoud tests the built app for real and reviews it **page by page, section by section**. For each page he lists notes → Claude fixes & re-verifies (build + screenshot, both themes) → iterate until Mahmoud says it's good → Claude marks that page **✅ CONFIRMED** and asks for the **next** page. After all pages, we do the **General / cross-cutting** tasks the same way. **Nothing is ✅ until Mahmoud explicitly confirms it.** Claude must NOT reopen a ✅ item without being asked.
>
> **Status legend:** ☐ not started / awaiting notes · 🔄 notes being addressed · ✅ CONFIRMED (locked).
> Keep each task's notes inline under it (bullet list) so history is preserved.

### A · Pages — review one at a time
**Core tabs**
- 🔄 A1. Home (greeting, balance swipe Total/Safe, account cards, this-month, Bills/Goals/Budgets cards, customize)
  - Customize button: removed the right chevron, centered icon+label as a button. (done, verified light+dark)
  - Navigation memory: sections opened from Home now render as an overlay over the still-mounted Home tab, so the in-screen Back restores Home at the same scroll/state; tapping the Home nav button remounts it fresh from the top. (App.jsx `.tabhost`/`.pushview` + `tabKey`)
  - New Home cards: **Installments** (orange, → Bills tab · Installments seg) + **Projects** (purple, → Budgets · Projects seg), both gated on having data, both added to Customize Dashboard + dash order (existing saved layouts auto-merge the new sections). (done, verified light+dark)
  - Uniform 13px gap below every section card (Budgets was missing its `marginBottom`). (done)
  - Bank-card carousel: **full-bleed to the screen edge** (negative margins on the `.hscroll`, first card aligned at 20px) + tightened the card drop-shadow (negative spread) so each card reads as separate instead of one merged shadow band. (done, verified)
  - **Toast** now slides down from the TOP (below the safe-area) as a clean card, instead of popping from the bottom near the nav. (`saver-ui.css .app .toast` + `toastIn` keyframe)
  - **Customize** button restyled as a centered accent pill (`.customize-cta`, acDim bg + grip-in-badge). (done)
  - NOTE: accent-text contrast was fixed app-wide this session — see B2 (new `--acText` token).
- ☐ A2. Activity (month summary, search/filter entry, grouped list, row states, empty)  ← **NEXT (cursor here)**
- ☐ A3. Bills · Subscriptions (hero, segment, rows, statuses, +)
- ☐ A4. Bills · Installments (hero, segment, rows, progress, +)
- ☐ A5. Profile (header, Your money rows, App rows, version footer)

**Detail screens**
- 🔄 A6. Account ledger (bank-gradient hero, Move, month ledger)
  - Ledger now reads the bank fresh from the store (by id), so an edited colour/name shows immediately. (done)
- ☐ A7. Subscription detail (brand hero+logo, chips, history, record payment, edit)
- ☐ A8. Installment detail (ring, schedule, pay/undo)
- ☐ A9. Goals list + A10. Goal detail (progress, add/return, spending-mode, frozen breakdown, contributions, archive)
- ☐ A11. Budgets/Projects list + A12. Budget detail + A13. Project detail
- 🔄 A14. Accounts list / All accounts
  - **All accounts**: bank cards now in a **2-up grid** (BankCard `grid` mode) instead of one full-width per row. (done)
  - **Delete account** (in the editor): soft-delete — blocked while the account holds money (clear "Empty it first" dialog), else confirms and sets `archived:true`. Archived banks are filtered from every banks list/picker app-wide (`banks.filter(b=>!b.archived)`) but the record stays so historical txns/totals don't break. After delete it returns to the accounts list (popN(2)). (done, verified)
  - Reorder accounts: still TODO.

**Add / input**
- ☐ A15. Add (Expense/Income/Saving — keypad, pickers, vault source)
- ☐ A16. Transfer
- ☐ A17. Quick Add sheet (long-press +)
- ☐ A18. Edit / delete transaction

**Editors & setup**
- 🔄 A19. Account editor · A20. Category editor + list · A21. Goal editor · A22. Budget editor · A23. Subscription editor
  - **Colour picker rebuilt as a shared component** (this session). `ui/ColorSheet.jsx` = the picker sheet: a **colour wheel** (drag the dot: angle=hue, distance=vividness) + a brightness slider + Add; **your colours** above (tap to use, × to remove) with NO fixed presets (seeded with 6 calm removable starters, persisted shared key `et_customColors`). `ui/ColorField.jsx` = the form row used by every editor (label + up to **6** of your colours + a + that opens the sheet). Wired into Account/Category/Goal/Subscription editors (each lost its local `COLORS` array). Account editor hero is a live colour preview; low-balance alert has an explicit "Alert me below" amount field. (done, verified) — Budget/Installment editors have no colour choice.
- ☐ A23. Subscription editor · A24. Installment editor · A25. Quick Actions setup
- ☐ A26. Customize Dashboard (drag + hide)

**System / settings**
- ☐ A27. Smart Filter + A28. Filter Results
- ☐ A29. Appearance (theme + accents) · A30. Privacy & Backup
- ☐ A31. Notifications · A32. Onboarding · A33. What’s New · A34. Empty state · A35. Goal celebration
- ☐ A36. Guide / Manual (currently a deferred empty scaffold — confirm when content lands)

### B · General / cross-cutting — after the pages
- ☐ B1. Typography (DM Sans Latin · IBM Plex Sans Arabic; sizes/weights/line-heights consistent)
- 🔄 B2. Colour & accents (calm palette, semantic in/out/warn/info, dark+light parity per element)
  - Fixed: bright mint accent used as TEXT was invisible on white in light theme. Added `--acText` token (light = darkened accent that passes AA; dark = `--ac`) and swapped all accent text/icon usages to it app-wide. Fills/bars/buttons keep `--ac`. (done)
- ☐ B3. Hero / cover consistency (unified 252px, gradient, orbs)
- ☐ B4. Buttons (sizes, primary/secondary/ghost/danger, pressed/disabled states)
- ☐ B5. Fields & chips (uniform size, consistent label↔value, single-line chips)
- ☐ B6. Cards / list rows / tiles (padding, radius, elevation, dividers)
- ☐ B7. Icons (one set, no emoji, stroke/size consistency, category tiles)
- ☐ B8. Bank cards (gradient, shine, contactless, available/frozen/low-balance)
- ☐ B9. Bottom nav + FAB (squircle, long-press, active states)
- ☐ B10. Overlays (dialog / confirm / toast / sheet — spacing, motion, scrim)
- ☐ B11. Motion (reveal, count-up, transitions; reduced-motion)
- ☐ B12. Spacing / radius / elevation scale (4pt grid)
- ☐ B13. Empty / loading / error states across lists
- ☐ B14. Currency & number formatting (multi-currency, tabular nums)
- ☐ B15. RTL / Arabic readiness (logical props, mirroring)
- ☐ B16. Native readiness (safe-areas, ≥44px touch targets, status/nav bars)
- ☐ B17. Light/Dark parity full pass
- ☐ B18. Copy / tone (friendly voice, no emoji, message catalog)
- ☐ B19. Performance / no console errors / build clean

### C · Sign-off
- ☐ C1. Final functional test with the **real backup** (calc vs real data)
- ☐ C2. Mahmoud final approval → merge to `main` / deploy

---

## 8. Session state / how to resume (updated this session)

**Where we are:** Working through §7 page-by-page. **A1 · Home is essentially done** (awaiting Mahmoud's final ✅). **Current cursor → A2 · Activity** (next to review).

**Done this session (all pushed):** A1 Home polish (customize pill, push-nav back-stack, Installments/Projects cards, uniform gaps, full-bleed + tightened bank-card shadow, top toast) · app-wide accent-text contrast fix (`--acText`) · Accounts area (2-up All-accounts grid, soft-delete account, fresh-bank ledger) · **shared colour picker** (`ui/ColorSheet.jsx` wheel + `ui/ColorField.jsx` row, used in Account/Category/Goal/Subscription editors).

**Navigation:** `App.jsx` uses a real **back-stack** (`stack` array; `push`/`back`/`popN`/`replace`). Detail screens render as an overlay (`.pushview`) over the still-mounted tab (`.tabhost`); Back returns to the previous screen, bottom-nav tap resets the tab fresh (`tabKey`). NOTE: `back` must stay arg-less (it's wired to onClick) — use `popN(n)` for multi-level pops.

**New shared components:** `ui/ColorSheet.jsx`, `ui/ColorField.jsx` (colour); reuse these for any future colour picker. Soft-deleted banks carry `archived:true` — keep filtering them from any new banks list.

**Git / deploy workflow (IMPORTANT — repo is NOT this folder):** This working folder is a file-transfer copy, not a git repo. To push: a clone lives at `/tmp/saver-push` on branch `claude/file-transfer-k1kui7` (remote `https://github.com/mahmoudstate/saver-test.git`). Flow each time: copy changed files from here into `/tmp/saver-push`, `git add -A && commit && push`. GitHub auth (PAT) is saved in the macOS keychain (osxkeychain helper) so push is non-interactive. If `/tmp/saver-push` is gone (reboot), re-clone the branch and re-copy. Latest pushed commit: `70aaef8`.

**Build/verify locally:** `npm run build` → serve `dist` on :8099 → puppeteer screenshot seeding `demo.json` into localStorage (theme via `et_theme`). Verify both light+dark.

**Rules to honour:** logic LOCKED · no emoji · **never change app visual style unprompted — ask first** (memory: no-style-changes) · keep replies short.

> **Current cursor:** start at **A1 · Home**. Mahmoud will paste Home notes; Claude addresses them, then asks to confirm Home before moving to A2.
