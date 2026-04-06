# Playtest Session — 2026-04-05 (Chairman)

**Build:** Tech Empire v0.1.0 DMG (arm64), post-PR #31 + #34
**Tester:** Chairman Aaron Stark (first full DMG consumer-experience test)
**Platform:** macOS, installed via DMG drag-to-Applications

---

## Findings (ordered as reported)

### 1. No Onboarding or Quick Start
**Severity:** High — First impression
**What happened:** Game opens → "Name your studio" → immediately "Name your first game." No welcome screen, no tutorial, no context for what you're about to do.
**Expected:** Some form of onboarding — at minimum a "Welcome to Tech Empire" intro beat, ideally a guided first-game tutorial that explains the dev phases, sliders, and review system.
**Fix type:** Feature — needs onboarding flow design

### 2. No Full Background View
**Severity:** Medium — Atmosphere
**What happened:** Office background images render correctly behind glass cards, but the UI always covers them. No moment where the player sees the full office art unobstructed.
**Expected:** A brief "establishing shot" when you first enter a new office tier — maybe a 2-3 second full-screen view of the office before the HUD fades in.
**Fix type:** Feature — office reveal animation

### 3. No Character Customization / CEO Avatar
**Severity:** Medium — Player identity
**What happened:** No way to customize or even see your CEO. The founder is just a circle with a letter initial.
**Expected:** At minimum: pick from preset avatars. Ideally: simple character creator (hair, skin, outfit).
**Ref:** Already tracked as issue #30 on GitHub.
**Fix type:** Feature (existing issue)

### 4. Persistent Blurred Dev Screen (BUG)
**Severity:** High — Likely a visual bug
**What happened:** During development, there's a blurred overlay/screen that persists and won't go away. Chairman described it as "a blurred screen of the dev that won't go away."
**Diagnosis needed:** Likely the glass-card backdrop-filter blur stacking with the office background in a way that creates a permanently washed-out view. Or a modal overlay that isn't dismissing.
**Fix type:** Bug — investigate GameScreen rendering during dev phase

### 5. Phase Transitions Too Fast
**Severity:** Medium — Pacing
**What happened:** Phase 1 → Phase 2 → Phase 3 transitions happen too quickly. Player doesn't have time to breathe or feel the rhythm of development.
**Expected:** Slower tick speed or longer phases — the pause between phases (slider modal) is good but the phases themselves fly by.
**Fix type:** Tuning — increase base tick interval or phase duration, especially for early-game small games

### 6. Too Many Starting Topics (30 → 10)
**Severity:** High — Progression design
**What happened:** ~30 topics available immediately. Overwhelming for a new player. No sense of progression when so much is already unlocked.
**Expected:** Start with ~10 carefully curated topics. Unlock more as you level up.
**Chairman's take:** "Even starting with 30 topics is a lot. I feel like we should only allow like 10 to start."
**Fix type:** Data tuning — re-tier topics so only 10 are Tier 1

### 7. Topic Tier System Needs More Levels (3 → 5-10)
**Severity:** Medium — Progression depth
**What happened:** Current system has 3 tiers (1=start, 2=Small Office, 3=Medium Office + Research). Feels compressed.
**Expected:** 5-10 tiers that map to more granular milestones — each office upgrade, staff count, research items, fan counts, etc. Gives more pacing and "just one more unlock" dopamine.
**Fix type:** Design + Data — expand tier system, redistribute 85 topics across more tiers

### 8. Topic Curation — Redundancy + No Clear Gating Logic
**Severity:** Medium — Content quality
**What happened:** Some topics feel redundant (e.g., similar themes with slight variations). No obvious rhyme or reason for what's gated vs what's available early.
**Expected:** Each topic should feel distinct. Gating should follow a clear design logic: basic/familiar topics early, exotic/complex topics later.
**Fix type:** Content review — audit all 85 topics for redundancy and re-gate based on "how interesting/exotic is this?"

### 9. Interesting Topics Should Be Gated Later
**Severity:** Medium — Reward design
**What happened:** Cool/exciting topics are available too early. Nothing to look forward to unlocking.
**Chairman's take:** "The more interesting and cool topics need to be gated further down the line."
**Fix type:** Data tuning — move exciting topics to higher tiers (relates to #7 and #8)

### 10. Compatibility Indicators Too Visible (Removes Discovery)
**Severity:** High — Game design philosophy
**What happened:** Topic/genre compatibility is shown with +/++/+++ indicators in the wizard. Player can see exactly what pairs well before trying.
**Expected:** This should be a discovery mechanic. Players should LEARN what works through experimentation, not be told upfront. Either hide compatibility entirely or gate the visibility (e.g., "Market Research" unlock reveals compatibility after you've shipped N games in that genre).
**Chairman's take:** "It takes away from the gamer experience of them trying to figure out what pairs well that will lead to success."
**Fix type:** Design change — hide or progressively reveal compatibility info

### 11. Scoring Seems Generous (9.6 on First Game?)
**Severity:** Low — Balance (observed from screenshot, not explicitly reported)
**What observed:** First game scored 9.6 average. 50K new fans. $94.6K revenue. For a garage studio's first game, this feels extremely high.
**Expected:** First games should typically score 4-7 range. A 9+ should feel like a rare triumph after years of learning.
**Fix type:** Balance tuning — review scoring formula difficulty curve

---

## Chairman's Meta Requests

### Playtest Feedback Document System
Chairman wants a persistent place to capture playtest findings over time.
**Decision:** This `docs/playtesting/` folder in the game repo. Each session gets a dated file. Historical record lives with the code. Wiki can link to it.

---

## Priority Recommendation

**Fix before next playtest:**
1. #4 — Blurred dev screen bug (investigate + fix)
2. #6 — Reduce Tier 1 topics from 30 to 10
3. #10 — Hide compatibility indicators by default
4. #5 — Slow down phase transitions

**Design for next sprint:**
5. #1 — Onboarding / first-game tutorial
6. #7 — Expand topic tier system to 5-10 levels
7. #8/#9 — Full topic curation pass
8. #2 — Office reveal animation

**Already tracked:**
9. #3 — Character creator (issue #30)

**Verify independently:**
10. #11 — Scoring generosity (may be dev mode artifact)


## Additional Findings (Reported During Session)

### 12. Slider Importance Indicators Reveal Mechanics
**Severity:** High — Same philosophy as #10
**What happened:** Dev phase sliders show which areas are "most important" for the current phase, removing the need for players to learn through experimentation.
**Expected:** Players should discover optimal slider distributions through trial and error. The "importance" hints should be EARNED (e.g., unlocked via post-game research reports after shipping N games).
**Fix type:** Design — hide slider hints by default, tie to progressive unlock

### 13. Need Post-Game Research Report System
**Severity:** High — Core loop enhancement
**What happened:** After a game ships and gets reviewed, there's no research/analysis phase. Player doesn't learn WHY the game scored the way it did.
**Expected:** After each game, a "Game Report" (like GDT's post-game analysis) that reveals what worked and what didn't. Unlocks progressively — early games give vague feedback ("players liked the action"), late games give precise data. This is how players LEARN the system instead of being told upfront.
**Fix type:** Feature — post-game report system with progressive detail unlock

### 14. Game Review Scoring Weights Need Review
**Severity:** Medium — Balance
**What happened:** Chairman wants to understand how review scores are calculated and ensure weights make sense.
**Fix type:** Audit — review scoring.js formula and document the logic

### 15. CRITICAL BUG: Review Screen Loops
**Severity:** CRITICAL — Blocker
**What happened:** After the first game review screen appears and player clicks Continue, the review screen appears AGAIN and keeps looping. Game cannot progress past review.
**Diagnosis:** Likely a state management bug in app.js where `showReview` is being re-triggered or the `reviewGame` ref isn't being cleared properly after dismissal.
**Fix type:** Bug fix — immediate priority
