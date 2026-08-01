# shadcn-svelte ↔ @svelte-atoms/core comparison

A running, iterative comparison (one summary per loop run) that mines shadcn-svelte for strengths to adopt and limitations to avoid, in order to improve @svelte-atoms/core.

## Index

| #                             | Topic                                            | Headline finding                                                                                                          |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| [1](iteration-1.md)           | Distribution model & high-level architecture     | vendored-source vs installed-package; missing CLI is the #1 gap                                                           |
| [2](iteration-2.md)           | A11y depth + customization DX                    | no body scroll-lock; Home/End disabled; presets beat global tokens                                                        |
| [3](iteration-3.md)           | Forms/validation + coverage diff                 | own validation engine, but no `Field.Error`, never auto-validates; missing Skeleton/Toggle/etc.                           |
| [4](iteration-4.md)           | Theming, dark mode, variants, docs               | theme runtime is docs-only; no theme generator; state-reactive variants win                                               |
| [5](iteration-5.md)           | Bundle/dep cost + CLI design sketch              | MCP SDK + lucide shipped but unused; config-not-source CLI design                                                         |
| [6](iteration-6.md)           | SSR/FOUC, testing, migration path                | SSR solid; FOUC script docs-only; tests beat shadcn; need migration guide                                                 |
| [7](iteration-7.md)           | Composition (`base` vs `asChild`), `fuse`, icons | no `buttonVariants` escape hatch; `fuse` is a shadcn-impossible differentiator                                            |
| [8](iteration-8-synthesis.md) | Synthesis v1 — prioritized roadmap               | Tier 0–3 ranked action plan; keep runtime wins, borrow shadcn's 3 on-ramps                                                |
| [9](iteration-9.md)           | Animation/motion story                           | JS `motion` wins `height:auto`+FLIP; gaps: inconsistent `data-state`, reduced-motion in 1 place, choreography is doc-only |
| [10](iteration-10.md)         | Memo engine + API stability                      | engine 14.8× justified but a liability; ~938-symbol API with no CHANGELOG/snapshot 🔴                                     |
| [11](iteration-11.md)         | RTL/i18n + keyboard completeness                 | 🔴 no RTL; tabs/tree/accordion have NO keyboard (capabilities built but unwired)                                          |
| [12](iteration-12.md)         | **Authoring DX + refreshed roadmap v2**          | bimodal author DX (Tier A simple, Tier B 12-concept); **v2 roadmap supersedes iter-8**                                    |
| [13](iteration-13.md)         | Misuse / error-handling DX                       | modern families excellent ("must be used within"); legacy `.get()` silent; preset-key typos silent 🔴                     |
| [14](iteration-14.md)         | TypeScript inference quality                     | excess-prop checking OFF for 17/22 (index-signature) 🔴; Select value `any`; generic `T` threading is good                |
| [15](iteration-15.md)         | Runtime cost at scale                            | cheap-per-leaf + memoized; large collections unbounded (no virtualization) 🔴 — the one decisive loss to shadcn           |
| [16](iteration-16-final.md)   | ⭐ **FINAL capstone**                            | standalone consolidation of all 15 iters: meta-pattern, win/borrow lists, master roadmap, 4-sprint plan                   |

> **Start here:** [ROADMAP.md](ROADMAP.md) is the actionable, trackable checklist of future improvements (status-verified against `src/lib`). [iteration-16-final.md](iteration-16-final.md) is the standalone reasoning behind it; the numbered iterations 1–15 are the supporting evidence.

## The one-line strategy

Don't become shadcn. Keep the runtime advantages (upgrade path, owned behavior, state-reactive presets, `fuse`) and borrow shadcn's three frictionless on-ramps: **a CLI, a theme generator, and a migration guide.**

**Meta-pattern (iters 1–12):** the architecture is ahead of shadcn; the _packaging, wiring, and on-ramps_ lag. Almost every gap is "capability exists but isn't wired/exported/documented" — mostly activation, not invention.

➡️ **Current roadmap: [ROADMAP.md](ROADMAP.md)** — the consolidated, status-tracked checklist (supersedes the embedded iter-8 and iter-12 tiers).
