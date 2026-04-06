# Tech Empire — Full Gap Analysis & Build Plan

**Date:** 2026-04-05
**Sources:** Chairman playtest session, GDT modding API analysis, GDT technical reference, Steam player sentiment analysis (22K reviews), codebase audit
**Purpose:** Identify every gap between Tech Empire and GDT parity, plus planned beyond-GDT features. Prioritize and sequence.

---

## Current State: What Works

Tech Empire's engine is solid. 100/100 automated tests pass. The core loop exists: make games, get reviewed, earn money, hire staff, unlock features, repeat. 28 game systems are wired and functional.

**What's live and working:**
- 85 topics, 6 genres, 3 audiences, 21 platforms with lifecycle + market curves
- 3-phase development with 9 aspect sliders
- 4 critics with personalities and quotes
- Staff hiring/firing with 15 roles, energy, personality, morale
- Finance tracking, taxes, loans, publisher deals
- 4 office tiers with background art
- 33-item research tree across 7 categories
- 4 business verticals + 6 synergies
- 5 victory paths + 3 moonshot mega-projects
- 6 AI competitor studios
- IPO system, conference system, franchise system
- Storyteller with drama score (rubber-band mechanic — not in GDT)
- 29 tech timeline events
- Audio (3 music loops, 10 SFX), keyboard shortcuts

---

## SECTION 1: Chairman Playtest Bugs (FIXED)

| # | Bug | Status | PR |
|---|-----|--------|----|
| 1 | Review screen loops infinitely | FIXED | #35 |
| 2 | Office background permanently blurred | FIXED | #35 |
| 3 | First game scores 9.6/10 (TGS=20) | FIXED (TGS→80, tiered curve) | #35 |

---

## SECTION 2: GDT Parity Gaps

### P0 — Must Fix Before Next Playtest

| # | Gap | GDT Behavior | Tech Empire Today | What to Build |
|---|-----|-------------|-------------------|---------------|
| 1 | **Too many starting topics** | ALL topics available from start (no gating) but only ~15-20 exist in vanilla | 30 Tier 1 topics — overwhelming | Reduce Tier 1 to 10. Redistribute 20 topics across new tiers 2-6 |
| 2 | **Compatibility shown upfront** | Compatibility is HIDDEN. Players learn through trial and error + post-game reports | +/++/+++ shown immediately for all genres, audiences, platforms | Hide all compatibility by default. Progressive unlock via games shipped + "Market Research" tech |
| 3 | **Slider hints exposed** | Phase importance is HIDDEN. Players learn the "right" allocation through experimentation | "Important" (green) / "Restricted" (red) labels visible on every slider | Remove labels. Add post-game feedback that reveals slider insights progressively |
| 4 | **No post-game research report** | After each game: shows which aspects worked (green bars) vs didn't (red bars). Gets more detailed over time | Nothing — review scores → sales → done | Build GameReport component with progressive detail unlock based on games shipped |
| 5 | **No skill bubbles during dev** | Colored bubbles (blue=Design, red=Tech) float up from characters during each tick. Bugs appear as red bug icons | Static progress bar + D/T counters. Staff pulse green. | Add CSS bubble animations per tick — Design (purple), Tech (blue), Bug (red) spawning above staff |
| 6 | **Dev phases too fast** | Small game ~45-60 sec at 1x speed. Clear visual pacing between phases | Small game ~30 sec at 1x. Phases fly by | Increase TICK_MS from 5000 to 7000 for early-game. Add phase transition animation |

### P1 — Required for GDT Parity

| # | Gap | GDT Behavior | Tech Empire Today | What to Build |
|---|-----|-------------|-------------------|---------------|
| 7 | **No character/CEO avatar** | Character visible at desk in garage. Moves with office upgrades. Present at conferences | Founder = colored circle with initial letter | Full character system: preset avatars → visible in office scene → present in events. CCO produces 10-12 base portraits |
| 8 | **No office scene (interactive)** | Click anywhere on office → context menu: New Game, Research, Marketing, Staff, etc. Office is a SCENE, not a background | Office is a background image behind glass cards. All actions in TopBar | Office scene overhaul: remove card overlay, make office interactive. Click to access menus. Staff visible at desks |
| 9 | **No onboarding / tutorial** | GDT has NO formal tutorial — the garage IS the tutorial. Only 4 random topics + 2 platforms available. Impossible to get overwhelmed | 30 topics, 21 platforms, all genres, all audiences, compatibility shown — massive decision space | Constrain initial choices so tightly the game teaches itself. 10 topics, 2 platforms, audience gated to Y3. Tutorial overlay already exists in tutorial.js but needs activation |
| 10 | **No custom game engine builder** | MAJOR system: build engines with component features (2D/3D graphics, physics, AI, networking, MMO support). Engine quality affects game quality. After 10 engines, license SDK | Research tree exists but no engine entity | Add engine builder: select researched components → name engine → use in game creation. Engine quality affects score. SDK licensing after 10 engines |
| 11 | **No office establishing shot** | When upgrading offices, brief animation/transition showing new space | Instant switch, background always covered by UI | 2-3 second full-screen office reveal on upgrade before HUD fades in |
| 12 | **Click-on-screen actions** | Click on office → context menu with all available actions (New Game, Sequel, Custom Engine, Contract Work, Publisher Deal, Staff, History) | All actions in TopBar icons | Add context menu on office area click. Same actions as TopBar but contextual |
| 13 | **Staff visible in office** | Staff characters sit at desks, animate during dev. You see your team working | Staff are circle avatars in a row above the office | Render staff sprites at desk positions in the office scene |
| 14 | **No Research Points currency** | RP is a separate scarce resource (earned from games, reports, contracts, R&D lab). Topics cost 10 RP each. Engine components cost RP. Specialist training costs 200 RP | Research costs only cash | Add RP as a resource alongside cash. Earned from game reports, contract work, R&D lab. Gates topic unlocks, engine building, specialization |
| 15 | **No contract work** | Accept contracts from publishers: specific genre/topic/platform, guaranteed payment + RP. Good for early-game income | Not built | Contract board: 3-5 available contracts cycling weekly. Cash + RP reward. Genre/topic/platform specified |
| 16 | **No bug-fixing "Finishing" stage** | After 3 dev phases, a visible "Finishing" stage where bugs are removed. Duration depends on bug count | Dev ends after Phase 3, bugs factored into score silently | Add visible Finishing phase with bug count display + removal animation |
| 17 | **Audience targeting available too early** | GDT gates Target Audience to Y3 M1. First games don't let you pick audience | Available from game 1 | Gate audience selection behind Year 3 or 2nd game milestone |
| 18 | **No staff specialization** | At 900 combined skill, staff can specialize (Design or Tech Specialist, costs 200 RP + $5M). R&D Lab REQUIRES Design Specialist. Hardware Lab REQUIRES Tech Specialist | Staff have roles but no specialization mechanic | Add specialization system: threshold + RP cost → specialist title → unlocks R&D/Hardware lab prerequisites |

### P2 — Polish & Depth

| # | Gap | GDT Behavior | Tech Empire Today | What to Build |
|---|-----|-------------|-------------------|---------------|
| 14 | **Topic tier expansion (3→6+)** | No tiers (all available). Mods add gating. | 3 tiers (Start, Small Office, Medium+Research) | Expand to 6 tiers tied to: start, Small Office, 2+ staff, Medium Office, 5+ games shipped, Large Office |
| 15 | **Topic curation + ordering** | ~30 topics, each distinct and thematically clear | 85 topics, some redundant, gating feels arbitrary | Full content audit: remove/merge redundant topics, re-gate by "interesting = later", clear thematic logic |
| 16 | **Multi-platform simultaneous release** | Large Office unlocks multi-platform dev | Single platform per game | Add multi-platform option at Large Office (costs more, takes longer, reaches wider market) |
| 17 | **Game expansion/DLC creation** | Not in vanilla GDT (top-requested mod feature) | Not built | Add DLC/expansion system: release add-ons for existing games, extends revenue tail |
| 18 | **Post-launch game management** | Not in GDT (most-wanted missing feature) | Not built | Patching, community management, seasonal content, live service operations |
| 19 | **Game of the Year awards** | Annual awards ceremony. Winning boosts fans + reputation | Not built | Annual awards event with categories. Win = fan boost + prestige |
| 20 | **Fan mail / player feedback** | Flavor text from "players" after each release | Nothing between review and sales | Post-release fan reactions — flavor quotes showing player sentiment |
| 21 | **Staff XP and leveling** | Staff gain experience organically through working on games | Stats are static (only change via training) | Add XP system: working on games in a genre gives genre specialty XP. Visible progress bars |
| 22 | **Contract work** | Accept contracts from publishers to make specific games for guaranteed payment | Not built | Contract board: accept jobs with genre/topic/platform requirements. Steady income for early game |

---

## SECTION 3: Beyond-GDT Features (Tech Empire Differentiators)

These are features Tech Empire HAS or PLANS that go BEYOND what GDT offers. These are our competitive edge.

| Feature | Status | Notes |
|---------|--------|-------|
| **4 Business Verticals** (Software, Streaming, Cloud, AI) | Built ✓ | GDT has nothing like this. Unique selling point |
| **Cross-vertical synergies** (6 synergies + full integration bonus) | Built ✓ | Emergent strategy layer GDT lacks |
| **5 Victory paths** with moonshot mega-projects | Built ✓ | GDT has no win condition — just "keep going" |
| **Storyteller drama score** (rubber-band difficulty) | Built ✓ | Adapts challenge to player performance. GDT is static |
| **6 AI competitor studios** with market share simulation | Built ✓ | GDT competitors are minimal/invisible |
| **IPO system** | Built ✓ | Take company public. GDT doesn't have this |
| **Custom hardware lab** | Built ✓ | Design your own gaming console |
| **Franchise system** | Built ✓ | Sequels with franchise bonuses |
| **Staff personalities + morale + energy** | Built ✓ | GDT staff are pure stat blocks |
| **15 staff roles** with stat-based assignment | Built ✓ | GDT has no roles |
| **10 expansion verticals** (post-launch DLC) | Assets prepared, not coded | Robotics, Semiconductor, Defense, etc. |
| **Dynamic market events** | Partial (storyteller) | Need more procedural variety for replayability |

---

## SECTION 4: CCO Asset Requests Needed

| Asset | Quantity | Priority | Status |
|-------|----------|----------|--------|
| Genre SVG icons | 6 | P2 | Filed (#32) |
| Topic theme SVG icons | 12 | P3 | Filed (#33) |
| CEO preset portrait avatars | 10-12 | P1 | **NEEDS FILING** |
| Staff desk sprites (isometric) | 8-10 | P1 | **NEEDS FILING** |
| Office scene layout (isometric, per tier) | 4 | P1 | **NEEDS FILING** |
| Skill bubble animations (Design/Tech/Bug) | 3 | P1 | Can be CSS-only |
| Phase transition animation assets | 3 | P2 | Can be CSS-only |
| Tutorial overlay art | 2-3 | P2 | **NEEDS FILING** |
| Game Report UI elements | 4-5 | P1 | Can be CSS-only |
| "Game of the Year" trophy icon | 1 | P3 | **NEEDS FILING** |
| Fan mail / player quote avatars | 6-8 | P3 | **NEEDS FILING** |

---

## SECTION 5: Scoring & Balance Calibration

### Current Scoring (Post-Fix)
- First game TGS = 80 (was 20). Expected first game: 4-7 range.
- Tiered curve: below TGS → 1-7.5, at TGS → 7.5, above TGS → 7.5-9.5, exceptional → 9.5 cap
- Moving baseline: TGS increases 2% per year + tracks your best score

### GDT's Scoring Problems We Should Avoid
1. **Moving goalposts** — GDT's #2 complaint. Making a 9/10 game means your next 8/10 gets a 6. Players feel "punished for success"
2. **Opaque weights** — Players can't learn WHY a game scored well. We fix this with post-game research reports
3. **Sequel penalty** — GDT penalizes sequels heavily. We should make sequels risky (diminishing returns) but not punishing

### Recommended Scoring Adjustments
- Soften the moving baseline (TGS rises 1% per year instead of 2%)
- Add a "Game Report" that explains 3-5 factors that most influenced the score
- Sequels: 10% penalty on second game, 20% on third — but franchise fans offset this
- Topic repetition: slight penalty for making the same topic/genre combo back-to-back (encourages variety without punishing specialization)

---

## SECTION 6: Progression Redesign

### Current Progression (4 levels, 3 topic tiers)
```
Y1: Garage (1 staff, 10→30 topics, Small games only)
Y4: Small Office ($1M, 5 staff, Marketing + Training)
Y6: Medium Office ($5M, Research Lab, Large games)
Y13: Large Office ($16M, 8 staff, Hardware Lab, AAA)
```

### Proposed Progression (6+ unlock gates, 6 topic tiers)
```
Y1:   Garage — 1 staff, 10 topics, Small games, PC/Govodore only
Y2:   First hire — Training unlocks (2 staff), 6 more topics unlock
Y4:   Small Office — Marketing unlocks, Medium games, 8 more topics
Y6:   Growing team — 3+ staff, genre specialization visible, 6 more topics
Y8:   Medium Office — Research Lab, Large games, engine builder, 10 more topics
Y10:  Established studio — Verticals unlock ($10M rev), publisher deals, 8 more topics
Y13:  Large Office — Hardware Lab, AAA games, conferences, remaining topics
Y15+: Empire era — IPO, victory paths, moonshots
```

### Topic Redistribution (85 topics across 6 tiers)

**Tier 1 (Start) — 10 topics** (familiar, accessible):
Fantasy, Sci-Fi, Sports, Racing, Comedy, Medieval, Zombies, Space, Superheroes, Mystery

**Tier 2 (First Hire) — 8 topics** (slightly broader):
Horror, Wild West, Pirate, Ninja, Detective, Music, School, Virtual Pet

**Tier 3 (Small Office) — 12 topics** (niche + creative):
Spy, History, Business, City, Life, Romance, Cooking, Dance, Hospital, Prison, Theme Park, Aliens

**Tier 4 (Growing Team) — 10 topics**:
Cyberpunk, Time Travel, Martial Arts, Hacking, Game Dev, Startups, Movies, Fashion, Law, Sandbox

**Tier 5 (Medium Office) — 16 topics** (advanced):
Vampire, Werewolf, Post Apocalyptic, Evolution, Farming, Fishing, Tower Defense, City Builder, Zoo, Transport, Magic Academy, Hunting, UFO, Archaeology, Surgery, Government

**Tier 6 (Large Office + Research) — 29 topics** (exotic, research-gated):
All current Tier 3 topics (Space Opera, Robot Uprising, Terraform, Biotech, etc.)

---

## SECTION 7: Build Sequence (Prioritized)

### Sprint 1: Playtest Blockers (3-5 days)
All engineering — no CCO dependency.

1. **Reduce Tier 1 topics to 10** — data.js re-tier
2. **Hide compatibility indicators** — NewGameWizard, remove +/++/+++ display
3. **Hide slider importance hints** — PhaseSliderModal, remove Important/Restricted labels
4. **Slow dev pacing** — TICK_MS 5000→7000, add phase transition pause
5. **Add skill bubbles during dev** — CSS animations on staff avatars per tick
6. **Post-game research report (basic)** — show 3 vague insights after each game

### Sprint 2: Core Experience (5-7 days)
Engineering + CCO assets in parallel.

7. **Onboarding / tutorial** — guided first game with contextual tooltips
8. **Office scene overhaul** — remove glass-card overlay, make office interactive
9. **CEO avatar selection** — 10-12 preset portraits at game start (CCO produces)
10. **Click-on-screen context menu** — right-click office for actions
11. **Office upgrade establishing shot** — full-screen office reveal animation
12. **Expand topic tiers to 6** — redistribute 85 topics per Section 6

### Sprint 3: Depth & Parity (7-10 days)
13. **Custom game engine builder** — compose researched components into named engines
14. **Post-game research report (full)** — progressive detail unlock, genre mastery tracking
15. **Staff XP and leveling** — working on games builds genre experience
16. **Multi-platform release** — Large Office feature
17. **Fan mail / player feedback** — flavor quotes after each release
18. **Contract work** — early-game income via publisher contracts

### Sprint 4: Beyond-GDT Polish (5-7 days)
19. **Game expansion/DLC system** — release add-ons for existing games
20. **Game of the Year awards** — annual ceremony with categories
21. **Staff visible in office scene** — isometric sprites at desks (CCO produces)
22. **Dynamic market events** — procedural industry disruptions for replayability
23. **Scoring transparency** — in-game "Game Design Handbook" that collects learnings

---

## SECTION 8: The Market Opportunity

From the sentiment analysis:

> The market is split into two segments:
> 1. **Casual/accessible** (GDT, Game Dev Story) — easy to learn, polished, but shallow endgame
> 2. **Deep simulation** (Mad Games Tycoon 2, Software Inc) — complex, replayable, but clunky UI
>
> **Nobody occupies the middle ground well — a game that's BOTH polished AND deep.** That's where Tech Empire lives.

Tech Empire already has systems that go beyond GDT (verticals, victory paths, storyteller, IPO, competitors). The gap is in the FIRST-TIME EXPERIENCE — the first 30 minutes need to feel as polished as GDT while the depth reveals itself over hours. Sprint 1 and 2 close this gap.

---

## Appendix: Chairman's Playtest Findings (Cross-Referenced)

| Chairman Finding | Section | Action Item |
|-----------------|---------|-------------|
| No onboarding | Sprint 2, #7 | Tutorial system |
| No character customization | Sprint 2, #9 | CEO avatar selection |
| Office background hidden behind blur | FIXED | PR #35 |
| Dev phases too fast | Sprint 1, #4 | TICK_MS increase + transition pause |
| 30 starting topics too many | Sprint 1, #1 | Reduce to 10 |
| Topic tiers need expansion (3→5-10) | Sprint 2, #12 | Expand to 6 tiers |
| Topic curation / redundancy | Sprint 2, #12 | Full content audit in redistribution |
| Interesting topics gated later | Sprint 2, #12 | Exotic topics in Tier 5-6 |
| Compatibility visible (removes discovery) | Sprint 1, #2 | Hide by default |
| Slider hints exposed | Sprint 1, #3 | Remove labels |
| Need post-game research report | Sprint 1, #6 + Sprint 3, #14 | Basic then full version |
| Review scoring weights | Section 5 | Soften moving baseline, add Game Report |
| Review screen loops | FIXED | PR #35 |
| Scoring too generous (9.6 first game) | FIXED | PR #35 (TGS 20→80) |
| No skill bubbles during dev | Sprint 1, #5 | CSS bubble animations |
| No clickable office screen | Sprint 2, #10 | Context menu on click |
| No office reveal on upgrade | Sprint 2, #11 | Establishing shot animation |
| Persistent blurred dev screen | FIXED | PR #35 |
| Platform icons need to feel interactive | Sprint 2, #8 | Office scene overhaul improves everything |
| Needs playtest feedback doc system | DONE | docs/playtesting/ folder |
