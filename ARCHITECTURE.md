# architecture.md

# Visual Style Redesign — System Architecture

**Document ID:** ARCH-VISUAL-001
**Spec Reference:** SPEC-VISUAL-001
**Version:** 1.0.0
**Status:** Approved for Implementation
**Stack Profile:** `vite-webapp` (Vite 8 + React 19 + TypeScript 6)

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Existing Codebase Baseline](#2-existing-codebase-baseline)
3. [Component Architecture](#3-component-architecture)
4. [Design Token System Architecture](#4-design-token-system-architecture)
5. [File Change Manifest & Contracts](#5-file-change-manifest--contracts)
6. [Data Models & Type Contracts](#6-data-models--type-contracts)
7. [Technology Stack](#7-technology-stack)
8. [CSS Architecture Strategy](#8-css-architecture-strategy)
9. [Accessibility & Resilience Architecture](#9-accessibility--resilience-architecture)
10. [Security Architecture](#10-security-architecture)
11. [Observability Plan](#11-observability-plan)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Risk Register](#13-risk-register)
14. [Acceptance Verification Matrix](#14-acceptance-verification-matrix)

---

## 1. Architectural Overview

This redesign is a **pure presentation-layer transformation** — no new runtime dependencies, no routing changes, no state management. The architectural unit of change is the CSS custom property layer and the React component tree rendering within `src/App.tsx`.

### 1.1 Scope Boundary

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHANGE BOUNDARY                             │
│                                                                 │
│   index.html        ← meta viewport, lang attribute only       │
│   src/index.css     ← REPLACED: design token registry +        │
│                        global resets + media query blocks       │
│   src/App.css       ← REPLACED: BEM component styles only,     │
│                        zero raw hex values                      │
│   src/App.tsx       ← MODIFIED: component tree restructured    │
│                        to emit required BEM DOM structure       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     FROZEN (NO CHANGES)                         │
│                                                                 │
│   src/main.tsx      vite.config.ts    tsconfig*.json           │
│   eslint.config.js  package.json      public/favicon.svg       │
│   public/icons.svg                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Architectural Principles Applied

| Principle | Application |
|-----------|-------------|
| **Token-First** | All visual values flow from CSS custom properties; components never own raw values |
| **BEM Naming** | Every selector follows `.block__element--modifier` preventing cascade pollution |
| **Progressive Enhancement** | `@supports` blocks ensure visual coherence before modern CSS features arrive |
| **Design for Failure** | `backdrop-filter` fallback; `prefers-reduced-motion` safety; font-stack fallback chain |
| **Zero New Dependencies** | No npm installs; CSS and TSX only |
| **Scope Discipline** | Extend existing `App.tsx`/`App.css`/`index.css`; do not touch unrelated subsystems |

---

## 2. Existing Codebase Baseline

### 2.1 Current File Inventory

```
applydigital/
├── index.html                 # Entry HTML — minimal, needs meta viewport check
├── src/
│   ├── main.tsx               # ReactDOM.createRoot — FROZEN
│   ├── App.tsx                # Root component — MODIFY component tree
│   ├── App.css                # Component styles — REPLACE content
│   └── index.css              # Global styles — REPLACE content
├── public/
│   ├── favicon.svg            # FROZEN
│   └── icons.svg              # FROZEN
├── vite.config.ts             # FROZEN
├── package.json               # FROZEN (no new deps)
└── tsconfig*.json             # FROZEN
```

### 2.2 Current Dependency Graph

```
index.html
    └── src/main.tsx              (ReactDOM.createRoot)
            └── src/App.tsx       (imports App.css)
                    └── src/App.css
    └── src/index.css             (global scope via Vite CSS pipeline)
```

The CSS pipeline is handled entirely by Vite's built-in CSS processor. No PostCSS config, no CSS Modules, no CSS-in-JS — this is confirmed by the codebase analysis. The architecture preserves this simple pipeline.

### 2.3 Build Pipeline (Unchanged)

```
npm run build
    │
    ├── tsc -b                   # TypeScript compile check (noEmit)
    │       └── Must exit 0 — TypeScript 6, strict mode
    │
    └── vite build               # Vite 8 production bundle
            ├── React 19 JSX transform (no import needed)
            ├── CSS minification → dist/assets/*.css
            └── JS bundling → dist/assets/*.js
```

---

## 3. Component Architecture

### 3.1 Component Tree (Target State)

```
App (src/App.tsx)
├── NavBar (src/components/NavBar.tsx)  ← extracted component
│   └── nav.nav-bar
│       └── div.nav-bar__inner
│           ├── a.nav-bar__logo
│           └── ul.nav-bar__links
│               ├── li > a.nav-bar__link  "Products"
│               ├── li > a.nav-bar__link  "Services"
│               └── li > a.nav-bar__link  "About"
│
├── HeroSection (src/components/HeroSection.tsx)  ← extracted component
│   └── section.hero[aria-labelledby="hero-heading"]
│       └── div.hero__inner
│           ├── h1.display#hero-heading
│           ├── p.hero__subtitle
│           └── div.hero__actions
│               ├── button.btn-primary
│               └── button.btn-secondary
│
├── FeaturesSection (inline in App.tsx or extracted)
│   └── section.section
│       └── div.content-wrapper
│           ├── h2.headline
│           └── div.card-grid
│               ├── article.card
│               │   ├── h3.card__title
│               │   └── p.card__body
│               ├── article.card
│               └── article.card
│
└── Footer (src/components/Footer.tsx)  ← extracted component
    └── footer.footer
        └── div.footer__inner
            └── p.footer__text
```

### 3.2 Component Diagrams

#### 3.2.1 Full Page Layout

```
┌─────────────────────────────────────────────────────┐
│  nav.nav-bar  [sticky, top:0, h:44px, z:1000]       │
│  ┌─────────────────────────────────────────────┐    │
│  │ nav-bar__inner [max-w:1200px, flex]          │    │
│  │  [logo]              [links: P | S | A]      │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  section.hero  [bg:#fff, text-align:center]         │
│  [padding: 120px top/bottom → 56px on mobile]       │
│  ┌─────────────────────────────────────────────┐    │
│  │ hero__inner [max-w:800px, centered]          │    │
│  │  h1.display  [clamp(48px→80px), w:700]      │    │
│  │  p.hero__subtitle  [clamp(28px→48px)]        │    │
│  │  div.hero__actions                           │    │
│  │    [btn-primary]  [btn-secondary]            │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  section.section  [bg:--color-bg-secondary]         │
│  ┌─────────────────────────────────────────────┐    │
│  │ content-wrapper [max-w:1200px, centered]     │    │
│  │  h2.headline                                 │    │
│  │  div.card-grid  [CSS Grid, auto-fit]         │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │    │
│  │  │  .card   │ │  .card   │ │  .card   │    │    │
│  │  │ r:18px   │ │ r:18px   │ │ r:18px   │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘    │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  footer.footer  [bg:--color-bg-secondary]           │
│  ┌─────────────────────────────────────────────┐    │
│  │ footer__inner [max-w:1200px, centered]       │    │
│  │  p.footer__text  [12px, --color-text-sec]    │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

#### 3.2.2 Responsive Layout State Machine

```
Viewport Width
      │
      ├─── < 768px (xs/sm) ──────────────────────────────────────┐
      │    • padding-inline: var(--space-3) [16px]               │
      │    • hero padding-block: var(--space-8) [56px]           │
      │    • section padding-block: var(--space-7) [48px]        │
      │    • card-grid: single column (minmax(280px,1fr))         │
      │    • nav links: hidden (display:none) OR stacked          │
      │                                                           │
      ├─── 768px–1023px (sm) ────────────────────────────────────┤
      │    • padding-inline: var(--space-5) [32px]               │
      │    • hero padding-block: 120px                            │
      │    • card-grid: 2 columns (auto-fit kicks in)             │
      │                                                           │
      ├─── 1024px–1439px (md) ───────────────────────────────────┤
      │    • content max-width: 1200px centred                    │
      │    • card-grid: 2–3 columns                               │
      │                                                           │
      └─── ≥ 1440px (lg/xl) ─────────────────────────────────────┘
           • Full 3-column card grid
           • nav-bar at full 1200px container width
           • padding-inline: var(--space-6) [40px]
```

### 3.3 Component Interface Contracts

Each extracted component is a pure functional React component with no props required for the initial implementation (static content). Prop interfaces are defined for future extensibility.

#### NavBar Component

```typescript
// src/components/NavBar.tsx
interface NavLink {
  label: string;
  href: string;
}

interface NavBarProps {
  brand?: string;          // defaults to "ApplyDigital"
  links?: NavLink[];       // defaults to Products/Services/About
}

// DOM contract: emits exactly the BEM structure defined in SPEC §7.1
// CSS contract: relies on .nav-bar, .nav-bar__inner, .nav-bar__logo,
//               .nav-bar__links, .nav-bar__link defined in App.css
```

#### HeroSection Component

```typescript
// src/components/HeroSection.tsx
interface HeroSectionProps {
  headline?: string;         // defaults to spec copy
  subtitle?: string;         // defaults to spec copy
  primaryCta?: string;       // defaults to "Get Started"
  secondaryCta?: string;     // defaults to "Learn More"
}

// DOM contract: emits .hero > .hero__inner > [h1.display, p.hero__subtitle,
//               div.hero__actions > [btn-primary, btn-secondary]]
// Accessibility contract: h1 has id="hero-heading";
//                         section has aria-labelledby="hero-heading"
```

#### Footer Component

```typescript
// src/components/Footer.tsx
interface FooterProps {
  copyrightYear?: number;    // defaults to new Date().getFullYear()
  companyName?: string;      // defaults to "ApplyDigital"
}

// DOM contract: emits .footer > .footer__inner > p.footer__text
```

---

## 4. Design Token System Architecture

### 4.1 Token Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    src/index.css                                 │
│                                                                  │
│  Layer 0: Box-sizing & margin reset  (* { box-sizing: ... })    │
│                                                                  │
│  Layer 1: Token Registry                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  :root {                                                  │   │
│  │    /* 10 colour tokens */                                 │   │
│  │    /* 12 typography tokens */                             │   │
│  │    /* 12 spacing tokens */                                │   │
│  │    /* 4 radius tokens */                                  │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 2: Dark Mode Override                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  @media (prefers-color-scheme: dark) {                    │   │
│  │    :root { /* 10 colour token overrides */ }              │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 3: Reduced Motion Safety                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  @media (prefers-reduced-motion: reduce) {                │   │
│  │    *, *::before, *::after {                               │   │
│  │      transition-duration: 0.01ms !important;              │   │
│  │      animation-duration: 0.01ms !important;               │   │
│  │    }                                                      │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 4: Body base styles                                       │
│  (font-family, font-size:17px, line-height:1.47059, colour)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │ consumed by
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    src/App.css                                   │
│                                                                  │
│  All values reference var(--token-name)                          │
│  BEM selectors only: .block__element--modifier                   │
│  Zero raw hex values (NFR-008 enforced)                          │
│                                                                  │
│  Sections:                                                       │
│  1. Layout primitives (.content-wrapper, .section)               │
│  2. NavBar component  (.nav-bar, __inner, __logo, __links, …)   │
│  3. Hero section      (.hero, __inner, __subtitle, __actions)    │
│  4. Typography        (.display, .headline, .title-1, .title-2)  │
│  5. Buttons           (.btn-primary, .btn-secondary)             │
│  6. Cards             (.card-grid, .card, __title, __body)       │
│  7. Footer            (.footer, __inner, __text)                 │
│  8. @supports block   (backdrop-filter graceful degradation)     │
│  9. Responsive blocks (@media max-width: 767px)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Token Resolution Flow

```
Browser renders element
        │
        ▼
Does OS report dark mode? ──Yes──► @media (prefers-color-scheme: dark)
        │                           └─ :root colour tokens overridden
        │ No
        ▼
Uses :root light mode defaults
        │
        ▼
CSS custom property var(--token) resolved at computed-style time
        │
        ▼
Does OS report reduced motion? ──Yes──► transition-duration: 0.01ms
        │                                animation-duration: 0.01ms
        │ No
        ▼
Full transitions applied (200–300ms ease)
```

### 4.3 Complete Token Registry (Authoritative)

#### Colour Tokens

| CSS Custom Property | Light Value | Dark Value |
|---------------------|-------------|------------|
| `--color-bg-primary` | `#ffffff` | `#000000` |
| `--color-bg-secondary` | `#f5f5f7` | `#1c1c1e` |
| `--color-bg-tertiary` | `#e8e8ed` | `#2c2c2e` |
| `--color-surface` | `#ffffff` | `#1c1c1e` |
| `--color-text-primary` | `#1d1d1f` | `#f5f5f7` |
| `--color-text-secondary` | `#6e6e73` | `#a1a1a6` |
| `--color-text-tertiary` | `#86868b` | `#6e6e73` |
| `--color-accent` | `#0071e3` | `#2997ff` |
| `--color-accent-hover` | `#0077ed` | `#47a7ff` |
| `--color-border` | `#d2d2d7` | `#3a3a3c` |

#### Typography Tokens

| CSS Custom Property | Value |
|---------------------|-------|
| `--font-family-system` | `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif` |
| `--font-size-display` | `clamp(48px, 5vw, 80px)` |
| `--font-size-headline` | `clamp(28px, 3vw, 48px)` |
| `--font-size-title-1` | `clamp(22px, 2.5vw, 32px)` |
| `--font-size-title-2` | `clamp(18px, 2vw, 24px)` |
| `--font-size-body` | `17px` |
| `--font-size-callout` | `15px` |
| `--font-size-caption` | `12px` |
| `--font-weight-regular` | `400` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |

#### Spacing Tokens (8px base grid)

| CSS Custom Property | Value | Notes |
|---------------------|-------|-------|
| `--space-1` | `4px` | |
| `--space-2` | `8px` | |
| `--space-3` | `16px` | Mobile padding-inline |
| `--space-4` | `24px` | Card gap |
| `--space-5` | `32px` | Desktop padding-inline (FR-020 ref) |
| `--space-6` | `40px` | Card padding; nav inner padding |
| `--space-7` | `48px` | Mobile section padding-block |
| `--space-8` | `56px` | Mobile hero padding-block |
| `--space-9` | `64px` | |
| `--space-10` | `80px` | Desktop section padding-block |
| `--space-11` | `88px` | |
| `--space-12` | `96px` | |

#### Border Radius Tokens

| CSS Custom Property | Value | Usage |
|---------------------|-------|-------|
| `--radius-sm` | `6px` | Tags, focus rings |
| `--radius-md` | `12px` | Inputs |
| `--radius-lg` | `18px` | Cards |
| `--radius-pill` | `980px` | CTA buttons |

> **Spacing note (FR-020 reconciliation):** The spec text in FR-020 states `var(--space-5)` is `40px`. Per the authoritative token table in §6.3 of the specification, `--space-5 = 32px` and `--space-6 = 40px`. The spec text has a one-off labelling error. The implementation follows **the token table as truth**: `--space-6 = 40px` for desktop padding-inline. All FR references using `var(--space-5)` for `40px` will be implemented as `var(--space-6)`. This discrepancy is logged in the Risk Register (§13).

---

## 5. File Change Manifest & Contracts

### 5.1 index.html — Minimal Change

**Change type:** Attribute update only

```diff
- <html lang="en">
+ <html lang="en">                  <!-- verify lang is present, no change needed -->

  <head>
    <meta charset="UTF-8" />
+   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>ApplyDigital</title>     <!-- update if currently default Vite title -->
  </head>
```

**No font imports added** — the system font stack (`-apple-system`, `BlinkMacSystemFont`) requires no external font files. This satisfies NG-010 (no SF Pro font files) and NG-008 (no changes to `main.tsx` beyond what is strictly required — font import is not needed).

### 5.2 src/index.css — Full Replacement

**Sections in order:**

```
1. Box-sizing reset           (* { box-sizing: border-box; margin: 0; padding: 0; })
2. :root token registry       (all 38 tokens in 4 groups)
3. Dark mode override block   (@media prefers-color-scheme: dark)
4. Reduced motion block       (@media prefers-reduced-motion: reduce)
5. Body base styles           (font, line-height, colour, background)
```

**Size target:** ≤ 4 KB uncompressed (well within NFR-001's 15 KB budget)

### 5.3 src/App.css — Full Replacement

**Sections in order (all referencing tokens via `var()`)**

```
1.  Layout primitives       (.content-wrapper, .section)
2.  NavBar block            (.nav-bar and all BEM elements)
3.  @supports fallback      (backdrop-filter degradation)
4.  Hero section            (.hero and all BEM elements)
5.  Typography utilities    (.display, .headline, .title-1, .title-2)
6.  Buttons                 (.btn-primary, .btn-secondary + states)
7.  Card grid               (.card-grid)
8.  Card block              (.card and all BEM elements + hover)
9.  Footer                  (.footer and all BEM elements)
10. Responsive overrides    (@media max-width: 767px)
```

**Size target:** ≤ 8 KB uncompressed (within NFR-001's 15 KB budget for total CSS delta)

### 5.4 src/App.tsx — Structural Modification

**Change type:** Extend existing component tree to emit BEM DOM structure

```typescript
// Target import structure
import './App.css'
import NavBar from './components/NavBar'
import HeroSection from './components/HeroSection'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <section className="section">
          <div className="content-wrapper">
            <h2 className="headline">Features</h2>
            <div className="card-grid">
              {/* 3 static cards */}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default App
```

### 5.5 New Files Created

| File | Purpose | Size Estimate |
|------|---------|---------------|
| `src/components/NavBar.tsx` | NavBar functional component | ~60 lines |
| `src/components/HeroSection.tsx` | Hero functional component | ~50 lines |
| `src/components/Footer.tsx` | Footer functional component | ~30 lines |

---

## 6. Data Models & Type Contracts

### 6.1 Design Token Type Contract

This TypeScript interface serves as the authoritative documentation contract for the CSS custom property namespace. It is **not instantiated at runtime** — it documents the CSS variable surface area for developer tooling and future token consumers.

```typescript
// src/types/design-tokens.d.ts  (declaration file — no runtime cost)

/**
 * CSS Custom Property Design Token Contract
 * Maps TypeScript identifiers to CSS --custom-property names.
 * All values are CSS string representations.
 */
export interface DesignTokens {
  // ── Colour ───────────────────────────────────────────────────────
  /** CSS: --color-bg-primary    | Light: #ffffff  | Dark: #000000  */
  readonly colorBgPrimary: string;
  /** CSS: --color-bg-secondary  | Light: #f5f5f7  | Dark: #1c1c1e  */
  readonly colorBgSecondary: string;
  /** CSS: --color-bg-tertiary   | Light: #e8e8ed  | Dark: #2c2c2e  */
  readonly colorBgTertiary: string;
  /** CSS: --color-surface       | Light: #ffffff  | Dark: #1c1c1e  */
  readonly colorSurface: string;
  /** CSS: --color-text-primary  | Light: #1d1d1f  | Dark: #f5f5f7  */
  readonly colorTextPrimary: string;
  /** CSS: --color-text-secondary| Light: #6e6e73  | Dark: #a1a1a6  */
  readonly colorTextSecondary: string;
  /** CSS: --color-text-tertiary | Light: #86868b  | Dark: #6e6e73  */
  readonly colorTextTertiary: string;
  /** CSS: --color-accent        | Light: #0071e3  | Dark: #2997ff  */
  readonly colorAccent: string;
  /** CSS: --color-accent-hover  | Light: #0077ed  | Dark: #47a7ff  */
  readonly colorAccentHover: string;
  /** CSS: --color-border        | Light: #d2d2d7  | Dark: #3a3a3c  */
  readonly colorBorder: string;

  // ── Typography ───────────────────────────────────────────────────
  readonly fontFamilySystem: string;   // -apple-system, BlinkMacSystemFont, …
  readonly fontSizeDisplay: string;    // clamp(48px, 5vw, 80px)
  readonly fontSizeHeadline: string;   // clamp(28px, 3vw, 48px)
  readonly fontSizeTitle1: string;     // clamp(22px, 2.5vw, 32px)
  readonly fontSizeTitle2: string;     // clamp(18px, 2vw, 24px)
  readonly fontSizeBody: string;       // 17px
  readonly fontSizeCallout: string;    // 15px
  readonly fontSizeCaption: string;    // 12px
  readonly fontWeightRegular: 400;
  readonly fontWeightMedium: 500;
  readonly fontWeightSemibold: 600;
  readonly fontWeightBold: 700;

  // ── Spacing ──────────────────────────────────────────────────────
  readonly space1: '4px';
  readonly space2: '8px';
  readonly space3: '16px';
  readonly space4: '24px';
  readonly space5: '32px';
  readonly space6: '40px';
  readonly space7: '48px';
  readonly space8: '56px';
  readonly space9: '64px';
  readonly space10: '80px';
  readonly space11: '88px';
  readonly space12: '96px';

  // ── Border Radius ────────────────────────────────────────────────
  readonly radiusSm: '6px';
  readonly radiusMd: '12px';
  readonly radiusLg: '18px';
  readonly radiusPill: '980px';
}

/** Breakpoint definitions (px) */
export interface Breakpoints {
  readonly xs: 320;
  readonly sm: 768;
  readonly md: 1024;
  readonly lg: 1440;
  readonly xl: 1920;
}
```

### 6.2 Component Prop Interfaces

```typescript
// src/types/components.d.ts

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface NavBarProps {
  readonly brand?: string;
  readonly links?: readonly NavLink[];
}

export interface HeroSectionProps {
  readonly headline?: string;
  readonly subtitle?: string;
  readonly primaryCta?: string;
  readonly secondaryCta?: string;
  readonly onPrimaryCtaClick?: () => void;
  readonly onSecondaryCtaClick?: () => void;
}

export interface CardData {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface FeaturesSectionProps {
  readonly heading?: string;
  readonly cards?: readonly CardData[];
}

export interface FooterProps {
  readonly copyrightYear?: number;
  readonly companyName?: string;
}
```

---

## 7. Technology Stack

### 7.1 Stack Decision Matrix

| Layer | Technology | Version | Justification | Alternatives Rejected |
|-------|-----------|---------|---------------|----------------------|
| **UI Framework** | React | 19.2.6 | Existing; new JSX transform; concurrent features available | — (existing) |
| **Language** | TypeScript | 6.0.2 | Existing; strict mode; `erasableSyntaxOnly` enforced | — (existing) |
| **Build Tool** | Vite | 8.0.12 | Existing; native CSS processing; HMR; fast cold start | — (existing) |
| **Styling** | Vanilla CSS + Custom Properties | CSS3 |