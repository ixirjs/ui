# shadcn-svelte ↔ @ixirjs/ui comparison

A running, iterative comparison (one summary per loop run) that mines shadcn-svelte for strengths to adopt and limitations to avoid, in order to improve @ixirjs/ui.

## Index

The per-iteration write-ups have been removed; this table and `ROADMAP.md` are the surviving record.

| #   | Topic                                            | Headline finding                                                                                                                                   |
| --- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Distribution model & high-level architecture     | vendored-source vs installed-package; missing CLI is the #1 gap                                                                                    |
| 2   | A11y depth + customization DX                    | no body scroll-lock; Home/End disabled; presets beat global tokens                                                                                 |
| 3   | Forms/validation + coverage diff                 | own validation engine, but no `Field.Error`, never auto-validates; missing Skeleton/Toggle/etc. — validation resolved by 1.2 + 2.5, see `adr/0010` |
| 4   | Theming, dark mode, variants, docs               | theme runtime is docs-only; no theme generator; state-reactive variants win                                                                        |
| 5   | Bundle/dep cost + CLI design sketch              | MCP SDK + lucide shipped but unused; config-not-source CLI design                                                                                  |
| 6   | SSR/FOUC, testing, migration path                | SSR solid; FOUC script docs-only; tests beat shadcn; need migration guide                                                                          |
| 7   | Composition (`base` vs `asChild`), `fuse`, icons | no `buttonVariants` escape hatch; `fuse` is a shadcn-impossible differentiator                                                                     |
| 8   | Synthesis v1 — prioritized roadmap               | Tier 0–3 ranked action plan; keep runtime wins, borrow shadcn's 3 on-ramps                                                                         |
| 9   | Animation/motion story                           | JS `motion` wins `height:auto`+FLIP; gaps: inconsistent `data-state`, reduced-motion in 1 place, choreography is doc-only                          |
| 10  | Memo engine + API stability                      | engine 14.8× justified but a liability; ~938-symbol API with no CHANGELOG/snapshot 🔴                                                              |
| 11  | RTL/i18n + keyboard completeness                 | 🔴 no RTL; tabs/tree/accordion have NO keyboard (capabilities built but unwired)                                                                   |
| 12  | **Authoring DX + refreshed roadmap v2**          | bimodal author DX (Tier A simple, Tier B 12-concept); **v2 roadmap supersedes iter-8**                                                             |
| 13  | Misuse / error-handling DX                       | modern families excellent ("must be used within"); legacy `.get()` silent; preset-key typos silent 🔴                                              |
| 14  | TypeScript inference quality                     | excess-prop checking OFF for 17/22 (index-signature) 🔴; Select value `any`; generic `T` threading is good                                         |
| 15  | Runtime cost at scale                            | cheap-per-leaf + memoized; large collections unbounded (no virtualization) 🔴 — the one decisive loss to shadcn                                    |
| 16  | ⭐ **FINAL capstone**                            | standalone consolidation of all 15 iters: meta-pattern, win/borrow lists, master roadmap, 4-sprint plan                                            |

> **Start here:** [ROADMAP.md](ROADMAP.md) is the actionable, trackable checklist of future improvements (status-verified against `src/lib`).

## The one-line strategy

Don't become shadcn. Keep the runtime advantages (upgrade path, owned behavior, state-reactive presets, `fuse`) and borrow shadcn's three frictionless on-ramps: **a CLI, a theme generator, and a migration guide.**

**Meta-pattern (iters 1–12):** the architecture is ahead of shadcn; the _packaging, wiring, and on-ramps_ lag. Almost every gap is "capability exists but isn't wired/exported/documented" — mostly activation, not invention.

➡️ **Current roadmap: [ROADMAP.md](ROADMAP.md)** — the consolidated, status-tracked checklist (supersedes the embedded iter-8 and iter-12 tiers).
