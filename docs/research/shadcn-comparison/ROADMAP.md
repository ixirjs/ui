# ROADMAP — future improvements (from the shadcn-svelte comparison)

_Standalone, trackable roadmap distilled from [iterations 1–17](README.md). The numbered iterations are the evidence; [iteration-16-final.md](iteration-16-final.md) is the full reasoning. This file is the actionable checklist — update the status boxes as items land._

_Status verified against `src/lib` on 2026-06-22 (baseline commit `7f9da8ac`)._

---

## The strategy in one line

**Don't become shadcn.** Keep the runtime advantages — versioned upgrade path, single owned Bond/atom/capability behavior model, per-slot state-reactive presets, `fuse` composition — and borrow shadcn's three frictionless on-ramps: **a CLI, a theme generator, and a migration guide**, plus the one capability it genuinely lacks: **virtualization**.

## The meta-pattern (why this roadmap is high-ROI)

> The architecture is **ahead** of shadcn; the **packaging, wiring, and on-ramps lag.**

In 13 of 15 investigative iterations the gap was _"the capability exists but isn't wired, exported, or documented"_ — **activation, not invention**. Keyboard nav/roving capabilities are built + tested but unwired; the `Theme` provider and FOUC script work but live in the docs app; Home/End is implemented but gated off; `reducedMotion()` exists but one factory reads it. **Exactly one item is true new invention: virtualization (§ Tier 2).** Everything else is reachable by wiring/exporting/documenting what's already there.

## Legend

- `[x]` done · `[~]` in working tree (uncommitted) · `[ ]` not started
- Impact ⭐⭐ top lever · ⭐ strong · (blank) polish · Effort: T trivial · L low · M medium · H high · `(iter N)` = source iteration

---

## Tier 0 — trivial, ship now (≈zero risk)

- [~] **0.1 — Dependency diet.** Move `@modelcontextprotocol/sdk` + `mcp-handler` + `lucide-svelte` → `devDependencies` (3 runtime deps with zero non-story `src/lib` use). _T · iter 5,7 · in working tree, **uncommitted**_
- [ ] **0.2 — Enable Home/End** for select / combobox / menu. Model already implements it; pure config flip. _T · iter 2,11_
- [ ] **0.3 — Demote memo-engine internals** out of `./utils` (mark `@internal`). Shrinks the public API surface; the engine is a liability if exposed. _L · iter 10_
- [ ] **0.4 — Normalize off-convention error messages** (~10%). Consistency of the "must be used within" misuse story. _L · iter 13_
- [ ] **0.5 — Docs:** recommend `@svelte-atoms/core/<component>` deep imports + document the `<Icon src>` BYO convention. Bundle-sensitive consumers; clarifies lucide is optional. _L · iter 5,7_

## Tier 1 — high impact, low/medium effort (the DX + correctness unlock)

- [ ] ⭐⭐ **1.1 — Wire `navigation` + `roving` into tabs / tree / accordion.** Biggest a11y ROI — these have **no keyboard** today; the capabilities exist + are tested. _M · iter 11_
- [ ] ⭐⭐ **1.2 — Add a `Field.Error` component.** Closes a forms gap **and** an a11y bug (dangling `aria-errormessage`). _L · iter 3_
- [ ] ⭐⭐ **1.3 — Emit `data-state` / `data-open`** on disclosure + overlay content. Gives consumers a CSS-animation opt-out path. _L · iter 9_
- [ ] ⭐⭐ **1.4 — Export `ThemeProvider` + `ThemeToggle` + FOUC `<head>` script from `$lib`.** Promotes the docs-only `Theme` runtime; kills the re-copy friction. _M · iter 4,6_
- [ ] ⭐⭐ **1.5 — Exports snapshot (api-extractor) + `.changeset/` + CHANGELOG.** Backs the "real upgrade path" claim; the ~938-symbol API has no snapshot today. _M · iter 10_
- [ ] ⭐⭐ **1.6 — "Coming from shadcn-svelte" migration guide** (token reuse + cva→preset side-by-side + name-map table). Top adoption lever. _M · iter 3,6_
- [ ] ⭐⭐ **1.7 — Remove / narrow the `ElementProps` index signature** (`[key: string]: unknown`). Restores excess-prop typo checking lib-wide (off for 17/22 today). _M · iter 14_
- [ ] ⭐⭐ **1.8 — DEV warn on unknown preset key** (Levenshtein "did you mean?"). Preset-key typos are silently dropped today. _L · iter 13_
- [ ] ⭐⭐ **1.9 — De-dup the double `DataGridBond.get()` per row.** Per-row cost reduction before virtualization lands. _L · iter 15_
- [ ] ⭐ **1.10 — Body scroll-lock capability** for modals (ref-counted). Most visible a11y gap vs bits-ui. _M · iter 2_
- [ ] ⭐ **1.11 — Thread `reducedMotion()` into the motion host.** Accessibility; the rune exists but only 1 factory reads it. _L · iter 9_
- [ ] ⭐ **1.12 — `buttonClasses()` helper and/or `Button` `href` mode.** Matches shadcn's `buttonVariants` escape hatch. _L · iter 7_
- [ ] ⭐ **1.13 — `SelectRootProps<T = unknown>` + thread `T` to `bind:value`.** Select value is `any` today. _M · iter 14_

## Tier 2 — flagship features, medium/high effort (strategic)

- [ ] ⭐⭐ **2.1 — CLI / registry (config-not-source):** `init` / `add` / `theme`, generate `registry.json` from `PresetModuleMap`. The #1 adoption objection; also fixes preset discoverability. _H · iter 1,3,4,5_
- [ ] ⭐ **2.2 — Theme generator page** (pick palette/radius → emit CSS-var / preset override). shadcn's top marketing asset; tokens already match. _M · iter 4_
- [ ] ⭐⭐ **2.3 — Component scaffolder** (`plop`/`hygen`) for contributors. Tier-B authoring is 12 concepts with no scaffolder. _M · iter 12_
- [ ] ⭐⭐ **2.4 — Virtualization for datagrid / list.** **The one true invention** — the only decisive loss to shadcn at scale. _H · iter 15_
- [ ] ⭐ **2.5 — Auto-wire `validate()`** to submit (default) + blur/input (opt-in); add dirty/touched/pristine. Makes the existing validation engine actually fire. _M · iter 3_
- [ ] ⭐ **2.6 — Typeahead model** (menu + select + tree listboxes). bits-ui parity. _M · iter 2,11_
- [ ] ⭐ **2.7 — RTL `dir` seam** + flip nav + floating-ui `rtl` + logical drawer sides. No RTL today. _H · iter 11_
- [ ] ⭐ **2.8 — Localization seam** (labels + calendar/date `locale`). 25 hardcoded English aria-labels. _M · iter 11_
- [ ] **2.9 — Storybook play functions** (addons already installed); lighter select-item row pattern. Free interaction + a11y coverage; per-row cost. _M · iter 6,15_

## Tier 3 — coverage & polish (ongoing)

- [ ] **3.1 — New components:** Skeleton, Toggle / Toggle-Group, Aspect-Ratio, Hover-Card, Alert-Dialog (fuse over dialog), Pagination. _iter 3_
- [ ] **3.2 — `@qrcode-js` optional + lazy `import()`;** evaluate `date-fns` → peer dep. _iter 5_
- [ ] **3.3 — Finish ~14 undocumented components;** ship 2–4 prebuilt theme presets. _iter 4_
- [ ] **3.4 — Migrate legacy `.get()` → `getOrThrow`** (alert / card / calendar). _iter 13_
- [ ] **3.5 — Harden focus trap** (sentinels); valibot adapter; broaden E2E; slider PageUp/Down; menu submenu; Tab-closes-menu. _iter 2,3,6,9,11_
- [ ] **3.6 — Fix dead calendar range mode** → unblock Range-Calendar parity. _iter 3_
- [ ] **3.7 — Resolve choreography doc/reality drift;** keep perf baseline + benches in CI. _iter 9,10_

---

## Suggested execution order (4 sprints)

1. **Sprint A — On-ramp & credibility:** all of Tier 0 + 1.4 (ThemeProvider/FOUC) + 1.5 (API snapshot/CHANGELOG) + 1.6 (migration guide) + 1.7 (index-signature fix) + 1.8 (preset-key warn). → smaller install, typo-safety, a credible upgrade path, a migration story.
2. **Sprint B — A11y correctness:** 1.1 (keyboard wiring) + 1.2 (Field.Error) + 1.3 (data-state) + 1.10 (scroll-lock) + 1.11 (reducedMotion) + 2.6 (typeahead). → keyboard / forms / motion meet _and exceed_ bits-ui.
3. **Sprint C — Flagship unlock:** 2.1 (CLI) + 2.2 (theme generator) + 2.3 (scaffolder) + 2.4 (virtualization). → adoption + contribution + scale.
4. **Sprint D — Reach:** 2.7 (RTL) + 2.8 (i18n) + all of Tier 3.

---

## Do NOT regress — the moat (defend & market these)

These already beat shadcn; the roadmap must not trade them away:

- **Real upgrade path** via versioned npm package (vs vendored drift).
- **Single owned behavior model** (Bond / atom / capability) vs shadcn's styling + bits-ui two-library split.
- **Per-slot, context-scoped, state-reactive presets** — `(bond) => record` styling cva can't express.
- **`fuse` stateful composition** — structurally impossible in shadcn.
- **Preset-driven `base` / `as` polymorphism** — themes repolymorphize parts.
- **`height:auto` + runtime-geometry FLIP** motion — CSS keyframes fundamentally can't.
- **Descriptive misuse errors**, **generic data-flow typing** (datagrid threads `T`), **tests + `llms.txt` + ADRs**.

---

_When an item lands, tick its box (`[ ]` → `[x]`) here and append a dated note to [iteration-17-tracking.md](iteration-17-tracking.md). Findings are point-in-time — re-verify against `src/lib` before starting an item._
