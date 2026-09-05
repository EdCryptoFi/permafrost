---
name: PermaFrost Crypto HUD
colors:
  surface: '#0e141d'
  surface-dim: '#0e141d'
  surface-bright: '#343944'
  surface-container-lowest: '#090e17'
  surface-container-low: '#161c25'
  surface-container: '#1a2029'
  surface-container-high: '#252a34'
  surface-container-highest: '#30353f'
  on-surface: '#dee2f0'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dee2f0'
  inverse-on-surface: '#2b313b'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#ffb2b7'
  on-secondary: '#67001b'
  secondary-container: '#b50036'
  on-secondary-container: '#ffc2c4'
  tertiary: '#fff6c8'
  on-tertiary: '#363100'
  tertiary-container: '#e9db78'
  on-tertiary-container: '#695f02'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#ffdadb'
  secondary-fixed-dim: '#ffb2b7'
  on-secondary-fixed: '#40000d'
  on-secondary-fixed-variant: '#92002a'
  tertiary-fixed: '#f2e580'
  tertiary-fixed-dim: '#d5c867'
  on-tertiary-fixed: '#201c00'
  on-tertiary-fixed-variant: '#4f4800'
  background: '#0e141d'
  on-background: '#dee2f0'
  surface-variant: '#30353f'
typography:
  headline-hero:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  headline-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  code-hash:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  badge-label:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.08em
  hud-micro:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  grid-unit: 4px
  pad-xs: 4px
  pad-sm: 8px
  pad-md: 16px
  pad-lg: 24px
  pad-xl: 32px
  pad-2xl: 48px
  container-max: 1280px
  gutter-hud: 24px
---

## Brand & Style

The design system embodies deep sub-zero cryogenics merged with uncompromising cryptographic certainty. Designed for high-assurance on-chain verification, liquidity lock architectures, and immutable cold storage protocols, the aesthetic combines technical precision HUDs, arctic sci-fi minimalism, and high-contrast neo-brutalist callouts.

The visual language balances two contrasting forces:
1. **The Cryo-Void**: Deep cosmic blues, midnight abyss backdrops, hairline polar grids, crystalline cyan luminescence, and precision monospace data streams.
2. **The Verification Punch**: High-voltage neon magenta/rose tabs, acidic highlighter yellow metadata badges, and offset framing lines that communicate unforgeable, human-readable truth against the cold void.

The target audience consists of smart-contract engineers, liquidity providers, institutional auditors, and crypto-native users who value deterministic immutability over soft web3 marketing gloss. The visual tone is mathematically absolute, hyper-focused, scientific, and uncompromised.

## Colors

The system uses a calibrated cold spectrum calibrated for low-light tactical clarity:

- **Abyss & Void Foundations**: `#060B14` (Core background void), `#0B132B` (Sub-zero grid surface), `#111D38` (Container/card fill).
- **Cryogenic Luminescence**: `#00F0FF` (Primary laser cyan), `#38BDF8` (Atmospheric cold sky), `#0D9488` / `#14B8A6` (Glacial teal midtones).
- **Sub-Zero Cyber Accents**: `#F43F5E` / `#E11D48` (Thermal magenta/pink accent used for primary active states and execution triggers), `#818CF8` (Cold spectral violet).
- **High-Visibility Badging**: `#FEF08A` (Hyper-contrast yellow badge ground), `#F59E0B` (Cryo-hazard warning amber for decaying or expiring locks).
- **Frost Highlights & Monolith Surface**: `#E0F2FE` (Pure frost text), `#FFFFFF` (Peak data white), `#64748B` (Inactive cryogenic slate).

Offset drop borders use solid neon cyan (`#00F0FF`) and fluorescent magenta (`#F43F5E`) outlines rather than blended drop shadows to maintain hard-edge HUD geometry.

## Typography

The typography architecture uses a stark separation between structural headings, utilitarian body copy, and cryptographic data readouts:

1. **Space Grotesk**: Dominates hero titles, section alerts, and sticker badges. All-caps treatments with tight tracking evoke industrial sci-fi bulkheads and telemetry screens.
2. **Inter**: Serves as the high-legibility layer for human-oriented descriptions, terms of verification, and explanatory tooltips.
3. **JetBrains Mono**: The cryptographic anchor. All hexadecimal hashes, smart-contract IDs, time-deltas, epochs, and CLI execution scripts must appear in `JetBrains Mono`. Hashes remain untruncated inside verification trays with click-to-copy anchors.

## Layout & Spacing

The design system operates on an uncompromising 4px/8px modular telemetry grid overlaid with coordinate tick marks and background grid coordinates (`grid-size: 32px`).

- **Grid Alignment**: 12-column dynamic desktop grid with strict 24px gutters and minimum 32px outer safe borders. On mobile screens (<768px), it collapses to a single 4-column flow with 16px lateral padding.
- **Section Stack Rhythm**: 48px to 64px vertical clearance between main protocol panels. Panels occupy 100% width on tablet/mobile and scale to fixed max-width hulls (`1080px` to `1280px`) centered on ultra-wide viewports.
- **Micro Spacing**: Inline hash-and-chip groupings use fixed 8px gaps. Multi-segmented duration selectors utilize zero-gap borders with shared boundary strokes.

## Elevation & Depth

Visual hierarchy does not rely on soft blurred drop shadows; it is constructed through **hard-offset isometric stroke projections** and **luminescent cryogenic edge glows**:

1. **Level 0 (Abyss Grid)**: Ground background (`#060B14`) textured with cyan grid hairlines (`rgba(0, 240, 255, 0.08)`) and micro crosshair registration points.
2. **Level 1 (Cryo Hull Container)**: Surface `#0B132B` bordered with 1px to 2px solid cyan (`#00F0FF`) or magenta (`#F43F5E`), flanked by a distinct hard offset shadow: `box-shadow: 4px 4px 0px 0px #00F0FF` or `box-shadow: 4px 4px 0px 0px #F43F5E`.
3. **Level 2 (Active Inspection Wells & Terminals)**: Recessed deep-black chambers (`#030712`) inset with 1px dotted frost borders (`rgba(224, 242, 254, 0.25)`).
4. **Sticker / Alert Elevation**: Angled floating badges (`transform: rotate(-1.5deg)`) set against contrasting backdrop planes with dense `3px 3px 0px #000000` hard shadow blocks.

## Shapes

The shape vocabulary is strictly **sharp and monolithic** (`roundedness: 0`). 

- Radii across all inputs, badges, cards, buttons, and terminal fields are strictly `0px` to emphasize machined cryogenic machinery and technical HUD readouts.
- Geometric accents feature 45-degree chamfers on primary cards or button edges where state indicators switch from frozen to thawing.
- Badge indicators and system pills utilize hard geometric rectangles with zero corner attenuation.

## Components

### Buttons & Verification Actions
- **Primary Cyber Freeze**: Solid high-saturation magenta (`#F43F5E`) or glowing cyan (`#00F0FF`) background, jet-black uppercase text in `Space Grotesk`, bordered with 1px hard white, sitting on a solid 3px offset shadow block.
- **HUD Secondary / Terminal Button**: Transparent ground, 1.5px cyan stroke, monospace text, hover reveals a glowing cyan wash with `box-shadow: 0 0 12px rgba(0, 240, 255, 0.4)`.

### Crypto Input Fields & Address Trays
- Inky sub-zero backgrounds (`#030712`) framed by a 1.5px solid border (`#00F0FF` or `#E0F2FE`).
- Typography set in full `JetBrains Mono`. Trailing actions feature direct copy-to-clipboard icons or on-chain protocol status indicators (`VERIFIED ON WALRUS`).

### Technical Indicator Badges & Warning Slugs
- High-contrast caution yellow (`#FEF08A`) with stark black monospace label text, slightly tilted (-1° to -2°) to emulate mechanical field tape and tamper-evident seals.
- Status slugs: "WALRUS STATUS: CHILL", "READ-ONLY PROOF", "BLIZZARD MODE".

### Isometric Ice Monolith Display Cards
- List rows presenting frozen token balances feature an illustrated vector ice block on the left (solid ice = locked; melting drips = streaming vesting; cracked = claimable).
- Dotted separation rules (`border-bottom: 1px dashed rgba(224, 242, 254, 0.2)`) divide on-chain entities with hover states triggering edge cyan luminescence.