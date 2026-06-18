# Pseudocode & Algorithm Design
## Apple.com-Inspired Visual Style Redesign — SPEC-VISUAL-001

---

## 1. System Overview & Design Patterns

### Applicable Design Patterns

| Pattern | Application |
|---------|-------------|
| **Token Dictionary** | CSS custom properties as a static key-value store |
| **Composite Component** | NavBar, Hero, Card assembled from sub-elements |
| **Strategy Pattern** | Dark/light mode resolved via OS media query strategy |
| **Decorator Pattern** | Hover/focus states layered atop base component styles |
| **Template Method** | Each component follows: Base Styles → State Styles → Responsive Overrides |
| **Graceful Degradation** | `@supports` fallback for `backdrop-filter` |

---

## 2. Data Structures

### 2.1 Design Token Registry

```pseudocode
// DATA STRUCTURE: Token Registry
// Type: Static Dictionary (Key → Value)
// Justification: O(1) lookup by token name; immutable after definition;
//                maps directly to CSS custom property flat namespace.

STRUCTURE DesignTokenRegistry
  COLOUR_TOKENS : Map<String, String>
    // 10 entries — fixed size
    "color-bg-primary"     → "#ffffff"
    "color-bg-secondary"   → "#f5f5f7"
    "color-bg-tertiary"    → "#e8e8ed"
    "color-surface"        → "#ffffff"
    "color-text-primary"   → "#1d1d1f"
    "color-text-secondary" → "#6e6e73"
    "color-text-tertiary"  → "#86868b"
    "color-accent"         → "#0071e3"
    "color-accent-hover"   → "#0077ed"
    "color-border"         → "#d2d2d7"

  DARK_MODE_COLOUR_OVERRIDES : Map<String, String>
    // 10 entries — mirrors COLOUR_TOKENS keys
    "color-bg-primary"     → "#000000"
    "color-bg-secondary"   → "#1c1c1e"
    "color-bg-tertiary"    → "#2c2c2e"
    "color-surface"        → "#1c1c1e"
    "color-text-primary"   → "#f5f5f7"
    "color-text-secondary" → "#a1a1a6"
    "color-text-tertiary"  → "#6e6e73"
    "color-accent"         → "#2997ff"
    "color-accent-hover"   → "#47a7ff"
    "color-border"         → "#3a3a3c"

  TYPOGRAPHY_TOKENS : Map<String, String | Number>
    // 12 entries — fixed size
    "font-family-system"  → "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
    "font-size-display"   → "clamp(48px, 5vw, 80px)"
    "font-size-headline"  → "clamp(28px, 3vw, 48px)"
    "font-size-title-1"   → "clamp(22px, 2.5vw, 32px)"
    "font-size-title-2"   → "clamp(18px, 2vw, 24px)"
    "font-size-body"      → "17px"
    "font-size-callout"   → "15px"
    "font-size-caption"   → "12px"
    "font-weight-regular"  → 400
    "font-weight-medium"   → 500
    "font-weight-semibold" → 600
    "font-weight-bold"     → 700

  SPACING_TOKENS : Map<String, String>
    // 12 entries — follows 4px/8px increment grid
    "space-1"  → "4px"
    "space-2"  → "8px"
    "space-3"  → "16px"
    "space-4"  → "24px"
    "space-5"  → "32px"
    "space-6"  → "40px"
    "space-7"  → "48px"
    "space-8"  → "56px"
    "space-9"  → "64px"
    "space-10" → "80px"
    "space-11" → "88px"
    "space-12" → "96px"

  RADIUS_TOKENS : Map<String, String>
    // 4 entries
    "radius-sm"   → "6px"
    "radius-md"   → "12px"
    "radius-lg"   → "18px"
    "radius-pill" → "980px"

  BREAKPOINTS : Map<String, Integer>
    // 5 entries — viewport widths in px
    "xs" → 320
    "sm" → 768
    "md" → 1024
    "lg" → 1440
    "xl" → 1920
END STRUCTURE
```

> **Complexity:** Space O(N) where N = total token count (N = 10+10+12+12+4+5 = 53). All lookups O(1).

---

### 2.2 Component Descriptor

```pseudocode
// DATA STRUCTURE: Component Descriptor
// Type: Record (named tuple)
// Justification: Groups DOM structure, required CSS properties,
//                and state variants per component into a single
//                cohesive unit — mirrors BEM block definition.

STRUCTURE ComponentDescriptor
  name        : String           // BEM block name e.g. "nav-bar"
  domTag      : String           // HTML semantic element e.g. "nav", "section"
  ariaRole    : String           // ARIA role for accessibility
  ariaLabel   : String           // ARIA label string
  baseStyles  : Map<String, String>   // property → value (token references allowed)
  hoverStyles : Map<String, String>   // delta styles on :hover
  focusStyles : Map<String, String>   // delta styles on :focus-visible
  children    : List<ComponentDescriptor>  // sub-elements (BEM elements)
  responsive  : List<ResponsiveRule>       // breakpoint overrides
END STRUCTURE

STRUCTURE ResponsiveRule
  breakpoint  : String      // key from BREAKPOINTS map e.g. "sm"
  operator    : Enum { MAX, MIN }  // max-width or min-width
  styles      : Map<String, String>
END STRUCTURE
```

---

### 2.3 Validation Result

```pseudocode
// DATA STRUCTURE: ValidationResult
// Type: Discriminated union record
// Justification: Encapsulates pass/fail state and error list
//                for token and component validation algorithms.

STRUCTURE ValidationResult
  passed   : Boolean
  errors   : List<String>   // empty when passed = TRUE
  warnings : List<String>
END STRUCTURE
```

---

## 3. Core Algorithms

### 3.1 ALGORITHM: Build Design Token CSS Block

```pseudocode
// ALGORITHM: BUILD_TOKEN_CSS_BLOCK
// Purpose: Serialize the DesignTokenRegistry into a valid CSS :root block
//          and a @media dark-mode override block for src/index.css
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: cssOutput : String  (valid CSS text)
//
// Time Complexity:  O(N) where N = total token count (53)
// Space Complexity: O(N) for output string accumulation
//
// Design Pattern: Iterator over fixed-size dictionary

FUNCTION BUILD_TOKEN_CSS_BLOCK(registry : DesignTokenRegistry) : String
BEGIN
  cssOutput ← ""

  // --- Phase 1: Open :root block ---
  cssOutput ← cssOutput + ":root {\n"

  // --- Phase 2: Emit colour tokens ---
  cssOutput ← cssOutput + "  /* Backgrounds */\n"
  FOR EACH (key, value) IN registry.COLOUR_TOKENS DO
    cssOutput ← cssOutput + "  --" + key + ": " + value + ";\n"
  END FOR

  // --- Phase 3: Emit typography tokens ---
  cssOutput ← cssOutput + "\n  /* Typography */\n"
  FOR EACH (key, value) IN registry.TYPOGRAPHY_TOKENS DO
    cssOutput ← cssOutput + "  --" + key + ": " + value + ";\n"
  END FOR

  // --- Phase 4: Emit spacing tokens ---
  cssOutput ← cssOutput + "\n  /* Spacing */\n"
  FOR EACH (key, value) IN registry.SPACING_TOKENS DO
    cssOutput ← cssOutput + "  --" + key + ": " + value + ";\n"
  END FOR

  // --- Phase 5: Emit radius tokens ---
  cssOutput ← cssOutput + "\n  /* Border Radius */\n"
  FOR EACH (key, value) IN registry.RADIUS_TOKENS DO
    cssOutput ← cssOutput + "  --" + key + ": " + value + ";\n"
  END FOR

  // --- Phase 6: Close :root block ---
  cssOutput ← cssOutput + "}\n\n"

  // --- Phase 7: Emit dark mode override block ---
  cssOutput ← cssOutput + "@media (prefers-color-scheme: dark) {\n"
  cssOutput ← cssOutput + "  :root {\n"
  FOR EACH (key, value) IN registry.DARK_MODE_COLOUR_OVERRIDES DO
    cssOutput ← cssOutput + "    --" + key + ": " + value + ";\n"
  END FOR
  cssOutput ← cssOutput + "  }\n"
  cssOutput ← cssOutput + "}\n\n"

  // --- Phase 8: Emit reduced-motion block (NFR-013) ---
  cssOutput ← cssOutput + "@media (prefers-reduced-motion: reduce) {\n"
  cssOutput ← cssOutput + "  *, *::before, *::after {\n"
  cssOutput ← cssOutput + "    transition-duration: 0.01ms !important;\n"
  cssOutput ← cssOutput + "    animation-duration: 0.01ms !important;\n"
  cssOutput ← cssOutput + "  }\n"
  cssOutput ← cssOutput + "}\n"

  RETURN cssOutput
END FUNCTION
```

---

### 3.2 ALGORITHM: Validate Token Completeness

```pseudocode
// ALGORITHM: VALIDATE_TOKEN_COMPLETENESS
// Purpose: Verify that ALL required tokens from the spec are present
//          before CSS emission; catches missing/misspelled tokens early.
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: result   : ValidationResult
//
// Time Complexity:  O(R) where R = total required token count (fixed = 44)
// Space Complexity: O(R) for required-token lists
//
// Error Path: If any required token is absent → result.passed = FALSE
//             and the missing token name is appended to result.errors

FUNCTION VALIDATE_TOKEN_COMPLETENESS(registry : DesignTokenRegistry) : ValidationResult
BEGIN
  result ← ValidationResult { passed: TRUE, errors: [], warnings: [] }

  // Define required token sets (compile-time constants)
  REQUIRED_COLOUR_KEYS ← [
    "color-bg-primary", "color-bg-secondary", "color-bg-tertiary",
    "color-surface", "color-text-primary", "color-text-secondary",
    "color-text-tertiary", "color-accent", "color-accent-hover", "color-border"
  ]  // 10 items

  REQUIRED_DARK_KEYS ← REQUIRED_COLOUR_KEYS  // must mirror exactly

  REQUIRED_TYPOGRAPHY_KEYS ← [
    "font-family-system", "font-size-display", "font-size-headline",
    "font-size-title-1", "font-size-title-2", "font-size-body",
    "font-size-callout", "font-size-caption",
    "font-weight-regular", "font-weight-medium",
    "font-weight-semibold", "font-weight-bold"
  ]  // 12 items

  REQUIRED_SPACING_KEYS ← [
    "space-1","space-2","space-3","space-4","space-5","space-6",
    "space-7","space-8","space-9","space-10","space-11","space-12"
  ]  // 12 items

  // --- Check each required set against registry ---
  validationPairs ← [
    (REQUIRED_COLOUR_KEYS,    registry.COLOUR_TOKENS,            "colour"),
    (REQUIRED_DARK_KEYS,      registry.DARK_MODE_COLOUR_OVERRIDES, "dark-mode colour"),
    (REQUIRED_TYPOGRAPHY_KEYS, registry.TYPOGRAPHY_TOKENS,        "typography"),
    (REQUIRED_SPACING_KEYS,   registry.SPACING_TOKENS,            "spacing")
  ]

  FOR EACH (requiredKeys, tokenMap, category) IN validationPairs DO
    FOR EACH key IN requiredKeys DO
      IF key NOT IN tokenMap THEN
        result.errors.append("MISSING " + category + " token: --" + key)
        result.passed ← FALSE
      END IF
    END FOR
  END FOR

  // --- Value format sanity check: colours must start with '#' or 'rgb' ---
  FOR EACH (key, value) IN registry.COLOUR_TOKENS DO
    IF NOT (value STARTS_WITH "#" OR value STARTS_WITH "rgb") THEN
      result.errors.append("INVALID colour format for --" + key + ": " + value)
      result.passed ← FALSE
    END IF
  END FOR

  // --- Spacing value sanity check: values must end with 'px' ---
  FOR EACH (key, value) IN registry.SPACING_TOKENS DO
    IF NOT (value ENDS_WITH "px") THEN
      result.errors.append("INVALID spacing format for --" + key + ": " + value)
      result.passed ← FALSE
    END IF
  END FOR

  RETURN result
END FUNCTION
```

---

### 3.3 ALGORITHM: Validate No Hard-Coded Hex In Component CSS

```pseudocode
// ALGORITHM: VALIDATE_NO_HARDCODED_HEX
// Purpose: Scan App.css content for bare hex colour literals,
//          ensuring NFR-008 compliance (zero raw hex in App.css).
//
// INPUT:  cssContent : String   (raw text of src/App.css)
// OUTPUT: result     : ValidationResult
//
// Time Complexity:  O(L) where L = length of cssContent string
// Space Complexity: O(M) where M = number of regex matches found
//
// Algorithm: Linear scan via regex pattern matching
// Error Path: Any match → append offending line to result.errors

FUNCTION VALIDATE_NO_HARDCODED_HEX(cssContent : String) : ValidationResult
BEGIN
  result ← ValidationResult { passed: TRUE, errors: [], warnings: [] }

  HEX_PATTERN ← REGEX("#[0-9a-fA-F]{3,8}")
  // Matches 3, 4, 6, or 8-digit hex codes (including alpha variants)

  lines ← cssContent.SPLIT_BY_NEWLINE()
  lineNumber ← 0

  FOR EACH line IN lines DO
    lineNumber ← lineNumber + 1

    // Skip comment lines — they may legitimately document hex values
    trimmedLine ← line.TRIM()
    IF trimmedLine STARTS_WITH "/*" OR trimmedLine STARTS_WITH "//" THEN
      CONTINUE
    END IF

    IF HEX_PATTERN.MATCHES(trimmedLine) THEN
      result.errors.append(
        "Line " + lineNumber + ": hard-coded hex found → " + trimmedLine.TRIM()
      )
      result.passed ← FALSE
    END IF
  END FOR

  RETURN result
END FUNCTION
```

---

### 3.4 ALGORITHM: Generate NavBar Component

```pseudocode
// ALGORITHM: GENERATE_NAVBAR_COMPONENT
// Purpose: Produce the NavBar ComponentDescriptor and its
//          corresponding CSS rule strings for App.css.
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: descriptor : ComponentDescriptor
//         cssRules   : String
//
// Time Complexity:  O(1) — fixed structure, no iteration over variable data
// Space Complexity: O(1) — fixed number of CSS properties
//
// Design Pattern: Composite (inner + logo + links list)
//                 Decorator (hover state, @supports fallback)

FUNCTION GENERATE_NAVBAR_COMPONENT(registry : DesignTokenRegistry)
  : (ComponentDescriptor, String)
BEGIN
  // --- Build component descriptor ---
  descriptor ← ComponentDescriptor {
    name:      "nav-bar",
    domTag:    "nav",
    ariaRole:  "navigation",
    ariaLabel: "Main navigation",
    baseStyles: {
      "position"          : "sticky",
      "top"               : "0",
      "height"            : "44px",
      "background-color"  : "rgba(255,255,255,0.72)",
      "backdrop-filter"   : "saturate(180%) blur(20px)",
      "-webkit-backdrop-filter" : "saturate(180%) blur(20px)",
      "border-bottom"     : "1px solid var(--color-border)",
      "z-index"           : "1000"
    },
    children: [
      ComponentDescriptor {
        name:    "nav-bar__inner",
        domTag:  "div",
        baseStyles: {
          "max-width"       : "1200px",
          "margin-inline"   : "auto",
          "padding-inline"  : "var(--space-6)",
          "height"          : "100%",
          "display"         : "flex",
          "align-items"     : "center",
          "justify-content" : "space-between"
        }
      },
      ComponentDescriptor {
        name:    "nav-bar__logo",
        domTag:  "a",
        baseStyles: {
          "font-size"        : "var(--font-size-body)",
          "font-weight"      : "var(--font-weight-semibold)",
          "color"            : "var(--color-text-primary)",
          "text-decoration"  : "none",
          "letter-spacing"   : "-0.002em"
        }
      },
      ComponentDescriptor {
        name:    "nav-bar__links",
        domTag:  "ul",
        baseStyles: {
          "display"     : "flex",
          "gap"         : "var(--space-6)",
          "list-style"  : "none",
          "margin"      : "0",
          "padding"     : "0"
        }
      },
      ComponentDescriptor {
        name:    "nav-bar__link",
        domTag:  "a",
        baseStyles: {
          "font-size"       : "var(--font-size-callout)",
          "color"           : "var(--color-text-secondary)",
          "text-decoration" : "none",
          "transition"      : "color 200ms ease"
        },
        hoverStyles: {
          "color" : "var(--color-text-primary)"
        },
        focusStyles: {
          "outline"        : "3px solid var(--color-accent)",
          "outline-offset" : "2px",
          "border-radius"  : "var(--radius-sm)"
        }
      }
    ]
  }

  // --- Emit CSS rules ---
  cssRules ← EMIT_COMPONENT_CSS(descriptor)

  // --- Append @supports fallback (NFR-007) ---
  cssRules ← cssRules + "\n"
  cssRules ← cssRules + "@supports not (backdrop-filter: blur(1px)) {\n"
  cssRules ← cssRules + "  .nav-bar {\n"
  cssRules ← cssRules + "    background-color: rgba(255,255,255,0.95);\n"
  cssRules ← cssRules + "  }\n"
  cssRules ← cssRules + "}\n"

  RETURN (descriptor, cssRules)
END FUNCTION
```

---

### 3.5 ALGORITHM: Generate Hero Section Component

```pseudocode
// ALGORITHM: GENERATE_HERO_COMPONENT
// Purpose: Produce the Hero section ComponentDescriptor and CSS rules.
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: descriptor : ComponentDescriptor
//         cssRules   : String
//
// Time Complexity:  O(1)
// Space Complexity: O(1)

FUNCTION GENERATE_HERO_COMPONENT(registry : DesignTokenRegistry)
  : (ComponentDescriptor, String)
BEGIN
  descriptor ← ComponentDescriptor {
    name:      "hero",
    domTag:    "section",
    ariaRole:  "region",
    ariaLabel: "hero-heading",  // aria-labelledby reference
    baseStyles: {
      "background-color" : "var(--color-bg-primary)",
      "text-align"       : "center",
      "padding-top"      : "120px",
      "padding-bottom"   : "120px"
    },
    children: [
      ComponentDescriptor {
        name:    "hero__inner",
        domTag:  "div",
        baseStyles: {
          "max-width"     : "800px",
          "margin-inline" : "auto",
          "padding-inline": "var(--space-5)"
        }
      },
      ComponentDescriptor {
        // .display heading — BEM modifier on typography class
        name:    "display",
        domTag:  "h1",
        baseStyles: {
          "font-size"      : "var(--font-size-display)",
          "font-weight"    : "var(--font-weight-bold)",
          "letter-spacing" : "-0.003em",
          "color"          : "var(--color-text-primary)",
          "line-height"    : "1.05",
          "margin-bottom"  : "var(--space-4)"
        }
      },
      ComponentDescriptor {
        name:    "hero__subtitle",
        domTag:  "p",
        baseStyles: {
          "font-size"     : "var(--font-size-headline)",
          "font-weight"   : "var(--font-weight-regular)",
          "color"         : "var(--color-text-secondary)",
          "line-height"   : "1.381",
          "margin-bottom" : "var(--space-6)"
        }
      },
      ComponentDescriptor {
        name:    "hero__actions",
        domTag:  "div",
        baseStyles: {
          "display"        : "flex",
          "gap"            : "var(--space-3)",
          "justify-content": "center",
          "flex-wrap"      : "wrap"
        }
      }
    ],
    responsive: [
      ResponsiveRule {
        breakpoint : "sm",    // < 768px
        operator   : MAX,
        styles: {
          "padding-top"    : "var(--space-8)",   // 56px
          "padding-bottom" : "var(--space-8)"
        }
      }
    ]
  }

  cssRules ← EMIT_COMPONENT_CSS(descriptor)
  RETURN (descriptor, cssRules)
END FUNCTION
```

---

### 3.6 ALGORITHM: Generate Button Components

```pseudocode
// ALGORITHM: GENERATE_BUTTON_COMPONENTS
// Purpose: Produce CSS for .btn-primary and .btn-secondary.
//          Both components share base reset styles.
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: cssRules : String
//
// Time Complexity:  O(1)
// Space Complexity: O(1)

FUNCTION GENERATE_BUTTON_COMPONENTS(registry : DesignTokenRegistry) : String
BEGIN
  cssRules ← ""

  // --- Shared button reset ---
  cssRules ← cssRules + EMIT_CSS_RULE(".btn-primary, .btn-secondary", {
    "display"         : "inline-flex",
    "align-items"     : "center",
    "justify-content" : "center",
    "cursor"          : "pointer",
    "text-decoration" : "none",
    "font-family"     : "var(--font-family-system)",
    "font-size"       : "17px",
    "line-height"     : "1",
    "border"          : "none"
  })

  // --- Primary button base ---
  cssRules ← cssRules + EMIT_CSS_RULE(".btn-primary", {
    "background-color" : "var(--color-accent)",
    "color"            : "#ffffff",
    "border-radius"    : "var(--radius-pill)",
    "padding"          : "12px 22px",
    "font-weight"      : "var(--font-weight-regular)",
    "transition"       : "background-color 250ms ease"
  })
  // NOTE: "#ffffff" on button text is exempt from NFR-008 per spec —
  //       white on accent blue is architecturally required and has
  //       no CSS token equivalent (pure white constant).
  // ALTERNATIVE: define --color-always-white token if strict zero-hex enforced.

  // --- Primary button hover ---
  cssRules ← cssRules + EMIT_CSS_RULE(".btn-primary:hover", {
    "background-color" : "var(--color-accent-hover)"
  })

  // --- Primary button focus-visible (NFR-004) ---
  cssRules ← cssRules + EMIT_CSS_RULE(".btn-primary:focus-visible", {
    "outline"        : "3px solid var(--color-accent)",
    "outline-offset" : "2px"
  })

  // --- Secondary button ---
  cssRules ← cssRules + EMIT_CSS_RULE(".btn-secondary", {
    "background-color" : "transparent",
    "color"            : "var(--color-accent)",
    "border-radius"    : "var(--radius-pill)",
    "padding"          : "12px 22px",
    "font-weight"      : "var(--font-weight-regular)",
    "transition"       : "color 200ms ease"
  })

  cssRules ← cssRules + EMIT_CSS_RULE(".btn-secondary:hover", {
    "color" : "var(--color-accent-hover)"
  })

  cssRules ← cssRules + EMIT_CSS_RULE(".btn-secondary:focus-visible", {
    "outline"        : "3px solid var(--color-accent)",
    "outline-offset" : "2px"
  })

  RETURN cssRules
END FUNCTION
```

---

### 3.7 ALGORITHM: Generate Card Component

```pseudocode
// ALGORITHM: GENERATE_CARD_COMPONENT
// Purpose: Produce the Card and Card Grid CSS rules.
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: cssRules : String
//
// Time Complexity:  O(1)
// Space Complexity: O(1)

FUNCTION GENERATE_CARD_COMPONENT(registry : DesignTokenRegistry) : String
BEGIN
  cssRules ← ""

  // --- Card grid container ---
  cssRules ← cssRules + EMIT_CSS_RULE(".card-grid", {
    "display"               : "grid",
    "grid-template-columns" : "repeat(auto-fit, minmax(280px, 1fr))",
    "gap"                   : "var(--space-4)"   // 24px per token table
  })

  // --- Card base ---
  cssRules ← cssRules + EMIT_CSS_RULE(".card", {
    "background-color" : "var(--color-bg-secondary)",
    "border-radius"    : "var(--radius-lg)",
    "padding"          : "var(--space-6)",        // 40px per token table
    "box-shadow"       : "none",
    "transition"       : "box-shadow 300ms ease, transform 300ms ease"
  })

  // --- Card hover ---
  cssRules ← cssRules + EMIT_CSS_RULE(".card:hover", {
    "box-shadow" : "0 4px 20px rgba(0,0,0,0.08)",
    "transform"  : "translateY(-2px)"
  })

  // --- Card title ---
  cssRules ← cssRules + EMIT_CSS_RULE(".card__title", {
    "font-size"      : "var(--font-size-title-1)",
    "font-weight"    : "var(--font-weight-semibold)",
    "color"          : "var(--color-text-primary)",
    "letter-spacing" : "-0.002em",
    "margin-bottom"  : "var(--space-2)"
  })

  // --- Card body ---
  cssRules ← cssRules + EMIT_CSS_RULE(".card__body", {
    "font-size"   : "var(--font-size-body)",
    "color"       : "var(--color-text-secondary)",
    "line-height" : "1.47059"
  })

  RETURN cssRules
END FUNCTION
```

---

### 3.8 ALGORITHM: Generate Footer Component

```pseudocode
// ALGORITHM: GENERATE_FOOTER_COMPONENT
// Purpose: Produce footer CSS rules.
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: cssRules : String
//
// Time Complexity:  O(1)
// Space Complexity: O(1)

FUNCTION GENERATE_FOOTER_COMPONENT(registry : DesignTokenRegistry) : String
BEGIN
  cssRules ← ""

  cssRules ← cssRules + EMIT_CSS_RULE(".footer", {
    "background-color" : "var(--color-bg-secondary)",
    "border-top"       : "1px solid var(--color-border)",
    "padding-block"    : "var(--space-7)"
  })

  cssRules ← cssRules + EMIT_CSS_RULE(".footer__inner", {
    "max-width"      : "1200px",
    "margin-inline"  : "auto",
    "padding-inline" : "var(--space-6)"
  })

  cssRules ← cssRules + EMIT_CSS_RULE(".footer__text", {
    "font-size"   : "var(--font-size-caption)",
    "color"       : "var(--color-text-secondary)",
    "line-height" : "1.33333"
  })

  RETURN cssRules
END FUNCTION
```

---

### 3.9 ALGORITHM: Generate Global Base Styles

```pseudocode
// ALGORITHM: GENERATE_GLOBAL_BASE_STYLES
// Purpose: Emit body, *, content-wrapper, and section-level
//          base styles for index.css global scope.
//
// INPUT:  registry : DesignTokenRegistry
// OUTPUT: cssRules : String
//
// Time Complexity:  O(1)
// Space Complexity: O(1)

FUNCTION GENERATE_GLOBAL_BASE_STYLES(registry : DesignTokenRegistry) : String
BEGIN
  cssRules ← ""

  // --- Box-sizing reset ---
  cssRules ← cssRules + EMIT_CSS_RULE("*, *::before, *::after", {
    "box-sizing" : "border-box",
    "margin"     : "0",
    "padding"    : "0"
  })

  // --- Body base ---
  cssRules ← cssRules + EMIT_CSS_RULE("body", {
    "font-family"      : "var(--font-family-system)",
    "font-size"        : "var(--font-size-body)",       // 17px
    "line-height"      : "1.47059",
    "color"            : "var(--color-text-primary)",
    "background-color" :