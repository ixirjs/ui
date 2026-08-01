# Iteration 7 — Composition (`base` vs `asChild`), `fuse`, and icon strategy

_Date: 2026-06-22 · Focus: polymorphism ergonomics vs bits-ui's `child`/`asChild`, the `fuse` composition primitive, and how icons are provided._

## `base` prop vs bits-ui `{#snippet child({ props })}`

Implemented in the atom kernel (`atom/html-atom.svelte` + `atom/resolvers.ts`). Every `<HtmlAtom>`-backed part is polymorphic via two props:

- **`as`** — swap the HTML _tag_ (`as="a"`).
- **`base`** — swap the rendered _component_ (`base={Button}`) or _snippet_ (`base={mySnippet}`, via `SnippetRenderer`).

Resolution: `base ?? preset?.base`, `as ?? preset?.as` — so the **caller wins, but a preset can inject `base`/`as`**. The kernel does all the attr/handler/preset-class spreading for you.

|                                                      | bits-ui `child({ props })`                               | svelte-atoms `base`                                                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Mechanism                                            | hands you `props`, **you** spread them onto your element | kernel **drives** your component, spreads for you                                                                         |
| Ergonomics (common case)                             | verbose; must remember to spread or a11y breaks          | ✅ one prop, classes auto-merge                                                                                           |
| Themeable                                            | ❌ call-site only                                        | ✅ **`base`/`as` can come from a preset** — a theme can change what element a part renders as without touching call sites |
| Prop-bag surgery (rename/drop/reorder before render) | ✅ full manual control                                   | ❌ not exposed — kernel always spreads                                                                                    |
| Arbitrary inline markup                              | ✅                                                       | ✅ via snippet base                                                                                                       |

**Net:** svelte-atoms is **more ergonomic + themeable** for the 95% case; bits-ui is **strictly more powerful at the leaf** (prop surgery + a class-only escape hatch).

### shadcn/bits-ui strengths to adopt

1. **A `buttonVariants()`-style class-only export.** shadcn's killer ergonomic recipe is `<a class={buttonVariants({ variant })}>` — apply button styling to _any_ element with zero component wrapping. svelte-atoms has **no such escape hatch**, and `Button` hardcodes `as="button"` with **no `href`/anchor handling** — so "Button as link" is _less_ turnkey than shadcn. → **Export a class-resolver per styled component** (`buttonClasses(props)` that resolves the `button` preset to a string), OR give `Button` first-class `href` → renders `<a>`. _Medium, closes a real ergonomic gap._ ⭐
2. **Consider a prop-bag intercept escape hatch** for the rare case (a `child`-style snippet that receives the resolved props so power users can do surgery). _Low priority — the `base` model covers most needs._

### Where svelte-atoms already wins

- **Preset-driven `base`/`as`** — themes can repolymorphize parts; bits-ui can't.
- **`fuse` (see below)** — stateful composition bits-ui has no equivalent for.

## `fuse` — stateful composition (a genuine differentiator)

`fuse({ name, parts })` (`shared/authoring/fuse.svelte.ts` → `defineBond` `parts:` path) merges multiple components' atom maps + capabilities into **one shared bond**, and overrides `share()` to register under **each part's context key** — so the parts' _own unmodified atom components_ (`<Popover.Trigger>`, `<Dialog.Content>`) all resolve the same fused brain. First consumer: `popover-dialog` = `fuse(Popover, Dialog)`.

**What shadcn can't easily do:** in shadcn, composing "a popover trigger that drives a dialog's modal content (shared open-state, focus, escape-stacking)" means hand-wiring two independent stateful primitives in app code. `fuse` produces a single unified bond while **reusing the original parts verbatim** (no bespoke wrappers). This is library-level composition of _stateful behavior_, not just markup. **→ Market `fuse` explicitly — it's a capability shadcn structurally lacks.**

## Icon strategy

`icon/icon.svelte`: `IconProps` adds one prop `src?: Component`. Accepts either `<Icon src={SomeLucideIcon} />` or a `children` snippet of inline SVG. The component only provides the sizing/alignment box (`inline-flex aspect-square h-6`, `'icon'` preset); **the consumer brings the glyph** — same BYO-icon model as shadcn.

**Packaging slip flagged (reinforces iter 5):** `lucide-svelte` is in `dependencies` but is **stories-only** (no shipped component imports it). → move to devDependencies. (Already on the iter-5 diet list.)

### shadcn strength to adopt

- shadcn documents the icon convention crisply ("install lucide-svelte, import the icon, pass it in"). svelte-atoms should **document the `<Icon src={...} />` convention prominently** and clarify lucide is optional/BYO — right now its presence in `dependencies` wrongly implies it's required. _Low._

## Composition limitations found (vs shadcn)

- ❌ No `buttonVariants()` class-only escape hatch (above). 🔴 the notable one.
- ❌ `Button` has no `href`/anchor mode (hardcoded `as="button"`).
- ❌ No prop-bag surgery before render (bits-ui `child` can).
- ✅ Tag swap (`as`), component swap (`base`), arbitrary children, and stateful `fuse` — all supported and in several ways ahead of shadcn.

## Consolidated actions this iteration (ranked)

1. **Export class-resolver helpers** (`buttonClasses()` etc.) and/or give `Button` an `href` mode → match shadcn's `buttonVariants` ergonomics. ⭐ closes the one real composition gap
2. **Document & market `fuse`** as a shadcn-impossible feature. ⭐ differentiation
3. **Document the `<Icon src={...} />` BYO convention**; move `lucide-svelte` to devDeps. low
4. (Optional) prop-bag intercept snippet for power users. low

## Open threads for next iterations

- [ ] Performance: variant-memoization engine justification vs cva simplicity (benchmark).
- [ ] API stability / semver as a marketed advantage over shadcn vendored drift.
- [ ] **Synthesis pass**: consolidate iters 1–7 into one prioritized roadmap (overdue — do next).
- [ ] Animation/motion story depth (svelte-atoms `motion.svelte.ts` per component vs shadcn's tailwindcss-animate).
