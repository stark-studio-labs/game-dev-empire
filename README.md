# Tech Empire

**Build your game studio from a garage to a global tech empire.**

Tech Empire is a game development tycoon simulator where you start as a solo developer in a garage, create hit games, hire staff, research new technologies, expand into multiple business verticals, and compete for industry dominance. Inspired by the classics, built for 2026.

> A Stark Labs project under ALCUB3 Labs.

---

## Screenshots

<!-- Screenshots will be added once final art assets are produced -->

| Garage Era | Startup Era | Empire Era |
|:---:|:---:|:---:|
| *Coming soon* | *Coming soon* | *Coming soon* |

---

## Features

### Core Gameplay
- **Tick-based simulation** -- 1 tick = 1 game week, with 1x/2x/4x/8x speed controls
- **85 curated topics** across 3 unlock tiers (Fantasy, Sci-Fi, Cyberpunk, AI, and 81 more)
- **6 genres** -- Action, Adventure, RPG, Simulation, Strategy, Casual
- **19 platform parodies** -- PlaySystem, mBox, Nuu Switch, grPhone, and more
- **3-phase development** with slider allocation (Engine, Gameplay, Story, Graphics, etc.)
- **Review scoring system** -- genre importance weights, topic compatibility, D/T ratio bonuses
- **Named critics** with distinct personalities and scoring tendencies

### Studio Management
- **Staff hiring and firing** with skill stats (design, tech, speed, research)
- **Staff energy and fatigue** -- burnout mechanics, rest management
- **8 training courses** for skill development
- **Staff personalities** that affect team dynamics
- **Team morale system** with 8 culture perks (free snacks to equity grants)

### Business
- **Full finance dashboard** with transaction tracking and cash flow
- **Tax system** scaling by office level (0% in Garage to 30% at Large Office)
- **8 publisher deals** with advance payments and royalty negotiation
- **Franchise tracking** with sequel bonuses
- **6 marketing campaigns** (social media to TV ads)
- **Loan system** for cash-strapped studios

### Growth
- **4 office tiers** -- Garage, Small Office, Medium Office, Large Office
- **33-item research tree** across 8 categories
- **Custom console hardware lab** -- build your own platform
- **IPO system** -- take your company public, manage stock price
- **3 annual conferences** -- E4, Tech Summit, Indie Fest

### Empire Building
- **4 business verticals** -- Software (B2C/B2B), Streaming (3 tiers), Cloud (3 regions), AI (open/closed source)
- **6 cross-vertical synergies** -- AI-Powered NPCs, Self-Hosted Servers, Hosted SaaS, and more
- **Full integration bonus** (+25% all revenue) at 4 active verticals
- **6 AI competitor studios** tracking market share

### Endgame
- **5 Civilization-style victory paths:**
  - Brand Empire -- become the most recognized name in gaming
  - Innovation Leader -- push the boundaries of game technology
  - Market Dominator -- own the market ($500M+ revenue, 60%+ share)
  - Financial Titan -- build an unassailable financial empire
  - Industry Kingmaker -- shape the entire industry
- **Victory tracker UI** with progress indicators for each path

### Dynamic Events
- **15 random events** -- market crashes, viral hits, talent raids, patent trolls
- **Adaptive storyteller** -- 30 narrative events (challenges, opportunities, catalysts) driven by a drama score
- **29 tech timeline events** -- historical industry milestones that affect gameplay
- **Game over conditions** -- bankruptcy triggers when you can't recover

### Quality of Life
- **Gated progression** -- features unlock as you grow, preventing information overload
- **New game wizard** with topic/genre/platform/size selection
- **Remaster wizard** -- re-release your best games on new platforms
- **Notification center** with toast notifications
- **Game history** with filtering and sorting
- **Tutorial/onboarding** for new players
- **Dev mode** (hidden easter egg) -- unlock everything for testing
- **Save/load** with full state serialization
- **Settings panel** with game options

### Visual & Audio
- **Dark-first design system** -- Bloomberg density meets Apple premium feel
- **Glassmorphism card system** with backdrop blur
- **Micro-animations** -- score reveal rolls, confetti on milestones, camera shake on 9+ scores
- **6 shared UI primitives** -- Toast, Modal, ProgressBar, StatCard, Chart, Tooltip
- **4px spacing grid** and Inter typography scale

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install and Run

```bash
# Clone the repo
git clone https://github.com/stark-studio-labs/game-dev-empire.git
cd game-dev-empire

# Install dependencies
npm install

# Launch the game
npm start

# Launch in dev mode (DevTools open)
npm run dev
```

### Build for macOS

```bash
# Build .app bundle
npm run build:mac

# Build DMG installer
npm run dist
```

The packaged app lands in `dist/`.

---

## Testing

### CDP Logic Tests (87 tests)

Tests game state, formulas, and system integration directly via Chrome DevTools Protocol.

```bash
# Start the game first
npm start

# In another terminal, run the test suite
python3 tests/cdp_test_suite.py
```

### Playwright E2E Tests (6 specs)

Tests real user interactions -- clicking through wizards, navigating panels, verifying UI state.

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E suite
npm run test:e2e
```

### Test Results

All 87 CDP tests passing. See [TEST-RESULTS.md](TEST-RESULTS.md) for the full breakdown.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Electron 35 |
| UI | React 18 (vendor-bundled, no build step) |
| JSX | Babel (in-browser transform) |
| Styling | CSS custom properties, glassmorphism, CSS animations |
| Logic Testing | Chrome DevTools Protocol (Python + websockets) |
| E2E Testing | Playwright |
| Packaging | electron-builder (DMG + ZIP for macOS arm64) |
| Version Control | Git + GitHub |

---

## Project Structure

```
game-dev-empire/
├── src/
│   ├── main/main.js              # Electron main process
│   ├── game/                      # 28 game system modules
│   │   ├── engine.js              # Core tick loop + state
│   │   ├── data.js                # Topics, genres, platforms, constants
│   │   ├── scoring.js             # Review score formula
│   │   ├── finance.js             # Cash flow + transactions
│   │   ├── market.js              # Market simulation
│   │   ├── research.js            # 33-item tech tree
│   │   ├── verticals.js           # 4 business verticals
│   │   ├── victory.js             # 5 victory paths
│   │   └── ...                    # 20 more modules
│   └── renderer/
│       ├── index.html             # App shell
│       ├── styles.css             # 1,200+ line design system
│       ├── app.js                 # Root React component
│       ├── components/            # 27 game UI components
│       │   ├── GameScreen.js      # Main game view
│       │   ├── NewGameWizard.js   # Game creation flow
│       │   ├── TopBar.js          # HUD overlay
│       │   ├── VerticalPanel.js   # Empire management
│       │   └── ...                # 23 more components
│       └── components/ui/         # 6 shared primitives
│           ├── Modal.js
│           ├── Toast.js
│           ├── Chart.js
│           ├── ProgressBar.js
│           ├── StatCard.js
│           └── Tooltip.js
├── tests/
│   ├── cdp_test_suite.py          # 87 CDP logic tests
│   └── e2e/                       # 6 Playwright spec files
├── assets/                        # Brand assets (8 categories)
├── dist/                          # Build output
└── docs/                          # Project documentation
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file -- project overview and quick start |
| [PLAYBOOK.md](PLAYBOOK.md) | Game development playbook -- repeatable build process |
| [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) | Art direction bible -- colors, typography, spacing, asset tiers |
| [PROGRESSION.md](PROGRESSION.md) | Gated unlock system -- topics, features, eras |
| [CODE-REVIEW.md](CODE-REVIEW.md) | Full code audit -- bugs found and fixes |
| [TIER3-REVIEW.md](TIER3-REVIEW.md) | Tier 3 systems review -- verticals, synergies, storyteller |
| [TEST-RESULTS.md](TEST-RESULTS.md) | Automated test results -- 87/87 passing |
| [DESIGN-REVIEW.md](DESIGN-REVIEW.md) | Visual design audit -- theme, states, typography |

---

## Roadmap

### Built (v0.1.0)
- [x] Core engine with tick-based simulation
- [x] 85 topics, 6 genres, 19 platforms
- [x] 3-phase development with slider allocation
- [x] Review scoring with genre importance weights
- [x] Staff management, energy, training, morale
- [x] Finance dashboard, taxes, loans, publisher deals
- [x] 33-item research tree
- [x] Custom hardware lab
- [x] 4 business verticals with synergies
- [x] IPO system
- [x] 5 victory paths
- [x] Adaptive storyteller with 30+ events
- [x] 6 AI competitor studios
- [x] Conference system
- [x] Micro-animations and visual polish
- [x] Save/load system
- [x] Dev mode
- [x] 87 automated tests (100% pass)
- [x] macOS DMG packaging

### Planned
- [ ] Commissioned T1 raster art (office backgrounds, platform hardware, staff portraits)
- [ ] T2 SVG icon families (topics, genres, platforms, verticals, achievements)
- [ ] Sound design and music
- [ ] Keyboard navigation and focus states
- [ ] Extended mid-game balance testing
- [ ] Steam distribution
- [ ] DLC Pack 1: Modding Community (let players mod your games)
- [ ] DLC Pack 2: Online Multiplayer (add online features to your games)
- [ ] DLC Pack 3: Esports (competitive gaming vertical)
- [ ] Windows and Linux builds

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit with conventional messages (`feat:`, `fix:`, `docs:`, `test:`)
4. Run tests: `python3 tests/cdp_test_suite.py` and `npm run test:e2e`
5. Open a PR against `main`

All PRs require passing tests before merge.

---

## Credits

**Tech Empire** is a [Stark Labs](https://github.com/stark-studio-labs) project, developed under the ALCUB3 Labs umbrella.

- **Studio:** Stark Labs (`studio@starklabs.dev`)
- **License:** MIT

---

*Built with obsessive attention to game feel. Ship games, build empires.*
