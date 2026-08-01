# Iteration 11 — RTL / i18n + keyboard-interaction completeness

_Date: 2026-06-22 · Focus: two areas where bits-ui (shadcn's engine) is strong — directional (RTL) awareness and full WAI-ARIA keyboard patterns. These surfaced the most serious a11y gaps of the whole comparison._

## Part A — RTL / i18n: essentially absent 🔴

| Concern                     | bits-ui (shadcn)                         | svelte-atoms                                                                                                                                                               |
| --------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dir` awareness             | reads `dir`, flips arrow nav + placement | ❌ **none** (`[dir=` 0 hits, `ltr` 0 hits; the 1 `rtl` hit is a CSS slider-fill trick)                                                                                     |
| Horizontal arrow nav in RTL | flips Left/Right                         | ❌ `navigation.svelte.ts:40-41` hardcodes `ArrowRight→next`, `ArrowLeft→prev`                                                                                              |
| Popover placement in RTL    | logical start/end, RTL-aware             | ❌ floating-ui used but **no direction context passed** → start/end resolve LTR                                                                                            |
| Drawer side                 | logical inline-start/end possible        | ❌ physical `left/right/top/bottom` only                                                                                                                                   |
| Localizable text            | locale plumbing                          | ⚠️ **25 hardcoded English `aria-label`s** in lib; date formatting hardcoded `en-US` (`date-picker-header.svelte:20`); calendar uses date-fns but **never passes `locale`** |
| Sole i18n hook              | —                                        | `input-currency-control.svelte` (`Intl.NumberFormat` + `locale` prop) — the only localized component                                                                       |

**shadcn strengths to adopt:**

1. **A `dir` context + RTL-aware navigation.** Add a `direction` to the root context (auto-detect from `getComputedStyle(el).direction` or explicit prop); branch the horizontal arrow keys in `navigation.svelte.ts` on it; pass `rtl` to floating-ui and add logical `inline-start/inline-end` to drawer/popover. _Medium effort, opens the whole RTL market bits-ui already serves._ ⭐
2. **A localization seam** — a `messages`/`labels` context (or per-component label props) so the 25 hardcoded `aria-label`s ("Previous month", "Increment", …) are overridable; thread a `locale` into calendar/date-picker (date-fns `locale` + `toLocaleDateString(locale)`). _Medium, table-stakes for non-English consumers._ ⭐

## Part B — Keyboard completeness: the shared capability exists but is mostly unwired 🔴

`navigation` + `roving` capabilities provide reusable arrow/Home/End — **but only dropdown-menu wires them up.** Tabs, tree, accordion ignore them despite the code sitting right there.

| Component               | Arrows    | Home/End     | Typeahead | Notable gap                                                                 |
| ----------------------- | --------- | ------------ | --------- | --------------------------------------------------------------------------- |
| dropdown / context menu | ✅        | ❌ gated off | ❌        | no submenu; Tab doesn't close                                               |
| select / combobox       | ✅        | ❌           | ❌        | (confirmed iter 2)                                                          |
| **tabs**                | ❌        | ❌           | ❌        | 🔴 **click-only**, no roving; orientation hardcoded horizontal              |
| slider                  | ✅ native | ✅ native    | n/a       | PageUp/PageDown missing                                                     |
| dialog                  | n/a       | n/a          | n/a       | ✅ compliant (Tab trap + Esc)                                               |
| **tree**                | ❌        | ❌           | ❌        | 🔴 **no keyboard at all** (pointerdown-only)                                |
| **accordion**           | ❌        | ❌           | n/a       | 🔴 native button Enter/Space only; **zero keyboard if rendered non-button** |

### The three serious offenders

- **Tabs are click-only** (`tabs/tab/bond.svelte.ts:52-61` defines only `onclick`). APG requires Left/Right + Home/End + roving tabindex + orientation. This is a baseline a11y failure bits-ui passes.
- **Tree has no keyboard handling** (`tree/bond.svelte.ts` sets roles/tabindex but wires zero handlers) — missing Up/Down, Right=expand/Left=collapse, Home/End, typeahead.
- **Accordion**: only works via native `<button>` Enter/Space; rendered as a non-button (`tabindex=0`) it has **no keyboard activation at all**, and no Up/Down/Home/End between headers.

### shadcn/APG strengths to adopt

1. **Wire the existing `navigation`+`roving` capabilities into tabs, tree, and accordion.** The infrastructure already exists and is tested — this is _activation, not invention_. Highest a11y ROI in the whole comparison. ⭐⭐
2. **Enable Home/End across the menu family** (same gated-off flag from iter 2). ⭐
3. **Add typeahead** (iter 2 thread) — benefits menu + select + tree once shared. ⭐
4. **Slider PageUp/PageDown** large-step + **menu submenu** support (Right/Left). medium.
5. **Tab key closes menus** (standard menu behavior). low.

## Why this matters for the thesis

svelte-atoms markets "accessible" first in its README and owns its behavior stack (vs shadcn outsourcing to bits-ui). But this iteration shows **bits-ui actually delivers more complete keyboard + RTL behavior today** — tabs/tree/accordion keyboard, RTL nav, localized labels. The good news: svelte-atoms already built the hard part (the `navigation`/`roving`/`selection` capability models). The gap is **wiring + a direction/locale seam**, not architecture. Closing it flips "accessible" from aspiration to a defensible claim _ahead_ of shadcn (because capabilities make it uniform once wired).

## Roadmap deltas (feed into iter-8 synthesis)

| #    | Action                                                                                          | Tier | Effort                         |
| ---- | ----------------------------------------------------------------------------------------------- | ---- | ------------------------------ |
| 11.1 | **Wire navigation+roving into tabs, tree, accordion**                                           | 1    | medium ⭐⭐ (biggest a11y ROI) |
| 11.2 | **RTL: `dir` context + flip horizontal nav + pass `rtl` to floating-ui + logical drawer sides** | 2    | medium ⭐                      |
| 11.3 | **Localization seam** (overridable labels + calendar/date `locale`)                             | 2    | medium ⭐                      |
| 11.4 | Enable Home/End (menu family) + typeahead (shared)                                              | 1    | low/med                        |
| 11.5 | Slider PageUp/PageDown; menu submenu; Tab-closes-menu                                           | 3    | med                            |

## Open threads remaining

- [ ] Custom-component authoring DX on the atom/bond kernel vs copying a shadcn file (the authoring curve).
- [ ] Refresh the iter-8 synthesis roadmap with iters 9, 10, 11 deltas (now overdue again).
- [x] ~~Verify tabs/tree/accordion keyboard findings~~ **CONFIRMED**: grep shows zero `onkeydown`/keyboard handlers in tabs, tree, accordion, and `navigationCapability` is wired into none of them.
