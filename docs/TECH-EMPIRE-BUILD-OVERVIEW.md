# Tech Empire — Build Overview & Stark Studios Team Spec

How Tech Empire was built, what roles were needed, and what the ALCUB3 Games team needs to replicate this for every future title.

---

## What Was Built

| Metric | Value |
|--------|-------|
| **Total files** | 66 |
| **Lines of code** | 17,000+ |
| **Game systems** | 45+ features |
| **Tests** | 112 (87 CDP logic + 25 Playwright E2E) |
| **Topics** | 85 curated across 3 unlock tiers |
| **Platforms** | 21 with lifecycle dates |
| **Victory paths** | 5 Civilization-style |
| **Verticals** | 14 planned (4 in base + 3 DLC packs) |
| **Build time** | ~18 hours initial build (agent swarm), ~3 days polish |
| **Stack** | Electron 35 + React 18 + Babel standalone + custom CSS |

---

## How It Was Built — Phase by Phase

### Phase 1: Research & Reverse Engineering
**What I did:** Decompiled Game Dev Tycoon, analyzed scoring formulas, studied 10+ top mods, reviewed Civilization mechanics for victory paths, built competitive comparison report.

**Role this maps to:** `Game Designer` + `Research Analyst`

**Artifacts:**
- `research/gdt-reverse-engineering.md` (1,257 lines)
- `research/game-dev-tycoon-modding-api-deep-dive.md` (563 lines)
- `research/gdt-visual-analysis.md` (753 lines)
- `research/civilization-mechanics-analysis.md` (~700 lines)
- `research/competitive-comparison-with-plan.md`
- `research/tycoon-player-wants.md`

### Phase 2: Core Engine
**What I did:** Built tick-based simulation engine from scratch. Game week = 1 tick. All systems hook into the tick loop. State management, save/load, office progression, game development lifecycle (concept → design → production → testing → release → sales).

**Role this maps to:** `Engine Programmer` + `Systems Designer`

**Key files:**
- `src/game/engine.js` — Core tick loop, all systems wire here
- `src/game/data.js` — All game data (topics, genres, platforms, offices)
- `src/game/scoring.js` — GDT-faithful scoring with modifications

### Phase 3: Feature Swarm (Parallel Agent Build)
**What I did:** Deployed 3-5 parallel agents, each building 2-3 features simultaneously on non-overlapping files. This is where the bulk of the 17K lines came from in ~18 hours.

**Role this maps to:** `Gameplay Programmers` (plural — this was a team effort)

**Systems built in parallel:**

| System | File | Lines | Description |
|--------|------|-------|-------------|
| Verticals | `verticals.js` | 432 | 4 tech business verticals (SaaS, Streaming, Cloud, AI) |
| Synergies | `synergies.js` | 160 | 6 cross-vertical bonuses + mega-bonus |
| Storyteller | `storyteller.js` | 449 | RimWorld-style adaptive event engine |
| Personalities | `personalities.js` | 219 | 10 staff traits, chemistry system |
| Timeline | `timeline.js` | 336 | 30 real-world tech events (renamed) |
| Conferences | `conference.js` | 280 | G3, GamesCon, Indie Showcase annual events |
| IPO | `ipo.js` | 258 | Stock price sim, quarterly board meetings |
| Competitors | `competitors.js` | 546 | 6 AI rival studios, procedural game releases |
| Victory | `victory.js` | — | 5 victory paths with tracker |
| Critics | `critics.js` | 244 | 8 named critic archetypes with quotes |
| Taxes | `taxes.js` | 196 | Quarterly tax with R&D/marketing deductions |
| Energy | `energy.js` | 174 | Staff fatigue, smoothed productivity curve |
| Marketing | `marketing.js` | 243 | 6 campaign types, hype system |
| Morale | `morale.js` | 172 | 0-100 scale, 8 culture perks |
| Franchise | `franchise.js` | 160 | Sequel tracking, fatigue, remasters |
| Events | `events.js` | — | 16 branching random events |
| Research | `research.js` | — | 33 items across 7 categories |
| Market | `market.js` | — | Boom/bust cycles, trending genres |
| Training | `training.js` | 280 | 8 training courses |
| Hardware | `hardware.js` | 234 | Custom console builder |

### Phase 4: UI & Rendering
**What I did:** Built all React components — TopBar HUD, NewGameWizard (5-step), PhaseSliderModal, every panel (Finance, Staff, Research, Market, etc.), 6 shared UI primitives (Toast, Modal, Tooltip, ProgressBar, StatCard, Chart).

**Role this maps to:** `UI Programmer` + `UX Designer`

**Key files:**
- `src/renderer/app.js` — React app entry, 20+ state variables
- `src/renderer/components/TopBar.js` — HUD with feature gating
- `src/renderer/components/NewGameWizard.js` — 5-step game creation
- `src/renderer/components/PhaseSliderModal.js` — Dev phase interaction
- `src/renderer/components/ui/` — 6 shared primitives

### Phase 5: Design System & Art Direction
**What I did:** Wrote the full design system (DESIGN-SYSTEM.md), defined 3-tier asset system (T1 Raster, T2 SVG, T3 CSS), established color palette, typography, spacing, micro-animations. Managed Victor for brand assets — filed 9 GitHub issues with full specs, reviewed deliveries, gave feedback.

**Role this maps to:** `Art Director` + `Technical Artist` + `Producer`

**Artifacts:**
- `DESIGN-SYSTEM.md` (289+ lines)
- 9 brand request issues filed with full specs
- Asset review cycles (V1 → V2 → V3 → V4 → V5)

### Phase 6: Testing
**What I did:** Built CDP test suite (87 logic tests via Chrome DevTools Protocol WebSocket), built Playwright E2E suite (25 UI tests), added `_devAutoPlay()` bridge for React CDP interaction, managed test results.

**Role this maps to:** `QA Engineer` + `Test Automation Engineer`

**Key files:**
- `tests/cdp_test_suite.py` — 87 logic tests
- `tests/e2e/*.spec.js` — 5 Playwright test files
- `playwright.config.js` — Electron launch config

### Phase 7: Game Balance & Data Curation
**What I did:** Curated 85 topics from 200+ candidates (removed redundant, too-niche, and genre-confused entries). Balanced scoring formula (revenue curve smoothing, energy gradual curve, sequel modifier). Tuned pacing (5000ms/tick). Gated progression (PROGRESSION.md — single source of truth).

**Role this maps to:** `Game Balance Designer` + `Economy Designer`

**Artifacts:**
- `PROGRESSION.md` (230 lines — the game's constitution)
- Topic curation (85 curated from 200+)
- Scoring formula tuning and bug fixes

### Phase 8: Build & Distribution
**What I did:** Configured Electron build, DMG packaging for Mac, app signing considerations, Steam publishing research.

**Role this maps to:** `Build Engineer` + `Release Manager`

**Artifacts:**
- `research/steam-publishing-guide.md` (990 lines)
- DMG builds at each milestone

---

## Roles I Played (Consolidated)

| Role | What I Did |
|------|-----------|
| **Game Designer** | Reverse engineering, mechanic design, topic curation, victory paths |
| **Economy Designer** | Scoring formulas, revenue curves, tax system, IPO simulation |
| **Engine Programmer** | Tick-based core loop, state management, save/load |
| **Gameplay Programmer** | All 20+ game systems (verticals, storyteller, competitors, etc.) |
| **UI Programmer** | All React components, HUD, wizards, panels, modals |
| **UX Designer** | Flow design, feature gating, progression pacing |
| **Art Director** | Design system, asset specs, Victor management, review cycles |
| **Technical Artist** | 3-tier asset system, CSS animations, SVG optimization |
| **QA Engineer** | CDP test suite, Playwright E2E, manual playtesting |
| **Test Automation** | Chrome DevTools Protocol automation, React bridge functions |
| **Build Engineer** | Electron packaging, DMG builds, dependency bundling |
| **Release Manager** | Steam research, milestone tracking, PR management |
| **Producer** | Prioritization, issue tracking, agent swarm coordination |

---

## ALCUB3 Games Team Spec — What's Needed for Every Title

### Tier 1 — Core Team (needed from day 1)

| Role | Level | Responsibility | Tools/Skills Needed |
|------|-------|----------------|---------------------|
| **GM, Game Design** | L7 | Game mechanics, balance, progression, topic curation | Game design docs, spreadsheet modeling, playtesting |
| **GM, Engineering** | L7 | Engine, systems programming, build pipeline | Electron/web stack, Git, CI/CD |
| **Lead Gameplay Programmer** | IC6 | All gameplay systems (the feature swarm) | JavaScript/TypeScript, game math, state machines |
| **Lead UI/UX** | IC6 | All UI components, HUD, flow design | React, CSS, responsive design, accessibility |
| **QA Lead** | IC5 | Test suites, automation, playtesting coordination | CDP, Playwright, Python, test frameworks |
| **Producer** | L6 | Sprint planning, issue tracking, asset pipeline, stakeholder comms | GitHub Projects, milestone tracking |

### Tier 2 — Scale Team (needed for polish + launch)

| Role | Level | Responsibility |
|------|-------|----------------|
| **Economy Designer** | IC6 | Scoring, pricing, progression math, balance tuning |
| **Technical Artist** | IC5 | Asset pipeline, design system, SVG/CSS art, tool routing |
| **Build/Release Engineer** | IC5 | Electron packaging, Steam integration, CI/CD, platform builds |
| **Audio Designer** | IC5 | SFX, music, ambient audio, ElevenLabs/Suno integration |
| **Narrative Designer** | IC5 | Events, storyteller content, critic quotes, timeline events |

### Tier 3 — Growth Team (post-launch)

| Role | Level | Responsibility |
|------|-------|----------------|
| **Live Ops Designer** | IC5 | Post-launch events, seasonal content, community features |
| **Localization Lead** | IC5 | Translation pipeline, i18n system, regional compliance |
| **Community Manager** | IC5 | Discord, Steam forums, feedback collection, bug triage |
| **Analytics Engineer** | IC5 | Telemetry, player behavior analysis, A/B testing |

---

## How This Maps to Selene's Stark Studios Org

```
Selene Royce (L10, President, Stark Studios)
│
├── ALCUB3 Games
│   ├── GM, Game Design (L7) — owns what gets built
│   ├── GM, Engineering (L7) — owns how it gets built
│   ├── Producer (L6) — owns when it ships
│   ├── Lead Gameplay Programmer (IC6)
│   ├── Lead UI/UX (IC6)
│   ├── Economy Designer (IC6)
│   ├── QA Lead (IC5)
│   ├── Technical Artist (IC5)
│   ├── Build/Release Engineer (IC5)
│   ├── Audio Designer (IC5)
│   └── Narrative Designer (IC5)
│
├── Stark Studio Labs (Sims 4 mods)
│   └── (existing team)
│
└── Shared Services
    ├── Localization Lead (IC5)
    ├── Community Manager (IC5)
    └── Analytics Engineer (IC5)
```

---

## The Playbook (Reusable for Every Title)

1. **Research** — Reverse engineer reference game (2-3 days)
2. **Core Engine** — Build tick loop + data structures (1-2 days)
3. **Feature Swarm** — 3-5 parallel agents build systems (1-2 days)
4. **Design System** — Art direction BEFORE asset requests (1 day)
5. **Testing** — CDP logic tests + Playwright E2E (ongoing)
6. **Brand Assets** — Upgraded intake template → CCO → review cycles
7. **Build** — DMG/platform builds at each milestone
8. **Pacing** — Slow default, let players speed up

This playbook built Tech Empire (17K lines) in ~18 hours of swarm time + 3 days of polish. Every future ALCUB3 Games title follows this same process.

---

## Related Docs
- [PLAYBOOK.md](../PLAYBOOK.md) — Detailed 8-phase game dev template
- [PROGRESSION.md](../PROGRESSION.md) — Feature gating single source of truth
- [DESIGN-SYSTEM.md](../DESIGN-SYSTEM.md) — Art direction bible
- [README.md](../README.md) — Project overview
