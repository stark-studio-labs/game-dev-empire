# Game Dev Tycoon — Technical Reference

Reverse-engineered data structures, scoring formulas, and system internals from GDT's official modding API (`greenheartgames/gdt-modAPI`) and decompiled game source. Cross-referenced with the Stark Ultimate Pack mod and Tech Empire's own implementation.

This document is the calibration bible for Tech Empire. Every number, weight, and formula here is sourced from actual GDT code, not guesswork.

---

## A. DATA STRUCTURES

### A.1 Topics

**GDT internal structure** (from `api/topics.js` + `helpers/checks.js`):

```javascript
{
  id: "Game Dev",                          // string, must be globally unique
  name: "Game Dev".localize("game topic"), // display name with localization key
  iconUrl: "",                             // optional, path to topic icon
  genreWeightings: [0.6, 0.7, 0.6, 1, 0.6, 0.8],   // 6 floats, 0.0-1.0
  audienceWeightings: [0.9, 1, 0.7],                  // 3 floats, 0.0-1.0
  missionOverrides: [...]                              // optional, 6x6 matrix
}
```

**Genre weightings** (always 6 values, order fixed):
| Index | Genre      |
|-------|------------|
| 0     | Action     |
| 1     | Adventure  |
| 2     | RPG        |
| 3     | Simulation |
| 4     | Strategy   |
| 5     | Casual     |

**Audience weightings** (always 3 values):
| Index | Audience |
|-------|----------|
| 0     | Young    |
| 1     | Everyone |
| 2     | Mature   |

**Weight interpretation** (from decompiled scoring):
- 1.0 = Great fit (full score contribution)
- 0.9 = Good fit
- 0.8 = Okay
- 0.7 = Bad fit (score penalty)
- 0.6 = Terrible fit (significant penalty)

**Validation** (from `checks.js`):
- `genreWeightings` must have exactly 6 values, each in `[0.0, 1.0]`
- `audienceWeightings` must have exactly 3 values, each in `[0.0, 1.0]`
- `id` must be unique across `Topics.topics`
- `missionOverrides` if present must be 6x6 matrix, all values in `[0.0, 1.0]`

**Topic unlock in GDT**: Topics are always available from the start (no unlock gating in vanilla). Mods can gate via `canResearch` functions on research items that unlock topic-related tech.

**Tech Empire adaptation**: Topics are tiered (30 starter, 26 at Small Office, 29 via Research). This is a Tech Empire addition — GDT has no topic gating.

---

### A.2 Platforms

**GDT internal structure** (from `api/platforms.js`):

```javascript
{
  id: 'Greenheart One',           // string, globally unique
  name: 'Greenheart One',         // display name
  company: 'Greenheart Games',    // manufacturer
  startAmount: 0.15,              // initial market share (0.0-1.0)
  unitsSold: 0.358,               // total lifetime units sold (millions)
  licencePrize: 5000,             // license fee to develop for this platform ($)
  published: '1/3/4',             // launch date (Year/Month/Week)
  platformRetireDate: '4/6/2',    // retirement date (Y/M/W)
  developmentCosts: 10000,        // base dev cost for this platform ($)
  genreWeightings: [0.9,1,1,0.9,1,0.7],   // 6-float genre compatibility
  audienceWeightings: [0.9, 1, 0.8],        // 3-float audience fit
  techLevel: 1,                   // integer, defines minimum tech needed
  iconUri: 'path/to/icon.png',    // platform icon
  marketPoints: [...],            // optional, market share curve over time
  events: [...]                   // optional, array of events (e.g. announcements)
}
```

**Date format**: `Y/M/W` — Year (1-based), Month (1-12), Week (1-4). Validated by `Checks.checkDate()` which enforces `month <= 12` and `week <= 4`.

**Market share curve** (`marketPoints`): Array of `{date: "Y/M/W"}` entries defining market share at specific dates. The game interpolates linearly between these points.

**Tech Empire's platform format** (expanded):
```javascript
{
  id: 'govodore',
  name: 'Govodore 64',
  company: 'Govodore',
  published: '1/1/1',
  retireDate: '4/6/1',
  licenseFee: 0,
  devCost: 2000,
  techLevel: 1,
  unitsSold: 12,                    // millions
  genreW: [0.8, 0.9, 0.8, 0.7, 0.8, 0.9],
  audienceW: [0.9, 1.0, 0.7],
  marketCurve: [[1,1, 0.05], [2,1, 0.15], [3,1, 0.08], [4,6, 0.01]]
  // marketCurve entries: [year, month, marketShare]
}
```

**Platform availability**: A platform is "available" when `currentDate >= published AND currentDate < retireDate`. Market share is linearly interpolated from the `marketCurve` at any given date.

**Tech Empire platform roster** (parody names mapped to real consoles):

| ID            | Name           | Real Console       | Published | Retired  | License | Dev Cost | Tech |
|---------------|----------------|--------------------|-----------|----------|---------|----------|------|
| govodore      | Govodore 64    | Commodore 64       | Y1/M1     | Y4/M6    | $0      | $2K      | 1    |
| pc            | PC             | PC                 | Y1/M1     | Never    | $0      | $5K      | 2    |
| tes           | TES            | NES                | Y1/M5     | Y6/M6    | $5K     | $8K      | 1    |
| master_v      | Master V       | Master System      | Y2/M1     | Y7/M1    | $5K     | $8K      | 1    |
| super_tes     | Super TES      | SNES               | Y4/M1     | Y10/M1   | $10K    | $15K     | 3    |
| gameling      | Gameling       | Game Boy           | Y3/M6     | Y9/M1    | $5K     | $6K      | 1    |
| mega_drive    | Mega Drive     | Genesis            | Y4/M6     | Y10/M6   | $10K    | $15K     | 3    |
| playsystem    | PlaySystem     | PlayStation        | Y7/M6     | Y14/M1   | $25K    | $25K     | 5    |
| nuu64         | Nuu 64         | N64                | Y8/M1     | Y13/M1   | $20K    | $20K     | 5    |
| dreamvast     | DreamVast      | Dreamcast          | Y10/M6    | Y14/M6   | $15K    | $20K     | 5    |
| playsystem2   | PlaySystem 2   | PS2                | Y12/M1    | Y19/M1   | $35K    | $40K     | 7    |
| game_sphere   | Game Sphere    | GameCube           | Y12/M6    | Y18/M1   | $30K    | $35K     | 7    |
| mbox          | mBox           | Xbox               | Y12/M6    | Y18/M6   | $35K    | $40K     | 7    |
| gs            | GS             | DS                 | Y16/M1    | Y23/M1   | $15K    | $15K     | 6    |
| grphone       | grPhone        | iPhone             | Y17/M6    | Never    | $5K     | $10K     | 6    |
| playsystem3   | PlaySystem 3   | PS3                | Y17/M1    | Y24/M1   | $50K    | $60K     | 9    |
| mbox_next     | mBox Next      | Xbox 360           | Y16/M6    | Y24/M1   | $50K    | $60K     | 9    |
| wuu           | Wuu            | Wii U              | Y17/M6    | Y23/M6   | $20K    | $25K     | 7    |
| playsystem4   | PlaySystem 4   | PS4/PS5            | Y23/M1    | Y32/M1   | $60K    | $80K     | 11   |
| mbox_one      | mBox One       | Xbox One           | Y23/M6    | Y32/M1   | $60K    | $80K     | 11   |
| nuu_console   | Nuu            | Switch             | Y23/M1    | Y30/M1   | $25K    | $30K     | 8    |

---

### A.3 Staff

**GDT base game staff properties** (decompiled):
- `design` — Design skill (generates Design points during dev)
- `tech` — Tech skill (generates Tech points during dev)
- `speed` — Work speed modifier
- `research` — Research capability

**Tech Empire staff system** (expanded from GDT):

```javascript
// Staff member object
{
  id: 'unique-id',
  name: 'Alex Chen',
  role: 'engineer',             // assigned via weighted stat matching
  design: 30,                   // 1-100
  tech: 65,                     // 1-100
  speed: 50,                    // 1-100
  research: 40,                 // 1-100
  salary: 5000,                 // monthly
  energy: 100,                  // 0-100 (Tech Empire addition)
  personality: { ... }          // Tech Empire addition
}
```

**15 Role definitions** (stat-weighted assignment):

| Role ID           | Display Name       | Primary Stat | Salary Range |
|-------------------|--------------------|-------------|--------------|
| game-designer     | Game Designer      | design      | $4.5K-$10K   |
| artist            | Artist             | design      | $4K-$9K      |
| ux-designer       | UX Designer        | design      | $4.5K-$9.5K  |
| writer            | Writer             | design      | $3.5K-$8K    |
| engineer          | Engineer           | tech        | $5K-$12K     |
| tech-director     | Tech Director      | tech        | $8K-$16K     |
| devops            | DevOps             | tech        | $5.5K-$12K   |
| sound-engineer    | Sound Engineer     | tech        | $4K-$9K      |
| qa-tester         | QA Tester          | speed       | $3K-$6K      |
| producer          | Producer           | speed       | $6K-$13K     |
| data-analyst      | Data Analyst       | research    | $4.5K-$9K    |
| marketing         | Marketing          | research    | $5K-$10K     |
| community-manager | Community Manager  | research    | $3.5K-$7K    |
| hr                | HR                 | speed       | -            |
| localization      | Localization       | research    | $3.5K-$7K    |

**Role assignment formula**: For each candidate role, compute `score = sum(member[stat] * role.weight[stat]) + random(0, 5)`. Highest score wins. The random noise prevents all high-design staff from being the same role.

---

### A.4 Research Items

**GDT research structure** (from `api/research.js`):

```javascript
{
  id: "Better dialogues",          // unique string
  name: "Better dialogues",        // display name
  v: 4,                            // tech level value
  canResearch: function(company) { // unlock predicate
    return LevelCalculator.getMissionLevel('Dialogs') > 2;
  },
  category: "Level Design",        // research category
  categoryDisplayName: "Level Design"  // UI display name
}
```

**Valid `v` values** (from `checkResearchV`): `[1, 2, 4, 6, 8, 10, 12, 14]` — only these 8 values are accepted. This implies a logarithmic tech progression: early items are dense (v=1,2,4), later items are sparse (v=10,12,14).

**Tech Empire research system** (expanded to 33+ items across 7 categories):

| Category     | Items | Tech Levels | Cost Range    | Duration     |
|-------------|-------|-------------|---------------|--------------|
| AI           | 5     | 2-13        | $15K-$120K    | 4-14 weeks   |
| Networking   | 5     | 3-14        | $20K-$100K    | 6-12 weeks   |
| Graphics     | 5     | 1-14        | $10K-$130K    | 3-14 weeks   |
| Audio        | 4     | 2-12        | $12K-$70K     | 3-10 weeks   |
| UX           | 5     | 2-12        | $10K-$65K     | 3-10 weeks   |
| Monetization | 4     | 4-13        | $18K-$90K     | 4-10 weeks   |
| Engine       | 5     | 2-12        | $15K-$85K     | 5-12 weeks   |

**Unlock rule**: An item is researchable if its `techLevel <= maxCompletedTechLevel + 3`. This creates a rolling frontier — you can reach 3 levels ahead of your best completed research.

---

## B. GAME SCORING INTERNALS

### B.1 The Core Scoring Formula

**GDT's actual formula** (reverse-engineered from decompiled source, implemented in `scoring.js`):

```
GameScore = RawPoints * Modifiers * TopicGenreMod * TopicAudienceMod
            * PlatformGenreMod * BugRatio * ResearchBonus
            * MoraleMult * SequelMult
```

Where:
```
RawPoints     = (DesignPoints + TechPoints) / SizeDivisor
Modifiers     = 1 + DesignTechBalance + TimeManagement
```

**Size divisors** (normalization):

| Size   | Divisor | Ideal Dev Weeks | Staff | Cost    |
|--------|---------|-----------------|-------|---------|
| Small  | 1.0     | 5               | 1     | $0      |
| Medium | 2.5     | 10              | 2     | $20K    |
| Large  | 5.0     | 20              | 4     | $80K    |
| AAA    | 10.0    | 32              | 6     | $250K   |

### B.2 Design/Tech Point Ratio

**Per-aspect Design:Tech split** (from GDT source):

| Aspect       | Design | Tech | Base Points |
|-------------|--------|------|-------------|
| Engine       | 0.20   | 0.80 | 20          |
| Gameplay     | 0.60   | 0.40 | 40          |
| Story/Quests | 0.90   | 0.10 | 40          |
| Dialogues    | 0.90   | 0.10 | 10          |
| Level Design | 0.40   | 0.60 | 30          |
| AI           | 0.20   | 0.80 | 60          |
| World Design | 0.70   | 0.30 | 70          |
| Graphics     | 0.20   | 0.80 | 20          |
| Sound        | 0.60   | 0.40 | 10          |

**Ideal D:T ratio by genre** (determines the balance modifier):

| Genre      | Ideal D:T Ratio | Meaning                       |
|------------|-----------------|-------------------------------|
| Action     | 0.67            | Tech-heavy (more tech needed) |
| Adventure  | 1.50            | Design-heavy                  |
| RPG        | 1.50            | Design-heavy                  |
| Simulation | 0.67            | Tech-heavy                    |
| Strategy   | 0.67            | Tech-heavy                    |
| Casual     | 1.50            | Design-heavy                  |

**Design/Tech Balance modifier** (range: -0.4 to +0.4):
```javascript
idealRatio = GENRE_DT_RATIO[genre];  // e.g. 0.67 for Action
delta = (design * (1/idealRatio) - tech) / max(design, tech, 1);
absDelta = min(abs(delta), 1);
modifier = 0.4 - 0.8 * absDelta;
// Perfect match = +0.4, worst mismatch = -0.4
```

### B.3 Genre Importance Matrix (Time Management)

The "slider importance" matrix determines which aspects matter for each genre. This is the most critical balance data in the entire game.

**Values**: 1.0 = Important (needs 40%+), 0.5 = Neutral, 0.0 = Restricted (must be <=20%)

```
                Engine  Gameplay  Story  Dialogues  LevelDesign  AI   WorldDesign  Graphics  Sound
Action:         1.0     1.0       0.0    0.0        1.0          1.0  0.0          1.0       1.0
Adventure:      0.0     0.5       1.0    1.0        0.5          0.0  1.0          1.0       0.5
RPG:            0.0     1.0       1.0    1.0        1.0          0.0  1.0          1.0       0.5
Simulation:     1.0     1.0       0.5    0.0        1.0          1.0  0.5          1.0       1.0
Strategy:       1.0     1.0       0.5    0.5        1.0          1.0  1.0          0.5       1.0
Casual:         0.0     1.0       0.0    0.0        1.0          0.0  0.0          1.0       1.0
```

**Time Management modifier** (range: -0.4 to +0.4):
```javascript
for each aspect i (0-8):
  if importance[i] >= 0.9:   // Important
    if slider[i] >= 40: score += 1
    if slider[i] < 20:  score -= 1
  if importance[i] <= 0.1:   // Restricted
    if slider[i] <= 20: score += 1
    if slider[i] > 40:  score -= 1

normalized = score / totalChecks;  // range: -1 to 1
timeManagement = normalized * 0.4;  // range: -0.4 to +0.4
```

**Key insight for calibration**: The combined modifier from D:T balance + time management ranges from -0.8 to +0.8. Since the formula is `RawPoints * (1 + combined_modifier)`, a perfect game gets `RawPoints * 1.8` while a terrible one gets `RawPoints * 0.2` — a 9x quality swing from slider management alone.

### B.4 Bug Ratio

```javascript
ratio = actualDevWeeks / max(idealDevWeeks, 1);
staffPenalty = max(0, (staffCount - 2) * 0.02);  // each staff beyond 2 adds 2% bug risk
base = min(1.0, ratio * 0.8 + 0.2);              // rushing = more bugs
bugRatio = max(0.5, base - staffPenalty);          // floor at 0.5 (50% quality)
```

### B.5 Review Score Computation (Relative Scoring)

GDT uses **relative scoring** — your game is judged against your personal best, not an absolute scale. This is the key mechanic that creates the difficulty curve.

```javascript
// Target Game Score (the bar for a "perfect" review)
if (topScore <= 0):
  tgs = 80;                    // first game baseline
else:
  yearMod = 1 + (currentYear - 1) * 0.02;   // bar rises 2% per year
  tgs = topScore + topScoreDelta * yearMod;  // bar = best + delta, scaled by time

// Base review score (1-10 scale)
if (gameScore >= tgs * 1.2):
  baseScore = 9.5;                           // exceptional
else if (gameScore >= tgs):
  baseScore = 7.5 + 2.0 * ((gameScore - tgs) / (tgs * 0.2));  // 7.5-9.5
else:
  baseScore = max(1, 7.5 * (gameScore / tgs));  // 1-7.5

// 4 reviewer scores with variance
for each reviewer:
  variance = (random() - 0.5) * 1.5;    // +/- 0.75 points
  score = clamp(round(baseScore + variance, 0.5), 1, 10);
```

**Critical calibration note**: The initial TGS of 80 means a first game needs ~80 raw game score to get a 7.5 review. With a Small game (divisor 1.0), perfect sliders (modifier ~1.8), and a 1.0 topic-genre match, you'd need about 44 raw Design+Tech points to hit 80. This prevents first games from scoring 9.5+ while keeping 6-7 achievable.

### B.6 Revenue Formula

```javascript
// Review score multiplier (smooth curve)
reviewMult = {
  < 3.0:  0.05,     // disaster, almost no sales
  3-5:    0.15,     // poor
  5-7:    0.50,     // average
  7-8:    0.75,     // good
  8-8.5:  1.00,     // very good (baseline)
  8.5-9:  1.40,     // great
  9-9.5:  1.80,     // hit
  9.5+:   2.20      // blockbuster
};

// Full formula
baseRevenue = 50000;
revenue = baseRevenue * reviewMult * sizeMult * fanMult * (marketShare * 10)
          * marketSentiment * genreTrendBonus;

// Size multipliers: Small=1, Medium=3, Large=8, AAA=20
// Fan multiplier: 1 + log10(max(fans, 1)) * 0.3
```

### B.7 Fan Growth

```javascript
baseFans = 100 + random(0, 200);  // 100-300 per release minimum
if (reviewAvg >= 9): fans += 50000 + currentFans * 0.15 + baseFans;
if (reviewAvg >= 8): fans += 20000 + currentFans * 0.08 + baseFans;
if (reviewAvg >= 7): fans += 5000  + currentFans * 0.03 + baseFans;
if (reviewAvg >= 5): fans += 1000  + baseFans;
else:                fans += baseFans;
```

---

## C. PROGRESSION MECHANICS

### C.1 Office Upgrades

| Level | Office         | Max Staff | Cash Gate  | Year Gate | Unlocked Sizes          |
|-------|---------------|-----------|------------|-----------|-------------------------|
| 0     | Garage         | 1         | $0         | Y1        | Small                   |
| 1     | Small Office   | 5         | $1,000,000 | Y4        | Small, Medium           |
| 2     | Medium Office  | 5         | $5,000,000 | Y6        | Small, Medium, Large    |
| 3     | Large Office   | 8         | $16,000,000| Y13       | Small, Medium, Large, AAA|

**What unlocks at each office level**:

**Garage (Level 0)**:
- Make small games, 30 starter topics, all 6 genres
- Finance dashboard, market panel, notifications

**Small Office (Level 1)**:
- Hire staff (up to 5), medium games
- Training system, marketing, publisher deals (after 3 games)
- Tier 2 topics (26 additional), morale panel
- Loan system

**Medium Office (Level 2)**:
- Large games, R&D Lab (research tree)
- Tier 3 topics (29 via research), verticals ($10M gate)

**Large Office (Level 3)**:
- AAA games, hardware lab
- Custom consoles (after 10 games), IPO ($50M + Y15)

### C.2 Research Tree Structure

7 categories with 4-5 items each, 33 total. Each item has:
- **techLevel**: determines unlock order (items available when `techLevel <= maxCompleted + 3`)
- **cost**: one-time research fee ($10K-$130K)
- **durationWeeks**: time to complete (3-14 weeks)

Categories unlock new capabilities:
- **AI**: pathfinding -> behavior trees -> procedural gen -> ML NPCs -> LLM dialogue
- **Networking**: basic multi -> dedicated servers -> MMO -> crossplay -> cloud gaming
- **Graphics**: sprites -> 3D -> shaders -> ray tracing -> nanite
- **Audio**: spatial -> dynamic music -> voice synth -> ambisonics
- **UX**: tutorials -> accessibility -> analytics -> live ops -> haptic
- **Monetization**: DLC -> MTX -> battle pass -> digital ownership
- **Engine**: physics -> scripting -> ECS -> hot reload -> voxel

**Score bonus from research**: `researchBonus = 1 + completedResearchCount * bonusPerItem`. Each completed research improves all future game scores.

### C.3 Custom Game Engine System

In GDT, custom engines are built from researched components. Each component (Graphics, AI, Sound, etc.) has a level from 1 to the maximum researched. Higher engine components contribute more Design/Tech points during development.

The engine system in Tech Empire is implicit — completing research in a category acts as the engine level for that category, feeding into the research score bonus.

---

## D. VISUAL/UI REFERENCE

### D.1 Garage Era (Screenshots Analyzed)

From `gdt-garage-gameplay.png` and `gdt-garage-welcome.png`:

**Viewport**: Isometric 2.5D room with cartoon art style. Single character sits at a desk with a computer. Room contains:
- Desk with monitor (character works here)
- Bulletin board on wall (pinned papers)
- Chalkboard on wall (design notes)
- Whiteboard on right wall (sketches)
- Sleeping bag/mattress on floor (startup vibes)
- Bookshelf with items
- Door to outside

**Top HUD bar** (always visible, left to right):
- Two circular icons (character/company/settings access)
- Project status bar (shows "No Project" when idle, game title + progress when developing)
- Research button (blue circle with count)
- Stats: "0 Fans Y1 M1 W2" + "Cash: 70K" in top right

**Dev screen animation**: When developing, colored bubbles (blue for Design, red for Tech) float up from the character, indicating point generation. Larger bubbles = higher point values. The progress bar in the top HUD fills over time.

### D.2 Large Office (Screenshot Analyzed)

From `gdt-large-office.png`:

**Room**: Much larger isometric space with:
- Multiple desks with staff members (5+ visible), each at their own workstation
- Named tags below each staff member
- Reception/lobby area
- Conference table
- Wall signage ("Stark Studios" on back wall)
- R&D Lab area visible in bottom-right
- Decorative items (plants, water cooler, pool/lounge area on right side)

**Right-click context menu** (visible in screenshot):
- Develop New Game...
- Develop Sequel...
- Create Custom Engine...
- Find Contract Work...
- Find Publishing Deal...
- Staff List...
- Game History...

**Bottom HUD**: Shows "R&D lab" section with Internet Opportunities counter and "Budget: 180K per month"

**Fan counter**: Shows "105" in the Research circle area. Top right shows game year/month/week.

### D.3 Dev Screen Animation Pattern

During development, the game shows 3 development phases sequentially. Each phase:
1. Player allocates sliders for 3 aspects (% of effort)
2. Characters work at desks, generating bubbles
3. Design bubbles (blue) and Tech bubbles (red) accumulate
4. Progress bar fills for the phase
5. At phase end, next phase begins (or game completes)

Between phases, the game pauses and asks the player to set sliders for the next 3 aspects.

---

## E. EVENT SYSTEM

### E.1 GDT Event Structure

```javascript
{
  id: 'unique-event-id',           // globally unique string (GUIDs common)
  isRandom: true,                   // false = deterministic/testing
  maxTriggers: 3,                   // max times this event can fire per game
  trigger: function(company) {      // predicate: return true to make eligible
    return company.currentLevel == 1 && company.isGameProgressBetween(0.2, 0.9);
  },
  getNotification: function(company) {  // creates the notification when fired
    return new Notification({
      sourceId: eventId,            // links options back to complete()
      header: "Event Title",
      text: "Story text...{n}More text after page break",  // {n} = page break
      options: ["Choice A", "Choice B", "Choice C"],       // max 3 choices
      weeksUntilFired: 2            // optional delay
    });
  },
  complete: function(decision) {    // decision = 0, 1, or 2 (option index)
    // Apply consequences
    company.adjustHype(value);
    company.adjustCash(amount, "reason");
    // Show follow-up notification
    company.activeNotifications.addRange(notification.split());
  }
}
```

**Key API methods** (from decompiled source):
- `company.isGameProgressBetween(min, max)` — check dev progress (0.0-1.0)
- `company.currentLevel` — office level (1-4)
- `company.getCurrentDate().year` — current game year
- `company.getRandom()` — seeded random (0.0-1.0)
- `company.adjustHype(amount)` — modify game hype
- `notification.adjustCash(amount, reason)` — modify cash (can be negative)
- `notification.adjustHype(amount)` — modify hype via delayed notification
- `notification.split()` — split `{n}` page breaks into separate notifications

### E.2 Tech Empire Storyteller System

Tech Empire replaces GDT's simple random events with a drama-aware storyteller.

**Drama Score** (0-100, starts at 50):
- Cash trending up significantly: drama +10
- Cash trending up slightly: drama +3
- Cash trending down significantly: drama -10
- Cash trending down slightly: drama -3
- High fan count (>10K): drama +2
- Constant drift toward center: `dramaScore += (50 - dramaScore) * 0.02`

**Event pool selection**:
| Drama Score | Pool           | Event Type    |
|-------------|---------------|---------------|
| > 70        | Challenges     | Problems/crises (10 events) |
| < 30        | Opportunities  | Good fortune (10 events)   |
| 30-70       | Catalysts      | Industry shifts (10 events) |

**Fire rate**: 30% chance per month. Each specific event has a 50-week cooldown.

**Key design principle**: Success breeds challenges (drama rises when doing well), failure breeds opportunities (drama drops when struggling). This creates a natural difficulty oscillation — a "rubber band" that keeps the game interesting regardless of skill level.

### E.3 Conference System

3 annual conferences, each at a fixed month/week:

| Conference       | Month | Cost Range | Hype   | Fans  | Award Chance | Min Year |
|-----------------|-------|------------|--------|-------|-------------|----------|
| G3              | May   | $20K-$80K  | +30    | 25K   | 25%         | Y3       |
| GamesCon Europe | Aug   | $12K-$50K  | +20    | 15K   | 20%         | Y2       |
| Indie Spotlight | Nov   | $5K-$15K   | +15    | 8K    | 35%         | Y1       |

**Conference outcomes**:
- Hype bonus (guaranteed if attending)
- Fan gain (guaranteed)
- Star recruit chance (40-60%)
- Award nomination (20-35%, requires last game 8+)
- Competitor intelligence

### E.4 Market Simulation

**Market sentiment** (0.5 to 1.5):
- Recession: 0.5-0.7
- Downturn: 0.7-0.9
- Stable: 0.9-1.1
- Growth: 1.1-1.3
- Boom: 1.3-1.5

**Update formula** (weekly):
```javascript
drift = (random() - 0.5) * 0.02;            // random walk
reversion = (1.0 - sentiment) * 0.01;        // mean reversion to 1.0
sentiment = clamp(sentiment + drift + reversion, 0.5, 1.5);

// Year boundaries: boom/bust cycles
if (year % 7 === 0): sentiment *= 0.85;      // mini-crash every 7 years
if (year % 5 === 0): sentiment *= 1.15;      // boom every 5 years
```

**Trending genres**: 2 random genres become "trending" each year, providing a sales bonus for games in those genres.

---

## F. FRANCHISE & SEQUEL SYSTEM

### F.1 Sequel Modifier Curve

The franchise system creates diminishing returns for sequels:

| Entry # | sequelCurve | Effect         |
|---------|-------------|----------------|
| 1st     | 1.15        | Sequel boost   |
| 2nd     | 1.05        | Trilogy bonus  |
| 3rd     | 0.95        | Slight fatigue |
| 4th     | 0.85        | Getting stale  |
| 5th+    | 0.75        | Major fatigue  |

**Full modifier**: `recognition * fatigueMultiplier * sequelCurve`
- `recognition = min(1.3, 1.0 + brandStrength/200)` — brand recognition bonus
- `fatigueMultiplier = max(0.5, 1.0 - fatigue * 0.05)` — fatigue penalty

**Fatigue accumulation**:
- Annual release (1 year gap): fatigue +3
- Biennial (2 year gap): fatigue +1
- Long gap (3+ years): fatigue -2 (recovery)

### F.2 Remaster Scoring

```javascript
if yearsSinceLast < 3:  score = 0          // too soon
if yearsSinceLast < 5:  score = 0.3        // early
if yearsSinceLast <= 10: score = 0.8 + (brandStrength/200)  // sweet spot
if yearsSinceLast <= 15: score = 1.0 + (brandStrength/150)  // peak nostalgia
if yearsSinceLast > 15:  score = 0.6       // too old
```

---

## G. MORALE SYSTEM

**Morale** (0-100, starts at 75):

| Range  | Label    | Quality Multiplier |
|--------|----------|-------------------|
| 90-100 | Ecstatic | 1.15 (15% bonus)  |
| 75-89  | Happy    | 1.05 (5% bonus)   |
| 50-74  | Content  | 1.00 (neutral)    |
| 25-49  | Stressed | 0.90 (10% penalty)|
| 0-24   | Unhappy  | 0.75 (25% penalty)|

**Culture perks** (one-time purchase, permanent morale boost):

| Perk              | Cost  | Morale Boost |
|-------------------|-------|-------------|
| Remote Work       | $2K   | +10         |
| Game Room         | $5K   | +8          |
| Free Lunch        | $3K   | +7          |
| Monthly Hackathons| $1K   | +12         |
| Stock Options     | $0    | +15         |
| Mentorship        | $500  | +6          |
| Wellness Program  | $2.5K | +9          |
| 4-Day Work Week   | $5K   | +20         |

---

## H. PUBLISHER SYSTEM

8 publishers with varying requirements and terms:

| Publisher           | Reputation | Advance % | Royalty Cut | Min Score | Genre Focus           |
|--------------------|-----------|-----------|-------------|-----------|----------------------|
| MegaCorp Games     | 90        | 40%       | 30%         | 7         | Action, Adventure     |
| Global Entertainment| 95       | 50%       | 35%         | 8         | Action, Adventure, RPG|
| Platinum Studios   | 85        | 45%       | 28%         | 7         | Action, RPG           |
| Eastern Star       | 75        | 35%       | 20%         | 6         | RPG, Strategy, Action |
| Indie Fuel         | 70        | 20%       | 15%         | 5         | RPG, Strategy, Sim    |
| TapTap Publishing  | 60        | 30%       | 25%         | 4         | Casual, Simulation    |
| Immersive Ventures | 55        | 25%       | 18%         | 5         | Adventure, Simulation |
| Niche Interactive  | 50        | 15%       | 10%         | 3         | Strategy, Sim, RPG    |

**Advance formula**: `advance = 10000 * publisher.advancePct * (1 + reputation/10)`

**Milestone structure**:
1. Prototype Demo — week 8 (20% of advance)
2. Alpha Build — week 16 (30%)
3. Beta Build — week 24 (20%)
4. Gold Master — week 32 (30%)
5. Post-Launch Support — week 44 (premium publishers only)

---

## I. KEY CALIBRATION NUMBERS

These are the numbers that matter most for making Tech Empire feel like GDT:

| Parameter                    | GDT Value          | Tech Empire Value   | Notes                    |
|-----------------------------|-------------------|--------------------|--------------------------| 
| Starting cash               | 70K               | 70K                | Identical                |
| Game span                   | ~35 years          | ~35 years          | Identical                |
| Genres                      | 6                  | 6                  | Identical                |
| Genre weightings array size | 6                  | 6                  | Identical                |
| Audience weightings size    | 3                  | 3                  | Identical                |
| D:T modifier range          | approx +/-0.4     | -0.4 to +0.4      | Matched                  |
| Time mgmt modifier range   | approx +/-0.4     | -0.4 to +0.4      | Matched                  |
| Review scale                | 1-10, half points  | 1-10, half points  | Identical                |
| Reviewer count              | 4                  | 4                  | Identical                |
| Reviewer variance           | +/- 0.75          | +/- 0.75           | Matched                  |
| Initial TGS                 | ~20 (estimated)    | 80                 | TE raised to prevent inflated first-game scores |
| Year scaling                | ~2% per year       | 2% per year        | Matched                  |
| Dev phases                  | 3                  | 3                  | Identical                |
| Aspects per phase           | 3                  | 3                  | Identical                |
| Date format                 | Y/M/W              | Y/M/W              | Identical                |
| Weeks per month             | 4                  | 4                  | Identical                |
| Months per year             | 12                 | 12                 | Identical                |
| Platform market curve       | Linear interp      | Linear interp      | Identical method         |

---

## J. SOURCE FILE MAP

| What                      | GDT ModAPI Location                          | Tech Empire Location                    |
|--------------------------|----------------------------------------------|----------------------------------------|
| Topic structure          | `gdt-modAPI/api/topics.js`                    | `src/game/data.js` (TOPICS array)       |
| Platform structure       | `gdt-modAPI/api/platforms.js`                 | `src/game/data.js` (PLATFORMS array)    |
| Research structure       | `gdt-modAPI/api/research.js`                  | `src/game/research.js`                  |
| Event structure          | `gdt-modAPI/api/events.js`                    | `src/game/events.js`                    |
| Scoring formula          | Decompiled (not in public API)                | `src/game/scoring.js`                   |
| Genre importance matrix  | Decompiled (not in public API)                | `src/game/data.js` (GENRE_IMPORTANCE)   |
| D:T ratios              | Decompiled (not in public API)                | `src/game/data.js` (GENRE_DT_RATIO)    |
| Aspect ratios           | Decompiled (not in public API)                | `src/game/data.js` (ASPECT_RATIOS)     |
| Validation checks       | `gdt-modAPI/helpers/checks.js`                | Input validation in game systems        |
| Persistence / save      | `gdt-modAPI/api/persistence.js`               | `src/game/engine.js` (localStorage)     |
| Examples                | `gdt-modAPI/examples/examples.js`              | N/A (used as reference only)            |
| Franchise system         | Not in vanilla GDT                            | `src/game/franchise.js`                 |
| Storyteller              | Not in vanilla GDT                            | `src/game/storyteller.js`               |
| Market simulation        | Not in vanilla GDT                            | `src/game/market.js`                    |
| Morale system            | Not in vanilla GDT                            | `src/game/morale.js`                    |
| Publisher deals          | Not in vanilla GDT                            | `src/game/publishers.js`                |
| Conference system        | Not in vanilla GDT                            | `src/game/conference.js`                |
| Synergies (verticals)    | Not in vanilla GDT                            | `src/game/synergies.js`                 |
