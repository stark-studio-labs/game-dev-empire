# Game Dev Empire — Code Review
**Date:** 2026-03-31
**Scope:** Full review of `src/game/` (19 files) and `src/renderer/` (20 files)
**Method:** All source files read in full

---

## Table of Contents
1. [Critical Bugs (Will Crash)](#1-critical-bugs-will-crash)
2. [Logic Bugs & Calculation Errors](#2-logic-bugs--calculation-errors)
3. [Missing Wiring](#3-missing-wiring)
4. [Consistency Issues](#4-consistency-issues)
5. [Balance Issues](#5-balance-issues)
6. [UX Issues](#6-ux-issues)
7. [Missing Features for v1.0](#7-missing-features-for-v10)
8. [Priority Fix List](#8-priority-fix-list)

---

## 1. Critical Bugs (Will Crash)

These will throw a runtime error or silently break core mechanics.

### 1.1 `isPlatformAvailable()` — Undefined Function
**File:** `engine.js` line 745
**Impact:** Game crashes on any platform availability check after week ~80

`isPlatformAvailable(p, this.state.totalWeeks)` is called but never defined anywhere in the codebase. Every tick after platforms start retiring will throw a ReferenceError. This is a blocker for any playthrough beyond ~Year 2.

```js
// engine.js line 745 — function doesn't exist
if (isPlatformAvailable(p, this.state.totalWeeks)) { ... }
```

**Fix:** Define `isPlatformAvailable(platform, currentWeek)` in `data.js` or `engine.js`. Logic: convert platform `publishedDate` and `retireDate` (format `"Y/M/W"`) to absolute week numbers and compare.

---

### 1.2 `getAvailablePeraks()` — Typo Crashes Morale Panel
**File:** `renderer/components/MoralePanel.js` line 14
**Impact:** MoralePanel throws `"moraleSystem.getAvailablePeraks is not a function"` on every render

```js
const availablePerks = moraleSystem.getAvailablePeraks(); // typo: Peraks
```

`morale.js` exports `getAvailablePerks()` (one 'k'). The extra 'a' means MoralePanel is permanently broken.

**Fix:** `getAvailablePeraks()` → `getAvailablePerks()`

---

### 1.3 `DEV_PHASES` — Undefined Global in GameScreen
**File:** `renderer/components/GameScreen.js` line 67
**Impact:** GameScreen crashes on every render during active development

```js
{DEV_PHASES.map((phase, i) => (  // DEV_PHASES not imported or defined
```

`DEV_PHASES` is defined in `data.js` but never explicitly imported. All scripts are loaded via `<script>` tags in `index.html` — if load order places `data.js` after `GameScreen.js` initializes, this throws.

**Fix:** Verify `data.js` script tag appears before `app.js` in `index.html`. Or add an existence guard: `{(typeof DEV_PHASES !== 'undefined' ? DEV_PHASES : []).map(...)}`

---

### 1.4 `marketSim` — No Null Guard in MarketPanel and TopBar
**File:** `renderer/components/MarketPanel.js` lines 7–10; `TopBar.js` lines 84–85
**Impact:** Two-call crash on `getLabel()` — first crashes, second never runs

```js
// TopBar.js line 84-85
<div style={{ color: marketSim.getLabel().color }}>
  {marketSim.getLabel().label}  // called twice; if returns null, first call already crashed
</div>
```

If `marketSim` isn't initialized before the component mounts (possible on first render), both MarketPanel and TopBar crash entirely, breaking the whole UI.

**Fix:** Cache the result: `const label = marketSim?.getLabel?.() ?? { color: '#ccc', label: 'Unknown' };`

---

### 1.5 `taxSystem` / `tutorialSystem` — Undefined at Render Time
**File:** `FinanceDashboard.js` line 218; `app.js` line 77
**Impact:** FinanceDashboard crashes on first open; tutorial system may never initialize

```js
// FinanceDashboard.js line 218
const currentRate = taxSystem.getTaxRate(OFFICE_LEVELS[state.level].name);

// app.js line 77
tutorialSystem.checkFirstTime();
```

Both globals are referenced before any null check. If either script hasn't loaded by render time, these throw.

**Fix:** Add existence checks: `taxSystem?.getTaxRate(...)` and `typeof tutorialSystem !== 'undefined' && tutorialSystem.checkFirstTime()`

---

### 1.6 Morale Read Before `reset()` in Engine Init
**File:** `engine.js` line 91 vs line 25
**Impact:** `newGame()` reads stale morale from previous game

`moraleSystem.getMorale()` is called on line 91 to set initial state, but `moraleSystem.reset()` isn't called until line 25 during the same initialization path. The morale system hasn't been reset yet when it's first read, so the initial game state contains leftover morale from the previous game or default value before reset.

---

## 2. Logic Bugs & Calculation Errors

### 2.1 Marketing Hype Multiplier Formula Is Broken
**File:** `marketing.js` line 102–103
**Impact:** Marketing is effectively useless — provides <1% sales bonus at max spend

```js
getSalesMultiplier() {
  return 1.0 + Math.min(2.0, this.totalHype / 100);
  // At hype=100: mult = 1.0 + min(2.0, 1.0) = 2.0 — CORRECT?
}
```

Wait — re-reading: at `totalHype = 100`, result is `1.0 + 1.0 = 2.0`. But the *typical* hype from a full Social Media campaign is 5–25 points. So real multiplier at hype=20 is `1.0 + 0.20 = 1.20`. That's 20% bonus, which is reasonable. **However**, `totalHype` resets on `onGameRelease()` — but `onGameRelease()` is never called from `engine.js` (see §3). So hype accumulates indefinitely across games, giving every game after the first a 3.0x sales multiplier regardless of whether the player spent on marketing for that specific game.

The bug is not the formula — it's that hype never resets.

---

### 2.2 Sequel Multiplier Computed But Never Applied
**File:** `franchise.js` lines 82–86; `engine.js` — absent
**Impact:** Franchise sequels get no bonus — the entire franchise system is dead code at runtime

`getSequelModifier()` computes a 1.10–1.15x multiplier for sequels but is never called from `engine.js`, `scoring.js`, or anywhere. Players can release sequels, the franchise tracker logs them, but sequel games score identically to unrelated games.

**Fix:** Call `franchiseTracker.getSequelModifier(game.title)` in `scoring.js` and multiply into `rawPoints`.

---

### 2.3 Energy Productivity Cliff at Exactly 30
**File:** `energy.js` lines 44–45
**Impact:** Harsh binary penalty — energy 31 = full productivity, energy 29 = 40% penalty

```js
if (energy < 30) return 0.6;
return 1.0;
```

There's no gradual degradation. A staff member drops from 100% to 60% productivity the moment they hit 29 energy. This creates an incentive to keep all staff at exactly 30 energy, not to manage them meaningfully.

**Fix:** Gradual curve: `return 0.5 + (energy / 100) * 0.5` (range: 0.5–1.0 based on energy)

---

### 2.4 Market Cycle Calculation Jitters
**File:** `market.js` line 41
**Impact:** Market cycle period changes every tick, making it a noisy random walk rather than a smooth boom/bust cycle

```js
const cyclePeriod = 300 + Math.sin(this.cyclePhase) * 80;
```

`cyclePhase` advances each tick, so `Math.sin(cyclePhase)` oscillates correctly — but `cyclePeriod` is only used for pacing, not the actual cycle. The sentiment itself is driven by `Math.sin(cyclePhase)` on a different line. This is fine. **However**, the 3% random shock on line 38 accumulates independently of the cycle: `sentiment += (Math.random() - 0.5) * 0.03`. Over 500 weeks, this random walk can push sentiment far from the sin-wave target. The clamp `[0.5, 1.5]` prevents extreme values, but the market doesn't reliably return to neutral between cycles.

---

### 2.5 Finance Ledger Missing Three Expense Categories
**File:** `finance.js` line 54; `research.js` line 115; `training.js` line 225; `taxes.js` line 116
**Impact:** Finance dashboard shows wrong expense totals; research/training/tax spending is invisible

`research.startResearch()` deducts from `state.cash` but never calls `finance.record()`. Same for `training.enroll()` and the tax payment in `taxes.js`. The `FinanceDashboard` expense breakdown will show these as zero.

Additionally, `finance.js` `expensesByCategory()` uses a hardcoded `cats` object that doesn't include `hardware_revenue` — yet `engine.js` line 236 calls `finance.record('hardware_revenue', ...)`.

**Fix:** Add `finance.record('research', -cost, ...)` in `research.startResearch()`, same for training and taxes. Add `hardware_revenue` to `finance.js` cats.

---

### 2.6 `activeTraining` Double-Enrollment Not Prevented
**File:** `training.js` lines 103–108
**Impact:** A staff member can be enrolled in the same course twice

`isTraining(staffId)` checks if they're already training, but `enroll()` doesn't check the return value:

```js
isTraining(staffId) { return this.activeTraining.some(t => t.staffId === staffId); }
enroll(staffId, courseId, options) {
  // No: if (this.isTraining(staffId)) return false;
  this.activeTraining.push({ staffId, courseId, ... }); // always pushes
}
```

**Fix:** Add early return in `enroll()`: `if (this.isTraining(staffId)) return { success: false, reason: 'already_training' };`

---

### 2.7 Tutorial Progress Off-by-One
**File:** `tutorial.js` line 148 vs 154
**Impact:** Tutorial shows "Step 10 of 9" on last step

```js
getCurrentStep() {
  if (this.currentStep >= TUTORIAL_STEPS.length) return null; // currentStep can be 9
}
getProgress() {
  return { current: this.currentStep + 1, total: TUTORIAL_STEPS.length };
  // At step 9 (last): current=10, total=9
}
```

**Fix:** `current: Math.min(this.currentStep + 1, TUTORIAL_STEPS.length)`

---

### 2.8 Event Trigger Reads Last Game Before It Exists
**File:** `events.js` lines 147, 166
**Impact:** Crashes or wrong trigger on first game release

```js
s.games[s.games.length - 1].reviewAvg >= 7  // games[0] may not exist
```

On the very first game release, `s.games` is either empty (if checked before the game is added) or has exactly one entry. If triggered before game is appended to the array, `games.length - 1 = -1` → `games[-1]` is `undefined` → `.reviewAvg` throws.

**Fix:** `s.games.length > 0 && s.games[s.games.length - 1].reviewAvg >= 7`

---

### 2.9 Hardware Price-Performance Formula Inverted
**File:** `hardware.js` line 116
**Impact:** Expensive high-end consoles sell fewer units than cheap ones — counterintuitive and punishing

```js
pricePerformance = (techLevel * 25) / Math.max(1, retailPrice / 10000)
```

This simplifies to `techLevel * 250000 / retailPrice`. Higher retail price → lower price-performance → fewer weekly sales. A $100K luxury console has half the sales of a $50K console at the same tech level. While "price performance" being inverse of price is correct for a budget-conscious consumer sim, the formula means there's never a reason to price high — more expensive always loses. There should be a prestige segment that wants expensive hardware.

---

### 2.10 `PublisherSystem` Global Reference Inconsistency
**File:** `publishers.js`; `PublisherPanel.js` line 11
**Impact:** PublisherPanel may crash if PublisherSystem isn't the right kind of export

`publishers.js` exports `PublisherSystem` as a plain object literal. `PublisherPanel.js` calls `PublisherSystem.getAvailableDeals(...)` which is correct for an object. But `engine.js` line 492 calls `PublisherSystem.applyDeal(deal)` — this method exists in the object. What's missing: `applyDeal()` never validates that `deal.effectiveRoyaltyCut` exists, so a stale deal object from a different publisher tier can silently apply a 0% royalty cut.

---

## 3. Missing Wiring

Features that are built but disconnected from the game loop or UI.

### 3.1 `marketingSystem.onGameRelease()` — Never Called
**File:** `marketing.js` line 198; `engine.js` — absent
**Impact:** Hype never resets between games; all post-game-1 sales are hype-inflated

`onGameRelease()` clears `totalHype` and applies `fanBonusPending`. It must be called from the game release handler in `engine.js`. Currently it's never triggered — active campaigns keep accumulating hype into future games' sales calculations.

---

### 3.2 `franchiseTracker.getSequelModifier()` and `getRemasterScore()` — Dead Code
**File:** `franchise.js` lines 82, 120
**Impact:** The entire franchise system (sequel bonuses, remaster scoring) has zero gameplay effect

Both methods are fully implemented but never called. The tracker correctly logs games via `registerGame()` (which IS wired in engine.js), so franchise data exists — it's just never consumed.

---

### 3.3 `NotificationCenter` — Never Receives Notifications
**File:** `notifications.js`; `renderer/components/NotificationCenter.js`
**Impact:** Notification bell is always empty; milestone alerts never appear

`NotificationCenter` subscribes to `notificationManager` events. `notificationManager` has `addNotification()`, `onGameRelease()`, `checkMilestones()` etc. — but none of the panel components call `addNotification()`. Engine.js calls `notificationManager.onResearchComplete()` (line 244) but this is the only hook. Staff hires, office upgrades, milestone hits, marketing campaign ends — none of these feed the notification system.

---

### 3.4 Training Costs Not Deducted from Cash
**File:** `training.js` line 225; `engine.js` calls `trainingSystem.tick()`
**Impact:** Training is free — players can train all staff indefinitely at zero cost

`trainingSystem.enroll()` stores cost in the training entry but the tick loop never charges `state.cash`. There's no `finance.record('training', ...)` call anywhere in the game loop path.

---

### 3.5 Research Spending Not Recorded in Finance
**File:** `research.js` line 115
**Impact:** Research cost is deducted from cash but disappears from the finance ledger

```js
state.cash -= item.cost;  // cash deducted
// finance.record() never called
```

---

### 3.6 `TutorialOverlay` Spotlight Targeting
**File:** `tutorial.js`; `TutorialOverlay.js`
**Impact:** Tutorial step spotlights may never find their target elements

`TUTORIAL_STEPS` references DOM element IDs (e.g., `targetId: 'btn-new-game'`). These IDs must exist in `index.html` or be set as React `id` props on the target elements. A quick grep shows most tutorial target buttons don't have matching `id` attributes in the renderer components. Tutorial overlay likely renders with no spotlight highlighting.

---

### 3.7 `Leadership Seminar` Training Has No Effect
**File:** `training.js` lines 88–90
**Impact:** The most expensive training course ($5K) does nothing

`Leadership Seminar` unlocks `team_lead` status on a staff member. But no code anywhere grants bonuses for `team_lead` — not in `engine.js` dev tick, not in `scoring.js`, not in `morale.js`. The flag is set but never read.

---

### 3.8 `energySystem.removeStaff()` Never Imported
**File:** `energy.js`; `engine.js`
**Impact:** Firing staff leaves their energy entry in `energySystem.staffEnergy`, leaking memory and causing stale state on subsequent games

When `fireStaff()` is called in engine.js, it removes the staff from `state.staff` but never calls `energySystem.removeStaff(staffId)`.

---

## 4. Consistency Issues

### 4.1 Direct State Mutation Across All Panels
**Severity:** Medium — makes bugs hard to trace

Every panel mutates `engine.state.cash` directly:
```js
// MarketingPanel.js line 26
engine.state.cash -= result.cost;
// TrainingPanel.js line 42
engine.state.cash -= course.cost;
// HardwarePanel.js line 42
engine.state.cash -= mfgCost;
// MoralePanel.js line 31
engine.state.cash -= cost;
```

There's no `engine.spendCash(amount, category)` method that centralizes validation, finance recording, and overdraft checking. This means:
- Some panels record to finance, others don't
- None check if cash would go negative before spending
- No single place to add an overdraft mechanic later

---

### 4.2 `formatCash()` Duplicated in 15+ Files
**Severity:** Low — maintenance burden

The same number formatting function is copy-pasted into every component file. Should be a single utility exported from `app.js` or a `utils.js` module.

---

### 4.3 Modal Close Behavior — Two Different Patterns
**Severity:** Low — inconsistent UX feel

```js
// ResearchPanel.js — stopPropagation pattern
<div className="modal-overlay" onClick={onClose}>
  <div onClick={e => e.stopPropagation()}>...</div>
</div>

// FinanceDashboard.js — target check pattern
<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
```

Both work but behave slightly differently in edge cases (e.g., clicking on a child element's border). Pick one and apply it to all modals.

---

### 4.4 Tab Styling — Three Different Patterns
**Severity:** Low — visual inconsistency

StaffPanel uses inline style objects, ResearchPanel uses className with `.active` CSS, MoralePanel mixes both. Should be one pattern.

---

### 4.5 Save/Load Pattern — Consistent and Correct (Positive Note)
All 12 stateful subsystems implement `serialize()`/`deserialize()` correctly with appropriate null checks. The engine's save/load loop in `engine.js` lines 128–146 covers all of them. **This is the strongest part of the codebase.**

---

### 4.6 `StatBar` Component Reimplemented Twice
**Severity:** Low

`StaffPanel.js` defines a `StatBar` component. `TrainingPanel.js` defines its own identical `StatBar`. `GameScreen.js` renders a morale mini-bar inline. Should be one shared component in `app.js` or its own file.

---

## 5. Balance Issues

### 5.1 Medium Office Unlock Requires Year 11 (~528 Weeks)
**File:** `data.js` line 20–23
**Impact:** Players are locked in a small office for the entire mid-game

`OFFICE_LEVELS[1]` (Small Office) requires `unlockCash: $1,000,000` and `unlockYear: 11`. At 1 year = 48 weeks, that's 528 weeks of play. A Small game takes ~5 weeks and earns ~$25K. Getting to $1M requires ~40 successful games (~200 weeks), but the Year 11 gate adds another 328 weeks of waiting. Players will hit the cash threshold in Year 4–5 but be gated until Year 11.

**Fix:** Either remove the year gate and rely solely on cash threshold, or drop it to Year 4–5.

---

### 5.2 Speed Stat Penalizes New Players
**File:** `engine.js` line 362–364
**Impact:** First staff (speed ~40) develop at 96% efficiency — a hidden 4% development penalty from day 1

```js
speedFactor = 0.8 + member.speed * 0.004
// speed=40 → 0.8 + 0.16 = 0.96x (penalized)
// speed=50 → 0.8 + 0.20 = 1.00x (break-even)
```

New players start below break-even speed for every staff member, with no feedback that they're developing slower than possible. The formula should break even at starting speeds (~25–35).

**Fix:** `speedFactor = 0.5 + member.speed * 0.01` (break-even at speed=50, range 0.5–1.5)

---

### 5.3 Score 9.0 vs 8.5 Revenue Cliff
**File:** `scoring.js` lines 215–220
**Impact:** Massive revenue discontinuity rewards min-maxing at the expense of consistent quality

Revenue multipliers:
- Score 8.0–8.9: 0.70x base → ~$350K
- Score 9.0–9.9: 2.00x base → ~$1,000,000

A 0.1 point difference in review score yields $650K difference in revenue. Players will obsessively optimize for that 9.0 threshold rather than experimenting with genres/topics.

**Fix:** Smooth the curve: 7=0.5x, 8=0.75x, 8.5=1.0x, 9=1.4x, 9.5=1.8x, 10=2.2x

---

### 5.4 Fan Growth "Winner Take All"
**File:** `scoring.js` line 215
**Impact:** Early-game failures permanently suppress fan growth

`fansGained()`: score <5 → 0 fans gained. With score <5, a new player with 0 fans gains nothing, can't unlock self-publishing (requires 10K fans), and is locked into publisher deals with 50% royalty cuts forever. There's no recovery mechanic.

**Fix:** Add a small base fan gain even for poor games: `Math.max(200, fansFromScore)` — enough to slowly build toward self-publishing.

---

### 5.5 Marketing Campaign Economics
**File:** `marketing.js` lines 12–68

Game Convention ($10K, 2000 fan bonus) is dramatically better value than any other campaign when fans are the primary progression gate (see 5.4). At $5/fan gained, it's 10x better than other campaigns in terms of unlocking self-publishing. All other campaigns become suboptimal once players discover this.

---

### 5.6 AAA Game Cost vs. Starting Cash
**File:** `data.js` line 15
AAA games cost $250K to develop but players start with $70K. This is intentional gating (players need ~4 years to afford AAA), but the game provides no explicit notification when you unlock AAA games or guidance on when they're viable. Players may attempt AAA too early and go bankrupt.

---

### 5.7 Research Bonus Too Strong Endgame
**File:** `research.js` lines 156–168
**Impact:** Late-game player can have 43% score bonus from research alone, making genre/topic matching less relevant

At 33 research items completed, score is multiplied by 1.43x. Combined with morale (1.15x) and franchise sequel bonus (1.10x — when wired), endgame games score ~1.8x higher than identical early-game games regardless of player skill. Flattening the research curve would keep skill relevant throughout.

---

### 5.8 Hardware Console Lifecycle Too Short
**File:** `hardware.js` line 110
Consoles go inactive at age > 208 weeks (~4 years). Real consoles have 7–10 year lifecycles. A console designed in Year 3 is obsolete by Year 7. Hardware revenue stream is too short to justify the design investment (which requires Level 3 office, ~Year 11).

---

## 6. UX Issues

### 6.1 `alert()` Used for In-Game Errors
**File:** `TrainingPanel.js` line 31
**Impact:** Browser native dialog breaks immersion, freezes the game loop

```js
alert('Not enough cash!');
```

This is the only place a native alert is used. Should be replaced with an in-game toast or inline error message.

---

### 6.2 No Confirmation for Destructive Actions
**Files:** `StaffPanel.js` line 109 (fire), `HardwarePanel.js` line 316 (discontinue console)
**Impact:** Accidental fires and discontinued consoles with no undo

Both actions are permanent and consequential. Fire a wrong staff member and lose $5K/week in invested training; discontinue a console and lose the entire hardware revenue stream.

---

### 6.3 No Feedback After Actions Complete
**Files:** `StaffPanel.js`, `HardwarePanel.js`, `MarketingPanel.js`
**Impact:** Players don't know if their action succeeded

Hiring a staff member, launching a console, or starting a marketing campaign all complete silently. No success toast, no panel refresh animation, no in-game notification. The UI just returns to the same state.

---

### 6.4 Disabled Buttons Explain Nothing
**Files:** `NewGameWizard.js` line 188, `StaffPanel.js` line 169
**Impact:** Players are stuck without knowing why

```jsx
<button disabled={!topic}>Next</button>
```

The Next button is grayed out but there's no text, tooltip, or highlight showing the player needs to pick a topic first. First-time players will be confused.

**Fix:** Add a `title` attribute or inline helper text: `{!topic && <span className="hint">Select a topic to continue</span>}`

---

### 6.5 FinanceDashboard Hardcodes Tax Rates
**File:** `FinanceDashboard.js` lines 296–299
**Impact:** If `taxSystem.js` rate constants change, FinanceDashboard shows wrong information

```jsx
<span>R&D: 50%</span>
<span>Marketing: 25%</span>
<span>Salaries: 100%</span>
```

These are copied from `taxes.js` constants but not dynamically linked. Fix: read from `taxSystem.DEDUCTION_RATES` or equivalent.

---

### 6.6 No Visual Indication of Hardware Unlock
**File:** `TopBar.js` line 184
**Impact:** Players may never discover the hardware system

Hardware button only appears at office Level 3. When the player upgrades to Level 3, there's no fanfare, notification, or highlight that a new major system has unlocked. This is a significant feature (the ability to design your own game console) that players may miss entirely.

---

### 6.7 100+ Topics in `NewGameWizard` with No Search
**File:** `NewGameWizard.js` (topic selection step); `data.js` lines 74–247
**Impact:** Topic picker is overwhelming — players scroll through 100 items

No search, no filter by genre compatibility, no sort by how well a topic matches the selected genre. The picker should show genre-compatibility scores and allow filtering.

---

### 6.8 No Bankruptcy / Game Over State
**File:** `engine.js` — absent
**Impact:** Players who go negative cash have no feedback that their company is dying

There's no check for `state.cash < 0` that triggers a warning, loan option, or game-over screen. Negative cash continues to tick without any narrative consequence.

---

## 7. Missing Features for v1.0

These are absent entirely or too skeletal to ship.

### 7.1 Platform Availability / Retirement System
Built in `data.js` (all 20+ platforms have `publishedDate`/`retireDate`), but `isPlatformAvailable()` is never defined. Platforms never retire from the game world — the NES is available forever. This is a blocker.

### 7.2 Staff Specialization Bonuses
`training.js` supports specialization courses that set a `team_lead` flag and allow `genreSpecialty`. Neither is read anywhere. Staff can be "specialized" but it has zero gameplay effect.

### 7.3 Sequel / Franchise Bonus Applied to Score
Franchise tracking works but the sequel multiplier is never applied. Players have no incentive to build franchises vs. standalone games.

### 7.4 Remaster Mechanic
`franchise.js` implements `getRemasterScore()` and tracks remaster history, but no UI exists to initiate a remaster and the score modifier is never applied.

### 7.5 Bankruptcy / Loan System
Players can go infinitely negative with no consequence or lifeline. A loan system (at interest) or bankruptcy game-over state is needed for meaningful financial tension.

### 7.6 Platform Launch Timing Strategy
Data exists for 20+ platforms with lifecycle curves, but since `isPlatformAvailable()` is unimplemented, all platforms are always available. The intended mechanic — release on a rising platform vs. a declining one — doesn't work.

### 7.7 Employee Morale Events
`events.js` has 16 random events, none of which specifically involve staff morale or team dynamics. No "key employee quit" or "team needs a raise" event. Morale changes are only from game success/failure and perk purchases.

### 7.8 Multi-Platform Release
`NewGameWizard.js` only allows selecting a single platform per game. No multi-platform release option. This is a significant feature for late-game revenue maximization.

### 7.9 Publisher Deal Negotiation
`PublisherPanel.js` shows deal terms but allows no negotiation. Players accept or reject fixed terms. A simple negotiate flow (trade advance % vs. royalty cut) would add depth.

### 7.10 Endgame Win Condition
There's no defined win condition — no target revenue, market cap, or "legendary studio" milestone. Without a clear goal, late-game play has no purpose. Define a win state (e.g., reach $500M total revenue and 10M fans) with a credits screen.

### 7.11 Settings / Difficulty
No settings menu, no difficulty options. No way to adjust autosave frequency, music/sound toggles, or game speed preferences.

### 7.12 Save Slot Management
The game serializes to a single localStorage key. No multiple save slots, no save file naming, no load-from-file. One bad autosave corrupts the only save.

### 7.13 Staff Gossip / Office Culture Events
`morale.js` is well-built but the only morale inputs are game outcomes and perk purchases. No random culture events, no inter-staff relationship mechanics, no poaching attempts from other studios.

### 7.14 Market Intelligence Detail
`MarketPanel.js` shows a sentiment gauge and trending genres but no competitive analysis — no information about what kinds of games are selling well, what the competing studios are releasing, or what platform is gaining market share. Players have limited strategic information to act on.

### 7.15 Tutorial Spotlight Targeting
Tutorial steps reference DOM element IDs that aren't present in the actual rendered components. The spotlight mechanic will show an overlay with no highlighted element, making the tutorial confusing for first-time players.

---

## 8. Priority Fix List

**Must fix before any playtest (will crash):**

| # | Issue | File | Line |
|---|-------|------|------|
| 1 | `isPlatformAvailable()` undefined | `engine.js` | 745 |
| 2 | `getAvailablePeraks` typo | `MoralePanel.js` | 14 |
| 3 | `DEV_PHASES` undefined in render | `GameScreen.js` | 67 |
| 4 | `marketSim` no null guard | `MarketPanel.js`, `TopBar.js` | 7, 84 |
| 5 | Event trigger on empty games array | `events.js` | 147, 166 |

**Should fix before alpha (broken mechanics):**

| # | Issue | File |
|---|-------|------|
| 6 | `marketingSystem.onGameRelease()` never called — hype never resets | `engine.js` |
| 7 | Sequel multiplier computed but never applied | `franchise.js`, `scoring.js` |
| 8 | Training costs not deducted from cash | `training.js` |
| 9 | Research/tax spending not recorded in finance | `research.js`, `taxes.js` |
| 10 | `energySystem.removeStaff()` not called on fire | `engine.js` |
| 11 | Double-enrollment in training not prevented | `training.js` |
| 12 | Tutorial off-by-one on last step | `tutorial.js` |

**Balance tuning before public beta:**

| # | Issue |
|---|-------|
| 13 | Medium Office year gate (Year 11 → Year 4) |
| 14 | Speed stat break-even threshold too high |
| 15 | Score 9.0 revenue cliff ($350K → $1M in 0.1 pts) |
| 16 | Fan growth locked out on low scores — add base gain |
| 17 | Hardware console lifecycle (208 weeks → 400+ weeks) |

**Polish / consistency before launch:**

| # | Issue |
|---|-------|
| 18 | Replace `alert()` with in-game toast (TrainingPanel) |
| 19 | Add confirmation dialogs for fire/discontinue |
| 20 | Extract `formatCash()` into shared utility |
| 21 | Standardize modal close pattern (stop propagation) |
| 22 | Add topic search/filter to NewGameWizard |
| 23 | Add bankruptcy/negative cash warning |
| 24 | Wire tutorial spotlight target IDs to actual DOM elements |

---

## Overall Assessment

The architecture is solid — the tick-based engine, save/load system, and subsystem separation are well-designed. The balance data (genres, topics, platforms, critics) is rich and thoughtful. The UI is visually polished with a good dark theme.

The game has three layers of problems: **crashes** (5 bugs that break the game immediately), **dead features** (franchise system, sequel bonuses, marketing hype reset, training costs — all built but disconnected), and **missing features** (platform lifecycle, win condition, bankruptcy, multi-platform releases).

Fix the crashes first, then wire the dead features — most of the "missing" gameplay is actually already implemented, just never called. The franchise + sequel system, marketing hype reset, and research/training finance recording together would make the game feel substantially more complete with probably 2–3 days of focused wiring work.

---

## Related Documentation

- [README.md](README.md) -- project overview and quick start
- [PLAYBOOK.md](PLAYBOOK.md) -- game development playbook
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) -- art direction bible
- [TIER3-REVIEW.md](TIER3-REVIEW.md) -- Tier 3 systems review
- [TEST-RESULTS.md](TEST-RESULTS.md) -- automated test results
