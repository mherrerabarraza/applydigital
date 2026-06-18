# refinement.md

# SPARC Refinement — Visual Style Redesign
## SPEC-VISUAL-001 · QA & Senior Code Review Pass

**Document ID:** REFINEMENT-VISUAL-001
**Spec Reference:** SPEC-VISUAL-001
**Arch Reference:** ARCH-VISUAL-001
**Version:** 1.0.0
**Status:** Ready for Implementation
**Reviewer Role:** Senior Tester & QA Strategist

---

## Table of Contents

1. [Consistency & Gap Analysis](#1-consistency--gap-analysis)
2. [Unit Test Cases](#2-unit-test-cases)
3. [Integration Test Scenarios](#3-integration-test-scenarios)
4. [Performance Optimization Suggestions](#4-performance-optimization-suggestions)
5. [Security Review Findings](#5-security-review-findings)
6. [Risk Register](#6-risk-register)
7. [Implementation Checklist](#7-implementation-checklist)

---

## 1. Consistency & Gap Analysis

### 1.1 Specification vs. Architecture Discrepancies

| ID | Location | Issue | Severity | Resolution |
|----|----------|-------|----------|------------|
| GAP-001 | SPEC FR-020 vs. ARCH §4.3 | FR-020 states `var(--space-5)` = 40 px for desktop padding-inline; token table defines `--space-5` = 32 px and `--space-6` = 40 px | **High** | Implement as `var(--space-6)` (40 px). Token table is authoritative. Document this in code comment. |
| GAP-002 | SPEC FR-039 vs. ARCH §4.3 | FR-039 states card gap is `var(--space-4)` (32 px); token table shows `--space-4` = 24 px | **Medium** | Clarify intent: use `--space-4` (24 px) per token table. FR-039 pass criterion says "32 px" but should be "24 px". Implement 24 px; update acceptance test accordingly. |
| GAP-003 | SPEC §7.1 vs. ARCH §3.3 | NavBar spec shows `padding-inline: var(--space-6)` (40 px) for inner container; FR-020 specifies 40 px desktop padding which resolves to `--space-6` | **Low** | Consistent — both resolve to 40 px via `--space-6`. No code change needed; add code comment. |
| GAP-004 | SPEC FR-032 vs. PSEUDOCODE §3.6 | Spec requires button `padding: 12px 22px`; pseudocode button shared reset sets `border: none` — consistent, but `color: #ffffff` on `.btn-primary` is a hard-coded hex value that violates NFR-008 | **High** | Define `--color-always-white: #ffffff` token in `:root` or acknowledge as exempt in a code comment. Recommend adding the token to maintain zero-hex policy. |
| GAP-005 | SPEC NFR-007 vs. PSEUDOCODE §3.4 | `@supports` fallback defined only for `.nav-bar`; card hover uses `rgba(0,0,0,0.08)` which is not a token reference and contains no hex but is a raw rgba literal | **Medium** | Card shadow value should be tokenised or acknowledged. Recommend `--shadow-card-hover: 0 4px 20px rgba(0,0,0,0.08)` token added to `:root`. |
| GAP-006 | ARCH §3.1 vs. SPEC §7 | Architecture proposes extracting `NavBar`, `HeroSection`, `Footer` as separate `.tsx` files under `src/components/`; spec only requires DOM output not file structure | **Low** | Extraction is good practice and safe. Ensure `tsconfig.app.json` `include: ["src"]` covers subdirectories — it does (glob `src` includes `src/**`). No blocker. |
| GAP-007 | SPEC FR-021 vs. ARCH §4.3 | FR-021 says section padding-block is `var(--space-10)` (80 px) ≥ 768 px and `var(--space-7)` (56 px) < 768 px; pseudocode hero uses `var(--space-8)` (56 px) for mobile — but hero has 120 px desktop, not 80 px | **Low** | Hero is a special case: 120 px fixed desktop (FR-031), `var(--space-8)` mobile. Non-hero sections use `var(--space-10)`/`var(--space-7)`. Tests must distinguish hero from generic sections. |
| GAP-008 | SPEC §6.3 (spacing note) | Note says `--space-5` = 32 px is the desktop padding per FR-020. Note contradicts FR-020 text AND the table. The note is internally inconsistent. | **Medium** | Token table is truth. `--space-6` = 40 px for desktop padding-inline. FR-020 text and the note are both wrong. Implementation comment required. |

### 1.2 Missing Specification Clauses

| ID | Missing Item | Impact | Recommendation |
|----|-------------|--------|----------------|
| MS-001 | No specification for `<main>` landmark element wrapping content sections | Accessibility regression risk (NFR-005) | Add `<main>` wrapper in `App.tsx` between `NavBar` and `Footer`; include in DOM contract |
| MS-002 | No specification for `nav-bar__links` visibility on mobile (< 768 px) | Layout break risk at 320 px viewport | Define: hide nav links on mobile (`display: none`) or implement hamburger (out of scope per NG-001). Safest: hide links, keep logo only |
| MS-003 | No `:focus-visible` spec for `.nav-bar__link` | NFR-004 violation risk | Pseudocode defines it in component descriptor — implement and test |
| MS-004 | No specification for `<html>` `scroll-behavior` | Minor UX gap | Add `scroll-behavior: smooth` to global styles as a non-functional enhancement (does not affect any FR) |
| MS-005 | No specification for `img` default styles | If any `<img>` is added later, layout break risk | Add `img { max-width: 100%; display: block; }` to global reset |
| MS-006 | Card `padding: var(--space-6)` = 40 px in pseudocode, but FR-036 says `padding: var(--space-5)` | Token mismatch | Apply same GAP-001 resolution logic: `--space-6` = 40 px. FR-036 says 40 px; use `--space-6`. |

### 1.3 TypeScript Strict-Mode Gaps

| ID | File | Issue | Fix |
|----|------|-------|-----|
| TS-001 | `src/components/Footer.tsx` | `copyrightYear` prop uses `new Date().getFullYear()` as default — this is safe but must not be evaluated at module load in SSR contexts | Use inline default: `copyrightYear = new Date().getFullYear()` in destructuring — fine for CSR Vite app |
| TS-002 | `src/types/design-tokens.d.ts` | Declaration file with no runtime export — `noUnusedLocals` in strict mode may flag if nothing imports it | Add `export {}` or use it in a JSDoc reference; alternatively omit the `.d.ts` file and rely on CSS-only contract |
| TS-003 | All new `.tsx` components | `erasableSyntaxOnly: true` in tsconfig — ensure no `const enum` or legacy decorator syntax is used | Standard functional components with `interface` props are safe |

---

## 2. Unit Test Cases

> **Tooling Note:** The existing stack has no test runner configured. The following test cases are written for **Vitest** (natural choice for Vite projects — zero config, compatible with existing `vite.config.ts`). To install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`. These are dev-only dependencies that satisfy NG-002 (no third-party UI component libraries) and NG-004 (no state management libraries).

### 2.1 Test Setup Requirements

```typescript
// vitest.config.ts (new file — allowed by stack rules)
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
```

---

### 2.2 Design Token Validation Tests

**File:** `src/test/design-tokens.test.ts`

#### TEST-TOKEN-001: All colour tokens present in :root

```typescript
describe('Design Token System — Colour Tokens', () => {
  const REQUIRED_COLOUR_TOKENS = [
    '--color-bg-primary',
    '--color-bg-secondary',
    '--color-bg-tertiary',
    '--color-surface',
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-tertiary',
    '--color-accent',
    '--color-accent-hover',
    '--color-border',
  ]

  test('TEST-TOKEN-001: All 10 required colour tokens are resolvable on document root', () => {
    // Arrange: inject index.css into jsdom
    const style = document.createElement('style')
    style.textContent = readFileSync('src/index.css', 'utf-8')
    document.head.appendChild(style)
    const root = document.documentElement

    // Assert
    REQUIRED_COLOUR_TOKENS.forEach((token) => {
      const value = getComputedStyle(root).getPropertyValue(token).trim()
      expect(value, `Token ${token} should be defined`).not.toBe('')
    })
  })
```

#### TEST-TOKEN-002: Light mode colour values match specification

```typescript
  test('TEST-TOKEN-002: Light mode --color-bg-primary is #ffffff', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg-primary').trim()
    expect(value).toBe('#ffffff')
  })

  test('TEST-TOKEN-003: Light mode --color-bg-secondary is #f5f5f7', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg-secondary').trim()
    expect(value).toBe('#f5f5f7')
  })

  test('TEST-TOKEN-004: Light mode --color-text-primary is #1d1d1f', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-text-primary').trim()
    expect(value).toBe('#1d1d1f')
  })

  test('TEST-TOKEN-005: Light mode --color-text-secondary is #6e6e73', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-text-secondary').trim()
    expect(value).toBe('#6e6e73')
  })

  test('TEST-TOKEN-006: Light mode --color-accent is #0071e3', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent').trim()
    expect(value).toBe('#0071e3')
  })

  test('TEST-TOKEN-007: Light mode --color-accent-hover is #0077ed', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent-hover').trim()
    expect(value).toBe('#0077ed')
  })

  test('TEST-TOKEN-008: Light mode --color-border is #d2d2d7', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-border').trim()
    expect(value).toBe('#d2d2d7')
  })
})
```

#### TEST-TOKEN-009: All 12 typography tokens present

```typescript
describe('Design Token System — Typography Tokens', () => {
  const REQUIRED_TYPOGRAPHY_TOKENS = [
    '--font-family-system',
    '--font-size-display',
    '--font-size-headline',
    '--font-size-title-1',
    '--font-size-title-2',
    '--font-size-body',
    '--font-size-callout',
    '--font-size-caption',
    '--font-weight-regular',
    '--font-weight-medium',
    '--font-weight-semibold',
    '--font-weight-bold',
  ]

  test('TEST-TOKEN-009: All 12 required typography tokens are defined', () => {
    REQUIRED_TYPOGRAPHY_TOKENS.forEach((token) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(token).trim()
      expect(value, `Typography token ${token} must be defined`).not.toBe('')
    })
  })

  test('TEST-TOKEN-010: --font-size-body is 17px', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-size-body').trim()
    expect(value).toBe('17px')
  })

  test('TEST-TOKEN-011: --font-size-caption is 12px', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-size-caption').trim()
    expect(value).toBe('12px')
  })

  test('TEST-TOKEN-012: --font-weight-bold is 700', () => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-weight-bold').trim()
    expect(value).toBe('700')
  })
})
```

#### TEST-TOKEN-013: All 12 spacing tokens present and correctly valued

```typescript
describe('Design Token System — Spacing Tokens', () => {
  const SPACING_TOKEN_MAP: Record<string, string> = {
    '--space-1': '4px',
    '--space-2': '8px',
    '--space-3': '16px',
    '--space-4': '24px',
    '--space-5': '32px',
    '--space-6': '40px',
    '--space-7': '48px',
    '--space-8': '56px',
    '--space-9': '64px',
    '--space-10': '80px',
    '--space-11': '88px',
    '--space-12': '96px',
  }

  test('TEST-TOKEN-013: All 12 spacing tokens have correct px values', () => {
    Object.entries(SPACING_TOKEN_MAP).forEach(([token, expectedValue]) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(token).trim()
      expect(value, `${token} should equal ${expectedValue}`).toBe(expectedValue)
    })
  })
})
```

---

### 2.3 CSS Compliance Tests (Static Analysis)

**File:** `src/test/css-compliance.test.ts`

```typescript
import { readFileSync } from 'fs'
import { describe, test, expect } from 'vitest'

describe('CSS Compliance — NFR-008: Zero hard-coded hex in App.css', () => {
  const appCssContent = readFileSync('src/App.css', 'utf-8')

  test('TEST-CSS-001: App.css contains no hard-coded 3-digit hex colours', () => {
    // Excludes comment lines
    const nonCommentLines = appCssContent
      .split('\n')
      .filter(line => !line.trim().startsWith('/*') && !line.trim().startsWith('//'))
      .join('\n')
    const hexPattern = /#[0-9a-fA-F]{3}(?![0-9a-fA-F])/g
    const matches = nonCommentLines.match(hexPattern) ?? []
    expect(matches, `Found hard-coded 3-digit hex values: ${matches.join(', ')}`).toHaveLength(0)
  })

  test('TEST-CSS-002: App.css contains no hard-coded 6-digit hex colours', () => {
    const nonCommentLines = appCssContent
      .split('\n')
      .filter(line => !line.trim().startsWith('/*') && !line.trim().startsWith('//'))
      .join('\n')
    const hexPattern = /#[0-9a-fA-F]{6}(?![0-9a-fA-F])/g
    const matches = nonCommentLines.match(hexPattern) ?? []
    expect(matches, `Found hard-coded 6-digit hex values: ${matches.join(', ')}`).toHaveLength(0)
  })

  test('TEST-CSS-003: App.css references CSS custom properties (var(--)) at least 20 times', () => {
    const varCount = (appCssContent.match(/var\(--/g) ?? []).length
    expect(varCount).toBeGreaterThanOrEqual(20)
  })

  test('TEST-CSS-004: App.css contains BEM selectors (double underscore pattern)', () => {
    const bemPattern = /\.__\w+/g
    // At minimum nav-bar__inner, hero__inner, footer__text etc. should appear
    const bemMatches = appCssContent.match(/\w+__\w+/g) ?? []
    expect(bemMatches.length).toBeGreaterThan(5)
  })
})

describe('CSS Compliance — NFR-013: Reduced motion block present', () => {
  const indexCssContent = readFileSync('src/index.css', 'utf-8')

  test('TEST-CSS-005: index.css contains prefers-reduced-motion media query', () => {
    expect(indexCssContent).toContain('prefers-reduced-motion')
  })

  test('TEST-CSS-006: Reduced motion block sets transition-duration to near-zero', () => {
    expect(indexCssContent).toContain('transition-duration: 0.01ms')
  })

  test('TEST-CSS-007: index.css contains prefers-color-scheme: dark override block', () => {
    expect(indexCssContent).toContain('prefers-color-scheme: dark')
  })
})

describe('CSS Compliance — NFR-007: @supports backdrop-filter fallback', () => {
  const appCssContent = readFileSync('src/App.css', 'utf-8')

  test('TEST-CSS-008: App.css contains @supports not (backdrop-filter) fallback', () => {
    expect(appCssContent).toContain('@supports not (backdrop-filter')
  })

  test('TEST-CSS-009: Fallback sets nav-bar to opaque background', () => {
    // Fallback should contain rgba with high alpha or solid colour
    const supportsBlock = appCssContent.substring(
      appCssContent.indexOf('@supports not (backdrop-filter')
    )
    expect(supportsBlock).toContain('nav-bar')
    expect(supportsBlock).toContain('background-color')
  })
})
```

---

### 2.4 NavBar Component Tests

**File:** `src/test/NavBar.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import NavBar from '../components/NavBar'

describe('NavBar Component — DOM Structure (FR-023, FR-026)', () => {
  test('TEST-NAV-001: NavBar renders a <nav> element with role="navigation"', () => {
    render(<NavBar />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav.tagName.toLowerCase()).toBe('nav')
  })

  test('TEST-NAV-002: NavBar has aria-label="Main navigation"', () => {
    render(<NavBar />)
    const nav = screen.getByRole('navigation', { name: /main navigation/i })
    expect(nav).toBeInTheDocument()
  })

  test('TEST-NAV-003: NavBar renders .nav-bar class on root element', () => {
    render(<NavBar />)
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('nav-bar')
  })

  test('TEST-NAV-004: NavBar renders logo link with .nav-bar__logo class', () => {
    render(<NavBar />)
    const logo = document.querySelector('.nav-bar__logo')
    expect(logo).toBeInTheDocument()
    expect(logo?.tagName.toLowerCase()).toBe('a')
  })

  test('TEST-NAV-005: NavBar renders default brand text "ApplyDigital"', () => {
    render(<NavBar />)
    expect(screen.getByText('ApplyDigital')).toBeInTheDocument()
  })

  test('TEST-NAV-006: NavBar renders custom brand text when brand prop provided', () => {
    render(<NavBar brand="TestBrand" />)
    expect(screen.getByText('TestBrand')).toBeInTheDocument()
    expect(screen.queryByText('ApplyDigital')).not.toBeInTheDocument()
  })

  test('TEST-NAV-007: NavBar renders at least 2 navigation links (FR-026)', () => {
    render(<NavBar />)
    const links = document.querySelectorAll('.nav-bar__link')
    expect(links.length).toBeGreaterThanOrEqual(2)
  })

  test('TEST-NAV-008: NavBar renders default 3 navigation links', () => {
    render(<NavBar />)
    const links = document.querySelectorAll('.nav-bar__link')
    expect(links.length).toBe(3)
  })

  test('TEST-NAV-009: NavBar default links include Products, Services, About', () => {
    render(<NavBar />)
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  test('TEST-NAV-010: NavBar links are rendered inside a <ul> list', () => {
    render(<NavBar />)
    const list = document.querySelector('.nav-bar__links')
    expect(list?.tagName.toLowerCase()).toBe('ul')
  })

  test('TEST-NAV-011: NavBar accepts custom links array', () => {
    const customLinks = [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
    ]
    render(<NavBar links={customLinks} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.queryByText('Products')).not.toBeInTheDocument()
  })

  test('TEST-NAV-012: NavBar renders inner wrapper with .nav-bar__inner class', () => {
    render(<NavBar />)
    const inner = document.querySelector('.nav-bar__inner')
    expect(inner).toBeInTheDocument()
  })
})
```

---

### 2.5 HeroSection Component Tests

**File:** `src/test/HeroSection.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import HeroSection from '../components/HeroSection'

describe('HeroSection Component — DOM Structure (FR-028, FR-029)', () => {
  test('TEST-HERO-001: HeroSection renders a <section> element', () => {
    render(<HeroSection />)
    const section = document.querySelector('section.hero')
    expect(section).toBeInTheDocument()
  })

  test('TEST-HERO-002: HeroSection has aria-labelledby="hero-heading"', () => {
    render(<HeroSection />)
    const section = document.querySelector('.hero')
    expect(section?.getAttribute('aria-labelledby')).toBe('hero-heading')
  })

  test('TEST-HERO-003: HeroSection renders exactly one <h1> with id="hero-heading"', () => {
    render(<HeroSection />)
    const h1 = document.querySelector('h1#hero-heading')
    expect(h1).toBeInTheDocument()
    expect(document.querySelectorAll('h1').length).toBe(1)
  })

  test('TEST-HERO-004: HeroSection h1 has class "display" (FR-029)', () => {
    render(<HeroSection />)
    const h1 = document.querySelector('h1')
    expect(h1).toHaveClass('display')
  })

  test('TEST-HERO-005: HeroSection renders .hero__subtitle paragraph', () => {
    render(<HeroSection />)
    const subtitle = document.querySelector('p.hero__subtitle')
    expect(subtitle).toBeInTheDocument()
  })

  test('TEST-HERO-006: HeroSection renders .btn-primary button (FR-029)', () => {
    render(<HeroSection />)
    const primaryBtn = document.querySelector('.btn-primary')
    expect(primaryBtn).toBeInTheDocument()
  })

  test('TEST-HERO-007: HeroSection renders .btn-secondary button (FR-035)', () => {
    render(<HeroSection />)
    const secondaryBtn = document.querySelector('.btn-secondary')
    expect(secondaryBtn).toBeInTheDocument()
  })

  test('TEST-HERO-008: Primary CTA button shows default text "Get Started"', () => {
    render(<HeroSection />)
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  test('TEST-HERO-009: Secondary CTA button shows default text "Learn More"', () => {
    render(<HeroSection />)
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  test('TEST-HERO-010: HeroSection renders custom headline when prop provided', () => {
    render(<HeroSection headline="Custom Headline" />)
    expect(screen.getByText('Custom Headline')).toBeInTheDocument()
  })

  test('TEST-HERO-011: HeroSection renders custom subtitle when prop provided', () => {
    render(<HeroSection subtitle="Custom subtitle text" />)
    expect(screen.getByText('Custom subtitle text')).toBeInTheDocument()
  })

  test('TEST-HERO-012: Primary CTA fires onPrimaryCtaClick callback', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    render(<HeroSection onPrimaryCtaClick={mockClick} />)
    await user.click(screen.getByText('Get Started'))
    expect(mockClick).toHaveBeenCalledOnce()
  })

  test('TEST-HERO-013: Secondary CTA fires onSecondaryCtaClick callback', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    render(<HeroSection onSecondaryCtaClick={mockClick} />)
    await user.click(screen.getByText('Learn More'))
    expect(mockClick).toHaveBeenCalledOnce()
  })

  test('TEST-HERO-014: hero__actions wrapper contains both buttons', () => {
    render(<HeroSection />)
    const actions = document.querySelector('.hero__actions')
    expect(actions?.querySelectorAll('button').length).toBe(2)
  })
})
```

---

### 2.6 Footer Component Tests

**File:** `src/test/Footer.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import Footer from '../components/Footer'

describe('Footer Component — DOM Structure (FR-040, FR-041, FR-042)', () => {
  test('TEST-FOOT-001: Footer renders a <footer> element with .footer class', () => {
    render(<Footer />)
    const footer = document.querySelector('footer.footer')
    expect(footer).toBeInTheDocument()
  })

  test('TEST-FOOT-002: Footer renders .footer__inner wrapper', () => {
    render(<Footer />)
    expect(document.querySelector('.footer__inner')).toBeInTheDocument()
  })

  test('TEST-FOOT-003: Footer renders .footer__text paragraph (FR-041)', () => {
    render(<Footer />)
    expect(document.querySelector('p.footer__text')).toBeInTheDocument()
  })

  test('TEST-FOOT-004: Footer displays current year by default', () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })

  test('TEST-FOOT-005: Footer accepts custom copyrightYear', () => {
    render(<Footer copyrightYear={2024} />)
    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })

  test('TEST-FOOT-006: Footer accepts custom companyName', () => {
    render(<Footer companyName="TestCo" />)
    expect(screen.getByText(/TestCo/)).toBeInTheDocument()
  })

  test('TEST-FOOT-007: Footer displays default company name "ApplyDigital"', () => {
    render(<Footer />)
    expect(screen.getByText(/ApplyDigital/)).toBeInTheDocument()
  })
})
```

---

### 2.7 App Root Component Tests

**File:** `src/test/App.test.tsx`

```typescript
import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import App from '../App'

describe('App Root — Heading Hierarchy (NFR-005)', () => {
  test('TEST-APP-001: App renders exactly one <h1> element', () => {
    render(<App />)
    const h1Elements = document.querySelectorAll('h1')
    expect(h1Elements.length).toBe(1)
  })

  test('TEST-APP-002: App contains at least one <h2> element for sections', () => {
    render(<App />)
    const h2Elements = document.querySelectorAll('h2')
    expect(h2Elements.length).toBeGreaterThanOrEqual(1)
  })

  test('TEST-APP-003: No <h2> appears before the <h1> in DOM order', () => {
    render(<App />)
    const h1 = document.querySelector('h1')
    const firstH2 = document.querySelector('h2')
    if (h1 && firstH2) {
      const position = h1.compareDocumentPosition(firstH2)
      // DOCUMENT_POSITION_FOLLOWING = 4; h2 should follow h1
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
  })

  test('TEST-APP-004: App renders a <nav> landmark', () => {
    render(<App />)
    expect(document.querySelector('nav')).toBeInTheDocument()
  })

  test('TEST-APP-005: App renders a <main> landmark', () => {
    render(<App />)
    expect(document.querySelector('main')).toBeInTheDocument()
  })

  test('TEST-APP-006: App renders a <footer> landmark', () => {
    render(<App />)
    expect(document.querySelector('footer')).toBeInTheDocument()
  })

  test('TEST-APP-007: App renders tsc-compatible output (no TS errors in component tree)', () => {
    // This is validated by the build pipeline; here we verify no runtime errors
    expect(() => render(<App />)).not.toThrow()
  })
})