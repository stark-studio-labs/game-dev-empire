# Tier 3 Systems Review

Reviewed: 2026-03-30
Status: **Mostly Complete -- 2 bugs fixed, minor gaps noted**

---

## 1. src/game/verticals.js -- Vertical Expansion System

**Status: COMPLETE (1 bug fixed)**

All 4 verticals implemented with full state management:
- **Software** -- B2C/B2B model toggle, 4 product slots, subscriber growth with churn, ARPU calc
- **Streaming** -- 3 tiers (ad/premium/both), content library growth, subscriber mechanics
- **Cloud** -- 3 regions (US West, EU West, Asia Pac), enterprise contracts, random outage events
- **AI** -- Training budget, cumulative investment, model quality (log scale), safety drift, open/closed source

Revenue formulas all present. Monthly tick processes each vertical with synergy flags.
Serialization/deserialization complete. Global `verticalManager` instance exported.

**Bug fixed:** AI revenue formula used `apiCallsMonthly * 0.001` -- at max quality (100), this caps revenue at ~$500/month against a $30K+ base cost, making the AI vertical permanently unprofitable. Changed rate to `0.50` per API call so revenue scales to ~$250K/month at peak, making the vertical viable but still requiring heavy investment.

---

## 2. src/game/synergies.js -- Cross-Vertical Synergies

**Status: COMPLETE -- no bugs**

All 6 synergies defined and calculating correctly:
1. `games_cloud` -- Self-Hosted Servers (cost reduction: $5K/mo savings)
2. `games_ai` -- AI-Powered NPCs (quality +15%)
3. `games_streaming` -- Exclusive Launch Deals (subscriber +20%)
4. `software_cloud` -- Hosted SaaS Infrastructure (margin +10%)
5. `cloud_ai` -- In-House GPU Clusters (AI costs -30%)
6. `streaming_ai` -- AI Recommendation Engine (retention +15%)

Full integration bonus (+25% all revenue) activates at 4 verticals.
`getSynergies()`, `getTotalBonus()`, `getSynergySavings()`, `buildSynergyFlags()` all correctly implemented.
Engine `_verticalTick()` properly applies savings and revenue multiplier.

**Note:** `cloud_ai` cost reduction is applied via `synergies.cloudActive` flag in `_aiTick()`, not via `getTotalBonus('cost_reduction')`. Both paths exist but only the flag path is consumed. Not a bug -- works as intended.

---

## 3. src/game/storyteller.js -- Adaptive Story Engine

**Status: COMPLETE -- no bugs**

All 30 events defined (10 challenges + 10 opportunities + 10 catalysts):
- **Challenges** (drama > 70): antitrust, key employee leaves, industry recession, competitor smash hit, data breach, talent raid, platform ban, crunch expose, patent troll, review bombing
- **Opportunities** (drama < 30): mentor investor, viral moment, talent joins, partnership offer, award nomination, tax incentive, merch goldmine, documentary, university collab, innovation grant
- **Catalysts** (drama 30-70): new tech, industry shift, competitor stumbles, regulation change, streaming platform, VR mainstream, modding explosion, esports interest, AI dev tools, subscription wars

`evaluateAndPick()` works correctly: 30% chance per month, selects pool by drama score, filters by cooldown (50 weeks per specific event), returns event in GAME_EVENTS format.
`updateDrama()` adjusts score based on cash trajectory and fan count with center drift.
`getDramaLabel()` returns labeled color for UI.

---

## 4. src/game/personalities.js -- Staff Personality System

**Status: COMPLETE (1 bug fixed)**

10 traits defined with correct modifiers:
- perfectionist, speed_demon, creative_rebel, team_player, lone_wolf, ambitious, loyal, gossip, mentor, procrastinator

`assignTraits()` uses Fisher-Yates shuffle, assigns 2-3 traits (40% chance of 3).
`getProductivityModifier()` correctly aggregates quality/speed/design/tech multipliers including `allMod`.
`getChemistry()` checks both orderings of trait pairs.
`getTeamChemistry()` averages pairwise scores.

**Bug fixed:** `TRAIT_CHEMISTRY` had duplicate entries `team_player+loyal: 8` AND `loyal+team_player: 8`. Since `getChemistry()` iterates all trait pairs of both staff members, when two staff members BOTH have `team_player` and `loyal`, the chemistry score would double-count (+16 instead of +8). Removed the `loyal+team_player` duplicate.

---

## 5. src/game/timeline.js -- Tech History Timeline

**Status: 29/30 events -- minor gap**

29 events mapped to years 1-25. All years 1-25 covered (some years have 2 events: years 6, 11, 15, 23). File comment says "30 events" but actual count is 29 -- one short.

`checkTimelineEvents(currentYear)` correctly fires all unfired events where `currentYear >= evt.year`.
`applyEffect()` handles cash, fans, and market sentiment adjustments.
`checkYear(state)` alias properly delegates to `checkTimelineEvents(state.year)`.
`getFullTimeline()` returns sorted events for UI.

**Note:** `applyEffect()` references global `marketSim` via `typeof marketSim !== 'undefined'` -- safe since `market.js` loads before `timeline.js` in index.html.

---

## 6. src/game/conference.js -- Industry Conferences

**Status: COMPLETE -- no bugs**

3 conferences defined with correct annual triggers:
1. **G3** -- Month 5, Week 2 (May), high prestige, minYear 3
2. **GamesCon Europe** -- Month 8, Week 1 (August), medium prestige, minYear 2
3. **Indie Spotlight** -- Month 11, Week 3 (November), indie prestige, minYear 1

`checkWeek()` correctly checks month/week against conference schedule.
`resolve()` handles 4 actions: announce (max hype + award), recruit (star talent), spy (competitor intel), skip.
Attendance cost scales by company level. Award chance gates on last game review >= 7.5.
Star recruit generation scales stats by company level. Spy intel generates randomized competitor data.
Engine wiring: pauses on conference, stores `pendingConference`, resumes on resolve.

---

## 7. src/game/ipo.js -- IPO & Stock Market

**Status: COMPLETE -- no bugs**

IPO eligibility: $50M total revenue + year 5+. `isEligible()` and `goPublic()` work correctly.
IPO price calculation: annual revenue estimate * 10 / shares, clamped $5-$200.
20% float raises cash at IPO price. 51% founder stake.

Stock price simulation: updates every 4 weeks based on fan growth, game quality, cash position, market sentiment, board approval. Dampened multiplicative model.
Quarterly board meetings (every 12 weeks): guidance targets (10% rev growth, 8% fan growth), missed guidance drops stock 10-25% and board approval -15.
Activist investor event: triggers when board approval < 50 (0.2% weekly chance). Three resolution paths.

`serialize()`/`deserialize()`/`reset()` all complete.

**Note:** `finance.totalRevenue()` accessed via `typeof finance !== 'undefined'` guard -- safe given load order.

---

## 8. src/renderer/components/VerticalPanel.js

**Status: COMPLETE -- no bugs**

Renders all 4 verticals in a 2x2 grid. Each card shows:
- Icon, name, tagline, active/locked status
- Active stats: Software (MRR + subscribers), Streaming (subscribers + ARPU), Cloud (regions + contracts), AI (quality + API calls)
- Lock state: unlock button with cost, disabled reasons
- Expandable detail sections via `VerticalDetailSection`

`VerticalDetailSection` provides per-vertical controls:
- Software: B2C/B2B toggle, product launch buttons (4 slots)
- Streaming: tier selector (ad/premium/both), content commission button
- Cloud: datacenter build buttons (3 regions), enterprise contract button
- AI: training budget selector (5 levels), safety bar, open/closed source toggle

Synergy section lists all 6 synergies with active/inactive state + full integration bonus.

---

## 9. src/renderer/components/StorytellerPanel.js

**Status: COMPLETE -- no bugs**

Shows drama score via progress bar with color-coded label (High Drama red / Steady blue / Calm green).
Numeric display: `{dramaScore} / 100`.
"How it works" explanation section.
Event history: scrollable list showing eventId, week, and drama score at time of event.
Properly references global `storyteller` instance.

---

## 10. src/renderer/components/TimelinePanel.js

**Status: COMPLETE -- no bugs**

Shows full timeline sorted by year. Fired events display title + description + colored left border.
Upcoming/unfired events show "???" title and "Something will happen..." placeholder at reduced opacity.
Year label shown for each event. Scrollable container with 400px max height.
Correctly uses `techTimeline.getFullTimeline()` and `techTimeline.getFiredEvents()`.

**Minor:** Fired events show `evt.category || 'Industry Event'` but timeline events don't have a `category` field -- always falls back to "Industry Event". Cosmetic only.

---

## 11. src/renderer/components/ConferencePanel.js

**Status: COMPLETE -- no bugs**

Two modes:
1. **Decision modal** (when `pendingConference` is truthy): shows conference description, attendance cost (with afford check), 4 action buttons (Announce, Recruit, Spy, Skip). ESC disabled during decision.
2. **History/overview** (default): lists this year's conferences with attended/missed/upcoming status, last conference result with outcomes, full attendance history.

Properly receives `pendingConference` and `onResolveConference` props from app.js.
Engine auto-opens panel when `state.pendingConference` is set.

---

## 12. src/renderer/components/IPOPanel.js

**Status: COMPLETE -- no bugs**

Three states:
1. **Not eligible**: shows revenue progress toward $50M and year progress toward 5
2. **Eligible**: "Go Public" button with explanation of 49% share sale
3. **Public**: 4-stat grid (stock price, market cap, player stake, board approval), bar chart of price history (last 40 data points, green/red coloring), quarterly guidance display

`handleGoPublic()` calls `engine.goPublic()`. Stock chart renders inline with flex layout.
Properly uses `ipoSystem` globals for all data access.

---

## Summary of Fixes Applied

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `verticals.js` | AI revenue rate `0.001` makes vertical permanently unprofitable (~$500/mo max vs $30K+ costs) | Changed to `0.50` per API call (~$250K/mo at peak) |
| 2 | `personalities.js` | Duplicate `loyal+team_player` entry causes double-counted chemistry when both staff have both traits | Removed duplicate entry |

## Minor Gaps (not bugs, noted for completeness)

- Timeline has 29 events, not 30 as stated in file comment (years 1-25 all covered)
- TimelinePanel shows "Industry Event" for all fired events (no per-event category field)
- `getTotalBonus('cost_reduction')` result is never consumed (savings go through separate path)

---

## Related Documentation

- [README.md](README.md) -- project overview and quick start
- [PLAYBOOK.md](PLAYBOOK.md) -- game development playbook
- [CODE-REVIEW.md](CODE-REVIEW.md) -- full code audit
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) -- art direction bible
- [TEST-RESULTS.md](TEST-RESULTS.md) -- automated test results
