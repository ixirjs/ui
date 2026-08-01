# Iteration 12 — Custom-component authoring DX + refreshed roadmap (v2)

_Date: 2026-06-22 · Focus: how hard it is to author a NEW component on the kernel vs editing a copied shadcn file, and a consolidated roadmap update folding in iters 9–11._

## Part A — Authoring DX: bimodal

shadcn's authoring pitch is "you know Svelte; here are ~50 lines; edit them" — zero framework concepts. svelte-atoms splits sharply in two:

### Tier A — stateless / single-element (≈ shadcn-simple ✅)

Smallest real interactive: `switch/` — 79-line `switch.svelte` + 22-line `types.ts` + 2-line `index.ts`. `divider/` is 40 lines. **Concepts: ~4** (`HtmlAtom`, `mergePresetProps`, `$preset` sentinel, preset-key convention). One file, same order of magnitude as a shadcn switch. **Genuinely competitive.**

### Tier B — stateful / multi-part (steep 🔴)

Smallest bonded component: `collapsible/` — **11 files, 667 lines.** Concepts a developer must hold _simultaneously_: `Bond`, `BondState`/`DisclosureState`, per-slot `legacy Bond-owned Atom` subclasses, `defineBond` + role map, the trigger↔content `capability`, `bindBond` + reactive cells, `.share()`/`.getOrThrow()`, `mergeAtomProps` vs `mergePresetProps`, `$preset`, `atoms.ts` namespace, `BondOf`/`ViewOf`/`StateOf`, and the "never mint `createAttachmentKey()` in a getter" invariant. **≈12–14 interlocking concepts, 8–11 files, before anything renders.** No shallow version exists — even the simplest stateful component pulls in a capability + a 4-slot atom map.

### The two real gaps vs shadcn

1. **No scaffolding generator.** `package.json` has no `plop`/`hygen`/`create-component`; `scripts/` only has `sync-props.mjs` (docs) + inventory greps. The _only_ template is CLAUDE.md's "copy the nearest sibling." 🔴
2. **No single end-to-end recipe.** Conceptual docs are actually **better than shadcn's** (877-line bonds tutorial, 295-line extending guide, atoms page, 12 ADRs) — but **scattered across 3–4 pages + ADRs + CONTEXT.md + CLAUDE.md.** There's no "build your first component in 10 minutes" with a finished file tree.

### Boilerplate is ~70% mechanical → a generator is the highest-leverage author DX fix

For Tier B, generatable: all barrels (`index.ts`/`atoms.ts`), the `*Props`/`*ExtendProps` interfaces, every part component (identical 28–29-line `getOrThrow → bond.atom() → mergeAtomProps → <HtmlAtom>` shape), the `legacy Bond-owned Atom` subclass constructors, and the `defineBond` map. Genuinely custom (~20%): `attrs`/`handlers` ARIA+keyboard logic, `BondState` methods, capability choice, motion, markup.

→ **A `plop`/`hygen` scaffolder taking `name` + `slots[]` (with `role`) emits ~70% of a stateful component.** Collapses the file-count shock, formalizes the "copy a sibling" workflow, and (bonus) makes external contribution viable. ⭐⭐ for contributor DX.

### shadcn strengths to adopt (authoring)

| #    | Action                                                                                                          | Effort      |
| ---- | --------------------------------------------------------------------------------------------------------------- | ----------- |
| 12.1 | **Internal component scaffolder** (`plop`/`hygen`: name + slots → barrels, types, parts, atoms, defineBond map) | medium ⭐⭐ |
| 12.2 | **Single "build your first component" end-to-end recipe** (Tier A then Tier B, finished file tree)              | low ⭐      |
| 12.3 | Document the Tier-A path explicitly as "the easy 80%" so contributors don't assume every component needs a Bond | low         |

### Where svelte-atoms already wins (authoring)

- Conceptual docs depth (bonds/extending/atoms/capabilities + 12 ADRs) — shadcn has none because the source _is_ the doc.
- Tier-A authoring is nearly as simple as shadcn while still getting presets/variants for free.

---

## Part B — Refreshed consolidated roadmap (v2, supersedes iter-8 tiers)

Folding in iters 9 (motion), 10 (perf/API), 11 (RTL/keyboard), 12 (authoring). **Re-ranked by impact × (1/effort), a11y correctness weighted up.**

### Tier 0 — trivial, ship now (pure wins)

- 0.1 Move `@modelcontextprotocol/sdk` + `mcp-handler` + `lucide-svelte` → devDependencies _(iter 5,7)_
- 0.2 Enable **Home/End** for select/combobox + menu family (config flip; model exists) _(iter 2,11)_
- 0.3 Deep-import docs note (`/<component>`) _(iter 5)_
- 0.4 Demote memo-engine internals out of `./utils` (`@internal`) _(iter 10)_
- 0.5 Document `<Icon src={...} />` BYO convention _(iter 7)_

### Tier 1 — high impact, low/medium effort

- **1.1 Wire `navigation`+`roving` into tabs, tree, accordion** — 🔴 biggest a11y ROI; infra already built+tested, just unwired _(iter 11)_ ⭐⭐
- 1.2 **`Field.Error` component** — closes forms gap + dangling-`aria-errormessage` a11y bug _(iter 3)_ ⭐⭐
- 1.3 **Emit `data-state`/`data-open` on all disclosure/overlay content** — unlocks CSS-animation opt-out _(iter 9)_ ⭐⭐
- 1.4 **Export `ThemeProvider`+`ThemeToggle`+FOUC script from `$lib`** — theming runtime is stranded in docs app _(iter 4,6)_ ⭐⭐
- 1.5 **Exports-snapshot/api-extractor + `.changeset/`+CHANGELOG** — makes the marketed upgrade-path credible _(iter 10)_ ⭐⭐
- 1.6 **Body scroll-lock capability** for modals _(iter 2)_ ⭐
- 1.7 **Thread `reducedMotion()` into the motion host** — a11y, fixes all factories at once _(iter 9)_ ⭐
- 1.8 **`buttonClasses()` class-resolver / `Button` `href` mode** — match `buttonVariants` ergonomics _(iter 7)_ ⭐
- 1.9 **"Coming from shadcn" migration guide** (token reuse + cva→preset + name map) _(iter 6,3)_ ⭐⭐

### Tier 2 — flagship, medium effort

- 2.1 **CLI/registry (config-not-source)**: `init`/`add`/`theme` from `PresetModuleMap` _(iter 1,3,4,5)_ ⭐⭐
- 2.2 **Theme generator page** on docs _(iter 4)_ ⭐
- 2.3 **Component scaffolder** (`plop`/`hygen`) for contributors _(iter 12)_ ⭐⭐
- 2.4 **Auto-wire `validate()`** (submit default + blur/input) + dirty/touched/pristine _(iter 3)_ ⭐
- 2.5 **Typeahead model** (menu+select+tree) _(iter 2,11)_ ⭐
- 2.6 **RTL: `dir` context + flip horizontal nav + `rtl` to floating-ui + logical drawer sides** _(iter 11)_ ⭐
- 2.7 **Localization seam** (overridable labels + calendar/date `locale`) _(iter 11)_ ⭐
- 2.8 Storybook play functions (addons installed) _(iter 6)_

### Tier 3 — coverage & polish

- New components: Skeleton, Toggle/Toggle-Group, Aspect-Ratio, Hover-Card, Alert-Dialog (fuse), Pagination _(iter 3)_
- `@qrcode-js` optional+lazy; `date-fns` → peer eval _(iter 5)_
- Finish ~14 undocumented components; 2–4 prebuilt theme presets _(iter 4)_
- Harden focus trap (sentinels); valibot adapter; broaden E2E; slider PageUp/Down; menu submenu; Tab-closes-menu _(iter 2,3,6,9,11)_
- Fix dead calendar range mode → Range-Calendar parity _(iter 3)_
- Resolve choreography doc/reality drift _(iter 9)_; keep perf baseline+benches in CI _(iter 10)_

### Suggested sprints

1. **A — On-ramp:** all Tier 0 + 1.4 + 1.5 + 1.9 → smaller install, credible upgrade path, themeable from `$lib`, migration story.
2. **B — A11y correctness:** 1.1 + 1.2 + 1.3 + 1.6 + 1.7 + 2.4 + 2.5 → keyboard/forms/motion reach + exceed bits-ui.
3. **C — Flagship:** 2.1 (consumer CLI) + 2.2 (theme gen) + 2.3 (author scaffolder) → adoption + contribution unlock.
4. **D — Reach:** 2.6 + 2.7 (RTL/i18n) + Tier 3.

## Meta-pattern (the whole study in one line)

**svelte-atoms's architecture is ahead of shadcn; its _packaging, wiring, and on-ramps_ lag.** Almost every gap is "the capability exists but isn't wired/exported/documented" (keyboard, Home/End, theme runtime, reduced-motion, scroll-lock) rather than "needs new architecture." That makes the roadmap unusually high-ROI: mostly activation, not invention.

## Open threads remaining

- [ ] Performance of a realistic page (many components) — runtime cost of the bond/context model at scale vs shadcn's static markup.
- [ ] Error messages / DX when a consumer misuses the API (missing context, wrong preset key).
- [ ] Community/ecosystem signals (since this is product strategy, may be out of code scope).
