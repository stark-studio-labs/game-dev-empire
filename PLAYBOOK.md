# Tech Empire -- Game Development Playbook

A repeatable template for building simulation/tycoon games from zero using AI-accelerated development. This documents the exact process used to build Tech Empire, a game dev tycoon simulator, from empty repo to 87-test-passing, packaged Electron app in approximately 18 hours of wall-clock time.

This playbook is maintained by **Stark Labs** as a reference for future game projects under the ALCUB3 Labs umbrella.

---

## Overview

| Metric | Value |
|--------|-------|
| **Game** | Tech Empire -- a game dev tycoon simulator |
| **Genre** | Business simulation / tycoon |
| **Platform** | Desktop (Electron, macOS) |
| **Source files** | 68 files across `src/game/`, `src/renderer/`, `src/main/` |
| **Lines of code** | 17,000+ JS + 1,200+ CSS + 1,200+ test lines |
| **Game systems** | 28 modules (engine, scoring, finance, staff, events, research, etc.) |
| **UI components** | 27 React components + 6 shared UI primitives |
| **Test suite** | 87 CDP logic tests + 6 Playwright E2E specs |
| **Topics** | 85 curated across 3 unlock tiers |
| **Commits** | 39 commits from scaffold to shipping |
| **Build time** | ~18 hours wall-clock, ~4 days calendar |

---

## Phase 1: Research & Reverse Engineering

**Goal:** Understand the reference game deeply enough to build something better.

### What We Did

1. **Analyzed Game Dev Tycoon source code** -- decompiled and studied the scoring formulas, topic/genre compatibility matrices, platform lifecycle timing, and slider importance weights. Every number in `data.js` traces back to actual GDT internals.

2. **Reverse-engineered formulas** -- extracted the design/tech ratio system, genre importance weights (9 aspects x 6 genres), audience weighting matrices, and the review score calculation. These became `scoring.js` and `ASPECT_RATIOS` in `data.js`.

3. **Studied top mods** -- analyzed what the modding community built on top of GDT to identify missing features: vertical expansion, conferences, hardware labs, IPO mechanics, storyteller events. These became our Tier 2 and Tier 3 feature sets.

4. **Visual analysis** -- studied GDT's UI patterns: progressive disclosure, modal-driven actions, isometric office art, platform parody naming. Documented in `DESIGN-SYSTEM.md`.

5. **Topic curation** -- started with 120+ candidate topics, cut to 85 through quality filtering. Removed redundant topics (6 fantasy variants consolidated to 1), topics that are actually genres (Idle Clicker, Match-3), and topics too mundane for fun gameplay (Barber, Plumber). Documented in `PROGRESSION.md`.

### Outputs
- `src/game/data.js` -- all game constants, topic/genre matrices, platform data
- `src/game/scoring.js` -- review score calculation (faithful to GDT source)
- `PROGRESSION.md` -- topic tiers, feature gating, unlock requirements
- `DESIGN-SYSTEM.md` -- art direction, color system, typography, spacing

### Template Takeaway
> Start by understanding the reference game at the formula level, not the surface level. Decompile if possible. The scoring system IS the game -- get that wrong and nothing else matters.

---

## Phase 2: Core Engine

**Goal:** Build a tick-based simulation engine that can run the entire game loop.

### What We Did

1. **Tick-based architecture** -- 1 tick = 1 game week. Engine runs at configurable speeds (1x/2x/4x/8x, base tick = 5000ms). Every system hooks into the tick: finance, energy, morale, market, research, events, verticals, storyteller.

2. **State machine** -- single `GameEngine` class owns all game state. `newGame()` resets 19 subsystems. `tick()` calls each subsystem in order. State serializes to JSON for save/load.

3. **Development pipeline** -- 3-phase game development (Phase 1: Engine/Gameplay/Story, Phase 2: Dialogues/Level Design/AI, Phase 3: World Design/Graphics/Sound). Each phase has 3 slider aspects the player allocates. Design/tech points accumulate based on slider allocation x aspect ratios.

4. **Scoring formula** -- faithful port from GDT: genre importance weights, topic/genre compatibility, audience weighting, sequel modifiers, frequency penalties, D/T ratio bonuses, random variance. Produces a 1-10 review score that maps to sales.

5. **Save/load** -- full state serialization to localStorage with version tracking.

### Outputs
- `src/game/engine.js` -- core tick loop, state management, all system wiring
- `src/game/scoring.js` -- review score calculation
- `src/game/data.js` -- constants, topics, genres, platforms, aspect ratios
- `src/main/main.js` -- Electron bootstrap

### Template Takeaway
> Build the engine first, UI second. If the tick loop, state management, and core formula work in a headless test, you have a game. Everything else is presentation.

---

## Phase 3: Feature Swarm

**Goal:** Build all game systems in parallel, wiring them into the engine as they land.

This is where AI-accelerated development shines. Each feature module is self-contained with its own state, reset(), and tick() method. Multiple agents can build different modules simultaneously without merge conflicts because each module is a separate file.

### Tier 1 Features (Core Loop)
| Module | File | What It Does |
|--------|------|--------------|
| Finance | `finance.js` | Transaction tracking, cash flow, balance sheet |
| Staff | engine.js (staff state) | Hiring, firing, skill stats, salary |
| Energy | `energy.js` | Staff fatigue, burnout, rest mechanics |
| Events | `events.js` | 15 random events (market crash, viral hit, etc.) |
| Research | `research.js` | 33-item tech tree across 8 categories |
| Market | `market.js` | Dynamic market simulation, platform popularity |
| Marketing | `marketing.js` | 6 campaign types, hype generation |
| Scoring | `scoring.js` | Review scores, critic system |
| Notifications | `notifications.js` | In-game notification queue |

### Tier 2 Features (Growth)
| Module | File | What It Does |
|--------|------|--------------|
| Training | `training.js` | 8 training courses for staff skill-ups |
| Hardware | `hardware.js` | Custom console builder |
| Publishers | `publishers.js` | 8 publisher deals with advance/royalty negotiation |
| Franchise | `franchise.js` | Sequel tracking, franchise value |
| Morale | `morale.js` | Team morale, 8 culture perks |
| Taxes | `taxes.js` | Tax brackets by office level |
| Settings | `settings.js` | Game settings, dev mode toggle |
| Tutorial | `tutorial.js` | Onboarding flow for new players |

### Tier 3 Features (Empire)
| Module | File | What It Does |
|--------|------|--------------|
| Verticals | `verticals.js` | 4 business verticals (Software, Streaming, Cloud, AI) |
| Synergies | `synergies.js` | 6 cross-vertical synergy bonuses |
| Storyteller | `storyteller.js` | Adaptive event engine (30 events, drama score) |
| Personalities | `personalities.js` | Staff personality traits affecting gameplay |
| Timeline | `timeline.js` | Tech industry events (29 historical milestones) |
| Conferences | `conference.js` | 3 annual conferences (E4, Tech Summit, Indie Fest) |
| IPO | `ipo.js` | Public offering, stock price simulation |
| Victory | `victory.js` | 5 Civilization-style victory paths |
| Competitors | `competitors.js` | 6 AI competitor studios |
| Critics | `critics.js` | Named critic system with personalities |

### Outputs
- 28 game module files in `src/game/`
- Each module exports a singleton manager with `reset()`, `tick()`, and action methods

### Template Takeaway
> Design each feature as an independent module with a standard interface (reset, tick, serialize). This enables parallel development -- multiple agents can build different systems in the same session without stepping on each other. Wire them into the engine last.

---

## Phase 4: Design System

**Goal:** Define the visual language before building any UI.

### What We Did

1. **3-tier asset system** -- Tier 1 (commissioned raster art), Tier 2 (SVG icon library), Tier 3 (pure CSS/SVG UI). Each tier has clear production methods and quality bars. Never cross tiers upward.

2. **Color system** -- dark-first palette with 5 background tones, 4 text tones, and 5 accent colors. Each of the 6 verticals gets a signature color. Era-based color temperature shifts (warm amber for Garage, cool blue for Empire).

3. **Typography scale** -- Inter font, 7 size/weight combinations from Display (32px/800) down to Tiny (11px/600). 4px spacing grid.

4. **Platform parody naming** -- 19 platforms, each a recognizable silhouette parody of real hardware (PlayStation becomes PlaySystem, Xbox becomes mBox, etc.).

5. **Micro-animation moments** -- 10 defined emotional peaks (score reveal, fan milestone, office upgrade, IPO bell, etc.) with specific animations and durations.

### Outputs
- `DESIGN-SYSTEM.md` -- the complete art direction bible
- `src/renderer/styles.css` -- 1,200+ lines implementing the design system
- `assets/` -- directory structure for all brand deliverables (18 asset files)

### Template Takeaway
> Write the design system document BEFORE building any UI components. It prevents the "every component looks different" problem that plagues AI-generated UIs. Reference the doc in every component file.

---

## Phase 5: Testing

**Goal:** Verify every game system works correctly through automated tests.

### What We Did

1. **CDP logic tests** -- 87 tests running against a live Electron instance via Chrome DevTools Protocol. Tests cover: core engine state, topic system, game creation flow, scoring, financial operations, staff management, system integration (all 19 subsystems), feature gating, sales mechanics, and victory balance.

2. **Playwright E2E tests** -- 6 spec files testing real user interactions: title screen, game creation wizard, speed controls, UI panel navigation, development flow. These launch the actual Electron app and click through the UI.

3. **Dev mode hooks** -- `_devAutoPlay()` and `_devLoadGame()` methods on the engine for test automation. Auto-play creates a game, sets optimal sliders, and fast-forwards through development. Load-game restores a specific state snapshot.

4. **Test infrastructure** -- `playwright.config.js` configured for Electron testing with screenshot-on-failure. CDP test suite uses Python with websocket connections to the Electron renderer process.

### Outputs
- `tests/cdp_test_suite.py` -- 87 CDP tests (30,550 lines including test data)
- `tests/e2e/` -- 6 Playwright spec files
- `TEST-RESULTS.md` -- full test results (87/87 pass, 100%)
- `playwright.config.js` -- Playwright configuration for Electron

### Template Takeaway
> Use CDP for logic/state testing (fast, direct access to game state via JS evaluation) and Playwright for interaction testing (clicks, navigation, visual verification). CDP tests catch formula bugs. Playwright tests catch wiring bugs.

---

## Phase 6: Polish

**Goal:** Make the game feel good to play, not just work correctly.

### What We Did

1. **Micro-animations** -- score reveal with slot-machine number rolling, confetti particles on fan milestones, camera shake on 9+ scores, glow effects on high scores, countUp animations on financial gains.

2. **Game pacing** -- tuned the base tick speed from 800ms to 5000ms for deliberate gameplay. Added 8x speed tier for players who want to fast-forward. One game year takes approximately 4 minutes at 1x speed.

3. **Feature gating** -- progressive unlock system tied to office level, staff count, games released, and revenue milestones. Prevents overwhelming new players. 6 features locked at game start, gradually unlocking as you grow. Documented in `PROGRESSION.md`.

4. **Phase slider flow** -- GDT-style development phases where the game pauses between each phase to let the player adjust their focus sliders. Creates meaningful decisions at each development checkpoint.

5. **Review screen** -- dramatic score reveal with individual critic scores, average calculation, and sales projection. The emotional peak of each game release.

6. **Notification system** -- toast notifications for events, achievements, financial changes, and game milestones. Non-intrusive slide-in from corner.

### Template Takeaway
> Pacing is more important than features. A game with 10 well-paced features beats one with 50 that fly by too fast. Set your tick speed so each decision feels meaningful, then add speed controls for repeat players.

---

## Phase 7: Brand Assets

**Goal:** Establish the visual identity pipeline for all game art.

### What We Did

1. **Brand asset intake template** -- GitHub issue template at `.github/ISSUE_TEMPLATE/brand-request.yml` for requesting new art assets. Captures tier, dimensions, context, reference, and approval requirements.

2. **Asset directory structure** -- organized under `assets/` with subdirectories for audio, brand, gameover, offices, platforms, staff, verticals, and victory screens.

3. **Tool routing** -- defined which AI model handles which asset type: Nano Banana Pro for raster art (T1), Gemini 3.1 Pro for SVG systems (T2), hand-coded for CSS/SVG UI (T3).

4. **Creative approval flow** -- 7-step process from brief definition through specialist production, creative review, and chairman approval for marquee assets.

### Outputs
- `.github/ISSUE_TEMPLATE/brand-request.yml` -- asset request template
- `assets/` -- 18 asset files across 8 categories
- `DESIGN-SYSTEM.md` (Design Tools Stack section) -- tool routing and workflow

### Template Takeaway
> Define the asset pipeline before generating assets. Know which tool produces which tier, who approves, and where files land. This prevents the "100 random PNGs in root" problem.

---

## Phase 8: Distribution

**Goal:** Package the game for distribution.

### What We Did

1. **Electron packaging** -- `electron-builder` configured for macOS with DMG and ZIP (arm64) targets. App ID: `dev.starklabs.tech-empire`. Category: `public.app-category.games`.

2. **Build configuration** -- `package.json` build section specifies file includes (`src/**/*`, `package.json`), output directory (`dist/`), and signing (disabled for development with `identity: null`).

3. **Build commands** -- `npm run build:mac` for .app bundle, `npm run dist` for DMG installer.

4. **Vendor bundling** -- React, ReactDOM, and Babel bundled locally in `src/renderer/vendor/` to avoid CDN dependencies in packaged builds.

### Outputs
- `package.json` (build section) -- electron-builder configuration
- `dist/` -- build output directory
- `src/renderer/vendor/` -- bundled React/Babel for offline builds

### Template Takeaway
> Bundle all dependencies locally from day one. CDN imports work in development but break in packaged Electron apps. Use `electron-builder` with explicit file lists so you don't accidentally ship `node_modules` in the app bundle.

---

## Key Learnings

### What Worked

1. **Formula-first development** -- starting with reverse-engineered scoring formulas meant the game "felt right" from the first playable build. No amount of UI polish can save bad math.

2. **Module-per-feature architecture** -- every game system in its own file with a standard interface. This made parallel development trivial and merge conflicts nearly impossible.

3. **Design system before components** -- writing `DESIGN-SYSTEM.md` first gave every component a shared visual vocabulary. Dark theme consistency was 7/10 on first pass instead of the usual 3/10.

4. **CDP testing** -- testing game logic directly via Chrome DevTools Protocol was 10x faster than Playwright for state verification. Launch the app once, run 87 tests in seconds.

5. **Gated progression** -- single source of truth in `PROGRESSION.md` for what unlocks when. Prevented the "everything is available immediately" problem that makes tycoon games overwhelming.

6. **Git discipline** -- 39 focused commits with conventional commit messages. Each commit was a shippable increment. No "WIP" commits on main.

### What Didn't Work

1. **Inline styles in React components** -- components accumulated inline styles that diverged from the CSS design system. Should have enforced CSS-only styling from the start.

2. **Missing keyboard/focus states** -- scored 4/10 on hover/focus in design review. Electron apps need keyboard navigation and we didn't build it into the component library.

3. **Test coverage gap in mid-game** -- CDP tests cover early-game and system integration well, but lack coverage for mid-game progression (Year 5-15 gameplay balance). Need longer automated playthroughs.

4. **Asset generation deferred** -- placeholder SVGs shipped instead of final art. The pipeline is defined but not yet exercised end-to-end.

### What to Do Differently Next Time

1. **Build the shared UI component library first** (Toast, Modal, ProgressBar, StatCard, Chart, Tooltip) -- then compose all panels from those primitives. We built it mid-project and retrofitting was painful.

2. **Write Playwright E2E tests alongside each feature** -- not as a batch at the end. Catch wiring bugs immediately.

3. **Set tick speed on day one** -- we changed it 3 times. Define the gameplay rhythm before building any time-dependent system.

4. **Commission key art in Phase 1** -- the game looks incomplete without office backgrounds and platform hardware art. Start the art pipeline in parallel with engineering.

---

## Tools Used

| Tool | Role | Why |
|------|------|-----|
| **Claude Code** | Primary development agent | Built all 28 game modules, 27 components, both test suites |
| **Electron** | Desktop runtime | Cross-platform desktop app with full Node.js access |
| **React 18** | UI framework | Component-based rendering, loaded via vendor bundle (no build step) |
| **Babel** | JSX transform | In-browser JSX compilation via vendor bundle |
| **CDP (Chrome DevTools Protocol)** | Logic testing | Direct JS evaluation against live game state |
| **Playwright** | E2E testing | Browser automation for user interaction testing |
| **electron-builder** | Packaging | DMG/ZIP builds for macOS distribution |
| **Nano Banana Pro** | T1 raster art | Game art generation (planned) |
| **Gemini 3.1 Pro** | T2 SVG systems | Icon/badge/illustration generation (planned) |
| **Figma** | Design source of truth | Mockups, design system, layout specs |
| **Git + GitHub** | Version control | 39 commits, conventional commit messages |

---

## Stats Summary

| Stat | Count |
|------|-------|
| Source files | 68 |
| Lines of JavaScript | 17,000+ |
| Lines of CSS | 1,200+ |
| Lines of test code | 1,200+ |
| Game systems (modules) | 28 |
| UI components | 27 + 6 shared primitives |
| Topics | 85 (30 starter + 26 mid-game + 29 late-game) |
| Genres | 6 |
| Platforms | 19 (parody-named) |
| Research items | 33 |
| Random events | 15 + 30 storyteller events |
| Publisher deals | 8 |
| Marketing campaigns | 6 |
| Training courses | 8 |
| Culture perks | 8 |
| Business verticals | 4 |
| Cross-vertical synergies | 6 |
| Victory paths | 5 |
| AI competitors | 6 |
| Conferences | 3 |
| Tech timeline events | 29 |
| Automated tests | 87 CDP + 6 Playwright specs |
| Git commits | 39 |
| Build targets | macOS DMG + ZIP (arm64) |

---

## Related Documentation

- [README.md](README.md) -- project overview and quick start
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) -- art direction bible
- [PROGRESSION.md](PROGRESSION.md) -- gated unlock system
- [CODE-REVIEW.md](CODE-REVIEW.md) -- full code audit findings
- [TIER3-REVIEW.md](TIER3-REVIEW.md) -- Tier 3 systems review
- [TEST-RESULTS.md](TEST-RESULTS.md) -- automated test results
- [DESIGN-REVIEW.md](DESIGN-REVIEW.md) -- visual design audit

---

*Maintained by Stark Labs. Last updated: 2026-04-01.*
