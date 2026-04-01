# Tech Empire — Design System

The art direction bible for all visual and interaction work. Every brand request, UI change, and asset must reference this document.

---

## Core Philosophy

**Bloomberg data density + Apple premium feel + GDT's warmth.**
Dark-first. Data-rich but never cluttered. Every visual earns its place by giving information or building emotional connection. Nothing decorative for its own sake.

---

## Shell Architecture

Three zones that never compete for space:

```
┌──────────────────────────────────────────┐
│  HUD LAYER (always-on overlay)           │  TopBar: cash, fans, date, speed,
│                                          │  feature icons, morale mini-bar
├──────────────────────────────────────────┤
│                                          │
│  STUDIO CANVAS (isometric scene)         │  The office — evolves per tier
│                                          │  Staff sprites, room art, trophies
│                                          │  This is the game's SOUL
│                                          │
├──────────────────────────────────────────┤
│  MODAL LAYER (game actions)              │  Wizards, review screens, panels
│                                          │  Fires on player actions
└──────────────────────────────────────────┘
```

---

## 3-Tier Asset System

**Never cross tiers upward.** Tier 3 elements must never try to look like Tier 1.

### Tier 1 — Commissioned Raster Art (warmth + personality)

| Asset | Format | Size | Style |
|-------|--------|------|-------|
| Office backgrounds | PNG | 2560x1600 (retina) | Isometric room illustration, warm lighting |
| Platform hardware | PNG | 256x256 + 64x64 | Isometric device, silhouette parody of real hardware |
| Staff portraits | PNG | 128x128 | Cartoon headshot, expressive, diverse |
| Game box art | PNG | 200x280 | Generated per release, genre-themed cover |
| Victory screens | PNG | 1280x800 | Cinematic, one per victory type |
| Game over screen | PNG | 1280x800 | Dramatic but not depressing |

**Production method:** Generate with Nano Banana Pro (`gemini-3-pro-image-preview`) for finals or Nano Banana 2 (`gemini-3.1-flash-image-preview`) for fast previews, then refine.
**Quality bar:** Must have warmth, imperfection, and personality. NOT wireframes. NOT flat vectors.

### Tier 2 — SVG Illustration Library (consistency + scalability)

| Asset | Format | Size | Style |
|-------|--------|------|-------|
| Topic icons | SVG | 48x48 base | Flat illustration, bold outlines, limited palette |
| Genre icons | SVG | 32x32 | 6 icons, geometric, instantly readable |
| Platform badges | SVG | 24x24 | Small logo marks for lists/tables |
| Vertical icons | SVG | 64x64 | 14 industry symbols, consistent family |
| Score display | SVG+CSS | Variable | Animated number with star rating |
| Achievement badges | SVG | 48x48 | Metallic finish, tier-colored borders |

**Production method:** Gemini 3.1 Pro (`gemini-3.1-pro-preview`) for SVG generation and animation logic, then hand-refine as needed. Must follow icon grid (see below).
**Quality bar:** Crisp at every size. Recognizable at 16px. Detailed at 128px.

### Tier 3 — CSS/SVG System (pure UI)

| Asset | Format | Notes |
|-------|--------|-------|
| Slider controls | CSS + SVG track | Phase allocation sliders |
| Progress bars | CSS | Dev progress, energy, research |
| Toast notifications | CSS | Slide-in from corner |
| Data charts | SVG polyline | Bar, line, pie — all dark-theme |
| Modal overlays | CSS | Backdrop blur, slide-up animation |
| Buttons/inputs | CSS | Focus states, hover lifts |

**Production method:** Code only. No external assets.

---

## Color System

### Base Palette
```css
--bg-primary:     #0d1117;   /* App background */
--bg-surface:     #161b22;   /* Card/panel background */
--bg-raised:      #1c2128;   /* Elevated surfaces */
--bg-floating:    #21262d;   /* Modals, dropdowns */

--text-primary:   #e6edf3;   /* Headings, important */
--text-body:      #c9d1d9;   /* Body text */
--text-secondary: #8b949e;   /* Labels, captions */
--text-tertiary:  #484f58;   /* Disabled, hints */

--accent-blue:    #58a6ff;   /* Primary actions, links */
--accent-green:   #4ade80;   /* Success, positive, brand */
--accent-red:     #f87171;   /* Error, danger, negative */
--accent-amber:   #fbbf24;   /* Warning, attention */
--accent-purple:  #a78bfa;   /* Special, premium */
```

### Vertical Colors
Each vertical has a signature accent:
```css
--v-games:     #4ade80;   /* Green — creative, fun */
--v-software:  #58a6ff;   /* Blue — professional, reliable */
--v-cloud:     #22d3ee;   /* Cyan — infrastructure, scale */
--v-ai:        #a78bfa;   /* Purple — intelligence, premium */
--v-streaming: #f87171;   /* Red — entertainment, passion */
--v-defense:   #94a3b8;   /* Slate — serious, classified */
```

### Era Color Temperature
Office art should shift color temperature across eras:
- **Garage:** Warm amber (#fbbf24 tint) — late nights, passion
- **Startup:** Neutral warm — professional but personal
- **Scale-Up:** Cool neutral — corporate emerging
- **Empire:** Cool blue (#58a6ff tint) — power, precision

---

## Typography

**Font:** Inter (loaded locally, not CDN)

| Use | Weight | Size | Line Height |
|-----|--------|------|-------------|
| Display (splash, victory) | 800 | 32px | 1.1 |
| Heading 1 (panel titles) | 700 | 24px | 1.2 |
| Heading 2 (section titles) | 600 | 20px | 1.3 |
| Body large (descriptions) | 400 | 16px | 1.5 |
| Body (default) | 400 | 14px | 1.5 |
| Small (labels, captions) | 500 | 13px | 1.4 |
| Tiny (badges, metadata) | 600 | 11px | 1.3 |

---

## Spacing

4px grid. All spacing is a multiple of 4.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## Icon Design Language

### T2 SVG Icon Grid
- **Canvas:** 24x24 base grid
- **Safe area:** 2px padding (20x20 active area)
- **Stroke width:** 2px (consistent across all icons)
- **Corner radius:** 2px on rectangles
- **Stroke cap:** Round
- **Fill:** Outline only by default, filled on active/selected state

### T1 Platform Hardware
- **Angle:** Isometric (30° from horizontal)
- **Silhouette rule:** Must match real device silhouette at 80%+ fidelity
- **Color deviation:** Use our palette, not original device colors
- **Detail level:** Visible d-pad/buttons/ports, but stylized not photographic

---

## Design Tools Stack

We already have a complete design toolchain. Use it deliberately instead of improvising assets ad hoc.

### Model Routing

| Need | Primary Tool | Why |
|------|--------------|-----|
| T2 SVG icons, animated SVGs, badges, visual code | Gemini 3.1 Pro | Best current SVG/code generation, strong multi-element choreography |
| T1 raster art, key art, portraits, office scenes, victory screens | Nano Banana Pro | Best current raster image quality, 4K output, strongest text/rendering |
| Fast raster previews during iteration | Nano Banana 2 | Same family, faster turnaround for exploration |

**Rule:** Victor should use both. Gemini 3.1 Pro owns SVG systems. Nano Banana Pro owns raster illustration.

### Enabled Design Tools

| Tool | What It Does | Primary Owner |
|------|--------------|---------------|
| Figma | Source of truth for design system, mockups, and layout specs | Victor |
| Frontend Design | Production-grade UI generation with strong visual taste | Theo |
| Chrome DevTools MCP | Live browser debugging, layout inspection, accessibility audit | Theo |
| Design Sync agent | Pixel-perfect Figma-to-code comparison | Theo |
| Design Review agent | Structured implementation review against spec | Victor |
| Design Iterator agent | Multi-pass refinement loop for visual polish | Victor + Theo |
| Firecrawl | Competitor/reference scraping for visual research | Victor + Theo |
| Agent Browser | Headless screenshots and UI verification | Theo |

### Operating Workflow

1. Victor creates the icon, badge, illustration, and layout system in Figma first.
2. Victor generates SVG families with Gemini 3.1 Pro and raster finals with Nano Banana Pro.
3. Theo implements from Figma specs using the repo’s frontend design tools.
4. Theo runs Design Sync against Figma before calling UI work done.
5. Theo runs Chrome DevTools accessibility and layout passes on every DMG build.

### Creative Approval Flow

1. Chairman or Victor defines the asset need, business context, and approval bar.
2. Victor frames the creative brief and routes production work to Rohan.
3. Rohan assigns the work to the correct lane:
   - SVG systems -> Principal, SVG Systems
   - Raster illustration/key art -> Principal, Raster Image Production
4. The specialist produces the asset package and sends it back to Rohan.
5. Rohan reviews against Figma, brand standards, and implementation constraints. Revisions stay in Rohan's lane until the work is ready.
6. Victor performs the executive creative gate.
7. Chairman performs the final approval gate for marquee, user-facing, or strategically important work.

### Asset Policy

- Do not generate raster art with Gemini 3.1 Pro. It is for SVG and visual code.
- Do not use Nano Banana as the source of truth for icon systems. Build the system in Figma first.
- All Tech Empire visual families should be Figma-led, then AI-assisted, then code-verified.

---

## GDT Design Principles — Our Stance

| GDT Principle | Our Approach | Why |
|---------------|-------------|-----|
| Silhouette parody | **COPY** | Instant recognition without IP risk |
| Warm neutral palette | **SUBVERT** | Dark-first = premium 2026 feel |
| One asset per platform | **COPY** | Consistency = recognition |
| Isometric angle | **COPY** | Gives physicality and depth |
| Progressive disclosure | **COPY** | Modals for actions, clean HUD |
| Micro-copy personality | **EXPAND** | Named critics, staff traits, game titles — more character |

---

## Micro-Animation Moments

These are the emotional peaks of gameplay. Each gets a dedicated animation.

| Moment | Animation | Duration | Priority |
|--------|-----------|----------|----------|
| Score reveal | Numbers roll up slot-machine style, camera shake on 9+ | 2-3s | P1 |
| New fan milestone | Confetti particles + counter ticking up | 1.5s | P1 |
| Office upgrade | Cinematic zoom out, walls expand | 3s | P1 |
| IPO bell ring | Bell icon rings + stock ticker scrolls | 2s | P2 |
| First employee hire | Character walks to their desk | 2s | P2 |
| GOTY award | Trophy flies onto shelf + spotlight | 2.5s | P2 |
| Bankruptcy | Lights dim, staff walk out one by one | 4s | P2 |
| Vertical unlock | New building wing assembles | 3s | P3 |
| Game release | Box art appears + "shipping" animation | 2s | P1 |
| Market crash | Screen shakes + red flash | 1s | P2 |

**Implementation:** Lottie for complex sequences, CSS @keyframes for simple ones, Web Animations API for timing.

---

## Platform Parody Naming Guide

Each platform is a recognizable parody of a real device:

| Real Device | Our Name | Era |
|-------------|----------|-----|
| Commodore 64 | Govodore 64 | Garage |
| NES | TES | Garage |
| Game Boy | Gameling | Startup |
| SNES | Super TES | Startup |
| PlayStation | PlaySystem | Startup |
| N64 | Nuu 64 | Startup |
| Xbox | mBox | Scale-Up |
| PS2 | PlaySystem 2 | Scale-Up |
| Wii | Wuu | Scale-Up |
| Xbox 360 | mBox Next | Scale-Up |
| PS3 | PlaySystem 3 | Scale-Up |
| iPhone | grPhone | Scale-Up |
| PS4 | PlaySystem 4 | Empire |
| Xbox One | mBox One | Empire |
| Switch | Nuu Switch | Empire |
| PS5 | PlaySystem 5 | Empire |
| PC | PC | Always |
| Android | DroidOS | Scale-Up |
| VR | VR Nexus | Empire |

**Rule:** Same silhouette shape as the real device. Our color palette applied. No logos from the real brand.

---

## Composable Office Canvas

The office isn't one static image — it's a scene that grows:

```
GARAGE ERA:
┌─────────┐
│ 🖥️ desk │  Single room
│  📦 box │  Cramped, warm
└─────────┘

STARTUP ERA:
┌─────────────────┐
│ 🖥️ 🖥️ 🖥️ 🖥️  │  Larger room
│ ☕ 📋 🪴       │  Whiteboard, plants
└─────────────────┘

SCALE-UP ERA:
┌─────────────────────────┐
│ 🖥️ 🖥️ 🖥️ 🖥️ 🖥️ 🖥️  │  Open floor
│ 🏢 meeting  │ 🧪 R&D   │  Glass rooms
└─────────────────────────┘

EMPIRE ERA:
┌───────────────────────────────────┐
│ GAMES  │ SOFTWARE │ CLOUD  │ AI  │  Wings per vertical
│ 🎮     │ 💻      │ ☁️    │ 🧠 │  Each uniquely themed
│        │         │        │     │
│ ████ LOBBY + TROPHY CASE ████   │
└───────────────────────────────────┘
```

Each vertical you unlock adds a visible wing/room to the campus.

---

## Asset Production Checklist

Before any asset ships into the game:

- [ ] Matches correct tier (T1 raster / T2 SVG / T3 CSS)
- [ ] Works on #0d1117 dark background
- [ ] Passes WCAG AA contrast (4.5:1 for text, 3:1 for graphics)
- [ ] Rendered at correct dimensions (see tier tables above)
- [ ] Has variants if needed (sizes, states, themes)
- [ ] Follows color system (no off-palette colors)
- [ ] Follows typography scale (no custom font sizes)
- [ ] Follows spacing grid (multiples of 4px)
- [ ] Reviewed against this document before merge
