---
name: Freight Operations Engine
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#c4c6d1'
  on-secondary: '#2d3039'
  secondary-container: '#444650'
  on-secondary-container: '#b3b4c0'
  tertiary: '#dec29a'
  on-tertiary: '#3e2d11'
  tertiary-container: '#231500'
  on-tertiary-container: '#957d5a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e1e2ed'
  secondary-fixed-dim: '#c4c6d1'
  on-secondary-fixed: '#191b24'
  on-secondary-fixed-variant: '#444650'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style

The design system is engineered for high-performance logistics management. It prioritizes clarity, data density, and institutional trust. The aesthetic is inspired by modern developer-centric tools, utilizing a "Dark Mode" first approach to reduce eye strain during long operational shifts.

The style is **High-Utility Minimalism**. It leverages significant negative space between logical containers while maintaining tight internal padding for data rows. The interface should feel like a precise instrument: responsive, monochromatic with intentional color hits, and structurally rigid. Surfaces use subtle tonal shifts rather than heavy borders to define hierarchy, creating a sophisticated, layered environment.

## Colors

This design system utilizes a deep, nocturnal palette optimized for data legibility. 

- **Primary & Background**: The base is a near-black Navy (`#020617`), with surfaces stepping up to Deep Navy (`#0f172a`). This creates a recessed effect for the application frame and a floating effect for content cards.
- **Semantic Colors**: Emerald Green and Red are reserved strictly for status indicators and financial deltas. They are used with high-saturation against the dark background to ensure immediate recognition.
- **Neutrals**: A range of "Slate" grays is used for secondary text and structural lines. Borders use a low-contrast Slate (`#1e293b`) to maintain a seamless, "borderless" feel while still segregating data.

## Typography

The typography system is built for technical precision. 

1. **Geist** is used for headlines to provide a sharp, modern, and slightly technical "developer" aesthetic.
2. **Inter** handles the bulk of data entry and reading, chosen for its exceptional legibility in dark environments and its neutral tone.
3. **JetBrains Mono** is utilized for "Labels" and "Data Points" (ID numbers, tracking codes, timestamps). This monospaced choice ensures that numerical values align vertically in tables, making it easier for users to scan and compare quantities.

Tracking should be tightened on larger headlines (-0.02em) and loosened slightly for monospaced labels to improve readability.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on maximizing horizontal real estate for complex data tables. 

- **Grid**: Use a 12-column system for dashboard layouts. On desktop, sidebars are fixed at 240px, with the main content area expanding fluidly.
- **Density**: The design system supports "Compact" and "Standard" densities. Standard uses `md` (16px) padding for cards, while Compact (for data tables) drops to `xs` (8px) vertical padding.
- **Breakpoints**: 
    - Mobile: < 768px (Single column, 16px margins).
    - Tablet: 768px - 1280px (8 columns, 24px margins).
    - Desktop: > 1280px (12 columns, 32px margins).

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and subtle ambient shadows rather than drastic color changes.

1. **Level 0 (Base)**: `#020617` — The application background.
2. **Level 1 (Card/Surface)**: `#0f172a` — Primary content containers. These feature a 1px solid border of `#1e293b`.
3. **Level 2 (Popovers/Modals)**: `#1e293b` — Elements that sit above the main surface. These receive a soft, large-radius shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.5)`.

Avoid use of pure black or stark white. Depth is communicated by "lifting" elements toward a lighter shade of Navy.

## Shapes

The design system uses an exaggerated roundedness for large containers to contrast with the sharp, technical typography. 

- **Main Cards/Containers**: Use `rounded-2xl` (1.5rem) to create a modern, approachable feel for the primary data blocks.
- **Buttons & Inputs**: Use `rounded-lg` (0.5rem) for a standard professional appearance.
- **Badges/Status**: Use `rounded-full` (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary**: Solid Slate-50 (Near white) text on a Primary Navy background with a subtle 1px border. 
- **Secondary**: Ghost style. Transparent background with a 1px Slate-800 border.
- **Size**: 36px height for standard, 32px for compact table actions.

### Status Badges
Badges should use a "Subtle Tint" approach: a low-opacity version of the semantic color for the background (e.g., 10% Emerald) with high-contrast text (e.g., 100% Emerald). This ensures the badge is visible but doesn't dominate the visual field.

### Data Tables
- **Header**: Sticky headers with a background blur (`backdrop-filter: blur(8px)`) and a bottom border.
- **Rows**: Subtle hover state using `#1e293b`. No vertical borders between columns; use generous horizontal spacing (gutters) instead.

### Form Inputs
- **Style**: Dark background (`#020617`), 1px border (`#1e293b`). 
- **Focus**: Transition the border to a subtle Blue-500 glow or a 1px solid Primary-100 ring.

### Modern Cards
Cards must have a "Glass-like" stroke. Apply a `1px` border with a linear gradient (top-left to bottom-right) from `#334155` to `#1e293b` to simulate a light source hitting the top edge of the card.