# Iteration 16 — FINAL synthesis: shadcn-svelte ↔ @svelte-atoms/core

_Date: 2026-06-22 · The capstone. A standalone consolidation of iterations 1–15. Read this alone for the full picture; the numbered iterations are the evidence._

---

## 1. The core difference in one paragraph

shadcn-svelte and @svelte-atoms/core share the **same visual DNA** — identical oklch CSS-variable token contract, Tailwind, cva-style variants — but invert the philosophy. **shadcn ships source you vendor and own** (CLI copies ~50-line files into your repo; behavior comes from bits-ui; zero runtime deps; no package API to break). **svelte-atoms ships an installed, versioned package** with a class-based **Bond / BondState / legacy Bond-owned Atom / Capability** runtime, a context-driven per-slot **preset** theming layer, and a heavily-memoized presentation kernel.

## 2. The meta-pattern (the single most important finding)

Across **13 of 15** iterations the same shape recurred:

> **svelte-atoms's architecture is ahead of shadcn; its packaging, wiring, and on-ramps lag.**

Almost every gap is _"the capability exists but isn't wired, exported, or documented"_ — **activation, not invention**. Examples: the keyboard `navigation`/`roving` capabilities are built + tested but unwired in tabs/tree/accordion; the `Theme` provider and FOUC script work but live in the docs app, not `$lib`; Home/End is implemented but gated off; `reducedMotion()` exists but only one factory reads it; scroll-lock, typeahead, `data-state` — all near-misses on existing infrastructure.

**Exactly one gap is true invention:** _virtualization_ for large collections (iter 15). Everything else is reachable by wiring/exporting/documenting what already exists. This makes the roadmap unusually high-ROI.

## 3. Where svelte-atoms genuinely BEATS shadcn (defend + market these)

| Advantage                                  | Evidence                                             | shadcn can't match because…                                   |
| ------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------- |
| **Real upgrade path**                      | versioned npm package (iter 1)                       | vendored source drifts; fixes don't propagate                 |
| **Single owned behavior model**            | Bond/atom/capability (iter 1,2)                      | shadcn outsources behavior to bits-ui (two-library debugging) |
| **Per-slot, state-reactive presets**       | `(bond) => record` (iter 4)                          | cva is static; can't style by component state                 |
| **`fuse` stateful composition**            | `popover-dialog = fuse(Popover, Dialog)` (iter 7)    | no shared-bond mechanism exists                               |
| **Preset-driven `base`/`as` polymorphism** | themes repolymorphize parts (iter 7)                 | bits-ui `child` is call-site only                             |
| **`height:auto` + runtime-geometry FLIP**  | dialog grows from trigger (iter 9)                   | CSS keyframes fundamentally can't                             |
| **Descriptive misuse errors**              | 68 "must be used within" (iter 13)                   | mis-wired vendored code throws raw `undefined`                |
| **Generic data-flow typing**               | datagrid threads `T` to row/cell snippets (iter 14)  | shadcn doesn't attempt it                                     |
| **Tests + `llms.txt` + concept docs**      | 43 specs, broad llms coverage, 12 ADRs (iter 6,4,12) | shadcn ships no tests; source _is_ the doc                    |

## 4. Where shadcn is STRONGER (the borrow list)

| shadcn strength                       | svelte-atoms gap                                  | iter    |
| ------------------------------------- | ------------------------------------------------- | ------- |
| `add` CLI / registry on-ramp          | none (no CLI)                                     | 1,3,4,5 |
| ~zero runtime deps                    | 11 deps; 3 shipped-but-unused (MCP×2, lucide)     | 5,7     |
| Theme generator page                  | none                                              | 4       |
| Full keyboard per component           | tabs/tree/accordion have **none**                 | 11      |
| RTL / `dir` awareness                 | none                                              | 11      |
| Localized labels                      | 25 hardcoded English aria-labels                  | 11      |
| Body scroll-lock on modals            | missing                                           | 2       |
| Typeahead in listboxes                | missing                                           | 2       |
| `buttonVariants()` class escape hatch | none; Button can't be `<a href>`                  | 7       |
| Trivial copy-paste authoring          | Tier-B = 12 concepts, no scaffolder               | 12      |
| Closed prop types (typos error)       | index signature disables it on 17/22              | 14      |
| Scales free (static markup)           | per-row bond cost, no virtualization              | 15      |
| Form server story (superforms)        | client-only, no `Field.Error`, no auto-validate   | 3       |
| Zero-complexity styling               | 1,140-LoC memo engine (justified but a liability) | 10      |
| No API to break                       | ~938-symbol API, no CHANGELOG/snapshot            | 10      |

## 5. The master roadmap (definitive — folds in all iterations)

### Tier 0 — trivial, ship now

- Move MCP SDK + mcp-handler + lucide-svelte → devDependencies _(5,7)_
- Enable Home/End for select/combobox + menu family _(2,11)_
- Demote memo-engine internals out of `./utils` (`@internal`) _(10)_
- Normalize the ~10% off-convention error messages _(13)_
- Deep-import docs note + `<Icon src>` BYO convention _(5,7)_

### Tier 1 — high impact, low/medium effort

- **Wire `navigation`+`roving` into tabs/tree/accordion** — biggest a11y ROI _(11)_ ⭐⭐
- **`Field.Error` component** — forms gap + a11y bug _(3)_ ⭐⭐
- **Emit `data-state`/`data-open` on disclosure/overlay content** — CSS-anim opt-out _(9)_ ⭐⭐
- **Export `ThemeProvider`+`ThemeToggle`+FOUC script from `$lib`** _(4,6)_ ⭐⭐
- **Exports-snapshot/api-extractor + `.changeset/`+CHANGELOG** — backs the upgrade-path claim _(10)_ ⭐⭐
- **"Coming from shadcn" migration guide** _(3,6)_ ⭐⭐
- **Remove/narrow `ElementProps` index signature** — restores typo-checking lib-wide _(14)_ ⭐⭐
- **DEV warn on unknown preset key** (Levenshtein "did you mean") _(13)_ ⭐⭐
- Body scroll-lock capability _(2)_ ⭐
- Thread `reducedMotion()` into the motion host _(9)_ ⭐
- `buttonClasses()` / Button `href` mode _(7)_ ⭐
- De-dup datagrid double `DataGridBond.get()` per row _(15)_ ⭐⭐
- `SelectRootProps<T = unknown>` + thread `T` to bind:value _(14)_ ⭐

### Tier 2 — flagship, medium/high effort

- **CLI/registry (config-not-source)** from `PresetModuleMap` _(1,3,4,5)_ ⭐⭐
- **Theme generator page** _(4)_ ⭐
- **Component scaffolder** (`plop`/`hygen`) for contributors _(12)_ ⭐⭐
- **Virtualization for datagrid/list** _(15)_ ⭐⭐ (the one true invention)
- Auto-wire `validate()` + dirty/touched/pristine _(3)_ ⭐
- Typeahead model (menu+select+tree) _(2,11)_ ⭐
- RTL `dir` seam + flip nav + floating-ui `rtl` + logical drawer sides _(11)_ ⭐
- Localization seam (labels + calendar/date `locale`) _(11)_ ⭐
- Storybook play functions _(6)_; lighter select-item row pattern _(15)_

### Tier 3 — coverage & polish

- New components: Skeleton, Toggle/Toggle-Group, Aspect-Ratio, Hover-Card, Alert-Dialog (fuse), Pagination _(3)_
- `@qrcode-js` optional+lazy; `date-fns` → peer eval _(5)_
- Finish ~14 undocumented components; 2–4 prebuilt themes _(4)_
- Migrate legacy `.get()`→`getOrThrow` (alert/card/calendar) _(13)_
- Harden focus trap (sentinels); valibot adapter; broaden E2E; slider PageUp/Down; menu submenu; Tab-closes-menu _(2,3,6,9,11)_
- Fix dead calendar range mode → Range-Calendar parity _(3)_
- Resolve choreography doc/reality drift _(9)_; keep perf baseline+benches in CI _(10)_

## 6. Suggested execution order (4 sprints)

1. **Sprint A — On-ramp & credibility:** all Tier 0 + ThemeProvider/FOUC + API snapshot/CHANGELOG + migration guide + index-signature fix + preset-key warn. → smaller install, typo-safety, credible upgrade path, a migration story.
2. **Sprint B — A11y correctness:** wire keyboard into tabs/tree/accordion + Field.Error + data-state + scroll-lock + reducedMotion + typeahead. → keyboard/forms/motion meet _and exceed_ bits-ui.
3. **Sprint C — Flagship unlock:** consumer CLI + theme generator + component scaffolder + virtualization. → adoption + contribution + scale.
4. **Sprint D — Reach:** RTL + i18n + Tier 3 coverage.

## 7. Strategic conclusion

**Don't become shadcn.** The runtime architecture is the moat — keep it. The work is to make the architecture's power _reachable_: wire the capabilities that already exist, export the theming runtime that already works, document the concepts that are already written, and add the three on-ramps shadcn proves matter — **a CLI, a theme generator, and a migration guide** — plus the one genuinely-missing capability, **virtualization**. Do that and svelte-atoms is not "a shadcn alternative" — it's the strictly-more-capable option with shadcn-grade ergonomics.

---

## 8. Study status & what the loop does next

Iterations 1–15 exhaustively cover the comparison surface; iter 16 consolidates. **The investigative phase is complete.** Going forward the 5-min loop will, each run, do one of:

- **Track implementation** — re-scan `src/lib` for any roadmap item that has since landed and mark it done here, OR
- **Spot deep-dive** a narrow sub-question on request, OR
- **Re-verify** a prior finding against current code (findings are point-in-time).

If no roadmap items have moved and no new angle is requested, the loop has reached natural saturation — a good point to pause it (`CronDelete eacd6c82`) to avoid redundant summaries. This is noted for the next iteration so it doesn't just re-tread covered ground.
