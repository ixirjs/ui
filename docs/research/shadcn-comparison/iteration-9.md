# Iteration 9 — Animation / motion story

_Date: 2026-06-22 · Focus: svelte-atoms's JS-driven `motion` (Framer Motion vanilla) per-component vs shadcn's pure-CSS `tailwindcss-animate` + `data-state` keyframes._

## The two philosophies

|                       | shadcn-svelte                                                                           | @svelte-atoms/core                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Engine                | **CSS-only**: `tailwindcss-animate` utilities + `data-state="open\|closed"` + keyframes | **JS**: `motion ^12` (Framer Motion `animate`) at 17 sites; 6 component `motion.svelte.ts` factories |
| Runtime cost          | ~0 JS                                                                                   | ships Framer Motion (~tens of KB), paid even if unused                                               |
| Trigger               | CSS reacts to `data-state` attr                                                         | state-driven `$effect` reading `bond.state.props.open`                                               |
| Pre-hydration / no-JS | ✅ animates before/without JS                                                           | ❌ needs hydration                                                                                   |

## Where svelte-atoms's JS approach genuinely WINS (keep these)

1. **`height: 0 ↔ auto`** — collapsible/accordion animate to `height:'auto'`, which **CSS keyframes fundamentally cannot do** (shadcn needs `grid-template-rows` hacks or fixed heights). `collapsible/motion.svelte.ts`, `accordion/item/motion.svelte.ts`.
2. **Runtime-geometry FLIP** — `dialog/motion.svelte.ts` reads the trigger's `getBoundingClientRect()` and scales the dialog _out of the trigger_; popover/drawer adapt to placement/side. Static CSS can't read runtime geometry. **This is a real, demoable differentiator.**
3. **Spring physics + mid-flight interruption** — popover/drawer expose `spring`/`stiffness`/`damping`; CSS has no real springs.

## Three real GAPS vs shadcn's model (actionable)

### Gap 1 — no consistent `data-state` hook → CSS-animation users locked out 🔴

shadcn exposes `data-state` on **every** primitive so consumers can write their own CSS animations. svelte-atoms emits it **inconsistently**:

- ✅ Full shadcn-style only on **toast** (`'data-state': isOpen ? 'open':'closed'` + `'data-open'`).
- ⚠️ Partial: `data-open` on scrollable + modal host; `data-active`/`data-selected`/`data-highlighted` on tabs/select/datagrid/roving.
- ❌ **Absent on the marquee disclosure/overlay content:** collapsible, accordion item, dialog content, popover panel — only `inert`/`aria-*`.

So a consumer who wants to drop the JS runtime and write `[data-state=open]` CSS **can't** for the exact components where it matters most. **→ Emit `data-state="open|closed"` (+ `data-side`/`data-placement` where relevant) on all disclosure/overlay content atoms.** Low effort (atoms already compute the state), high payoff: it gives consumers shadcn's CSS-animation option _on top of_ the JS one, and is the bridge that lets bundle-sensitive users opt out of `motion`. ⭐⭐

### Gap 2 — reduced-motion honored in exactly ONE place 🔴 (a11y)

`prefersReducedMotion()` / `reducedMotion()` exist but only `element/motion.ts` (`scaleFade`) reads them. **None of the `motion`-lib factories** (collapsible/dialog/popover/drawer/accordion/sidebar/tree) respect `prefers-reduced-motion` — they animate at full duration regardless. This is an **accessibility regression vs shadcn** (whose CSS honors the media query trivially via `motion-reduce:` utilities). **→ Thread `reducedMotion()` into the shared motion host (`element/html-element.svelte`) so every factory collapses to duration 0 when set.** Low/medium effort, fixes all factories at once. ⭐

### Gap 3 — choreography/stagger capability does NOT exist in code ⚠️ (doc/reality drift)

`grep -ri "choreograph|stagger" src/lib` returns **nothing**. There is no engine, no parent-owned run, no `Bond.#animationPromises`. The only sequencing is manual per-item `delay`. `docs/motion-transition-api.md` confirms choreography is **design prose only**.

> ⚠️ **This contradicts the project memory note `choreography-capability`** ("engine+spec landed"). The memory appears stale or describes reverted work — verify before relying on it. Flagging, not fixing.

shadcn doesn't have choreography either, so this isn't a shadcn-gap — but it's a **documentation-vs-reality drift** worth resolving (either build it or downgrade the ADR/memory to "planned").

## Transitions coexistence (context, not a gap)

The lib runs a **two-channel model** wired in `element/html-element.svelte`: four slots — `initial` (`{@attach}`), `enter` (Svelte `in:`), `exit` (Svelte `out:`), `animate` (imperative `motion`). A `hasEntered` gate defers the imperative `animate` until Svelte's `onintroend` so JS and Svelte timelines don't fight. Unit gotcha: `motion` wants seconds, Svelte `TransitionConfig` wants ms (factories divide by 1000).

## Consolidated actions this iteration (feeds the iter-8 roadmap)

| #   | Action                                                                                                                                    | Tier | Effort            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------- |
| 9.1 | **Emit `data-state`/`data-open` (+`data-side`/`data-placement`) on all disclosure/overlay content atoms** — unlocks CSS-animation opt-out | 1    | low ⭐⭐          |
| 9.2 | **Thread `reducedMotion()` into the motion host** so all factories honor `prefers-reduced-motion`                                         | 1    | low/med ⭐ (a11y) |
| 9.3 | Resolve choreography doc/reality drift (build it, or downgrade ADR/memory to "planned")                                                   | 3    | —                 |
| 9.4 | (Optional) document the JS-vs-CSS trade-off + the `height:auto`/FLIP wins as marketing                                                    | 3    | low               |

## Where svelte-atoms wins (market these)

- `height:auto` animation and **dialog-grows-from-trigger FLIP** — visibly better than anything shadcn's CSS can do.
- Spring physics + interruptible tweens.

## Open threads for next iterations

- [ ] Variant-memoization engine perf justification vs cva simplicity (benchmark).
- [ ] Semver / API-stability discipline as a marketed advantage over shadcn vendored drift.
- [ ] Update the synthesis roadmap (iter 8) with 9.1/9.2 into Tier 1.
- [ ] Verify/correct the `choreography-capability` memory note against current `src/lib`.
