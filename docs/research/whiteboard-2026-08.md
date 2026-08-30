# The whiteboard test — what the runtime costs, and what to do about it (2026-08-26)

## The question

Seven rounds of measured, gated micro-work (`perf-vs-shadcn-2026-08.md` §8–§17) and the client column
still reads card +50%, table +64%, accordion +99%, tree 49× a floor. Every round found a real defect
and removed it; none changed the order of magnitude. So this round stopped optimising the current
approach and asked the question from a blank page: **if the same product promises were written with
nothing but Svelte 5, what would they cost?** If that number is close to ours, the architecture is
the price of the product. If it is far below shadcn's, the architecture is the problem.

## Method

Two families were rewritten from scratch under `src/lib/test/perf/whiteboard/` and added to the
head-to-head harness as their own arms (`card-wb`, `accordion-wb`), measured with the exact
instruments and fixtures the real families use:

- **Card**: swappable preset (installed entry resolved once, tailwind-merged with the consumer's
  class, cached), `aria-labelledby` on the root that points at a Title only when one rendered,
  clickable role/tabindex, `aria-disabled`, a `{ card }` snippet argument, SSR-deterministic ids from
  `$props.id()`. One class with one `$state` (`titleId`), one context, plain `<div>`s.
- **Accordion**: `values`/`multiple`/`collapsible`/`disabled`, per-item `value`/`disabled`, header as
  a `<button>` with `aria-expanded`/`aria-controls`/roving `tabindex`/`aria-disabled`, body as
  `role="region"` + `aria-labelledby` rendered only while open, ArrowUp/Down/Home/End over enabled
  headers, focus follows Tab/click, preset classes, deterministic ids. Two classes, two contexts,
  one `$state` (`focused`), registration is a plain array in mount order, focus moves by
  `getElementById`.

What the whiteboards deliberately do not have: a Bond, an Atom, the capability runtime, the node
registry, Kernel plan/node/element, the presentation fold, `factory`/`getBond`, a `base` renderer,
`as`, motion, DEV diagnostics. That absence is the measurement.

## Results (chromium, this box, medians; opponent is shadcn-svelte / bits-ui 2.19)

| per unit          | real `Card` | **whiteboard card** | shadcn card |
| ----------------- | ----------: | ------------------: | ----------: |
| SSR µs            |        8.57 |            **7.64** |     4.7–5.3 |
| client mount µs   |        43.9 |            **20.3** |       30–38 |
| client hydrate µs |        44.4 |            **18.1** |       18–32 |
| retained heap B   |      15 793 |          **10 846** |      13 400 |
| hydration anchors |           9 |               **7** |           9 |

| per item                 | real `Accordion` | **whiteboard accordion** | bits-ui |
| ------------------------ | ---------------: | -----------------------: | ------: |
| SSR µs                   |             37.7 |                 **11.2** |    59.1 |
| client mount µs          |            164.7 |                 **22.0** |     172 |
| client hydrate µs        |            150.7 |                 **18.0** |      98 |
| targeted update µs/flush |            10–11 |                    **3** |     6–7 |
| retained heap B          |           38 839 |               **10 283** |  37 000 |
| hydration anchors        |               12 |                    **7** |      13 |

The whiteboard card is **−46% mount / −43% hydrate against shadcn**, and the whiteboard accordion is
**−87% / −82% against bits-ui** — with the same behaviour on the page. The real families are 2.2×
and 7.5× the whiteboard.

The whiteboard card's own profile (`bench:vs-shadcn:own card-wb`) has library frames at **0.2 µs of
~20**; everything else is Svelte's component boundary, effect creation, DOM insertion and GC — the
floor shadcn pays too. There is nothing left to optimise _in_ it; the number is what four components
and four divs cost.

## The real cause

**The runtime, not the product and not Svelte.** Card's Bond is measured at ~0 µs; the 22 µs it
loses to shadcn are the layers around it — `useRoot`/`bindBond`, the Atom and its lazy descriptor,
the node registry, the Kernel plan/node/element, the presentation fold, the behaviour-layer merge —
each doing a little per part per render, and all of it existing to let a part be described
_generically_ (any tag, any renderer, any preset shape, any capability projected by role) rather
than written. A whiteboard part is written; it does the one thing it does.

Seven rounds could not close that because each removed one layer's slack while every layer stayed.
The primitive counts prove it: a card now creates **fewer** Svelte effects than shadcn's (24 vs 29)
and still costs 1.5× — the cost is inside our functions, not in Svelte's scheduling.

### The queue question

`queueMicrotask` costs ~0.65 µs per call on this Chromium (a resolved-promise `.then` 0.05, draining
one microtask over a Set 0.1 per entry). The registry commit and the `animate` batch are one
microtask per flush — free. The per-root `isSettled` microtask (Round 7) was 0.65 µs per root and is
now one per flush. Queues are not the cause; they are ~1% of a card.

### The bits-ui comparison

bits-ui is not lean either: an accordion item builds 4 state classes, 4 `attachRef` attachments, 30
`$derived` (13 of them dead — `boxWith` allocates one it never reads), 6 effects, a presence manager
with rAF + `MutationObserver` + `getAnimations()`, and rebuilds a 12-key `props` object on every
invalidation; keyboard candidates are re-queried with `querySelectorAll` on each keystroke. It has no
preset system, no registry, no capability runtime — composition is static Svelte components. It costs
172 µs/item on mount because of _its_ machinery, which is why the whiteboard beats it by 87%. The
lesson is not "copy bits-ui"; it is that every layer of generality costs on every element, in every
library.

## What the runtime is (inventory)

| layer                                            |      lines |
| ------------------------------------------------ | ---------: |
| `bond/` (Bond, Atom, binding, registries, merge) |      2 888 |
| `capability/` + `models/` + `bond-effects/`      |      4 575 |
| `kernel/` + `resolve/` + `render/`               |      3 532 |
| `authoring/`                                     |      1 106 |
| `preset/`, `components/element/`, `utils/`       |      2 185 |
| **total**                                        | **14 776** |

Sixteen classes with 59 private fields between them — `Bond`, `Atom`, `BondBinding`,
`CapabilityRegistry`, `CapabilityHost`, `CapabilityRuntime`, `NodeRegistry`, `LazyNodeDescriptor`,
`Collection`, `KernelNode`, `ElementRoot`, `BondRoot`, `Defined`, three generated Atom classes.

**Producing one rich part's attribute object once** (`Tree.Header`, the ledger in the inventory
report): **30 distinct frames** — spread memo → snapshot derived → config derived → `elementConfig`
→ props thunk → `elementAttrs` → `valuesFrom` → `restPropsFor` → Atom materialize →
`mergeAtomPresentationProps` → `presentationSpread` → `#buildSpread` → `#nodeBehaviors` →
`attrs`/`handlers` (×2 with `super`) → `mergeBehaviorLayers` → 3 behaviour projections →
`mergeAttributeLayer`/`mergeHandlerLayer`/`composeHandlers` → `mergeSpreadProps` →
`resolvePresentation` → `resolvePreset`/`resolveEntry` → variants ×3 → `foldLayers` →
`foldPresentationAttrs` → `foldMotion` → `resolveClass` → `mergeClassesWithPreset` — and **14–18
intermediate objects** per render. The whiteboard header is one `$derived`-free template with eight
literal attributes reading two objects.

The same document answers the queue question in full: five `queueMicrotask` sites, two
`setTimeout`s, no rAF; the registry commit, the collection coalescing and the animate batch are each
one microtask per flush and correct. Nothing there is worth a microsecond.

## Are we over-engineering? — measured by what shipped components use

| mechanism                          | accepted by          | exercised first-party                                     | demonstrated (docs/stories) |
| ---------------------------------- | -------------------- | --------------------------------------------------------- | --------------------------: |
| `as` polymorphic tag               | ~112 part types      | **0**                                                     |                       **0** |
| `factory` prop                     | 32 roots             | 3 (all delegating popover wrappers)                       |                           0 |
| `getBond` export                   | 29 roots             | **0**                                                     |                           1 |
| `presetLayer` prop / `presets` bag | 109 parts / 15 roots | 4 / ~12 (the library talking to itself)                   |                       **0** |
| preset `render.base`, `motion`     | every entry          | 0 / 0                                                     |                       1 / 0 |
| `base` renderer prop               | 109 parts            | 2                                                         |                          98 |
| capability factories               | 42 exported          | 27 used, **15 with no consumer**                          |                           — |
| capability `compose`               | typed + plumbed      | **0 declarations**                                        |                           — |
| capability `setup`                 | 12 declarations      | 3                                                         |                           — |
| `Collection` `positional: true`    | option               | **0**                                                     |                           0 |
| `defineAtom` declarations          | 45 (+47 class Atoms) | 16 override attrs, 4 handlers, 2 onmount, **0 ondestroy** |                           — |
| virtualization (`createVirtual`)   | roadmap item         | **not implemented**                                       |                           0 |

Yes. Every rendered part carries, at runtime, the generality to be any tag (`as`), any renderer
(`base`), any preset shape (records, merged layers, function entries, per-instance layers, motion
channel), any capability projected onto it by role, composed over a prior registration, registered
in a cardinality-checked registry a relationship might query — and the shipped components use a
sliver of it. What _is_ used and does earn its keep: the 7 relationship links, roving/navigation on
four families, the `base` renderer (98 demos), swappable presets as a whole, `$props.id()` identity,
the portal system. Those are product. The mechanism that delivers them is not.

## The answer

The real cause is that **every part pays for a description of itself instead of being written**.
Not Svelte, not queues, not any single layer — the layered generality, whose cost is paid per
element per render and cannot be removed one layer at a time, because each layer is only slack
relative to the next. Seven rounds took 25–50% off individual layers and the ratio to shadcn barely
moved; the whiteboard removed the generality and beat shadcn by 46% and bits-ui by 87% with the same
behaviour on the page.

## Recommendation — re-platform the runtime on the whiteboard model

Keep the **public component surface** — family and part names, props, presets and their keys,
`$props.id()`-seeded ids, snippet arguments, the 7 ARIA relationships, the keyboard models, the
portal system — and replace what renders it. A family becomes what the whiteboard already is:

1. **One `.svelte.ts` of plain state classes per family** (root + parts). Props stay live through
   thunks; `$state` only for facts the DOM produces (a title's id, the focused item, a measured
   height). Cross-part ARIA is a child writing its id into its parent's `$state` field — one signal,
   no registry, no lazy descriptors, no cardinality scans.
2. **Context carries the class instance.** `Card.get()`, not a Bond behind a context key behind a
   definition. `{ card }` in the snippet argument is that instance (public type change: `CardBond` →
   `CardState`; `getBond` → an equivalent export where anyone needs it — nobody does today).
3. **Parts are their element.** A literal tag with literal attributes reading the state class.
   `as`/`base`/motion-via-props go away as _universal_ props (Round 7 already did this for 25
   parts); `base` survives where it is demonstrated — as an explicit slot on the few parts that
   render a consumer component (`Field.Control`, popover triggers, `Alert.Root`).
4. **Presets stay swappable through one helper.** `presetClass(installed, key, base, consumer,
state)` — installed entry resolved once per entry (function entries called once per state
   instance when they read it), tailwind-merge cached per (key, consumer, resolved). The variant
   axis stays where a family declares variants, resolved by the same helper with a cache keyed on
   variant values — the fix for the button finding in §17.
5. **Behaviour is a small set of helpers, not a runtime**: `roving(items, options)` over a
   registration array in mount order, `typeahead`, `outsidePress`/`escape` as shared document
   listeners with ref-counting, `focusScope`, `animate` (kept, batched), `portal` (kept). Perhaps
   500–800 lines, replacing 14 776 — and every one of them a function a family calls, not a
   capability the family registers so that a projection can find it by role.

What this costs: the `/shared` and `/experimental` authoring SDK (`Bond`, `Atom`, `defineBond`,
`defineAtom`, `useRoot`, `definePart`, capability factories) goes — ADR 0008 already says it is not
a complete SDK and lists it pre-1.0; `factory` goes with it (three internal wrappers re-root their
own popover family directly instead). Nothing a docs page demonstrates is lost.

### How, without a big bang

Family by family, each behind its existing public surface, with the family's own behaviour specs
(`accordion-keyboard`, `tree-keyboard`, `tabs-*`, `datagrid-ssr`, the SSR snapshots) as the gate and
the head-to-head arm as the measure — the same discipline every round used. Order by weight and by
how much the whiteboard already covers:

1. **Card** (whiteboard done: −46% vs shadcn) and **Accordion** (whiteboard done: −87% vs bits-ui),
   promoted from `test/perf/whiteboard/` into `components/` with motion for later toggles restored
   through `animate`.
2. **Collapsible, Tabs, Alert, Stack, Scrollable** — same shapes.
3. **Tree** (one state class per node instead of a Bond + 6 capabilities + 3 Atoms; the record
   redesign `tree-node-cost` declined becomes free), **DataGrid** (row and cell as literal elements
   over one grid state; selection stays a keyed map).
4. **Menu / Select / Combobox / Popover / Dialog / Drawer** — the overlay families, where the shared
   helpers (`outsidePress`, `escape`, `focusScope`, portal) are the whole runtime that remains.
5. Delete `bond/`, `capability/`, `kernel/`, `authoring/` when the last family moves; keep
   `preset/`, `utils/animate`, portal, `createVirtual`.

Expected, from the two whiteboards: card and accordion **ahead of shadcn/bits-ui on every client
column**, tree and table at a fraction of today's per-unit cost, SSR roughly halved where the
presentation fold was the cost. The fixtures and instruments that measured this stay in the repo
(`card-wb`, `accordion-wb` arms; `bench:vs-shadcn:ab/own/primitives`) so the migration is gated the
way the investigation was.

## Kernel, redesigned — same `Kernel.xxx` seam, the whiteboard underneath

The first recommendation above dropped Kernel with the rest of the runtime. That was wrong by one
layer: Kernel owns behaviour a consumer can observe — presentation precedence, tailwind-merge with
its memo, consumer/part attribute merge semantics (handler composition, aria token lists, `class`/
`style`), the transition and renderer leaves at their measured anchor cost, the lifecycle seam, DEV
diagnostics — none of which the whiteboard exercised. What the whiteboard proved dispensable is the
part of Kernel that _discovers_ what a part is: plan, node, the two lanes, `prepare()`/`escalates()`,
the Atom seam and the behaviour-layer projection. `src/lib/kernel/kernel.svelte.ts` is Kernel with
that removed and everything else kept, behind five methods:

| method                          | contract                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Kernel.element(props, spec)`   | The element seam. `spec` states the facts: `preset` key, base `class`, the part's own `attrs()` (attributes + handlers, read inside the memo so state reads track), `state` for function-form presets and variants, `variantProps`, and — only with a reason — `base` or `motion`. Returns `el` with one memoized `attrs` object and the leaf view. |
| `Kernel.render(el)`             | The leaf a rich part dispatches once, `{@render Kernel.render(el)(el, children)}` — unchanged syntax, unchanged leaves (transition ×4, `HtmlElement`, custom renderer), mode decided once from the spec. A plain part never calls it: `<div {...el.attrs}>`.                                                                                        |
| `Kernel.context(name)`          | A family's context: canonical `@ixirjs/context/<name>` key, `share`/`get`/`getOrThrow`. Replaces `defineBond`'s generated keys and `Bond.get()`.                                                                                                                                                                                                    |
| `Kernel.id(seed, part)`         | `${part}-${seed}` from the root's `$props.id()` — the same SSR-deterministic ids as today.                                                                                                                                                                                                                                                          |
| `Kernel.compose(consumer, own)` | Handler composition, consumer first, own skipped on `defaultPrevented` — the rule `Kernel.element` already applies to every consumer handler.                                                                                                                                                                                                       |

What `Kernel.element` does per resolution, in order — and it is the whole list: read the consumer's
props once; pick the preset key (consumer `preset` wins); resolve the entry (class-only default
entries once per entry via `simpleRecord`, function entries inside the memo so their state reads
track); resolve variants only if the record declares them; `mergeClassesWithPreset` (memoised) and
the default border; merge the part's own attrs under the consumer's with `mergeSpreadProps`
(consumer-first handler composition, aria/class/style merge, DEV source messages). One object out.
No plan, no node, no lane, no Atom, no registry, no fold of eleven axes.

**Authoring on it** — the whiteboard card and accordion are the worked examples
(`src/lib/test/perf/whiteboard/`): a family is a `.svelte.ts` of plain state classes plus one
`Kernel.context` per class; the root constructs and `share`s; every part `get`s, calls
`Kernel.element` with its facts, and spreads `el.attrs` on its literal tag. Cross-part ARIA is a
child writing its id into the parent's `$state`. Keyboard is a method on the state class over a
mount-ordered array.

**Dropped as over-engineered, and why it is safe**: `KernelPlan`/`KernelNode`/two lanes/`prepare()`/
`escalates()`/`RichPart` (existed to decide per render what a generic part needs; a written part
states it), `mergeAtomPresentationProps`/`presentationSpread`/`#buildSpread`/role projection (existed
to fold an Atom's capabilities in; there is no Atom), `readValues`' eleven thunks and the
`PresentationSnapshot`/`FoldedPresentation` intermediates (the spec is the values), the `attrs`
bargain lane, `definePart`/`defineLeaf`/`useRoot`/`bindBond` as separate seams (one `Kernel.element`
serves root, part and leaf alike), universal `as`/`base`/`motion` props (0/98-in-8-slots/12 uses:
`base` and `motion` become spec entries on the parts that have a reason).

### The cost of keeping Kernel — measured, with the spread stated

Both whiteboards were ported onto `Kernel.element`/`Kernel.context`/`Kernel.id`, then made to
exercise what the bare whiteboard had given up: the card's Title is the **composable** shape (`as`
and `base` through `Kernel.render`, next to the literal Header), the accordion Body renders through
the **transition leaf** with the shipped enter/exit recipes (instant for a body open at mount,
animated for one opened later). `whiteboard.svelte.spec.ts` pins all of it in a browser: `as="h2"`
renders `<h2>`, `base` renders the custom renderer with the consumer's attrs, the consumer's
`onclick` composes with the root's, `aria-labelledby`/`aria-controls`/`region` wiring, no WAAPI
animation at mount and one on a later open, ArrowDown moves focus.

The client harness turned out to carry more spread than any earlier round admitted — shadcn's own
card read 24.6–37.7 µs across today's runs, and its hydrate 17.3 in one arm and 28.0 in the next
arm of the _same_ run — so single reads are not results. Ranges over 3–5 runs:

| per unit             | whiteboard on Kernel | real family | shadcn / bits-ui |
| -------------------- | -------------------: | ----------: | ---------------: |
| card SSR µs          |            7.7 – 7.9 |   7.8 – 9.1 |        4.7 – 5.3 |
| card mount µs        |              22 – 45 |     38 – 44 |          25 – 38 |
| card hydrate µs      |              20 – 34 |     43 – 52 |          17 – 32 |
| card heap B          |      11 000 – 14 100 |      15 900 |           13 400 |
| accordion SSR µs     |          10.0 – 10.4 |     31 – 34 |          53 – 59 |
| accordion mount µs   |              22 – 23 |   161 – 165 |        155 – 184 |
| accordion hydrate µs |              18 – 19 |   142 – 151 |          87 – 98 |
| accordion heap B     |      10 300 – 10 750 |      38 800 |           37 000 |

Read that as: **the accordion result is robust — 7× under the real family and ~6× under bits-ui on
every run, with transitions and keyboard intact**; the **card is at parity with shadcn within the
harness's own spread**, ahead on heap and SSR-neutral. A card is four divs; both sides are dominated
by Svelte's component and effect floor (the own-cost profile puts Svelte's self time at ~21–25 µs
of ~48 in-profile for us _and_ for shadcn). The 20–22 µs card reads early in the day were the
favourable end of the spread, not a different code state — the interleaved A/B with the same bundle
on both sides varies 12%.

The composable shapes have a price and it is the known one: a polymorphic part (`as` as a thunk)
takes the `<svelte:element>` leaf, +2 hydration anchors and, by interleaved A/B, ~3–5 µs per part
over the literal tag. That is why it is per part and opt-in: Header is literal, Title is composable,
and a family chooses.

Two things the first cut of the new Kernel got wrong and the SSR profile caught before they shipped:
the string form of the user class bypassed `mergeClassesWithPreset`'s memo (tailwind-merge ran per
part, 10% of SSR self time — the memo caches only a flat string array keyed on its first element,
now hoisted per element), and the eight-closure handle object was 9% of SSR self time (now a class
with one allocation). Card-wb SSR went 10.5 → 7.7 µs from those two.

One honest wart on the card: `broad` (a page-wide class change) reads 6.3 µs against shadcn's 1.6,
because a memoised attrs object is rebuilt and re-diffed whole where a compiled template updates
only `class`. bits-ui has the same shape. It is the price of one object per element; a family that
cares can put `class` on the tag literally and spread the rest.

## Promoted: Card and Accordion on the redesigned Kernel (2026-08-26)

Both families now ship on `Kernel.element`/`Kernel.render`/`Kernel.context`/`Kernel.id`, behind
their existing public surfaces. The vocabulary stayed — the family's shared object is still
`CardBond` / `AccordionBond` / `AccordionItemBond` (plain classes now), so `{ card }`,
`{ accordion }`, `{ accordionItem }`, `getBond`, `factory`, `CardBond.create` and every exported
type keep their names; `Factory<T>` no longer requires a `Bond`. What went: `Atom`s, capabilities,
the node registry, `useRoot`/`definePart`, universal `as`/`base`/`motion` (Card's parts and both
roots are literal elements; the accordion body renders through the transition leaf with the shipped
recipes, the indicator through the `animate` driver). Old-runtime perf fixtures that used Card as
their vehicle (`lanes/`, `lazy-kernel/`, the inert-part probes, `bond-construct`,
`capability-cost`) moved to Alert, which is still on it.

**Gates.** 1116 unit tests (the families' own keyboard, callback, preset, intro and behaviour specs
unchanged except the Atom-registry spec, replaced by a DOM-level one); `bench:ssr` fingerprints
**unchanged** — card/cardroot/card-preset shas identical, i.e. byte-identical production output;
`bench:growth` accordion k 0.83, n=400 mount **20.6 ms** (261 → 92 → 20.6 over the day); public
surface and prop tables refreshed; eslint and the authoring audit sanction the seam's import path
(`$ixirjs/ui/kernel/kernel.svelte`). SSR snapshot deltas, all a11y-neutral or better: Card loses
only the DEV `data-bond`/`data-kind` markers; Accordion loses `aria-disabled="false"`,
`aria-multiselectable="false"`, `aria-hidden="false"`, a stray `value=` attribute and
`role="button"` on a `<button>`, and gains `type="button"`, `aria-controls` at SSR and
`tabindex="0"` on the first header at SSR (was −1 on every header). A preset's `render.as`/
`render.base` is honoured by every part that dispatches through `Kernel.render` — resolved once at
init, a consumer's `as` winning over the preset's over the part's own — and `AccordionItem.Root`
dispatches for exactly that reason (the docs theme renders items as `<li>`; one anchor and ~2 µs
per item, paid only there). A part that renders a literal element cannot honour it, and DEV warns
once per preset key when a theme targets one.

**Numbers** (`bench:ssr` µs/unit; `bench:vs-shadcn` SSR; client 6 rounds, ranges over runs):

| per unit             | before (Round 7) | **promoted** | shadcn / bits-ui |
| -------------------- | ---------------: | -----------: | ---------------: |
| `bench:ssr` cardroot |             3.36 |     **1.67** |                — |
| `bench:ssr` card     |            10.85 |     **6.53** |                — |
| accordion SSR        |          31 – 38 |     **15.8** |          53 – 59 |
| accordion mount      |        161 – 165 |     **52.7** |        155 – 187 |
| accordion hydrate    |        142 – 151 |     **33.3** |         87 – 101 |
| accordion heap B     |           38 800 |   **21 380** |           36 750 |
| card mount           |          38 – 44 |  **34 – 35** |          29 – 30 |
| card hydrate         |          43 – 52 |      45 – 49 |          17 – 32 |
| card heap B          |           15 900 |   **14 275** |           13 450 |

Accordion is the headline: **−72% mount and −67% hydrate against bits-ui**, from +99% / +74% this
morning. Card is at shadcn parity on mount (+12%) and heap (+6%); its hydrate column swings with
the harness's first-arm effect (shadcn's own hydrate read 17 and 32 in consecutive runs) and both
sides' hydrate profiles have the same shape (Svelte 53%, GC 17%) — there is no card-specific
hydrate cost left to find in the library frames.

### The dispatch is free when the leaf is bound once

Keeping a preset's `render.as`/`render.base` needs a part to render "whichever leaf this turns out
to be", and the first cut paid a `snippet()` block, a branch, a `BranchManager` and a hydration
anchor per dispatching part for it (`AccordionItem.Root`: +8 µs, +1 anchor). The compiler test
(`svelte/compiler`, client and server) shows the block is not the price of the _choice_ — it is the
price of the call-site shape: `{@render Kernel.render(el)(…)}` is a call expression the compiler
must assume can change, so it wraps it; `const leaf = Kernel.render(el)` in the script and
`{@render leaf(el, children)}` is a plain identifier callee and compiles to a direct call with no
block and no anchor on either platform. The leaf is decided once at init anyway, so binding it once
loses nothing. Applied to every dispatching part: accordion SSR anchors 26 → **21** (below the
literal-root 24, because the body's and indicator's dispatches lost theirs too), per item
**29 effects / 16 deriveds / 7 blocks / 10 branches / 2 attach** (this morning 55 / 26 / 12 / 21 /
5; bits-ui 52 / 41 / 12 / 21 / 4), comments 8 per item (bits-ui 13), heap 20.6 KB (bits-ui 36.8).
The rule is in `Kernel.render`'s doc comment and AGENTS.md — and, the trade-off accepted, it was
then applied to **every part on the older runtime as well** (119 files): the 36 SSR snapshots that
changed did so by anchors alone, **792 → 611 across the library (−23%)**, zero other byte
differences; `bench:ssr` fingerprints re-pinned for collapsible, datagrid, tree and menu by exactly
those bytes; anchor rows re-pinned (collapsible 16 → 13, tree 16 → 15, menu item 9 → 8, lane rows
13 → 11). What was traded: a part whose props turn rich _after_ init keeps its initial leaf — a
`base` or motion that appears later is not honoured (two specs re-stated to the init-time
contract). Nothing in the repo relied on it.
