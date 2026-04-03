# Design System — Little Bets

## Product Context
- **What this is:** A group moment capture tool that uses predictions as the social prompt. The bet is the excuse. The gathering is the product.
- **Who it's for:** Hosts who want to capture a live moment (create, pass the phone, resolve together), participants who get handed a phone and lock in a prediction, nostalgics who open the moment card in the group chat the next morning and remember the whole evening.
- **Space/industry:** Consumer social / casual group games. Neighbors: Polymarket (serious predictions), Heads Up (party games), Bump (physical-device social). Little Bets sits at the intersection: prediction mechanics with party game energy.
- **Project type:** Mobile-first web app (React + TypeScript + Vite + Supabase + Netlify)

## Aesthetic Direction
- **Direction:** Dual-personality. Two persistent themes (Neo, Retro) plus a temporary dark context (pass-the-phone mode). Not three themes. Two moods the user chooses, one situational override.
- **Decoration level:** Minimal. Typography and color do the heavy lifting. Neo uses hard offset shadows as structural decoration. Retro uses soft drop shadows. Dark mode uses no shadows.
- **Mood:** Bold, social, shareable. This app should look like something you'd screenshot and send to a friend, not something you'd use quietly at your desk. The visual identity is part of the product.
- **Anti-patterns:** No purple gradients, no 3-column icon grids, no centered-everything layouts, no decorative blobs. The design is opinionated, not generic.

## Typography

### Neo Theme
- **Display/Body:** Space Grotesk — geometric, bold, technical. Pairs with the brutalist 0px-radius aesthetic.
- **Fallback stack:** "Space Grotesk", "Helvetica Neue", Arial, sans-serif
- **Loading:** Google Fonts CDN

### Retro Theme
- **Display/Body:** DM Serif Display — warm, editorial, nostalgic. Serif + cream background = vintage newspaper feel.
- **Fallback stack:** "DM Serif Display", Georgia, "Times New Roman", serif
- **Loading:** Google Fonts CDN

### Pass-the-Phone Dark Mode
- **Font:** Space Grotesk (same as Neo, but at larger sizes for arm's-length readability)
- **Scale:** Question 28px/700, subtitle 14px/400, name input 20px/400, options 20px/600, CTA 18px/800, confirmation 22px/700

### Type Scale (general app)
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| h1 | 1.5rem (24px) | 700 | Page titles |
| h2 | 1.25rem (20px) | 700 | Section headings |
| h3 | 1.1rem (17.6px) | 600 | Card titles, bet questions |
| body | 1rem (16px) | 400 | Body text, descriptions |
| small | 0.875rem (14px) | 400-500 | Labels, metadata, nav items |
| xs | 0.7rem (11.2px) | 400 | Char counts, timestamps |

## Color

### Approach
Restrained. Each theme has 1 strong identity color + neutrals + semantic colors. The yellow `#f5f020` is the brand constant that ties all contexts together.

### Neo Theme (default)
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#000000` | Text, borders, buttons |
| `--color-primary-hover` | `#1a1a1a` | Button hover |
| `--color-primary-light` | `#e5e5e5` | Subtle backgrounds |
| `--color-primary-focus` | `rgba(0,0,0,0.15)` | Focus rings |
| `--color-primary-tint` | `rgba(0,0,0,0.04)` | Hover tints |
| `--color-bg` | `#f5f020` | Page background (the brand yellow) |
| `--color-surface` | `#ffffff` | Cards, inputs, content areas |
| `--color-text` | `#000000` | Primary text |
| `--color-text-secondary` | `#404040` | Muted text |
| `--color-border` | `#000000` | Borders (sharp, 3px) |

### Retro Theme
| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#b45309` | Amber/brown primary |
| `--color-primary-hover` | `#92400e` | Darker amber |
| `--color-primary-light` | `#fef3c7` | Light amber bg |
| `--color-primary-focus` | `rgba(180,83,9,0.15)` | Focus rings |
| `--color-primary-tint` | `rgba(180,83,9,0.05)` | Hover tints |
| `--color-bg` | `#fdf6e3` | Cream page background |
| `--color-surface` | `#fffbeb` | Warm off-white surfaces |
| `--color-text` | `#44403c` | Warm dark gray text |
| `--color-text-secondary` | `#78716c` | Muted warm gray |
| `--color-border` | `#d6d3d1` | Soft borders (1px) |

### Pass-the-Phone Dark Context
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#111111` | Full-screen dark bg |
| Text | `#ffffff` | Primary text (15.4:1 contrast, AAA) |
| Accent | `#f5f020` | Selected state, CTA bg (12.1:1, AAA) |
| Muted | `#aaaaaa` | Subtitle text |
| Subtle | `#888888` | "Done?" link |
| Border | `#444444` | Unselected option borders |
| Input bg | `#111111` | Name input background |

**Inline usage (resolve panel):** Same palette, `z-index: auto`. The dark resolve panel on BetDetail reuses this vocabulary inline — same background (#111111), white text, yellow buttons — but renders in the normal page flow rather than as a fullscreen takeover. Border-radius is always 0px regardless of active theme.

### Semantic Colors (shared across themes)
| Token | Neo | Retro | Usage |
|-------|-----|-------|-------|
| `--color-success` | `#16a34a` | `#15803d` | Yes/correct/winners |
| `--color-danger` | `#dc2626` | `#dc2626` | No/wrong/errors |
| `--color-yes` | `#16a34a` | `#15803d` | Yes predictions |
| `--color-no` | `#dc2626` | `#dc2626` | No predictions |

### Brand Color
`#f5f020` (Little Bets Yellow). Present in every context:
- Neo: page background
- Retro: not used directly (the amber primary carries the warmth)
- Dark mode: accent, selected state highlight, CTA button background

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- **Page gutters:** 16px
- **Page top padding:** `header-height (56px) + 16px = 72px`
- **Page bottom padding:** `bottom-nav-height (60px) + 16px = 76px`

## Layout
- **Approach:** Grid-disciplined, single column
- **Max content width:** 800px (`--max-width`)
- **Centering:** `margin: 0 auto` on `.page` container
- **Mobile-first:** No major breakpoint complexity. Content reflows naturally within the single column.
- **Header:** Fixed, 56px height (`--header-height`)
- **Bottom nav:** Fixed, 60px height (`--bottom-nav-height`)

### Border Radius
| Context | Value | Rationale |
|---------|-------|-----------|
| Neo | `0px` | Brutalist, sharp edges. A deliberate aesthetic statement. |
| Retro | `6px` | Warm, approachable, traditional. |
| Dark mode | `0px` | Follows Neo's geometric language in the dark context. |

### Shadows
| Context | Standard | Medium | Rationale |
|---------|----------|--------|-----------|
| Neo | `4px 4px 0px #000` | `6px 6px 0px #000` | Hard offset shadows. Structural, not decorative. |
| Retro | `0 2px 4px rgba(120,113,108,0.12)` | `0 4px 8px rgba(120,113,108,0.15)` | Soft drop shadows. Warm, subtle depth. |
| Dark mode | none | none | Clean, flat. The contrast does the work. |

### Borders
| Context | Width | Color |
|---------|-------|-------|
| Neo | `3px` | `#000000` (solid black) |
| Retro | `1px` | `#d6d3d1` (warm gray) |
| Dark mode | `2px` | `#444444` (subtle gray) |

## Motion
- **Approach:** Intentional. Animations serve comprehension and emotional payoff, never decoration.
- **Easing:** enter: `ease-out`, exit: `ease-in`, move: `ease-in-out`, bounce: `ease`
- **Durations:**
  - Micro (hover, focus): `0.15s`
  - Toast entrance: `0.25s`
  - State change (locked-pop, count-pop): `0.3s`
  - Confetti fall: `1.5-3s` (per particle, randomized)

### Pass-the-Phone Motion
| Moment | Animation | Duration |
|--------|-----------|----------|
| LOCK IT IN haptic | `navigator.vibrate(100)` | 100ms |
| Screen border flash | `box-shadow: inset 0 0 0 4px #f5f020` | 0.2s |
| Confirmation scale | `scale(1) -> scale(1.05) -> scale(1)` | 0.3s ease |
| Handoff interstitial | Tap-locked, `pointer-events: none` | 1.5s |
| "I'm Ready" button | Fade in, `opacity: 0 -> 1` | 0.2s |
| Fullscreen exit | Fade out dark overlay | 0.3s |

### Reduced Motion
Respect `prefers-reduced-motion: reduce`. Replace all scale/flash animations with instant state changes. Disable haptic vibration. Keep opacity transitions (they're less disorienting).

## Button Hierarchy

### Primary CTA (`.btn-primary-cta`)
The highest-priority action on any screen. Used for "Pass the Phone", "Bet!" (create), "Start Collecting".

| Theme | Background | Text | Border | Shadow |
|-------|-----------|------|--------|--------|
| Neo | `#f5f020` | `#000000` | `3px solid #000` | `4px 4px 0px #000` (existing hard shadow token) |
| Retro | `#b45309` | `#ffffff` | none | `0 2px 4px rgba(120,113,108,0.12)` (existing soft shadow token) |

### Navigation Active/Inactive Colors
| State | Neo | Retro |
|-------|-----|-------|
| Active (icon + label) | `#f5f020` background with `#000` text (uses `--color-bg`) — or icon+label in `#000` on yellow bg | icon+label in `#b45309` |
| Inactive (icon + label) | `#666666` | `#78716c` |

## Z-Index Hierarchy
| Layer | z-index | Component |
|-------|---------|-----------|
| Base content | auto | Page content |
| Header / Bottom nav | 100 | Fixed navigation |
| Auth modal | 200 | Login overlay |
| Pass-the-phone | 250 | Fullscreen takeover |
| Toast / Confetti | 300 | Feedback overlays |

## Touch Targets
- **Minimum:** 48px total height (WCAG 2.5.8)
- **Standard button padding:** 12-14px vertical, 16-20px horizontal
- **Pass-the-phone padding:** 16-18px vertical (larger for arm's-length use)
- **Bottom nav items:** 60px container height

## Accessibility
- **Contrast (Neo):** Black on white = 21:1 (AAA). Black on yellow (#f5f020) = 12.1:1 (AAA).
- **Contrast (Retro):** #44403c on #fdf6e3 = 7.2:1 (AAA).
- **Contrast (Dark):** White on #111 = 15.4:1 (AAA). Yellow on #111 = 12.1:1 (AAA).
- **Focus indicators:** Theme-colored focus rings via `--color-primary-focus`
- **Screen readers:** Semantic HTML, ARIA labels on interactive elements, `aria-live` regions for dynamic content
- **Font sizing:** rem-based for user zoom support

## Design Risks (deliberate departures from convention)
1. **Yellow page background (Neo).** Instantly recognizable in screenshots. Polarizing by design. Most apps use white or near-white backgrounds.
2. **Two completely different fonts for two themes.** Most apps have one typographic identity. Little Bets has two. The tradeoff is brand consistency for user ownership.
3. **0px border-radius (Neo).** Sharp edges in a world of rounded corners. Combined with 3px borders and hard shadows, it's anti-generic.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-30 | Initial design system created | Formalized existing CSS variables + pass-the-phone dark mode from /design-consultation. Based on live product at littlebets.netlify.app |
| 2026-03-30 | Dark mode is a context, not a theme | Pass-the-phone fullscreen is temporary (game mode), not a persistent user preference. Uses fixed values, not CSS custom properties. |
| 2026-03-30 | Yellow #f5f020 as brand constant | The one color that appears in every context, expressed differently: Neo bg, dark mode accent. Ties the visual identity together. |
