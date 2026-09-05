---
name: PermaFrost Tactical HUD
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d1f27'
  surface-container-high: '#272a32'
  surface-container-highest: '#32353d'
  on-surface: '#e1e2ec'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#ffb4aa'
  on-secondary: '#690003'
  secondary-container: '#c5020b'
  on-secondary-container: '#ffd2cc'
  tertiary: '#fff6d1'
  on-tertiary: '#373100'
  tertiary-container: '#f3db00'
  on-tertiary-container: '#6b5f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#930005'
  tertiary-fixed: '#fde400'
  tertiary-fixed-dim: '#dec800'
  on-tertiary-fixed: '#201c00'
  on-tertiary-fixed-variant: '#504700'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353d'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-code-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-margin-desktop: 2.5rem
  grid-margin-tablet: 1.5rem
  grid-margin-mobile: 1rem
  gutter-desktop: 1.5rem
  gutter-tablet: 1rem
  gutter-mobile: 0.75rem
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4.5rem
---

## Brand & Style

The design system embodies a high-stakes, hyper-tactile collision between sub-zero crystalline defense and volatile volcanic hazard. Drawing from neo-brutalism, arcade cyberpunk head-up displays (HUDs), and stylized comic-vector illustration, the interface treats crypto security not as a dry ledger, but as an interactive, live-combat tactical environment.

### Personality & Emotional Response
- **Sub-Zero Certainty vs. Volcanic Volatility:** Cryogenic blues and electric cyans denote provable cryptographic trust, locked vaults, and settled liquidity. Molten magmas, blistering oranges, and acidic yellows signal unconfirmed states, liquidity drains, malicious contracts, and exploitative risks.
- **Cartoonized Precision:** Thick comic-ink keylines paired with pixel-sharp vector readouts prevent the interface from feeling sterile or clinical. It evokes the playful yet merciless mechanical clarity of high-end mech simulators and arcade battle dashboards.
- **Zero Ambiguity:** Heavy contrast, vivid state shifts, and tactile surface feedback ensure instant spatial comprehension under high-frequency conditions.

### Design Movement & Aesthetic
- **Style Blend:** Cyber-Comic Neo-Brutalism meets Tactical Telemetry.
- **Hallmarks:** 2px to 3px solid ink containment borders, hard offset block shadows without Gaussian blur, glowing radioactive holographic edge-accents, monospaced computational micro-data, and chunky, responsive interactive controls.

## Colors

The color architecture is built upon an obsidian volcanic abyss punctuated by dual thermodynamic poles: cryogenic zero and molten plasma.

### Color Hierarchy & Roles
- **Primary — Cryo Cyan (`#00f0ff`):** The definitive marker of cryptographic proof, verified smart contracts, sub-zero cold storage, and active user focus. Accompanied by Glacial Sky (`#38bdf8`) for structural mesh lines and sub-zero telemetry.
- **Secondary — Magma Hazard (`#ff3b30`):** Denotes severe threat, liquidated collateral, malicious transactions, and catastrophic slippage. Flanked by Molten Amber (`#ff9500`) for warning thresholds, gas surges, and pending verifications.
- **Tertiary — Volcanic Kinetic (`#ffe600`):** Electric highlight for real-time order matching, yields, volatile price action, and actionable focal points.
- **Neutral Canvas & Structural Abyss:**
  - `abyss-core`: `#0a0d14` (Deepest foundation canvas)
  - `abyss-surface`: `#0d121d` (Base HUD panel background)
  - `abyss-elevated`: `#161f30` (Interactive cards, nested containers)
  - `ink-black`: `#04060a` (Comic containment borders and hard block drop shadows)
  - `frost-white`: `#f0f6fc` (Primary alphanumeric text and high-visibility glyphs)
  - `frost-muted`: `#8b9bb4` (Secondary metrics, network stats, inactive labels)

### Interaction Tokens & Rules
- Under no circumstances should frost cyan and magma hazard be blended into a soft gradient. State boundaries must remain hard-edged, comic-paneled, or separated by a stark `ink-black` (`#04060a`) separation border.
- Critical confirmation zones must be framed in cryogenic cyan. Irreversible, destructive, or high-risk actions must adopt the molten magma fill with ink-black typography.

## Typography

The typographic hierarchy juxtaposes the punchy, kinetic geometry of **Space Grotesk** against the surgical, computational strictness of **JetBrains Mono**.

### Roles & Formatting Rules
- **Space Grotesk (Display & Narrative):** Applied to headlines, account balances, heroic metric summaries, and action triggers. Always set with tight tracking (`-0.01em` to `-0.03em`) and heavy weights (`600` through `800`) to evoke graphic-novel sound effects and physical signage.
- **JetBrains Mono (Telemetry, Verification & Data):** Reserved for wallet addresses, cryptographic hashes, execution pricing, slippage tolerances, order-book depths, and HUD tags. All labels must default to uppercase formatting to reinforce the military-grade cyber-tactical tone.
- **Numbers and Cryptographic Data:** Financial quantities use `JetBrains Mono` when dynamic and comparative (tables, order books), and `Space Grotesk` (Bold/Extrabold) when featured as large hero portfolio balances.

## Layout & Spacing

The layout is constructed on a 12-column rigid HUD grid system engineered for tactical readability and high data density.

### Breakpoint Specifications
- **Desktop (1200px+):** 12-column fluid-locked grid. Maximum content bounding container is `1440px`. Column gutters remain locked at `1.5rem` (`24px`), with outer margins of `2.5rem` (`40px`). Multi-panel command layouts present simultaneous telemetry, charts, and execution consoles.
- **Tablet (768px – 1199px):** 8-column flexible grid. Margins compress to `1.5rem` (`24px`), gutters compress to `1rem` (`16px`). Secondary side panels fold into tabbed drawer sheets.
- **Mobile (< 768px):** 4-column stack. Margins compress to `1rem` (`16px`), gutters to `0.75rem` (`12px`). Critical primary actions dock to a floating bottom tactical shelf with fixed thumb-zone targets.

### Spacing Cadence
Layout elements follow an explicit 4px / 8px grid cadence. Inner card padding matches `space-lg` (`24px`) on desktop and automatically drops to `space-md` (`16px`) on mobile devices. Dense data tables and order books scale down internal line gaps using `space-xxs` (`4px`) and `space-xs` (`8px`).

## Elevation & Depth

Depth is established strictly without soft, fuzzy photorealistic shadows. The system relies on **hard comic-book drop offsets, crisp chromatic halos, and layered structural boundaries**.

### The Hard-Block Offset (Neo-Brutal Depth)
- **Base Level (Z0):** Abyss backdrop (`#0a0d14`), textured with a faint dot-matrix or 24px isometric vector grid in `#161f30` at 40% opacity.
- **Panel Surface (Z1):** Abyss surface (`#0d121d`) bounded by a 2px solid `#04060a` ink border. Offset shadow: `3px 3px 0px 0px #04060a`.
- **Raised Interactive Cards (Z2):** Container surface (`#161f30`) bounded by a 2.5px solid `#04060a` border. Offset shadow: `4px 4px 0px 0px #04060a`.
- **Floating Overlays & Tooltips (Z3):** Surface `#161f30` with a 3px solid `#00f0ff` border and a dual hard shadow: `6px 6px 0px 0px #04060a`.

### Chromatic Glow & Warning Bleeds
Active states inject a neon vector aura behind the hard shadow:
- **Frost Sealed State:** `box-shadow: 4px 4px 0px 0px #04060a, 0px 0px 16px 2px rgba(0, 240, 255, 0.45)`.
- **Magma Threat State:** `box-shadow: 4px 4px 0px 0px #04060a, 0px 0px 18px 2px rgba(255, 59, 48, 0.55)`.

## Shapes

The interface balances cybernetic industrial geometry with approachable, stylized cartoon curves.

### Curvature Standard
- Standard containers, cards, and input fields use **Soft** corners (`0.25rem` / `4px`), ensuring buttons feel like sturdy physical tactical switches rather than rounded pills.
- Tactical dialogs, badges, and segmented toggles use `rounded-lg` (`0.5rem` / `8px`).
- Specialized HUD display chips leverage stylized **chamfered corners (45-degree corner notches of 6px)** or sharp zero-radius interior cuts combined with the standard `4px` outer radius.

### Border Execution
Every interactive component is bound by a high-contrast outline (`2px` to `3px`) in `#04060a` (Solid Ink) or primary `#00f0ff` / `#ff3b30`. Hairline (`1px`) borders are strictly prohibited for structural boundaries.

## Components

### Buttons
- **Frost Primary (Confirm, Vault, Liquidity Inject):** Background `#00f0ff`, text `#04060a`, typography `Space Grotesk 700`, 2.5px border `#04060a`, shadow `4px 4px 0px 0px #04060a`. Hover translates `translate(-2px, -2px)` with shadow expansion `6px 6px 0px 0px #04060a`. Active state depresses `translate(2px, 2px)` with shadow collapsing to `0px 0px 0px 0px`.
- **Magma Destructive (Liquidate, Revoke Contract, Emergency Dump):** Background `#ff3b30`, text `#ffffff`, 2.5px border `#04060a`, shadow `4px 4px 0px 0px #04060a`. Hover reveals molten amber edge-glow (`#ff9500`).
- **Tactical Secondary (Cancel, Inspect):** Background `#161f30`, text `#f0f6fc`, 2px border `#38bdf8`, shadow `3px 3px 0px 0px #04060a`.

### Status Badges & Chips
- **Sub-Zero Sealed:** Background `rgba(0, 240, 255, 0.12)`, text `#00f0ff`, border `1.5px solid #00f0ff`, `JetBrains Mono 700` uppercase, leading diamond icon `◈`.
- **Magma Hazard:** Background `rgba(255, 59, 48, 0.16)`, text `#ff3b30`, border `1.5px solid #ff3b30`, leading hazard icon `▲`. Pulsing 1.5s hard-keyframe blink animation.
- **Volcanic Yield:** Background `#ffe600`, text `#04060a`, border `1.5px solid #04060a`, label typography `JetBrains Mono 700`.

### Cards & Panels
- Constructed with `#0d121d` or `#161f30`, wrapped in a 2.5px solid `#04060a` border, with a distinct comic corner accent: a small geometric top-right notch or a 3-bar cyan HUD ventilation slash indicator.
- Internal divider lines use 2px solid `#161f30` or dashed `2px dashed rgba(56, 189, 248, 0.3)`.

### Input Fields & Controls
- **Text & Numeric Inputs:** Background `#0a0d14`, border `2px solid #161f30`, text `#f0f6fc`, placeholder `#8b9bb4`. Focus swaps border to `2px solid #00f0ff` with a solid `3px 3px 0px 0px #00f0ff` hard offset.
- **Checkboxes & Radios:** Chunky 20px x 20px squares. Border `2px solid #04060a`. Inactive background `#0a0d14`. Checked state snaps to `#00f0ff` background with a thick black geometric tick mark `#04060a`.

### Specialized Tactical Telemetry
- **Fraud & Exploit Threat Banner:** Heavy warning block wrapped in diagonal warning hazard stripes (`#ff3b30` alternating with `#04060a` at 45 degrees). Typography in full-caps `JetBrains Mono` notifying the operator of honeypot parameters, fake metadata, or drain attempts.
- **Cold Vault Lock Meter:** Segmented cryogenic progress bar consisting of individual stepped neon blocks (`#00f0ff`) separated by `2px` black gaps, showcasing timelock maturity and transaction finality.