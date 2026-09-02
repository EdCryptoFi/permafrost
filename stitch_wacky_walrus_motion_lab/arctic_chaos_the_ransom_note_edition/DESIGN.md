---
name: 'Arctic Chaos: The Ransom Note Edition'
colors:
  surface: '#0a1421'
  surface-dim: '#0a1421'
  surface-bright: '#303a48'
  surface-container-lowest: '#050f1c'
  surface-container-low: '#121c2a'
  surface-container: '#16202e'
  surface-container-high: '#212a39'
  surface-container-highest: '#2c3544'
  on-surface: '#d9e3f6'
  on-surface-variant: '#dcbed4'
  inverse-surface: '#d9e3f6'
  inverse-on-surface: '#27313f'
  outline: '#a4899d'
  outline-variant: '#564052'
  surface-tint: '#ffabf3'
  primary: '#ffabf3'
  on-primary: '#5b005b'
  primary-container: '#ff00ff'
  on-primary-container: '#510051'
  inverse-primary: '#a900a9'
  secondary: '#ffffff'
  on-secondary: '#323200'
  secondary-container: '#eaea00'
  on-secondary-container: '#686800'
  tertiary: '#81cfff'
  on-tertiary: '#00344b'
  tertiary-container: '#009cd6'
  on-tertiary-container: '#002e43'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd7f5'
  primary-fixed-dim: '#ffabf3'
  on-primary-fixed: '#380038'
  on-primary-fixed-variant: '#810081'
  secondary-fixed: '#eaea00'
  secondary-fixed-dim: '#cdcd00'
  on-secondary-fixed: '#1d1d00'
  on-secondary-fixed-variant: '#494900'
  tertiary-fixed: '#c6e7ff'
  tertiary-fixed-dim: '#81cfff'
  on-tertiary-fixed: '#001e2d'
  on-tertiary-fixed-variant: '#004c6b'
  background: '#0a1421'
  on-background: '#d9e3f6'
  surface-variant: '#2c3544'
  ransom-pink: '#ff00ff'
  highlighter-yellow: '#ffff00'
  arctic-cyan: '#29b6f6'
  glitch-blue: '#a855f7'
  paper-white: '#e8eef6'
  deep-ice: '#0a1524'
typography:
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -1px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '800'
    lineHeight: '1.0'
    letterSpacing: 1px
spacing:
  margin-page: 2.5rem
  gutter-panel: 1.5rem
  gap-ransom: 0.25rem
  container-max: 1120px
---

## Brand & Style

This design system pivots from the clinical precision of glacial verification to a **Techno-Brutalist "Ransom Note"** aesthetic. It maintains the technical rigor of the underlying protocol but expresses it through a lens of chaotic irony and irreverent DIY hacking.

The brand personality is "The Chaotic Expert"—someone who knows exactly how the blockchain works but prefers to explain it using letters cut out of a 1994 tech magazine. It uses a mix of high-fidelity arctic metaphors and low-fidelity "ransom note" aesthetics to create a unique tension between security and subversion. 

**Visual Pillars:**
- **Controlled Chaos:** Every headline looks like a manual assembly of disparate parts.
- **Physical Distortion:** Elements are "wobbly," "melting," or slightly rotated, breaking the digital grid.
- **Glitch Texture:** A digital-meets-analog paper grain or pixel-glitch overlay is applied to all primary surfaces.
- **Mascot Persistence:** The Walrus mascot returns as a chaotic guide, appearing in various disguises (sunglasses, beanies, etc.) to soften the technical complexity with humor.

## Colors

The palette retains its freezing foundation but is disrupted by high-visibility "illegal" accents. 

- **The Void:** Surfaces remain rooted in `#040d1a` (Background) and `#0a1524` (Panels) to maintain readability and technical depth.
- **Primary Disruptor (Ransom Pink):** Use `#ff00ff` for primary CTAs and critical path interactions. It is the "loudest" color in the system.
- **The Warning (Highlighter Yellow):** Use `#ffff00` for warnings, alerts, and highlighting specific data points within a ransom-note headline.
- **Arctic Legacy:** The `arctic-cyan` and `ice-ramp` are relegated to secondary data visualizations and decorative elements, acting as the "calm" background to the chaotic foreground.

## Typography

The "Ransom Note" effect is achieved through **component-level font mixing** rather than a single family.

**The Ransom Note Rule (Headlines):**
Headlines must never be a single string. They should be rendered as a series of individual character spans or word spans that randomly cycle between `Bricolage Grotesque` (Sans), `Newsreader` (Serif), `JetBrains Mono` (Mono), and `Epilogue` (Display). 
- **Rotation:** Each "cutout" span should have a random CSS rotation between `-3deg` and `+3deg`.
- **Backgrounds:** 30% of words in a headline should have a solid background (White, Pink, or Yellow) with black text.

**The Functional Split:**
- **Body Text:** Use `Plus Jakarta Sans` for all descriptive prose to ensure the chaos doesn't hinder usability.
- **Technical Data:** Every blockchain hash, address, and token value remains strictly in `JetBrains Mono`.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. While the outer containers are strictly aligned to a 12-column grid, the internal content "vibrates" within those bounds.

- **Breakpoints:**
    - **Desktop (1024px+):** 1120px max-width, 12 columns.
    - **Tablet (768px - 1023px):** 6 columns, fluid width.
    - **Mobile (<768px):** 2 columns, 1rem margins.
- **Internal Rhythm:** Spacing between ransom-note letters should be tight and uneven (`-2px` to `4px`) to simulate manual gluing.
- **The "Wobble" Offset:** Panels should have a `margin: 4px` but then use absolute positioning or translates to offset their visual border by a few pixels, breaking perfect vertical alignment.

## Elevation & Depth

Depth is conveyed through **Tactile Layering** rather than realistic lighting.

- **The Glitch Overlay:** All cards and panels feature a low-opacity `mix-blend-mode: overlay` noise texture to simulate paper grain or a cathode-ray tube screen.
- **Hard Shadows:** Instead of soft blurs, use "Block Shadows." These are solid offsets of `#ff00ff` or `#000000` set at 4px or 8px, with no blur radius.
- **Glassmorphism (Subdued):** Use `backdrop-filter: blur(8px)` only for the Walrus's overlays or navigation elements to keep the "Arctic" theme present beneath the chaos.
- **Tonal Tiers:** Surfaces use `#0a1524` (Surface) and `#16202e` (Elevated Surface) to define hierarchy.

## Shapes

The design system moves away from geometric perfection toward **"Melted" and "Hand-Cut"** geometry.

- **Wobbly Borders:** Instead of a standard `border-radius`, use `clip-path` or irregular 8-point `border-radius` values (e.g., `60% 40% 70% 30% / 40% 60% 30% 70%`). 
- **Sharp Cutouts:** Ransom-note letters should have 0px radius, appearing like they were cut with scissors.
- **Pills:** Status badges are the only elements allowed to be fully rounded (`999px`) to distinguish them from the "cutout" interactive elements.

## Components

### Buttons (The Ransom CTA)
- **Style:** Rectangular, sharp edges.
- **Visual:** Background is `Ransom Pink` (#ff00ff). The text is `JetBrains Mono` in all-caps.
- **Shadow:** A solid 6px block shadow of `Highlighter Yellow` (#ffff00).
- **Hover:** The button and shadow swap colors instantly (no transition).

### Cards (The Melting Block)
- **Border:** 2px solid `Arctic Cyan`. The border-radius must be irregular/wobbly.
- **Texture:** Apply the "Paper Grain" SVG filter.
- **Header:** Every card title must follow the multi-font ransom-note logic.

### Icons (The Messy Set)
- **Style:** Hand-drawn SVGs. Lines should be slightly shaky and strokes should not always perfectly meet at the corners.
- **Weight:** Variable stroke width (1px to 2.5px) to simulate a felt-tip marker.

### Input Fields
- **Style:** Inverted colors. Black background with `Paper White` borders.
- **Focus State:** The border turns into a "marching ants" dashed line animation (black/white or pink/yellow).

### The Walrus (Mascot)
- **Implementation:** The Walrus must appear on every major screen. 
- **Variations:** 
    - **Dashboard:** Walrus in a winter hat.
    - **Warnings:** Walrus in high-vis vest and sunglasses.
    - **Success:** Walrus holding a pink "ransom" bag.