# specification.md

```markdown
# Visual Style Redesign Specification
## Apple.com-Inspired Design System for ApplyDigital Vite/React Application

**Document ID:** SPEC-VISUAL-001  
**Version:** 1.0.0  
**Status:** Draft  
**Created:** 2025  
**Scope:** `src/**`, `public/**`, `index.html`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Goals & Context](#2-business-goals--context)
3. [Non-Goals (Explicit Exclusions)](#3-non-goals-explicit-exclusions)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Design System Specification](#6-design-system-specification)
7. [Component Specifications](#7-component-specifications)
8. [Data Models](#8-data-models)
9. [Acceptance Criteria (Gherkin)](#9-acceptance-criteria-gherkin)
10. [Use Cases](#10-use-cases)
11. [Constraints & Boundaries](#11-constraints--boundaries)
12. [Success Metrics & Performance Targets](#12-success-metrics--performance-targets)
13. [File Change Manifest](#13-file-change-manifest)

---

## 1. Executive Summary

This specification defines the requirements for applying an Apple.com-inspired visual style to the existing `applydigital` Vite + React + TypeScript web application. The redesign targets `src/App.tsx`, `src/App.css`, and `src/index.css` (plus `index.html` meta/font references) to adopt Apple's design language: minimal whitespace-driven layout, SF Pro–equivalent system fonts, high-contrast typography hierarchy, clean monochromatic palette with selective accent colour, and smooth CSS transitions. No business logic, routing, state management, or backend concerns are in scope.

---

## 2. Business Goals & Context

| ID | Goal | Measurable Outcome |
|----|------|--------------------|
| BG-001 | Elevate perceived visual quality to match premium consumer-tech aesthetics | Lighthouse Accessibility score ≥ 90; WCAG 2.1 AA contrast ratios on all text/background pairs |
| BG-002 | Establish a consistent design token system for future component growth | All colour, spacing, and typography values defined as CSS custom properties in `index.css`; zero hard-coded hex values in component CSS |
| BG-003 | Preserve existing functionality during visual overhaul | Zero regressions in `tsc -b && vite build` pipeline; no runtime errors in browser console |
| BG-004 | Deliver a responsive layout that matches Apple's fluid grid approach | Layout renders correctly at viewport widths: 320 px, 768 px, 1024 px, 1440 px, 1920 px |

---

## 3. Non-Goals (Explicit Exclusions)

The following are **explicitly out of scope** and must not be implemented:

- NG-001: Adding any new routing, pages, or navigation logic
- NG-002: Introducing a third-party component library (e.g., MUI, Ant Design, Chakra UI)
- NG-003: Replacing or modifying `vite.config.ts`, `tsconfig*.json`, or `eslint.config.js` for non-build-critical reasons
- NG-004: Adding state management libraries (Redux, Zustand, Jotai, etc.)
- NG-005: Implementing animations beyond CSS `transition` and `@keyframes` (no GSAP, Framer Motion, etc.)
- NG-006: Fetching or rendering any external data / API calls
- NG-007: Replacing the existing `public/favicon.svg` or `public/icons.svg` unless the requirement explicitly requests it (it does not)
- NG-008: Modifying `src/main.tsx` beyond what is strictly required for font import
- NG-009: Implementing dark mode toggle logic (dark mode palette is defined as tokens but the toggle UI is out of scope)
- NG-010: Copying, reproducing, or trademarking Apple's proprietary assets, logotype, or SF Pro font files

---

## 4. Functional Requirements

### 4.1 Design Token System

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-001 | The file `src/index.css` MUST define all design tokens as CSS custom properties under the `:root` selector | `grep --count "var(--" src/App.css` returns ≥ 20 matches; no raw hex/rgb values appear in `src/App.css` |
| FR-002 | Colour tokens MUST include: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`, `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`, `--color-accent`, `--color-accent-hover`, `--color-border`, `--color-surface` | All 10 tokens present in `:root {}` block of `src/index.css` |
| FR-003 | Typography tokens MUST include: `--font-family-system`, `--font-size-display`, `--font-size-headline`, `--font-size-title-1`, `--font-size-title-2`, `--font-size-body`, `--font-size-callout`, `--font-size-caption`, `--font-weight-regular`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold` | All 12 tokens present in `:root {}` block of `src/index.css` |
| FR-004 | Spacing tokens MUST include an 8 px base grid: `--space-1` (4 px) through `--space-12` (96 px) | 12 spacing tokens present; values follow 4 px increments up to 16 px then 8 px increments |
| FR-005 | A `@media (prefers-color-scheme: dark)` block MUST redefine colour tokens for dark mode without any JavaScript toggle | Dark token overrides present in `src/index.css`; `--color-bg-primary` resolves to `#000000` in dark mode |

### 4.2 Typography

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-006 | The primary font stack MUST be: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif` assigned to `--font-family-system` | Computed `font-family` on `body` element matches this exact stack order |
| FR-007 | The `body` element MUST use `font-size: var(--font-size-body)` (defined as `17px`) and `line-height: 1.47059` (matches Apple body copy ratio) | Browser computed style shows `font-size: 17px` and `line-height: 25px` on `body` |
| FR-008 | Display text (largest heading class `.display`) MUST use `font-size: var(--font-size-display)` (defined as `clamp(48px, 5vw, 80px)`) with `font-weight: var(--font-weight-bold)` (700) and `letter-spacing: -0.003em` | Computed styles match at 1440 px viewport |
| FR-009 | Headline text (`.headline`) MUST use `font-size: var(--font-size-headline)` (defined as `clamp(28px, 3vw, 48px)`) with `font-weight: var(--font-weight-semibold)` (600) and `letter-spacing: -0.002em` | Computed styles match at 1440 px viewport |
| FR-010 | Body copy text MUST have a contrast ratio of ≥ 7:1 against its background (AAA standard for primary text) | WebAIM Contrast Checker confirms ratio for `--color-text-primary` on `--color-bg-primary` |

### 4.3 Colour Palette

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-011 | Light mode `--color-bg-primary` MUST be `#ffffff` | CSS custom property value equals `#ffffff` |
| FR-012 | Light mode `--color-bg-secondary` MUST be `#f5f5f7` (Apple's signature off-white section background) | CSS custom property value equals `#f5f5f7` |
| FR-013 | Light mode `--color-text-primary` MUST be `#1d1d1f` (Apple's near-black body text) | CSS custom property value equals `#1d1d1f` |
| FR-014 | Light mode `--color-text-secondary` MUST be `#6e6e73` (Apple's secondary text grey) | CSS custom property value equals `#6e6e73` |
| FR-015 | `--color-accent` MUST be `#0071e3` (Apple's signature blue CTA colour) | CSS custom property value equals `#0071e3` |
| FR-016 | `--color-accent-hover` MUST be `#0077ed` | CSS custom property value equals `#0077ed` |
| FR-017 | Dark mode `--color-bg-primary` MUST be `#000000` | CSS custom property resolves to `#000000` when `prefers-color-scheme: dark` |
| FR-018 | Dark mode `--color-text-primary` MUST be `#f5f5f7` | CSS custom property resolves to `#f5f5f7` when `prefers-color-scheme: dark` |

### 4.4 Layout & Grid

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-019 | The main content wrapper MUST have a `max-width` of `1200px` and be horizontally centred with `margin-inline: auto` | Computed `max-width` is `1200px`; element is centred at 1440 px viewport |
| FR-020 | Horizontal padding on the content wrapper MUST be `var(--space-5)` (40 px) on viewports ≥ 768 px and `var(--space-3)` (24 px) on viewports < 768 px | Padding computed correctly at both breakpoints |
| FR-021 | Section vertical spacing MUST use `padding-block: var(--space-10)` (80 px) on viewports ≥ 768 px and `var(--space-7)` (56 px) on viewports < 768 px | Computed padding-block matches at both breakpoints |
| FR-022 | The app MUST use a single-column layout on viewports < 768 px | No horizontal overflow at 320 px viewport width; `overflow-x: hidden` not required to hide broken layout |

### 4.5 Navigation Bar

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-023 | A sticky navigation bar component MUST be rendered at the top of the page | `position: sticky; top: 0` computed on `.nav-bar` element |
| FR-024 | The nav bar MUST have `height: 44px` matching Apple's nav bar specification | Computed height is exactly `44px` |
| FR-025 | The nav bar background MUST use `backdrop-filter: saturate(180%) blur(20px)` with `background-color: rgba(255,255,255,0.72)` in light mode | Computed styles match on `.nav-bar` element |
| FR-026 | The nav bar MUST contain a logo/brand text element on the left and at least two navigation link placeholders | DOM contains `.nav-bar__logo` and minimum 2 `.nav-bar__link` elements |
| FR-027 | Nav link hover state MUST transition `color` over `200ms ease` | CSS transition property includes `color 200ms ease` on `.nav-bar__link` |

### 4.6 Hero Section

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-028 | A hero section MUST be rendered below the nav bar with `text-align: center` | `.hero` element present with computed `text-align: center` |
| FR-029 | The hero section MUST contain: one display-size heading (`.display`), one subtitle paragraph (`.hero__subtitle`), and one primary CTA button (`.btn-primary`) | All three child elements present in DOM |
| FR-030 | The hero section background MUST alternate to `var(--color-bg-primary)` (`#ffffff`) | Computed background on `.hero` equals `#ffffff` |
| FR-031 | Vertical padding on the hero section MUST be `120px` top and `120px` bottom on viewports ≥ 768 px | Computed `padding-top` and `padding-bottom` are `120px` |

### 4.7 CTA Button

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-032 | The primary button (`.btn-primary`) MUST have `background-color: var(--color-accent)` (`#0071e3`), `color: #ffffff`, `border-radius: 980px` (Apple's pill shape), `padding: 12px 22px`, and `font-size: 17px` | All five computed styles match specification |
| FR-033 | The primary button MUST have NO visible `border` (i.e., `border: none` or `border: 0`) | Computed `border-width` is `0px` |
| FR-034 | On `:hover`, the button `background-color` MUST transition to `var(--color-accent-hover)` over `250ms ease` | CSS transition is `background-color 250ms ease`; hover state resolves to `#0077ed` |
| FR-035 | A secondary button (`.btn-secondary`) MUST be styled as text-only with `color: var(--color-accent)` and no background | Computed `background-color` is `transparent`; `color` is `#0071e3` |

### 4.8 Feature/Content Cards

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-036 | A card component (`.card`) MUST have `background-color: var(--color-bg-secondary)`, `border-radius: 18px`, and `padding: var(--space-5)` (40 px) | All three computed styles match |
| FR-037 | Cards MUST have NO visible box shadow in resting state (`box-shadow: none`) | Computed `box-shadow` is `none` |
| FR-038 | On `:hover`, cards MUST apply `box-shadow: 0 4px 20px rgba(0,0,0,0.08)` and `transform: translateY(-2px)`, both transitioning over `300ms ease` | Computed transition includes both properties; hover state applies the specified values |
| FR-039 | A card grid container (`.card-grid`) MUST use CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` and `gap: var(--space-4)` (32 px) | Computed styles match on `.card-grid` element |

### 4.9 Footer

| ID | Requirement | Pass Criterion |
|----|-------------|----------------|
| FR-040 | A footer element MUST be rendered at the bottom of the page with `background-color: var(--color-bg-secondary)` | `.footer` element present; computed background equals `#f5f5f7` |
| FR-041 | Footer text MUST use `font-size: var(--font-size-caption)` (defined as `12px`) and `color: var(--color-text-secondary)` | Computed font-size `12px` and color `#6e6e73` on `.footer__text` |
| FR-042 | The footer MUST have a `1px solid var(--color-border)` top border | Computed `border-top` matches specification |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement | Measurement Method | Pass Threshold |
|----|----------|-------------|-------------------|----------------|
| NFR-001 | Performance | CSS bundle size increase due to this redesign MUST NOT exceed 15 KB (uncompressed) | `du -b dist/assets/*.css` diff before/after | ≤ 15,360 bytes added |
| NFR-002 | Performance | `vite build` completion time MUST NOT increase by more than 5 seconds compared to pre-change baseline | `time npm run build` before and after | Δ ≤ 5,000 ms |
| NFR-003 | Accessibility | All text/background colour pairs MUST meet WCAG 2.1 AA contrast ratio (4.5:1 for normal text, 3:1 for large text ≥ 18 pt or ≥ 14 pt bold) | axe-core automated scan or manual WebAIM check | Zero contrast violations |
| NFR-004 | Accessibility | All interactive elements (buttons, links) MUST have a visible `:focus-visible` outline of ≥ 2 px | Manual keyboard navigation test; `outline` computed style ≥ `2px` | 100% of interactive elements pass |
| NFR-005 | Accessibility | The page MUST have a logical heading hierarchy (exactly one `<h1>`, `<h2>` for sections, `<h3>` for sub-sections) | HTML validator + axe-core | Zero heading order violations |
| NFR-006 | Browser Compatibility | Visual output MUST be consistent (no layout breaks) in the latest stable release of Chrome, Firefox, Safari, and Edge | Manual cross-browser check at 1440 px viewport | Zero layout breaks across 4 browsers |
| NFR-007 | Browser Compatibility | `backdrop-filter` MUST gracefully degrade (nav bar remains opaque) in browsers that do not support it (Firefox < 103) | `@supports` fallback block present in CSS | Nav bar background is solid and readable without `backdrop-filter` |
| NFR-008 | Maintainability | Zero hard-coded colour hex values in `src/App.css`; all colours MUST reference CSS custom properties | `grep -E "#[0-9a-fA-F]{3,6}" src/App.css` | Returns 0 matches |
| NFR-009 | Maintainability | CSS selectors MUST use BEM naming convention (`.block__element--modifier`) | Code review / CSS linter | All new selectors in `App.css` conform to BEM |
| NFR-010 | TypeScript | `tsc -b` MUST complete with zero errors after changes | `npm run build` exit code | Exit code 0 |
| NFR-011 | TypeScript | `eslint .` MUST complete with zero errors after changes | `npm run lint` exit code | Exit code 0 |
| NFR-012 | Responsiveness | No horizontal scrollbar MUST appear at any of the five test viewport widths (320, 768, 1024, 1440, 1920 px) | Browser DevTools device emulation | `document.documentElement.scrollWidth === window.innerWidth` at all 5 widths |
| NFR-013 | Animation | All CSS transitions MUST respect `prefers-reduced-motion: reduce` media query by setting `transition-duration: 0.01ms` | `@media (prefers-reduced-motion: reduce)` block present in `index.css` | All transitions disabled for reduced-motion users |

---

## 6. Design System Specification

### 6.1 Colour Tokens (Full Definition)

```css
:root {
  /* Backgrounds */
  --color-bg-primary:     #ffffff;
  --color-bg-secondary:   #f5f5f7;
  --color-bg-tertiary:    #e8e8ed;
  --color-surface:        #ffffff;

  /* Text */
  --color-text-primary:   #1d1d1f;
  --color-text-secondary: #6e6e73;
  --color-text-tertiary:  #86868b;

  /* Accent / Interactive */
  --color-accent:         #0071e3;
  --color-accent-hover:   #0077ed;

  /* Border / Divider */
  --color-border:         #d2d2d7;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary:     #000000;
    --color-bg-secondary:   #1c1c1e;
    --color-bg-tertiary:    #2c2c2e;
    --color-surface:        #1c1c1e;
    --color-text-primary:   #f5f5f7;
    --color-text-secondary: #a1a1a6;
    --color-text-tertiary:  #6e6e73;
    --color-accent:         #2997ff;
    --color-accent-hover:   #47a7ff;
    --color-border:         #3a3a3c;
  }
}
```

### 6.2 Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--font-size-display` | `clamp(48px, 5vw, 80px)` | Hero headlines |
| `--font-size-headline` | `clamp(28px, 3vw, 48px)` | Section headers |
| `--font-size-title-1` | `clamp(22px, 2.5vw, 32px)` | Card headings |
| `--font-size-title-2` | `clamp(18px, 2vw, 24px)` | Sub-section headings |
| `--font-size-body` | `17px` | Default body text |
| `--font-size-callout` | `15px` | Supporting text |
| `--font-size-caption` | `12px` | Footer, metadata |
| `--font-weight-regular` | `400` | Body text |
| `--font-weight-medium` | `500` | Labels |
| `--font-weight-semibold` | `600` | Subheadings |
| `--font-weight-bold` | `700` | Display, headlines |

### 6.3 Spacing Scale (8 px base grid)

| Token | Value |
|-------|-------|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `16px` |
| `--space-4` | `24px` |
| `--space-5` | `32px` |
| `--space-6` | `40px` |
| `--space-7` | `48px` |
| `--space-8` | `56px` |
| `--space-9` | `64px` |
| `--space-10` | `80px` |
| `--space-11` | `88px` |
| `--space-12` | `96px` |

> **Note on grid alignment:** `--space-4` is 24 px (a common Apple intermediate), `--space-5` is 32 px, and `--space-6` is 40 px. All padding values referenced in FR-020 (`var(--space-5)` = 40 px) are consistent with this table.

### 6.4 Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Tags, badges |
| `--radius-md` | `12px` | Inputs, small cards |
| `--radius-lg` | `18px` | Cards, modals |
| `--radius-pill` | `980px` | CTA buttons |

### 6.5 Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| `xs` | `320px` | Minimum supported viewport |
| `sm` | `768px` | Tablet portrait |
| `md` | `1024px` | Tablet landscape / small desktop |
| `lg` | `1440px` | Standard desktop |
| `xl` | `1920px` | Wide desktop |

---

## 7. Component Specifications

### 7.1 NavBar Component

**File:** `src/App.tsx` (inline or extracted to `src/components/NavBar.tsx`)

**DOM Structure:**
```html
<nav class="nav-bar" role="navigation" aria-label="Main navigation">
  <div class="nav-bar__inner">
    <a class="nav-bar__logo" href="/">ApplyDigital</a>
    <ul class="nav-bar__links" role="list">
      <li><a class="nav-bar__link" href="#">Products</a></li>
      <li><a class="nav-bar__link" href="#">Services</a></li>
      <li><a class="nav-bar__link" href="#">About</a></li>
    </ul>
  </div>
</nav>
```

**CSS Properties (mandatory):**

| Property | Value |
|----------|-------|
| `position` | `sticky` |
| `top` | `0` |
| `height` | `44px` |
| `background-color` | `rgba(255,255,255,0.72)` |
| `backdrop-filter` | `saturate(180%) blur(20px)` |
| `-webkit-backdrop-filter` | `saturate(180%) blur(20px)` |
| `border-bottom` | `1px solid var(--color-border)` |
| `z-index` | `1000` |

**@supports fallback (NFR-007):**
```css
@supports not (backdrop-filter: blur(1px)) {
  .nav-bar {
    background-color: rgba(255,255,255,0.95);
  }
}
```

### 7.2 Hero Section Component

**DOM Structure:**
```html
<section class="hero" aria-labelledby="hero-heading">
  <div class="hero__inner">
    <h1 class="display" id="hero-heading">Headline Text</h1>
    <p class="hero__subtitle">Supporting subtitle copy goes here.</p>
    <div class="hero__actions">
      <button class="btn-primary">Get Started</button>
      <button class="btn-secondary">Learn More</button>
    </div>
  </div>
</section>
```

### 7.3 Button Components

**`.btn-primary` mandatory CSS:**

| Property | Value |
|----------|-------|
| `display` | `inline-flex` |
| `align-items` | `center` |
| `justify-content` | `center` |
| `background-color` | `var(--color-accent)` |
| `color` | `#ffffff` |
| `border` | `none` |
| `border-radius` | `var(--radius-pill)` |
| `padding` | `12px 22px` |
| `font-size` | `17px` |
| `font-weight` | `var(--font-weight-regular)` |
| `cursor` | `pointer` |
| `text-decoration` | `none` |
| `transition` | `background-color 250ms ease` |

**`.btn-primary:hover`:**

| Property | Value |
|----------|-------|
| `background-color` | `var(--color-accent-hover)` |

**`.btn-primary:focus-visible`:**

| Property | Value |
|----------|-------|
| `outline` | `3px solid var(--color-accent)` |
| `outline-offset` | `2px` |

### 7.4 Card Component

**DOM Structure:**
```html
<article class="card">
  <h3 class="card__title">Card Title</h3>
  <p class="card__body">Card description text.</p>
</article>
```

**`.card` mandatory CSS:**

| Property | Value |
|----------|-------|
| `background-color` | `var(--color-bg-secondary)` |
| `border-radius` | `var(--radius-lg)` |
| `padding` | `var(--space-6)` |
| `box-shadow` | `none` |
| `transition` | `box-shadow 300ms ease, transform 300ms ease` |

**`.card:hover`:**

| Property | Value |
|----------|-------|
| `box-shadow` | `0 4px 20px rgba(0,0,0,0.08)` |
| `transform` | `translateY(-2px)` |

---

## 8. Data Models

> This specification is a **pure visual/CSS redesign**. No new data entities, API contracts, or state models are introduced. The data model section documents the **CSS token schema** as the authoritative design data contract.

### 8.1 CSS Custom Property Schema

```typescript
// Informational TypeScript type representing the design token contract
// This is NOT implemented as runtime code; it documents the CSS variable contract.

interface DesignTokens {
  // Colour tokens
  colorBgPrimary: string;       // CSS: --color-bg-primary
  colorBgSecondary: string;     // CSS: --color-bg-secondary
  colorBgTertiary: string;      // CSS: --color-bg-tertiary
  colorSurface: string;         // CSS: --color-surface
  colorTextPrimary: string;     // CSS: --color-text-primary
  colorTextSecondary: string;   // CSS: --color-text-secondary
  colorTextTertiary: string;    // CSS: --color-text-tertiary
  colorAccent: string;          // CSS: --color-accent
  colorAccentHover: string;     // CSS: --color-accent-hover
  colorBorder: string;          // CSS: --color-border

  // Typography tokens
  fontFamilySystem: string;     // CSS: --font-family-system
  fontSizeDisplay: string;      // CSS: --font-size-display
  fontSizeHeadline: string;     // CSS: --font-size-headline
  fontSizeTitle1: string;       // CSS: --font-size-title-1
  fontSizeTitle2: string;       // CSS: --font-size-title-2
  fontSizeBody: string;         // CSS: --font-size-body
  fontSizeCallout: string;      // CSS: --font-size-callout
  fontSizeCaption: string;      // CSS: --font-size-caption
  fontWeightRegular: number;    // CSS: --font-weight-regular
  fontWeightMedium: number;     // CSS: --font-weight-medium
  fontWeightSemibold: number;   // CSS: --font-weight-semibold
  fontWeightBold: number;       // CSS: --font-weight-bold

  // Spacing tokens (px values as integers)
  space1: number;   // 4
  space2: number;   // 8
  space3: number;   // 16
  space4: number;   // 24
  space5: number;   // 32
  space6: number;   // 40
  space7: number;   // 48
  space8: number;   // 56
  space9: number;   // 64
  space10: number;  // 80
  space11: number;  // 88
  space12: number;  // 96

  // Border radius tokens
  radiusSm: string;   // 6px
  radiusMd: string;   // 12px
  radiusLg: string;   // 18px
  radiusPill: string; // 980px
}
```

---

## 9. Acceptance Criteria (Gherkin)

### Feature: Design Token System

```gherkin
Feature: CSS Design Token System
  As a developer
  I want all visual values expressed as CSS custom properties
  So that the design system is maintainable and consistent

  Scenario: All colour tokens are defined in :root
    Given the file "src/index.css" is opened
    When the ":root" CSS block is inspected
    Then it contains the property "--color-bg-primary" with value "#ffffff"
    And it contains the property "--color-bg-secondary" with value "#f5f5f7"
    And it contains the property "--color-text-primary" with value "#1d1d1f"
    And it contains the property "--color-text-secondary" with value "#6e6e73"
    And it contains the property "--color-accent" with value "#0071e3"
    And it contains the property "--color-accent-hover" with value "#0077ed"
    And it contains the property "--color-border" with value "#d2d2d7"

  Scenario: App.css contains no hard-coded colour values
    Given the file "src/App.