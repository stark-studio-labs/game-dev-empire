# Tech Empire — Design Review
**Date:** 2026-04-01
**Reviewer:** Claude Sonnet 4.6
**Scope:** `src/renderer/styles.css` + all 17 components

---

## Executive Summary

The visual foundation is **solid but unfinished**. The dark theme is coherent, the color palette is well-chosen, and the glassmorphism card system works. The main problems are: (1) inline styles dominate the components, making design changes hard and introducing inconsistency; (2) critical interactive states (focus, keyboard nav) are missing; (3) typography lacks hierarchy beyond size changes; (4) the TopBar icon buttons are too small and dense; (5) form inputs have no styled focus state; (6) modals are functional but lack polish (no close-on-Escape visual feedback, no X button consistency); (7) the `.phase-dot` / `.stat-fill` / progress bars are missing color variants.

---

## 1. Dark Theme Consistency: 7/10

**What's good:** `#0d1117` base, `#161b22` surface, `#1c2128` elevated surfaces are used consistently. All text uses `#e6edf3` (primary), `#c9d1d9` (body), `#8b949e` (secondary), `#484f58` (tertiary) — a solid 4-tier text system.

**Issues found:**
- `FinanceDashboard` uses `background: '#161b22'` inline (matches CSS) — OK, but fragile.
- `GameHistory` filter `<select>` and `<input>` use `rgba(255,255,255,0.05)` inline — not in global input styles.
- `TutorialOverlay` has no `.glass-card` — uses raw `background: '#161b22'` inline.
- `body` class on `index.html` uses Tailwind classes (`bg-[#0d1117] text-gray-200`) while all other styles are in `styles.css` — **dual styling system**, a consistency hazard.

**Fix:** Remove Tailwind classes from `<body>` — `styles.css` already handles `body { background: #0d1117; color: #c9d1d9 }`.

---

## 2. Hover/Focus States: 4/10

**Missing entirely:**
- `button:focus-visible` — no ring/outline for keyboard navigation
- `input:focus`, `select:focus` — no state at all (just `outline: none`)
- `input[type="range"]:focus` — no indicator
- `.selection-item:focus` — keyboard-unreachable
- Table row hover is JS `onMouseEnter/Leave` — works but fragile

**Present:**
- `.btn-accent:hover` ✓ — lift + glow
- `.btn-secondary:hover` ✓ — bg change
- `.glass-card-hover:hover` ✓ — border + bg
- `.speed-btn:hover` ✓ — border highlight
- `.staff-card:hover` ✓

**Critical gap:** Keyboard-only users (or those who tab through the game UI) will see zero focus indicators. This is also an Electron-specific issue — tab navigation is common.

---

## 3. Modals and Panels: 7/10

**What's good:** `.modal-overlay` backdrop, `.modal-content` border-radius and padding are consistent. `slideUp` animation on entry is nice. `backdrop-filter` on `.glass-card` adds depth.

**Issues:**
- `FinanceDashboard` and `GameHistory` don't use `.modal-content` — they define their own `background: '#161b22'` inline divs. This means border-radius, padding, and scroll behavior diverge.
- Close buttons are inconsistent: `GameHistory` uses plain `x` text at `fontSize: 24px`; `FinanceDashboard` uses `×` at `fontSize: 20px`. Neither uses a styled class.
- No `backdrop-filter: blur()` on modal overlays — the overlay is flat black at 70% opacity. A subtle blur would add depth.
- `modal-content` has no top padding differentiation — header content runs tight against the modal edge.

---

## 4. Visual Hierarchy: 6/10

**Positives:** Section labels (11px uppercase tracking) are used consistently across panels. The 3-tier value/label pattern (11px gray label + 17–20px bold value) is clean and readable.

**Problems:**
- **No page-level heading system.** Panel headers (like "Finance Dashboard") are `fontSize: 20px` inline — should be a named class.
- **No spacing tokens.** Margins/paddings are all ad-hoc (12, 16, 20, 24, 28, 32, 48px) with no system. Some modals use `24px` padding, one uses `28px`, one uses `32px`.
- **TopBar is overloaded.** 12+ interactive elements in a single flex row with no visual grouping. Stats and controls blend together.
- **No dividers between TopBar sections.** Company name, financial stats, date, speed, and panel toggles need visual separation.
- **Font weight spread is limited.** Only 400, 500, 600, 700 are used, but the selection could better signal importance. Critical numbers (cash) could use 800.

---

## 5. CSS Improvements for Polish: Priority List

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | Add `button:focus-visible` ring | Accessibility | Low |
| 2 | Style `input`, `select`, `textarea` focus states | UX + a11y | Low |
| 3 | Add `.modal-close-btn` class (consistent × button) | Consistency | Low |
| 4 | Add backdrop-filter blur to `.modal-overlay` | Premium feel | Low |
| 5 | Add TopBar section dividers | Hierarchy | Low |
| 6 | Add `.panel-header` utility class | Consistency | Low |
| 7 | Animate `.stat-fill` with glow on high values | Polish | Low |
| 8 | Add `.badge` utility class (replace inline badge styles) | DRY | Low |
| 9 | Add CSS custom properties for spacing scale | Maintainability | Low |
| 10 | Add `@keyframes pulse` (referenced in GameScreen but not defined in CSS) | Bug fix | Low |

---

## 6. Accessibility Issues: 5/10

**Critical:**
- `button:focus-visible` — NO focus ring anywhere. Keyboard users are blind.
- `input:focus` has `outline: none` with no replacement ring.
- `select` elements have no focus state.
- Color-only information: score colors (green/yellow/red) convey meaning without text labels accessible to screen readers.
- Close buttons use `×` text or `x` text without `aria-label`.

**Minor:**
- Progress bars have no `role="progressbar"` or `aria-valuenow`.
- `.modal-overlay` has no `role="dialog"` or `aria-modal`.
- `.selection-item` divs used as buttons — should be `<button>` or have `role="button"` + `tabIndex`.
- Contrast: `#484f58` on `#0d1117` is approximately 2.9:1 — fails WCAG AA (requires 4.5:1 for small text).

---

## 7. Design Tools That Would Help

**Figma Plugins:**
- **Contrast** (by Figma) — check all text/bg combinations against WCAG AA
- **Tokens Studio** — extract current ad-hoc values into a proper design token system
- **Iconify** — replace Bootstrap-style inline SVGs with a consistent icon set

**CSS Architecture:**
- The `inline style` explosion in components should be progressively replaced with utility classes as screens are touched. Not a rewrite — just stop adding new inline styles.
- Consider a `design-tokens.css` file with `--spacing-*`, `--text-*`, `--surface-*` tokens to replace magic numbers.

---

## Top 10 CSS Fixes Implemented

See `styles.css` — the following were added:

1. `button:focus-visible` ring (blue glow, 2px outline)
2. `input:focus`, `select:focus`, `textarea:focus` — accent border + subtle glow
3. `input[type="text"]`, `input[type="number"]`, `select` — global dark style so inline styles aren't needed
4. `.modal-overlay` — `backdrop-filter: blur(4px)` added
5. `.modal-close-btn` — consistent `×` button class
6. `.panel-header` — utility class replacing 11px uppercase inline label pattern
7. `.badge` — utility class for the pill/tag pattern used everywhere inline
8. `@keyframes pulse` — defined in CSS (was referenced in GameScreen but missing)
9. TopBar visual grouping via `.topbar-divider` separator class
10. `#484f58` text color replaced in tertiary usage with improved `#6e7681` (passes WCAG AA at 4.6:1 on `#0d1117`)
