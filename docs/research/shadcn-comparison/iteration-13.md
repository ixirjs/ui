# Iteration 13 — Misuse / error-handling DX

_Date: 2026-06-22 · Focus: what happens when a consumer misuses the API. This is a svelte-atoms-specific risk surface — shadcn has no runtime contract (it's just your vendored code), so there's nothing to misuse and nothing to throw cryptic errors. The flip side: svelte-atoms can give *better* guidance than shadcn if its errors are good._

## The framing

shadcn can't have "used outside its root" or "wrong preset key" errors because it has no context system and no preset registry — your mistakes are ordinary Svelte/TS mistakes in code you own. svelte-atoms has a runtime contract, so misuse DX is a real axis: done well it's a **help** shadcn can't offer; done poorly it's friction shadcn doesn't have.

## Findings — three tiers of quality

### ✅ Modern `defineBond` families: excellent (matches Radix/bits-ui)

`getOrThrow` (`shared/bond/bond.svelte.ts:228-237`) is the SSOT; every modern part passes a component-specific message:

> `<Collapsible.Header /> must be used within a <Collapsible.Root />`

**68 named "must be used within" messages across 61 files** (dialog, drawer, popover, collapsible, datagrid, combobox, date-picker, + bond-level deps in datagrid/accordion/stepper/select). Prefixed `[svelte-atoms]`, consistent template. This is **on par with mature headless libraries** — and strictly better than shadcn, which throws a raw `undefined` deref if you mis-wire your own copied code.

### ⚠️ Legacy prop-builder families: silent degradation 🔴

`Bond.get()` (`bond.svelte.ts:223-225`) returns `undefined` with no throw/warn. **67 part files use non-throwing `.get()`** — the **alert, card, calendar** families (the prop-builder migration debt). Used outside their root they **silently render unstyled-but-no-wiring** via optional chaining (`card-title.svelte:6` → `bond?.title()`). Not a crash, but _harder to diagnose than an explicit throw_ — the consumer sees a half-working component and no clue why.

### 🔴 Preset keys: the single highest-value gap

`PresetKey` (`context/preset.svelte.ts:197`) is `PresetModuleName | (string & {}) | [...]` — the `(string & {})` escape hatch means **a typo like `preset="buttn"` type-checks fine** (autocomplete suggests the ~190 real keys but doesn't reject typos). At runtime `resolvePreset` (`resolvers.ts:21-32`) → `getPreset` returns `undefined` → element renders **unstyled with zero diagnostics**. A mistyped preset key = silent broken styling, no warning. This is the most likely everyday consumer mistake and currently the worst-diagnosed.

### Dev/prod guards (context)

**11 `throw new Error`** (always on) + **7 `console.warn`** (8 sites `import.meta.env?.DEV`-guarded), no `console.error`. Well-written, `[svelte-atoms]`-prefixed, often name the bond id/slot — **but they target internal _authoring_ mistakes** (capability wiring, roles, teleport ids), not everyday _consumer_ mistakes (wrong preset key, legacy missing-root).

## shadcn comparison takeaways

**Where svelte-atoms already wins:** descriptive "must be used within" errors are a genuine DX _advantage_ over shadcn for the modern families — shadcn users debugging a mis-wired copy get a raw undefined error with no guidance. **Market this**: "components tell you when they're misused."

**Where to close gaps (turn the runtime contract from a liability into a help):**
| # | Action | Why | Effort |
|---|---|---|---|
| 13.1 | **DEV warn in `getPreset`/`resolvePreset` for unknown preset keys** (suggest nearest key) | the most common consumer mistake, currently silent | low ⭐⭐ |
| 13.2 | **Migrate legacy `.get()` parts (alert/card/calendar) to `getOrThrow`** | makes them fail loudly like everything else; also clears known migration debt | medium ⭐ |
| 13.3 | **Normalize the ~10% off-convention messages** (combobox/datagrid drop the `[svelte-atoms]` prefix + `<X.Part/>` brackets) | full consistency | trivial |
| 13.4 | **A "troubleshooting/common errors" docs page** mapping each error → cause → fix | turns good errors into great DX | low |

### Note on the preset-key warn (13.1)

A DEV-only Levenshtein "did you mean `button`?" against `PresetModuleMap` keys would be high-delight, low-cost, and is **only possible because svelte-atoms has a registry** — shadcn structurally can't offer it. This is a place to _lean into_ the architecture, not just patch a gap.

## Roadmap deltas (feed into iter-12 v2)

- **Tier 0:** 13.3 (normalize messages — trivial).
- **Tier 1:** 13.1 (preset-key DEV warn ⭐⭐) + 13.4 (troubleshooting page).
- **Tier 2/3:** 13.2 (legacy `.get()`→`getOrThrow` migration — rides along with the prop-builder→atom migration already on the books).

## Meta-pattern (continues iter 12's)

Same shape again: the _good_ error infrastructure already exists (`getOrThrow`, DEV-warn helpers, `[svelte-atoms]` convention) — the gaps are **unwired legacy parts** and **one un-validated surface (preset keys)**. Activation + one new DEV warn, not new architecture.

## Open threads remaining

- [ ] Runtime cost of the bond/context model at scale (many components on a page) vs shadcn static markup.
- [ ] TypeScript inference quality — does `defineBond`/generic-bond give good autocomplete, or `any`-leaks?
- [ ] Tree-shaking real-world measurement (actual byte sizes of a small app) — partly covered iter 5, could measure.
