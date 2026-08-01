# Iteration 8 — Synthesis: prioritized roadmap from iterations 1–7

_Date: 2026-06-22 · Focus: consolidate every finding into one ranked, actionable roadmap. No new investigation — this is the decision document._

## TL;DR — the thesis

shadcn-svelte and @svelte-atoms/core share the **same visual DNA** (oklch token contract, Tailwind, cva-style variants) but opposite philosophies:

- **shadcn = vendored source you own.** Strength: ownership, zero deps, frictionless `add` CLI, theme generator. Weakness: no upgrade path, logic outsourced to bits-ui, per-project duplication, global-token-only theming.
- **svelte-atoms = installed package with a Bond/atom/capability runtime.** Strength: real upgrade path, single owned behavior model, per-slot state-reactive presets, `fuse` stateful composition, broader tests + `llms.txt`. Weakness: heavier deps, no CLI, theming runtime stranded in the docs app, discoverability of the preset surface.

**The winning strategy is not to become shadcn — it's to keep the runtime advantages while borrowing shadcn's three frictionless on-ramps: a CLI, a theme generator, and a migration guide.**

## Recurring cross-iteration patterns (the signal)

1. **Theming runtime lives in the docs app, not `$lib`** (iters 4 + 6): the `Theme` provider and the anti-FOUC script are both demo-only. Consumers re-copy them → the exact vendoring friction svelte-atoms otherwise avoids.
2. **Missing CLI/registry** (iters 1, 3, 4, 5): the single most-cited shadcn strength; surfaces in adoption, docs, theming, and install.
3. **Preset surface is powerful but undiscoverable** (iters 2, 4, 7): the `PresetModuleMap`/slot-key system is strictly more expressive than shadcn, but consumers must _know it exists_.
4. **Packaging slips** (iters 5, 7): MCP SDK + mcp-handler + lucide-svelte shipped as runtime deps with zero `src/lib` usage.

## Ranked roadmap

### Tier 0 — trivial, ship this week (pure wins, ~zero risk)

| #   | Action                                                                                            | Source iter | Effort  |
| --- | ------------------------------------------------------------------------------------------------- | ----------- | ------- |
| 0.1 | Move `@modelcontextprotocol/sdk`, `mcp-handler`, `lucide-svelte` → `devDependencies`              | 5, 7        | trivial |
| 0.2 | Enable **Home/End** for select/combobox (config flip; model already implements it)                | 2           | trivial |
| 0.3 | Docs note: recommend `@svelte-atoms/core/<component>` deep imports for bundle-sensitive consumers | 5           | trivial |
| 0.4 | Document the `<Icon src={...} />` BYO convention; clarify lucide is optional                      | 7           | low     |

### Tier 1 — high impact, low/medium effort (the DX unlock)

| #   | Action                                                                                                   | Source iter | Why                                                                      |
| --- | -------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| 1.1 | **Export `ThemeProvider` + `ThemeToggle` from `$lib`** (promote the docs `Theme` class)                  | 4, 6        | kills recurring pattern #1                                               |
| 1.2 | **Ship the FOUC `<head>` script** (export + documented snippet)                                          | 6           | removes flash-of-wrong-theme for every consumer                          |
| 1.3 | **Add a `Field.Error` component**                                                                        | 3           | closes a 🔴 forms gap **and** an a11y bug (dangling `aria-errormessage`) |
| 1.4 | **Body scroll-lock capability** for modals (ref-counted)                                                 | 2           | most visible a11y gap vs bits-ui                                         |
| 1.5 | **Export class-resolver helpers** (`buttonClasses()`) and/or `Button` `href` mode                        | 7           | matches shadcn's `buttonVariants` ergonomic                              |
| 1.6 | **"Coming from shadcn-svelte" migration guide** (token reuse + cva→preset side-by-side + name-map table) | 6, 3        | top adoption lever                                                       |

### Tier 2 — flagship features, medium effort (strategic)

| #   | Action                                                                                                      | Source iter | Why                                                                |
| --- | ----------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| 2.1 | **CLI/registry (config-not-source)**: `init`/`add`/`theme`; generate `registry.json` from `PresetModuleMap` | 1,3,4,5     | the #1 adoption objection; also fixes pattern #3 (discoverability) |
| 2.2 | **Theme generator page** on docs (pick palette/radius → emit CSS-var/preset override)                       | 4           | shadcn's top marketing asset; your tokens already match            |
| 2.3 | **Auto-wire `validate()`** to submit (default) + blur/input (opt-in); add dirty/touched/pristine            | 3           | makes the existing validation engine actually fire                 |
| 2.4 | **Typeahead model** for select listbox                                                                      | 2           | bits-ui parity                                                     |
| 2.5 | **Storybook play functions** (addons already installed)                                                     | 6           | free interaction + a11y coverage                                   |

### Tier 3 — coverage & polish (ongoing)

| #   | Action                                                                                                               | Source iter |
| --- | -------------------------------------------------------------------------------------------------------------------- | ----------- |
| 3.1 | New components: Skeleton, Toggle/Toggle-Group, Aspect-Ratio, Hover-Card, Alert-Dialog (fuse over dialog), Pagination | 3           |
| 3.2 | `@qrcode-js` optional + lazy `import()`; evaluate `date-fns` → peer                                                  | 5           |
| 3.3 | Document remaining ~14 undocumented components; ship 2–4 prebuilt theme presets                                      | 4           |
| 3.4 | Harden focus trap with sentinels; valibot adapter; broaden E2E                                                       | 2,3,6       |
| 3.5 | Fix known dead calendar range mode → unblock Range-Calendar parity                                                   | 3           |

## What to KEEP / market (svelte-atoms already wins — don't regress)

- **Real upgrade path** via versioned package (vs shadcn vendored drift).
- **Single owned behavior model** (Bond/atom/capability) vs shadcn's two-library (styling + bits-ui) split.
- **Per-slot, context-scoped, state-reactive presets** — `(bond) => record` styling cva can't express.
- **`fuse` stateful composition** — structurally impossible in shadcn.
- **Preset-driven `base`/`as` polymorphism** — themes repolymorphize parts.
- **Broader `llms.txt` coverage + `?raw` live-source docs** + a real test suite.

## Suggested sequencing

1. **Sprint A (on-ramp):** Tier 0 (all) + 1.1 + 1.2 + 1.6 → smaller install, no FOUC, themeable from `$lib`, a migration story.
2. **Sprint B (correctness):** 1.3 + 1.4 + 2.3 + 2.4 → forms + a11y reach bits-ui parity.
3. **Sprint C (flagship):** 2.1 (CLI) + 2.2 (theme generator) → the adoption unlock.
4. **Continuous:** Tier 3.

## Note

Iterations 9+ (loop still running every 5 min) can deep-dive the remaining open threads — variant-memoization perf justification, motion/animation story depth, semver discipline as marketing — and feed any new findings back into this roadmap.
