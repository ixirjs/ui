# Runtime performance against shadcn-svelte (2026-08-21)

Status: **Phases 0–1 complete; two rounds of fixes landed on top (§11, §12). §8's lever table and
§9's staged plan are the original ranking and are superseded in part by both — read §11 and §12
before working from them.**

Companion to `hydration-anchor-diet-2026-08.md` (anchor cost model),
`nesting-component-vs-snippet-2026-08.md` (seam cost model) and
`menu-item-atom-seam-2026-08.md`. Those priced our seams against each other. This one prices the
library against the thing consumers actually compare it to, and it is the first document here that
reports numbers we lose.

---

## 0. Executive summary

We are **faster than bits-ui and slower than no abstraction at all**, and that split is nearly
perfect across every axis.

| Axis              | Where we win                                | Where we lose                                                          |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| SSR µs/unit       | menu **−67%**, accordion **−35%**           | table **+201%**, card **+130%**, button **+59%**                       |
| Client mount      | menu **±0%** (parity)                       | accordion **+1630%**, table **+169%**, card **+87%**, button **+129%** |
| Hydration         | menu +24%                                   | accordion **+1014%**, table **+211%**, card **+105%**, button **+67%** |
| Targeted update   | menu **−6%**, card **±0%**, button **±0%**  | table **+167%**, accordion **+86%**                                    |
| Hydration anchors | accordion **21 vs 25**, and 3 elements vs 5 | card 19 vs 14, table 20 vs 15, menu 9 vs 7, button 6 vs 4              |
| Shipped JS        | raw **−15%**                                | brotli **+13%** (gzip +2%, i.e. parity)                                |

Three sentences of interpretation:

1. **Against bits-ui we already win, decisively, on the server** — a menu item costs 7.94 µs against
   22.65, an accordion item 36.44 against 56.42 — and we render _less DOM_ doing it (3 elements per
   accordion item to bits-ui's 5, because we do not render a closed panel and they do).
2. **Against vendored source we lose, and the loss is structural, not sloppy.** A shadcn card part is
   a `<div>`, one `cn()` and a spread: **1.53 µs**. Ours is **2.93 µs** on the cheap lane and
   **8.46 µs** on the rich one. Everything above 1.53 µs buys a Bond, a registered semantic identity,
   cross-slot ARIA and a swappable per-slot preset. That is a real product decision, but it is not
   free and this document stops pretending otherwise.
3. **The client is worse than the server, and two families were defects rather than costs.** Our
   accordion mount was superlinear — three separate O(n)-per-item reads, all now fixed (§7). A cold
   400-item mount went from ~2880 ms to ~1000 ms and the gap to bits-ui from ~41× to ~15×. It is
   **still** superlinear (k ≈ 1.55 against their 0.97); the remaining cause is measured — `Collection`
   publishing a membership change per `set` — and a prototype that batches it reaches k = 0.67 and
   288 ms, but breaks a synchronous a11y invariant and is therefore not shipped. **Tree had the same
   defect and worse** — `visibleHeaderIds` is recursive and spreads child arrays, so a 400-node mount
   took **13.6 seconds** at k = 2.51. That one is fully fixed: **131 ms, k = 0.94 — 92×** (§7b).

**The cheapest reversals, ranked by measured µs × instances:** (1) memoize the resolved class on the
rich lane — 8% of datagrid SSR, and it multiplies by rows × cells; (2) batch collection registration
so mount stops being O(n²) in reaction marking; (3) stop emitting a per-part `id` nobody references.
Full table with numbers and risks in §8.

---

## 1. The opponent is two opponents

`shadcn-svelte` is not one runtime, and a blended number hides both halves.

| Half               | Families in this set    | What it actually is                                 | The fight                     |
| ------------------ | ----------------------- | --------------------------------------------------- | ----------------------------- |
| **Presentational** | Card, Button, Table     | vendored source: a `<div>`, one `cn()`, `{...rest}` | against _no_ abstraction      |
| **Behavioral**     | Accordion, DropdownMenu | a thin wrapper over **bits-ui**                     | against _another_ abstraction |
| **Absent**         | Tree                    | nothing — shadcn ships no tree                      | against a hand-written floor  |

Against the presentational half there is no machinery to remove: the floor is `cn()` plus a spread,
and everything above it is ours to justify. Against bits-ui the question is whether a Bond and its
capabilities cost less than `svelte-toolbelt` boxes, `mergeProps` and per-part state classes. Both
are answered below, and the answers point in opposite directions.

Iteration 15 of `shadcn-comparison/README.md` called unbounded collections "the one decisive loss".
That verdict is **now stale in both directions**: `createVirtual` has landed, so the collection loss
is opt-in-recoverable — and the per-row cost that virtualization was supposed to make irrelevant is
itself the largest single SSR loss in this set (§3).

## 2. The harness

```
bun run bench:vs-shadcn:fetch    # re-vendor shadcn source; --verify fails if the registry drifted
bun run bench:vs-shadcn          # SSR: µs/unit, GC share, bytes/anchors/elements per unit, skeleton
bun run bench:vs-shadcn:client   # mount, hydrate, targeted, broad, live DOM, retained heap
bun run bench:vs-shadcn:size     # shipped JS, raw/gzip/brotli
node scripts/bench-vs-profile.mjs <family> <side> <n> [--cold|--scale]   # client attribution
```

Pinned opponent, recorded in `bench/vs-shadcn/provenance.json`:

- shadcn-svelte registry content hash **`bb18a383f940250b`**, fetched 2026-08-21 (the registry is
  unversioned, so the content hash _is_ the version; `--verify` fails when it drifts)
- **bits-ui 2.19.0**, tailwind-variants 3.3.1
- **svelte 5.56.8 compiles both sides** — the same compiler, in the same build, in one process.
  Benching across compiler versions invalidates every µs figure, ours included.

Method, and why each piece is there:

- **Every figure is a slope** between two instance counts, so per-page fixed setup (a Root, a portal
  host, a `<table>` wrapper) cancels and what remains is the marginal cost of one unit.
- **The two sides interleave at the innermost loop.** A-then-B is the classic false win.
- **Endpoints are floored across rounds, then subtracted** — never the minimum of per-round slopes,
  which is biased downward by pairing a fast HIGH with a slow LOW.
- **The IQR of per-round slopes is printed beside every figure.** A gap narrower than the spread is
  reported with `~` and is not a result.
- **The 1-minute load average is printed, and a busy box is called out.** This is not decoration: an
  early run of this harness on a box at load 11-of-16 reported `card` at 76.45 µs where the same tree
  gives 13.96 µs idle — 5.5× inflation that no amount of flooring removes, because the competing work
  is not this process's. It also distorted the _ratio_: the same card pair read **+107%** idle and
  **+164%** loaded. Every number in this document was taken at load < 3.

### Byte-identical output is impossible, so the parity claim rests on the skeleton

Two libraries cannot render identical HTML — different class strings, different `data-*`, ours
carries ids. The harness therefore asserts nothing about bytes and instead reports, per unit: bytes,
hydration anchors, **anchor bytes** (comment-node bytes alone — abstraction overhead net of class
string length), element count, and a **tag + `role`/`aria-*` skeleton**. Where the skeletons differ
the report prints `≠` and the difference is named here rather than passed over:

| Family    | Skeleton difference                                                                                                                 | Whose favour                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| card      | our title is `<h3>`, theirs a `<div>`                                                                                               | ours (semantics), cost-neutral |
| accordion | bits-ui wraps the trigger in a `role="heading"` div and renders the **closed** panel with `hidden`; we render 3 elements to their 5 | ours                           |
| table     | our DataGrid is a CSS grid of `<div role="row">`; theirs is `<table>/<tr>/<td>`                                                     | theirs (native semantics)      |
| menu      | our item is an `<li>`; theirs a `<div role="menuitem">`                                                                             | ours (semantics), cost-neutral |
| button    | identical                                                                                                                           | —                              |

Two fixture decisions worth stating because they change numbers:

- **The accordion opens every item on both sides.** bits-ui renders a closed panel anyway; we render
  nothing for one. Leaving them closed would have compared _n_ bodies against zero and called the
  difference per-item cost. It also means our JS `enter` motion runs _n_ times at mount, which is a
  real cost we pay and they do not — measured at ~30% of our 400-item mount (§7).
- **Behavioral fixtures use bits-ui primitives with shadcn's own class strings** where the shadcn
  wrapper hard-imports a lucide icon. The `cn()` call, class strings and `data-slot` attributes are
  shadcn's, copied from their file; only the icon is absent, on both sides.

## 3. Scoreboard — SSR

`bun run bench:vs-shadcn`, 13 measured rounds × 8 iterations, sides interleaved, load < 3 of 16
cores, AMD Ryzen 9 PRO 8945HS ×16, node v24.13.1. **Median of three whole runs**, with the range
across those runs beside it — a single run moved `accordion` between −33% and −40%, which is the
resolution you actually have.

Re-recorded 2026-08-21 after the §7 fixes landed, on a quieter box (load < 2).

| Family    | unit       | @ixirjs/ui (median, range) | shadcn-svelte (median, range) | verdict        |
| --------- | ---------- | -------------------------- | ----------------------------- | -------------- |
| card      | per card   | **12.02** (12.00–12.21)    | 5.22 (5.06–5.22)              | **+130%**      |
| button    | per button | **2.45** (2.34–2.48)       | 1.54 (1.50–1.62)              | **+59%**       |
| accordion | per item   | **36.44** (36.36–37.83)    | 56.42 (55.61–58.30)           | **−35% win**   |
| table     | per row    | **20.19** (19.78–20.85)    | 6.70 (6.69–6.89)              | **+201%**      |
| menu      | per item   | **7.57** (7.53–7.96)       | 22.65 (21.16–22.69)           | **−67% win**   |
| tree      | per node   | **43.90** (43.80–45.23)    | 0.06 (hand-written floor)     | **732× floor** |

**Every absolute here is 5–15% below the previous recording — on both sides.** That is the machine,
not progress: shadcn's card fell 6.13 → 5.22 and its accordion 67.85 → 56.42 without a line of their
code changing. The _ratios_ are the stable quantity, and they moved by less than their own spread
(card +114 → +130%, accordion −38 → −35%, menu −69 → −67%). Same trap as §2, seen from the other
side: a cross-session comparison of absolutes on one box says nothing.

The button verdict sits close to its own spread — their per-round IQR reached ±1.71 against a median
of 1.63, and one of the three runs marked it `~`, i.e. inside the noise. Read it as "we are somewhat
slower on button", not as a precise 71%. Every other verdict is far outside its spread in all three
runs.

**GC share runs the other way and is worth noticing**: ~22% (us) vs ~45% (them) on card, ~19% vs
~47% on table, ~33% vs ~50% on button. shadcn allocates far more per unit of work than we do —
`cn()` is `clsx` + `twMerge` on every element on every render, where our class-only lane resolves the
string once per plan and caches it. We lose on CPU while winning on allocation, which is why closing
the CPU gap is worth doing and why "just cache harder" is not the answer: the caching is already
there on the lane that has it, and missing on the lane that does not (§8, lever 1).

### Output census, per unit

Load-independent, so these are the most reliable numbers in the document.

| Family    | side   | bytes   | anchors | anchor B | elements |
| --------- | ------ | ------- | ------- | -------- | -------- |
| card      | ixir   | 591     | **19**  | 144      | 4        |
|           | shadcn | 554     | 14      | 106      | 4        |
| button    | ixir   | **231** | 6       | 42       | 1        |
|           | shadcn | 707     | **4**   | 32       | 1        |
| accordion | ixir   | **662** | **21**  | **157**  | **3**    |
|           | shadcn | 1415    | 25      | 215      | 5        |
| table     | ixir   | 629     | 20      | 152      | 4        |
|           | shadcn | 672     | **15**  | 113      | 4        |
| menu      | ixir   | **308** | 9       | 69       | 1        |
|           | shadcn | 921     | **7**   | 59       | 1        |

Read it two ways:

- **Bytes: we win almost everywhere**, by up to 3× (menu 308 vs 921, button 231 vs 707). That is
  entirely class-string length — tailwind-variants emits every variant's classes into the attribute.
  It is a real transfer-size win and a real _nothing_ for CPU.
- **Anchors: we lose everywhere except accordion.** +5 per card, +5 per row, +2 per button and per
  menu item. The anchor diet moved us a long way (card 34 → 24 → 19 in the budget spec's own
  history), and the remaining gap is the price of one component boundary per part plus `$props.id()`
  per root. Accordion is the exception because bits-ui spends 5 elements and a heading wrapper where
  we spend 3.

## 4. Scoreboard — client

`bun run bench:vs-shadcn:client`, 3 measured rounds, targeted storm of 100, 4 broad updates,
chromium via playwright, load < 3. Mount/hydrate/broad are µs per unit (slopes); targeted is µs per
flush for one probe unit embedded in a tree of _n_ others.

| Family    | side    | mount                | hydrate         | broad           | targeted (high n) |
| --------- | ------- | -------------------- | --------------- | --------------- | ----------------- |
| card      | ixir    | 83.14 **+87%**       | 74.71 **+105%** | 2.32 (+8%)      | 8 (**±0%**)       |
|           | shadcn  | 44.43                | 36.43           | 2.14            | 8                 |
| button    | ixir    | 20.57 **+129%**      | 10.00 **+67%**  | 6.00 (+49%)     | 7 (**±0%**)       |
|           | shadcn  | 9.00                 | 6.00            | 4.04            | 7                 |
| accordion | ixir    | 2029 **+1630%**      | 1648 **+1014%** | 11.83 (+87%)    | 13 (+86%)         |
|           | shadcn  | 117.33               | 148.00          | 6.33            | 7                 |
| table     | ixir    | 134.29 **+169%**     | 79.00 **+211%** | 23.11 **+709%** | 16 **+167%**      |
|           | shadcn  | 50.00                | 25.43           | 2.86            | 6                 |
| menu      | ixir    | 62.71 (**±0%**)      | 48.57 (+24%)    | 19.29 (**−2%**) | 16 (**−6%**)      |
|           | shadcn  | 62.57                | 39.29           | 19.61           | 17                |
| tree      | ixir    | 1372.67 (515× floor) | 1653.33 (827×)  | 11.83 (24×)     | 12 (12×)          |
|           | control | 2.67                 | 2.00            | 0.50            | 1                 |

Accordion and tree run at 50/200 units rather than 100/800 because 800 is minutes per round for
accordion; that substitution **understates** its gap, since the cost is still superlinear.

**The mount absolutes here run high against an isolated mount** — `bench:growth` puts tree at
~320 µs/node where this reports 1373. Both sides are measured under identical conditions (six
families, a hundred update flushes and a hydrate leg each, in one long-lived page), so the _ratios_
are sound; the absolutes carry that accumulated heap. Use `bench:growth` or
`bench-vs-profile --scale` when the absolute mount cost is the question.

### Live DOM and retained heap, per unit

| Family    | side    | elements | comments | texts | heap B/unit    |
| --------- | ------- | -------- | -------- | ----- | -------------- |
| card      | ixir    | 4        | 13       | 9     | 112 167 ⚠      |
|           | shadcn  | 4        | 9        | 5     | 12 078         |
| button    | ixir    | 1        | 3        | 5     | 7 303 (+86%)   |
|           | shadcn  | 1        | 2        | 2     | 3 930          |
| accordion | ixir    | **3**    | 14       | 13    | 44 608 (+27%)  |
|           | shadcn  | 5        | 13       | 9     | 35 079         |
| table     | ixir    | 4        | 13       | 10    | 31 039 (+155%) |
|           | shadcn  | 4        | 9        | 6     | 12 182         |
| menu      | ixir    | 1        | 4        | 6     | 10 801 (+7%)   |
|           | shadcn  | 1        | 3        | 3     | 10 072         |
| tree      | ixir    | **3**    | 10       | 7     | 35 495 (57×)   |
|           | control | 4        | 0        | 3     | 621            |

⚠ **The card heap figure is not trustworthy** and is printed rather than quietly dropped: 112 kB of
retained heap for four `<div>`s is implausible on its face, and it exceeds the accordion's — a
component with a Bond, four capabilities and a motion rune per item. `usedJSHeapSize` is the noisiest
axis in the harness even with `--enable-precise-memory-info`. Treat every heap column as an order of
magnitude; treat this cell as broken until someone re-measures it with a heap snapshot instead.

> **Re-measured 2026-08-25 (§14).** It was broken, and so was the whole column — not just the card
> cell. `usedJSHeapSize` is page-wide, so it carries V8 fragmentation and every other allocation the
> page has made. A CDP heap snapshot (full GC, then reachable `self_size` diffed between the two
> counts) gives **card 25.0 kB/unit against shadcn's 13.5 (+85%, not +730%)** and **table 29.6
> against 13.6 (+118%)**; button 6.4 vs 3.9, tree 36.6 vs 0.7. The ratios move, not just the
> absolutes, which is why the column could not be read as "an order of magnitude" either. The heap
> leg now takes that snapshot — it moved out of `vs-client.svelte.ts` and into
> `scripts/bench-vs-client.mjs`, because only the driver has CDP.

The text-node column is a genuine and unremarked cost: we emit **9 text nodes per card to their 5**,
**10 per row to their 6**. Empty text nodes between anchors are cheap individually and are pure DOM
mass in a 1000-row grid.

## 5. Scoreboard — shipped JS

`bun run bench:vs-shadcn:size` — the same five families bundled, minified, tree-shaken, Svelte
external on both sides (it ships once per app either way), `@lucide/svelte` external (icons are a
per-app choice on both sides, so bundling one side's set would measure the icons).

| side       | raw          | gzip        | brotli      |
| ---------- | ------------ | ----------- | ----------- |
| @ixirjs/ui | **295.2 kB** | 75.1 kB     | 63.0 kB     |
| shadcn     | 345.9 kB     | **73.7 kB** | **55.8 kB** |
| vs         | **−15%**     | +2%         | **+13%**    |

We ship _less code_ and it _compresses worse_. shadcn's bulk is repeated Tailwind class-string
literals, which is exactly what a compressor eats; ours is program text. On the axis that matters for
transfer — brotli — this is a **13% loss**, and on gzip it is parity. Calling this "we're smaller"
because raw is smaller would be the dishonest reading.

## 6. Cost model

Two ladders, both measured on this box, both reproducible.

**The lane ladder** (`bun run bench:lanes`, 20 rounds): the same `card.title` slot rendered through
each authoring path, all arms asserted byte-identical.

```
direct       8.50 µs/card   8 anchors    module-scope plan + node, plain import
node         8.50 µs/card  10 anchors    the same part reached as `Card.Title`
inlinePlan   9.37 µs/card   8 anchors    plan resolved per instance instead of per module
element     10.16 µs/card   8 anchors    the same part authored through `definePart`
escalated   14.02 µs/card  10 anchors    one rich prop → full presentation resolution
```

**The component ladder** (`bun run bench:ssr`): `plain 0.21 · cardroot 4.36 · card 13.16 ·
datagrid 18.98 · tree 66.12`.

Unit costs, each derived **within a single harness** so no figure is a cross-harness subtraction:

| Thing                                                    | µs       | derivation (harness)                                     |
| -------------------------------------------------------- | -------- | -------------------------------------------------------- |
| hand-written `<div>` in one template                     | 0.05     | `plain` 0.21 / 4 elements (`bench:ssr`)                  |
| **our root** (Bond + capabilities + share + `$props.id`) | **4.36** | `cardroot` (`bench:ssr`)                                 |
| **our part, class-only lane**                            | **2.93** | (`card` 13.16 − `cardroot` 4.36) / 3 (`bench:ssr`)       |
| **our part, rich lane**                                  | **8.46** | `escalated` 14.02 − `direct` 8.50 + 2.93 (`bench:lanes`) |
| **rich-lane premium**                                    | **+5.5** | `escalated` − `direct` (`bench:lanes`)                   |
| **a shadcn part** (boundary + `cn` + spread)             | **1.53** | card 6.13 / 4 parts (`bench:vs-shadcn`)                  |

The model is built entirely from `bench:ssr` and `bench:lanes`, so predicting the _third_ harness is
a real test rather than a division:

- **card**, predicted 4.36 + 3 × 2.93 = **13.15 µs**; `bench:vs-shadcn` measured a median of
  **13.12** — **within 0.3%**.
- **datagrid row**, predicted from the same units as one root plus four rich-lane elements minus the
  registration a cell does not do: `bench:ssr` measures the row at 18.98 and `bench:vs-shadcn` at
  **22.02** — **+16%**, at the edge of the ±15% band. The two fixtures differ (the parity fixture adds
  a probe row and a `class` prop), and the row is the least-decomposed unit in the set.
- **shadcn card** = 4 × 1.53 = 6.13, measured 6.13 — this one _is_ a division and proves nothing
  beyond internal consistency.

So the card loss decomposes as: **the root costs ~2.8 µs more than a bare div because it constructs a
Bond, activates its capabilities, publishes context and seeds an SSR-deterministic id; each part costs
~1.4 µs more because it registers a lazy semantic node, resolves a class through the preset seam, and
spreads an attribute object instead of emitting a literal class attribute.** A rich-lane part costs a
further 5.5 µs on top, which is why the datagrid — four rich-lane elements per row — is the largest
loss in the set.

### Where the time goes, by profiler

`LAYER=card bun run profile:ssr` and `LAYER=datagrid bun run profile:ssr`, self time:

| Bucket                                                           | card   | datagrid  |
| ---------------------------------------------------------------- | ------ | --------- |
| garbage collector                                                | 25.9%  | 22.8%     |
| Svelte's own server renderer¹                                    | ~31%   | ~22%      |
| Kernel / presentation²                                           | ~17%   | ~17%      |
| class merging (`mergeClassesWithPreset` + tailwind-merge + clsx) | ~1.4%³ | **~8.0%** |
| Bond construction / binding                                      | ~1.7%  | ~2.6%     |
| root component body                                              | 10.3%  | —         |

¹ `#collect_content`, `#traverse_components`, `attributes`, `is_boolean_attribute`,
`get_or_init_context_map`, `child`, `escape_html`, `#collect_ondestroy`, `component`.
² `divBranch`, `spread`, `assembleProps`, `buildKernelElement`, `elementAttrs`, `withDefaultBorder`,
`resolvePresentation`, `KernelNode`, `registerLazy`, `prepare`.
³ On card this is `klass` alone at 1.39% — **no tailwind-merge frame appears at all**, because the
class-only lane hits `plan.defaultClass` and the string was resolved once per plan. That absence is
the finding: the datagrid's 8% is the same work, done per instance, because its parts take the rich
lane.

Two things fall out of this that were not obvious:

1. **The single largest identified bucket is Svelte's own renderer, not our code**, and it scales with
   the number of _component boundaries_ and _spread attributes_. Every part we add is a boundary
   Svelte must traverse and a spread it must walk. shadcn pays the boundary too — but writes
   `data-slot="card"` as a **static** attribute compiled into the template string, where every one of
   our attributes goes through the runtime attribute walk.
2. **The datagrid pays 8% in class merging that the card does not**, because its rows and cells go
   through `Kernel.element` (the rich lane) where the class is re-resolved through `twMerge` per
   instance, while the card's parts hit `plan.defaultClass`, resolved once per plan. This is the
   single most concentrated, most multiplied inefficiency found in this pass — a grid pays it
   rows × cells times.

## 7. Two superlinear-mount defects — accordion, and tree

### 7a. Accordion — found, partly fixed

`node scripts/bench-vs-profile.mjs accordion --scale` mounts each side cold at 50/100/200/400. A flat
µs/unit column means linear.

| n   | ours, before  | ours, now     | bits-ui |
| --- | ------------- | ------------- | ------- |
| 50  | 111.9 ms      | 90.4 ms       | 14.7 ms |
| 100 | 271.6 ms      | 123.6 ms      | 20.6 ms |
| 200 | 665.0 ms      | 613.6 ms      | 43.5 ms |
| 400 | **3215.7 ms** | **2187.9 ms** | 90.2 ms |

bits-ui is linear (≈200 µs/item at every size). We were **not**, and still are not.

**Cause, from the warmed profile** (`node scripts/bench-vs-profile.mjs accordion ixir 400`): every
accordion item's header atom reads two things that were each O(n).

1. `AccordionBondBase.#enabledIds` — a plain getter running `.filter().map()` over every item, read
   once per item through `parent.focusedId` (the roving tabindex). Two array allocations × n items ×
   n reads.
2. `AccordionItemBondBase.isOpen` / `isActive` — `parent.values.includes(this.id)`, O(open) per item.
   With every panel open that is a second quadratic; it was 7.8% of warmed self time at n = 400.

**`DropdownMenu` never had either**, which is exactly why menu is the family we win: its roving
backing points at `Collection.keys`, which the Collection caches. The correct pattern already existed
in the codebase, one directory over.

**Landed** (`src/lib/components/accordion/bond.svelte.ts`,
`src/lib/components/accordion/item/bond.svelte.ts`, `src/lib/components/tabs/bond.svelte.ts`):

- `#enabledIds` and the identical `TabsBondBase.#enabledValues` are now `$derived`. Tabs had the same
  O(n²) shape and no benchmark that could see it, a tab strip being short — the shape is wrong
  regardless of the constant.
- `AccordionBondBase.isValueOpen(value)` gives O(1) membership over a `$derived` Set;
  `IAccordion.isValueOpen?` is **optional**, so an external implementor of that contract keeps
  compiling and callers fall back to `values.includes`.

3216 ms → 2955 ms (memo) → 2188 ms (membership) at n = 400: **−32%**. `bun run bench:ssr` fingerprints
are unchanged, all 192 test files / 1096 tests pass, and the SSR accordion improved from a 49.01 µs/item
median to 42.28, widening that win from −26% to −38%.

**Deliberately not fixed here.** The same O(n) membership walk lives in `SelectionModel.isSelected`
and is shared by roughly ten families. The obvious fix — a `$derived` Set inside `createSelection` —
is unsound as a blanket change: that model's backing is not guaranteed reactive across all its
callers, and a `$derived` over a non-reactive backing caches a stale answer forever. The accordion's
backing is a `$bindable` prop, so the local fix is sound; the general one needs a per-caller audit.
It is lever 4 in §8.

> **Resolved 2026-08-23.** The audit did not have to be exhaustive, because the model cannot detect a
> stale index from the outside and should not try. `SelectionBacking` gained an opt-in `indexed`
> flag: declare `get()` reactive and `isSelected` answers from a `$derived` Set, otherwise it scans
> exactly as before. Accordion, DataGrid and Select set it — each backs onto its own `$bindable`
> prop — and their three independent local workarounds (`#openValues`, `#selectedIds`, and
> `SelectItemAtom.isSelected` reading `props.values.includes` directly) are gone, delegating to the
> one model. Tabs and `createDisclosure` are single-valued and stay below the Set threshold, so they
> are unchanged either way. The guard is pinned by three cases in `selection.svelte.spec.ts`,
> including the one that killed the inference-based version: a plain array behind a plain getter
> keeps both its identity and its length across `values[3] = x`, so nothing observable distinguishes
> it from a reactive backing that has not changed.

**A third quadratic, found by diagnosis rather than by profiling.** The profiler showed a _flat_
warmed profile after the first two fixes — no single frame dominated — which is what a reaction
cascade looks like: the cost is spread over every dependent. What found it was a fitted growth
exponent, `t ∝ n^k`, now printed by `node scripts/bench-vs-profile.mjs <family> --scale`:

| family / side       | k    | reading                       |
| ------------------- | ---- | ----------------------------- |
| **accordion, ours** | 1.85 | superlinear — the defect      |
| accordion, bits-ui  | 0.97 | linear                        |
| **menu, ours**      | 0.33 | linear (fixed cost dominates) |

Our own menu being linear is the discriminator that mattered: a menu item also owns a Bond, also
registers into a parent `Collection`, and also carries roving + navigation. So the cause could not be
"Bond machinery is quadratic".

The cause is one expression — `AccordionBondBase.focusedId`:

```ts
get focusedId() {
	return this.#roving.activeId ?? this.#enabledIds[0] ?? null;   // ← the fallback
}
```

Every item's header atom reads `focusedId` for its roving tabindex. When nothing is highlighted,
`activeId` is `null`, so the expression **falls through to the item list** — and as a plain getter,
each header therefore depended on the collection directly. Mounting item _i_ invalidated all _i−1_
headers already mounted: O(n²).

`DropdownMenu` escapes it by accident of ordering: `RovingFocus.indexOfActive()` returns `−1`
_before_ it touches `ids()` when the active id is null, so its items never take a dependency on the
list at all. Same capability, same collection, one early return apart.

Deleting the fallback outright confirmed it — k 1.61 → 0.86, and a 400-item mount 2803 → 458 ms —
but the fallback exists so the accordion is always Tab-reachable when every panel is closed, which
`accordion-keyboard.svelte.spec.ts` pins. **Landed** instead:

- `focusedId` is now a `$derived`, which is an **equality gate** rather than a memo: a registration
  invalidates one signal, it recomputes to the _same string_, and Svelte stops the propagation there.
- the fallback reads a new `#firstEnabledId` that scans with an **early return** instead of taking
  `#enabledIds[0]`, so the full filter+map is not rebuilt per registration — and `#enabledIds` is not
  read at all during a mount where nothing is highlighted.

Interleaved A/B, best of three, both sides in one page
(`node scripts/bench-vs-profile.mjs accordion --scale`):

|        | n=400, ours    | vs bits-ui    | k           |
| ------ | -------------- | ------------- | ----------- |
| before | 2829 / 2883 ms | 38× / 45×     | 1.91 / 1.79 |
| after  | 1114 / 968 ms  | 15.5× / 13.8× | 1.55 / 1.54 |

**~2.7× at n=400, and the gap to bits-ui closed from ~41× to ~15×.** Fingerprints unchanged,
1096/1096 tests pass.

**It is still superlinear (k ≈ 1.55), and the remaining cause is measured, not guessed.** With
`focusedId` gated, a registration no longer re-runs the headers — but Svelte still _marks_ all n of
them MAYBE_DIRTY, n times. That is O(n²) marking with a small constant. `Collection` publishes a
membership change on **every** `set`, where `NodeRegistry` already batches its version bump through a
microtask. Prototyping that batching on `Collection` — plain-`Map` variant, and a better one that
keeps `SvelteMap` for `get`/`has` and wraps the `Array.from` walks in `untrack` — gave:

| variant                          | n=400      | k        |
| -------------------------------- | ---------- | -------- |
| shipped (no batching)            | ~1000 ms   | 1.55     |
| batched, plain `Map`             | 441 ms     | 0.74     |
| batched, `SvelteMap` + `untrack` | **288 ms** | **0.67** |

i.e. **linear, and within ~2.4× of bits-ui**. It is **not shipped**, and the reason is a hard gate
rather than a preference: batching defers membership visibility to the next microtask, and two
existing specs pin it as synchronous —

- `accordion-keyboard.svelte.spec.ts` → _"keeps one tabbable header while every panel is closed"_
  asserts `tabIndex === 0` immediately at mount. Batched, the accordion is Tab-reachable one
  microtask late. That is an a11y invariant, and a11y is a hard gate.
- `collection.svelte.spec.ts` → _"keeps derived views reactive when a Bond eagerly owns the
  collection"_ asserts a derived view updates in the same tick as `set()`.

Both failures are correct. A batching design that threads this needle would have to flush a pending
publish synchronously when a tracked view is read — which is a write during a read, so it needs real
design work rather than a `queueMicrotask`. That is lever 2 in §8, and it now carries a price tag and
a blocker instead of a guess.

**Two other contributors, both linear and both real:**

- **JS motion at mount.** Our accordion body runs an `enter` animation per open item, and `animate`
  reads `getComputedStyle` — a forced style read per item. Rendering the same fixture with every panel
  closed: 2099 ms vs 2955 ms at n = 400, so **~30%** of the mount. bits-ui animates in CSS. This is the
  cost of `height: auto`, which CSS cannot do, and is a defensible trade — but it should be skippable
  under `prefers-reduced-motion` (roadmap 1.11, still open).
- **Flat per-item machinery**: two Bonds, four capabilities, atom spread assembly and presentation
  resolution per item — the same cost §6 prices on the server, paid again on the client. This is what
  the residual ~2.4× against bits-ui would be, once the mount is linear.

### 7b. Tree — the same defect, found by reusing the loop, and fully fixed

`TreeBondBase` had the identical fallback:

```ts
get focusedId() {
	return this.#roving?.activeId ?? this.visibleHeaderIds[0] ?? null;   // ← same shape
}
```

but `visibleHeaderIds` is far worse than the accordion's `#enabledIds`. It is **recursive**, it
allocates an array at every level, it **spreads each child's array into its parent's**
(`ids.push(...child.visibleHeaderIds)` — an O(subtree) copy per level, so one full walk is
O(n·depth) before anything reads it twice), and it calls `headerId`, which **materializes the header
Atom** through `nodeByPart`. Every node's header reads `keyboardOwner.focusedId`, so all of that ran
once per node.

**The existing SSR fixture could never have caught it.** `src/lib/test/perf/tree-ablation.test.svelte`
renders _n independent_ `Tree.Root`s — each its own keyboard owner with an empty child collection —
so the per-tree cost never multiplies. The parity fixture renders **one** tree of n nodes, which is
what an application has. That distinction is the whole reason the family was added here.

Measured with the same loop (`node scripts/bench-vs-profile.mjs tree --scale`):

| n     | before        | after      | hand-written floor |
| ----- | ------------- | ---------- | ------------------ |
| 50    | 73.3 ms       | 18.7 ms    | 0.3 ms             |
| 100   | 332.1 ms      | 32.0 ms    | 0.4 ms             |
| 200   | 1730.5 ms     | 59.9 ms    | 0.8 ms             |
| 400   | **13 637 ms** | **131 ms** | 1.2 ms             |
| **k** | **2.51**      | **0.94**   | 0.67               |

**92× at n = 400, and k 2.51 → 0.94 — linear.** Worse than quadratic before, because the array
spread makes a single walk superlinear on its own.

The fix is the accordion's, plus one more step the accordion did not need:

- `visibleHeaderIds` is now `$derived.by` **per node**, so the recursion memoizes per _subtree_: a
  change under one node invalidates that node and its ancestors, not the whole tree.
- `firstVisibleHeaderId` finds `visibleHeaderIds[0]` by **early return**. For the outermost node —
  the only one whose `focusedId` is ever read — its own header answers immediately, so the fallback
  costs O(1) and never touches the collection.
- `focusedId` is a `$derived` **equality gate**, as in the accordion.
- `ITreeNode.firstVisibleHeaderId` is **optional**, so an external implementor of that contract keeps
  compiling; callers fall back to `visibleHeaderIds[0]`.

**No attributable SSR change, and that is the expected result.** The `tree` layer read 58.03 µs/node
after the fix against a 69.45 baseline, which looks like −16% — but every other layer in that same
run was down 11–31% too (`datagrid` −31%, `card-preset` −21%, `menu` −18%). That is machine drift,
not the fix, and crediting it would contradict the finding above: the server never sees a populated
collection, so it never paid the quadratic and has nothing to give back. Cross-session µs on one box
cannot support a claim this size; only an interleaved ratio can.

Only two families ever had this fallback (`grep "activeId ??"` finds exactly these two); both are
now fixed. Tabs never had it — its roving is controlled by `props.value` — and `DropdownMenu` never
had it either.

**No regression seam exists in the unit suite.** A "mount stays linear" assertion needs a real browser
and four mount sizes; as a vitest case it would be flaky and slow. The gate is instead the loop
itself: `node scripts/bench-vs-profile.mjs accordion --scale` **exits non-zero when our fitted k
exceeds 1.2**, so it is runnable in CI or by `git bisect run`. That absence is itself a finding — the
architecture has no cheap seam for "this stayed O(n)".

## 7c. Why no existing gate caught either, and what now does

Both defects were live for months against a suite that includes an SSR budget, anchor budgets,
fingerprint checks and 1096 tests. Three independent reasons, each worth fixing:

1. **A slope cannot see a shape.** `bench:ssr` measures the marginal cost between two instance
   counts. Between 100 and 800 a quadratic just reports a bigger number, and the ±15% budget plus a
   3 µs allowance absorbs a great deal of "bigger".
2. **SSR structurally cannot reach this class.** Children register with their parent from an atom's
   `onmount`, which never fires on the server. A server render therefore sees an _empty_ collection,
   so the per-child O(n) read costs O(1). Measured on the pre-fix tree: **k = 0.60 on the server,
   k = 2.51 in a browser.** No amount of SSR benchmarking would ever have found this.
3. **The fixture shape made it unreachable anyway.** `tree-ablation.test.svelte` renders n
   _independent_ roots, each its own keyboard owner with a zero-length child collection. The
   quadratic needs one owner and n children.

**`bun run bench:growth`** closes all three. It mounts each collection-owning family at four sizes in
a real browser and fits `t ∝ n^k`, gating on the exponent:

```
  family        unit      n=50    n=100    n=200    n=400        k
  accordion     item        17.6 ms    37.8 ms    97.4 ms   328.2 ms     1.41   ← known defect
  tabs          tab          6.7 ms    11.9 ms    20.8 ms    40.0 ms     0.86
  tree          node        15.1 ms    29.6 ms    58.0 ms   129.5 ms     1.03
  datagrid      row          7.2 ms    12.6 ms    23.3 ms    45.0 ms     0.88
  dropdown-menu item         4.1 ms     7.1 ms    11.8 ms    21.5 ms     0.80
  select        option       6.4 ms     9.9 ms    16.8 ms    30.4 ms     0.75
  stepper       step         8.6 ms    13.1 ms    28.4 ms    52.8 ms     0.87
```

Four properties it was designed to have:

- **The exponent is machine-independent.** A slow or loaded box scales every point together and
  leaves the ratio alone. That is why this gate can run in CI on any machine, where
  `ssr-baseline.json`'s µs budgets are pinned to the box that recorded them and need `--no-gate`
  anywhere else. Verified against the load trap in §2: k barely moved on a box at load 11.
- **It has been seen to fail.** Re-introducing the tree defect produces
  `✗ tree: k=2.39 exceeds the absolute ceiling 1.50`, exit 1, and an error naming the cause and the
  fix pattern with two worked examples. A gate never observed failing is not a gate.
- **It refuses to measure nothing.** Each fixture must render more elements at n=400 than at n=50 or
  the run throws. The first `select` fixture had no portal host, rendered only its trigger, and
  reported a tidy **k = −0.07** — which would have been baselined as "linear" forever. Counting the
  whole document, not the mount target, is what makes that check work for portalling families.
- **Its scope is checked against the source, not against memory.**
  `src/lib/test/perf/growth/growth-coverage.spec.ts` greps `src/lib/components` for
  `this.collection<` and fails when a family owns a child collection and has no growth fixture — the
  same reasoning as `root-identity-audit.spec.ts`. It caught its first mistake immediately: a fixture
  registered as `menu` while the directory is `dropdown-menu`.

`growth-baseline.json` carries a `known` block, printed on every run, so accordion's 1.41 reads as an
open defect held from getting worse rather than as an accepted number. `tree-ablation.test.svelte`
now carries a comment saying what it cannot see and pointing here — it keeps its shape, because its
output SHA is that layer's equivalence anchor.

## 8. Levers, ranked by measured µs × instances ÷ risk

| #   | Lever                                                  | Mechanism                                                                                                                                                                                                                                                                                                                                                                                                    | Expected                                                                                                                    | Blast radius                                                                                                                                  | Gate                                                                                                                                                                                                       |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Memoize the resolved class on the rich lane**        | `klass()` already caches the final string per (plan, preset entry) in a `WeakMap`; `resolvePresentation`'s class axis does not, so every `Kernel.element` part re-runs `mergeClassesWithPreset` → `twMerge` per instance. Extend the same memo, keyed on the resolved `PresetEntryRecord` + the literal class array, and bail for function-valued presets exactly as `simpleRecord` already classifies them. | **−8% datagrid SSR**, multiplied by rows × cells; every rich-lane part in the library                                       | shared presentation path — the one place `ssr-bench.ts` documents having regressed every layer at once                                        | `bench:ssr` fingerprints + the interleaved-worktree A/B its header prescribes; `resolve-count.svelte.spec.ts`                                                                                              |
| 2   | **Batch `Collection` membership**                      | Give `Collection` the microtask commit `NodeRegistry` already has, so n mounting children publish once, not n times. **Prototyped and measured, not shipped.**                                                                                                                                                                                                                                               | accordion n=400 mount **1000 → 288 ms**, k **1.55 → 0.67** (linear)                                                         | every family with child collections; defers membership visibility by one microtask                                                            | **currently blocked**: fails `accordion-keyboard` ("one tabbable header", an a11y invariant asserted synchronously) and `collection.svelte.spec.ts`. Needs a design that flushes a pending publish on read |
| 3   | **Stop emitting a per-part `id`**                      | Every part renders `id="card-title-s1"`; shadcn emits none. Costs a string build, an attribute in the runtime walk, ~20 B/part, and one anchor's worth of `$props.id()` per root. Cross-slot ARIA already resolves ids at BROWSER time only.                                                                                                                                                                 | ~5 of our 19 card anchors are `$props.id`-adjacent; ~20 B/part; part of the 8.4% `attributes`+`is_boolean_attribute` bucket | **changes rendered DOM** — needs an explicit fingerprint update and a hydration-mismatch check, since the client sets what the server omitted | `anchor-budget.spec.ts`, `root-identity-audit.spec.ts`, a new hydration-parity spec                                                                                                                        |
| 4   | **O(1) selection membership**                          | The accordion fix (§7) generalized into `SelectionModel.isSelected`, after auditing each of its ~10 callers for a reactive backing.                                                                                                                                                                                                                                                                          | removes an O(n·k) walk from select, tabs, tree, datagrid, menu                                                              | ten families; **unsound as a blanket change** — see §7                                                                                        | per-family selection specs; the audit is the work, not the diff                                                                                                                                            |
| 5   | **Static-attribute fast path for the class-only lane** | On the class lane a part's attrs are usually just `class` + `id`. Svelte's `attributes` walk + `is_boolean_attribute` is 8.4% of card self time. A leaf that emits a literal `class=` instead of a spread would skip it.                                                                                                                                                                                     | up to ~8% of card SSR                                                                                                       | Kernel leaf table; leaves are compiled snippets, so this needs a second leaf, not a branch                                                    | `anchor-budget.spec.ts`, `bench:ssr` sha                                                                                                                                                                   |
| 6   | **Skip motion under `prefers-reduced-motion`**         | Roadmap 1.11, already scoped: the rune exists, one factory reads it.                                                                                                                                                                                                                                                                                                                                         | −30% of accordion mount for users who ask for it                                                                            | motion host                                                                                                                                   | existing motion specs                                                                                                                                                                                      |

### Levers investigated and rejected, with the number that killed them

- **Resolve the class once instead of twice per eager part.** `KernelNode` calls `#resolveClass` in
  `escalates()` at init and again in `prepare()` at render; on the server the source cannot change
  between the two, so the second is provably redundant. `#resolveClass` is **0.8%** of card self time
  and the common path hits `plan.defaultClass` immediately. Ceiling ≤1%, against a correctness note in
  the code explicitly warning that priming that cache goes stale on the client. **Not worth it.**
- **Import parts directly instead of through the namespace.** `nesting-component-vs-snippet-2026-08`
  recorded `Card.Title` costing +0.5 µs and +2 anchors over a direct import, because a member
  expression compiles to a dynamic component. Re-measured here: `node` 8.50 vs `direct` 8.50 — **the
  time gap is gone** on this compiler (the 2 anchors remain). And it is not a lever against shadcn
  regardless: their consumers write `<Card.Title>` too, so both sides pay it.
- **Cache `mergeAtomProps` packets.** Already dead — `menu-item-atom-seam-2026-08` removed the packet
  from the multiplied path and got 10.35 → 7.29 µs. `calendar-day` is the one remaining multiplied
  case and inverts precedence, so it does not convert mechanically.
- **Make the whole rich lane lazy.** The rich lane's cost is presentation resolution the consumer
  asked for by passing a prop the class lane cannot express. `bench:lanes` already prices the
  init-time lane decision at −2.5 µs and −4 anchors against the old deferred one; there is no further
  deferral available without re-opening an init context, which is the thing that cost those 2.5 µs.

## 9. Staged plan

> **Superseded in part by §11 (round 2) and §12 (round 3), both 2026-08-21.** Stages 1 and 2
> landed, Stage 1 at a different seat than sketched here; lever 2's premise turned out to be wrong.
> Lever 5 landed in half in §11 and in full in §12, where the DEV/production divergence that
> blocked its second half is dissolved rather than accepted. Read both before working from this
> table.

Each stage is independently verifiable, names its gate, and names what would make us revert it.
**No stage may** change `src/lib/public/**` or preset key names; change rendered DOM without an
explicit, justified fingerprint update; weaken a11y, keyboard or focus behavior; import internals
through `@ixirjs/ui/…`; or add a per-root lifecycle `$effect` or a second `Kernel.element` on a node.

| Stage         | Change                                                                                                                                                                                                                                                                                                                     | Files                                                                                                               | Expected                                                                                                                                                                              | Gate                                                                                        | Revert signal                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **0 ✅ done** | Accordion + tabs: memoize `#enabledIds` / `#enabledValues`, O(1) `isValueOpen`, `focusedId` as a `$derived` equality gate + early-return `#firstEnabledId` (§7a). Tree: `visibleHeaderIds` as a per-node `$derived`, early-return `firstVisibleHeaderId`, `focusedId` as an equality gate (§7b). Plus `bench:growth` (§7c) | `components/accordion/bond.svelte.ts`, `components/accordion/item/bond.svelte.ts`, `components/tabs/bond.svelte.ts` | accordion cold mount ~2880 → ~1000 ms at n=400, k 1.85 → 1.55, gap to bits-ui 41× → 15×; **tree 13 637 → 131 ms, k 2.51 → 0.94 (92×)**; no attributable SSR change on tree, by design | `bench:ssr` sha unchanged ✅, 1096 tests pass ✅                                            | a stale tabindex or a panel that does not reflect `values`                       |
| **1**         | Lever 1 — class memo on the rich lane                                                                                                                                                                                                                                                                                      | `components/atom/presentation.svelte.ts`, `components/atom/resolve/classes.ts`                                      | −8% datagrid SSR, −5% collapsible/tree                                                                                                                                                | interleaved-worktree A/B ×3 + `bench:ssr` + `resolve-count.svelte.spec.ts`                  | any layer's sha moves; a function-valued preset stops re-resolving on bond state |
| **2**         | Lever 2 — batch `Collection` membership                                                                                                                                                                                                                                                                                    | `shared/bond/collection.svelte.ts`                                                                                  | accordion mount 1000 → 288 ms, k 1.55 → 0.67 (linear)                                                                                                                                 | `--scale` k < 1.2, **and** the two specs it currently fails must pass without being relaxed | membership observed a microtask late anywhere that needs it synchronously        |
| **3**         | Lever 6 — reduced-motion in the motion host                                                                                                                                                                                                                                                                                | `shared/capability/models/…`, motion host                                                                           | −30% accordion mount under the media query                                                                                                                                            | existing motion specs + a new reduced-motion spec                                           | an animation that no longer runs when it should                                  |
| **4**         | Lever 3 — drop the per-part `id`                                                                                                                                                                                                                                                                                           | Kernel `spread()`, `getElementId` callers                                                                           | ~20 B and one attribute per part                                                                                                                                                      | **new hydration-parity spec first**, then `anchor-budget` + `bench:ssr` sha update          | any hydration mismatch, or an ARIA relationship that loses its target            |
| **5**         | Lever 4 — audit `SelectionModel` backings, then O(1) membership                                                                                                                                                                                                                                                            | `shared/capability/models/selection.svelte.ts` + ~10 callers                                                        | removes O(n·k) from select/tree/datagrid                                                                                                                                              | per-family selection specs                                                                  | any family whose backing turns out non-reactive                                  |

Stages 1 and 2 are where the money is. Stage 4 is the only one that touches rendered DOM and should
not be attempted until the hydration-parity spec exists.

## 10. What this does not answer

- **Dialog, Select, Popover** are absent. Their content portals, so the server renders nothing and a
  fair comparison needs an interaction-driven client fixture (open → measure → close). The menu
  fixture works around this with bits-ui's `ContentStatic` + `forceMount`; Select has no equivalent.
- **A stray `value` attribute leaks onto `accordion-item-root`'s `<div>`** (`value="0"` in the
  rendered output). Out of scope here, flagged rather than fixed.
- **The card retained-heap figure is broken** (§4) and needs a heap-snapshot measurement rather than
  `usedJSHeapSize`.

---

## 11. Round 2 — what landed, and what did not (2026-08-21)

Method throughout: interleaved-worktree A/B, three rounds, **both trees rebuilt every round**, the
before-tree being the working tree with exactly one change reverted — never `HEAD`, because the
branch carries 328 unrelated modified files. Medians reported with the arms' overlap, because that
is what says whether a delta is real. `plain` (no Kernel at all) rides along as a drift control.

A caution the round produced twice: **cross-session absolutes are worthless here, and a single
`bench:vs-shadcn` run is not enough for a verdict.** Three runs of identical code put `table` at
+158%, +203% and +179%, with shadcn's own side moving 6.60 → 5.85 → 6.34. The §3 scoreboard's
"median of three whole runs" is not a formality.

### Scoreboard, median of three whole runs

| family    | §3 (round 1) | round 2   | verdict then → now |
| --------- | ------------ | --------- | ------------------ |
| button    | 2.45         | **1.69**  | +59% → **+10%~**   |
| table     | 20.19        | **17.69** | +201% → **+179%**  |
| tree      | 43.90        | **39.56** | 732× → **645×**    |
| card      | 12.02        | **11.80** | +130% → **+124%**  |
| accordion | 36.44        | **34.35** | −35% → **−40%**    |
| menu      | 7.57         | **7.42**  | −67% → −67%        |

Client arm, button: mount **20.57 → 10.29 µs** (+129% → +11%), hydrate **10.00 → 7.71**
(+67% → **−53%**), live-DOM comments 3 → **2**, matching shadcn exactly.

### Stage 1 — the resolved-class memo. Landed. −4 to −7%.

`bench:ssr`, medians of three interleaved rounds: **datagrid −6.8%** (17.89 → 16.68, arms separated
17.74 > 16.79), **menu −6.5%** (7.27 → 6.80), **tree −5.2%** (56.23 → 53.32), **collapsible −4.0%**.
`card` and `cardroot` unchanged with fully overlapping arms — correct, they are the class lane, which
was already cached. All eight fingerprints identical across all six runs.

**The seat is `mergeClassesWithPreset` and the key is `userClass[0]`.** Two things were tried and are
worth recording because both look right on paper:

- **Seating it at `buildKernelElement` keyed on a `KernelPlan`** — the shape §8 lever 1 sketches —
  **misses every multiplied case.** `datagrid` cell, `datagrid` row and `button` call
  `Kernel.element` directly and have no plan to key on.
- **A joined-string key measures as a wash.** Building it is cheap; _hashing_ it is not. On this box
  `Map.get` costs **4.6 ns for a module-level literal and 128.5 ns for a freshly joined array**,
  against ~198 ns for the whole merge. A rope built this call has no cached hash and must be
  flattened before the probe — which is exactly the fresh-string hash `twMerge`'s own LRU already
  pays. This is the real mechanism behind `presentation-path-perf-2026-08` §2 taking a memo on `cn`
  off the list, and it kills any value-keyed string memo anywhere on this path.

So the key is the array's first entry, a module literal at every hot call site, and everything past
the probe is `===`. Entries snapshot their inputs and compare element-wise, so an array mutated in
place still misses (four new cases in `classes.spec.ts` pin this). `''` is deliberately not a key —
~25 plans declare an empty base class and would share one bucket whose scan costs more than the merge.
Caps: 512 keys, 8 per bucket, the bucket cap being the load-bearing one against a fixed first class
with a computed tail.

**The revert signal §9 names is structurally unreachable at this seat.** "A function-valued preset
stops re-resolving on bond state" cannot happen: `resolveEntry` invokes `entry({ bond })` in
`resolvePresentation`, upstream of `resolveClass`. A cache below that cannot suppress the call.

Independent confirmation: `LAYER=tree bun run profile:ssr` now has **no class-merging frame anywhere
in the top 30**. Before this round it did.

### Stage 4a — a literal `<button>` leaf. Landed. −18.5% on button.

`renderMode` had literal leaves only for `div` and `h3`; everything else fell to `svelte:element`,
which emits three comment anchors (open, close, empty-content) and runs a tag-name regex, `is_void`
and `is_raw_text_element` per instance.

Isolated A/B on the `button` family, three rounds: **1.51 → 1.23 µs (−18.5%)**, arms separated
(1.49 > 1.30); verdict **+5% → −16%**; census **231 → 210 bytes** and **6.0 → 3.0 anchors** per
button. `card`, which renders no button, moved +1% with fully overlapping arms and byte-identical
census — the control holds.

**Rendered DOM changed, deliberately.** 18 SSR-fidelity snapshots were re-recorded; a mechanical diff
confirms **183 anchors removed and zero semantic differences** — no attribute, class or text changed
anywhere. `anchor-budget.spec.ts` is untouched (no pinned case contains a button). One `bench:ssr`
fingerprint moved, `menu` (422 B/`62edaf171bf6` → 415 B/`1463d698858e`), which is its Trigger — one
button per fixture, and `bytesPerUnit` is `body.length / 3`, so a 24-byte constant reads as −7. The
justification is recorded in `ssr-baseline.json`'s new `fingerprintNotes`.

Hydration is the risk this carries, and **nothing in the unit suite hydrates** — the only thing that
does is `bench:vs-shadcn:client`, which was run as the gate. It passes, and button's live-DOM comment
count drops 3 → 2 to match shadcn.

### Stage 4b, partial — stop allocating attribute keys that can never carry a value. Landed. Card −5.7%.

`KernelNode.spread()` built `data-bond`, `data-kind` and `part` as object-literal entries on every
class-lane part. All three are `undefined` in production, but the keys existed, so Svelte's
`attributes()` walk visited and skipped three of them per part — and that walk plus
`is_boolean_attribute` is 8.4% of card self time.

A/B, medians of three: **card 11.44 → 10.79 (−5.7%)**, **card-preset 11.58 → 11.14 (−3.8%)**, both
with arms separated. `collapsible` +2.3% and `menu` −0.3%, both fully overlapping — correct, those
layers are on the rich lane and never reach this code. `plain` unmoved. Output byte-identical: an
`undefined` value was never emitted as an attribute, so this removes iterations, not markup.

**The other half of lever 5 — a literal `class`+`id` leaf — was deliberately NOT taken.** In DEV the
attrs object carries `data-bond`/`data-kind`, so the fast path could only ever fire in production,
and the test suite runs in DEV. That is a render path CI can never execute, in the seam this codebase
has twice been bitten in (`custom-renderer.svelte.spec.ts`, `resolve-count.svelte.spec.ts` both exist
because of exactly that). Not worth it for the remaining few percent.

### Stage 2 — `definePart` asks a question it ignores. Landed, unmeasurable.

`definePart` passed `eagerElement: true` unconditionally, but a declared-Atom slot builds its element
regardless, so `KernelNode`'s constructor resolved a class — a preset context read and possibly a
whole `twMerge` — that nothing read. `eagerElement: plan.synthesized` removes it, and both branches
converge on the same `useKernelElement(part, part.elementConfig)` call.

**A/B says nothing: every layer's arms fully overlap** (datagrid +4.6%, tree +0.6%, collapsible
−0.2%). It applies to ~25 of 33 `definePart` slots and none of them is multiplied — `DataGrid.Body`
is once per grid, `Collapsible.Header` once per collapsible. Kept because it deletes provably dead
work and is behaviour-identical, **not** because it is a win.

A second idea here was **killed on analysis**: reordering `escalates()` to short-circuit before
`#resolveClass`. It only pays when a cheap disjunct is already true, i.e. when the node is rich — and
a rich node immediately resolves the class again anyway. In the common case all three cheap disjuncts
are false and the resolve runs regardless, so the reorder saves exactly nothing while editing the one
predicate that decides the lane.

### Stage 5 — `Collection` membership. Gates unblocked; **the hypothesis is wrong.**

§8 lever 2 and §7a say batching is blocked by two synchronously-asserted invariants. It is now
unblocked, but not by batching.

**Deferring the publish cannot work, and flush-on-read does not rescue it** — a `$derived` that is
still CLEAN short-circuits and never calls into `Collection`, so there is no read to flush from. The
`untrack` escape does exist (`sources.js`'s guard reads `(!untracking || EAGER_EFFECT)`), but it has
nothing to attach to.

What works is **coalescing rather than deferring**. The publish stays synchronous; a
`#dirtySinceRead` flag records that every dependent is already marked, so a further `set` skips the
bump, and a tracked read clears it. n registrations with no interleaved read cost one bump instead of
n, and every read still observes the collection as of that instant. **Both blocking specs pass
unrelaxed** — `accordion-keyboard`'s "one tabbable header while every panel is closed" and
`collection.svelte.spec.ts`'s same-tick derived view.

One trap worth recording: `#version++` **reads** the signal before writing it, and `set()` runs inside
the child's mount effect — so tracked, the registering effect subscribes to the signal it bumps,
re-runs, and silently reorders the collection. `tree-keyboard.svelte.spec.ts` catches it as focus
landing on the wrong node. The bump must be `untrack`ed, for the same reason `set` already reads
`#items` untracked.

**And then the result is negative.** Interleaved A/B: accordion n=400 mount **234 → 215 ms (−8%)**,
arms separated — but **k did not move: 1.30 before, 1.30 after**, and no other family's k moved
either. Round 1's memoized `#enabledIds` and `focusedId` equality gate had already removed the part
batching would have helped, so **the k 1.55 → 0.67 prototype in §7a does not reproduce against this
baseline**. Whatever still makes accordion superlinear is not collection marking, and §8 lever 2
should no longer be described as the fix for it. `growth-baseline.json`'s accordion entry is
ratcheted 1.37 → 1.31 with its `known` note rewritten to say so.

### Stage 6 — tree. Investigated, not changed.

`docs/research/tree-node-cost-2026-08.md`. Short version: tree's growth is linear (k = 1.04), its cost
is distributed with no frame above 5.4% outside GC, **lazy capability activation is dead for tree**
(none of its four capability models declares `setup` at all), and the only lever that would change the
order of magnitude is not having a Bond per node — a public-surface redesign whose answer this library
already ships as `createVirtual`.

### Still open

- **`bench:ssr`'s µs/gc gate fails on `menu` gc share (24.3% against a 16.5% baseline) and this is
  pre-existing session drift, not a regression** — the before-tree measures 21.0–22.7% with none of
  this round's code. The whole baseline was recorded 2026-08-15 and every layer now reads 19–28%
  faster, `plain` included. It wants re-recording on a quiet machine, deliberately, as its own change.
- **The button parity fixture installs no preset**, so every ixir button figure here is a best case.
  Measured separately: the same button costs **1.805 µs with no preset and 3.330 µs with one**,
  against shadcn's 1.279 — i.e. ~2.6× for an application that calls `setPreset`. A preset arm for the
  parity set is the honest next fixture.
- **`dynamicBranch` compiles to `$.attributes({ ...view.spread() })`** — the compiler copies the
  spread object a second time, which defeats the "the leaves now copy nothing" claim in the
  `ElementView` docblock at `render/element-branches.svelte`. Flagged, not fixed.
- `card-root.svelte` declares `onclick`/`onkeydown` in both its `source` getters and its `attrs()`
  thunk. Looks unintentional; out of scope this pass.

---

## 12. Round 3 — the class-only leaf, and two dead-key removals (2026-08-21)

Same method as §11: interleaved A/B, both trees rebuilt every round, the before-tree being the
working tree with exactly the change under test reverted. Medians with every run printed, because
the arms' overlap is what says whether a delta is real. `plain` (no Kernel at all) rides along as a
drift control and earned its place again — it moved **+8.7% to +13%** across two of this session's
runs with none of its code touched, and a desktop application sat at 30% CPU for part of it. Every
number below that is called a result has **separated arms**; everything else is reported as
unmeasurable rather than as a small win.

**All eight `bench:ssr` fingerprints and all eight byte-per-unit counts are unchanged**, in every
run of every arm. The parity harness's output census is identical too (card 591 B/19 anchors, table
629 B/20, menu 308 B/9, accordion 641 B/18, button 210 B/3, tree 454 B/15). Nothing here changes a
rendered byte.

### Scoreboard — parity, same-session interleaved, three rounds

Absolutes are useless across sessions (§11 says so twice, and this session proved it again: the
same `table` code read 17.69 µs in round 2 and 19.4–21.2 µs here, with shadcn's own untouched side
moving 6.29 → 7.18). So the before-tree was run against the after-tree **in the same process
sequence**, and the opponent is the control.

| family    | ixir before       | ixir after        | shadcn before / after | verdict          |
| --------- | ----------------- | ----------------- | --------------------- | ---------------- |
| card      | 12.75 12.84 12.58 | 11.84 9.98 10.77  | 5.82 / 5.68           | **+119% → +90%** |
| button    | 1.78 1.87 1.88    | 1.89 1.82 1.80    | 1.67 / 1.67           | +12% → +9%~      |
| table     | 20.48 19.03 19.19 | 21.19 19.87 19.48 | 7.68 / 6.96           | +150% → +185%~   |
| accordion | 37.55 37.26 37.13 | 43.02 35.94 36.00 | 65.96 / 60.22         | −44% → −40%~     |
| menu      | 8.36 8.46 7.89    | 7.80 8.11 7.73    | 27.07 / 25.73         | −69% → −70%~     |
| tree      | 46.29 49.15 43.38 | 46.50 48.68 46.76 | 0.06 / 0.06           | floor, unmoved   |

`~` means the arms overlap. **Card is the only family this round resolves**, and it resolves
cleanly: median 12.75 → 10.77, **−15.5%**, with the arms separated (12.58 > 11.84). The parity
harness cannot see the datagrid win at all — `table`'s IQR is ±1.8 to ±2.7 µs on a 20 µs unit, so a
7% effect is inside its resolution. `bench:ssr` can, and does, below.

### The class-only leaf. Landed. Card −6.6%, datagrid −7.7%.

This is §8 lever 5, the half §11 deliberately did not take.

`{...view.spread()}` compiles to `$.attributes({ ...view.spread() })`. The compiler cannot know
`spread()` already returns a fresh object nobody else holds, so it copies it a second time; then
`attributes()` allocates `Object.keys`, and per attribute runs a unicode name regex, a
`toLowerCase`, a `startsWith('on')`, and `is_boolean_attribute` — which is
`DOM_BOOLEAN_ATTRIBUTES.includes(name)`, **a linear scan of twenty-six strings**. On a part whose
attributes are just `class` and `id`, all of that exists to discover there was nothing to discover.

`divPlain` and `headingPlain` write those attributes literally, so every one of those steps is
compile-time. Two views reach them:

- **`KernelNode`, the class-only lane.** `prepare()` already walks the source once per render to
  decide the lane; it now also answers whether that walk found anything the leaf does not declare.
  In the plain case that walk _replaces_ `spread()` rather than adding to it.
- **`KernelElement`, the resolved lane, when the part has no attributes but its class.** Answered
  by **identity**, not by a walk: `elementAttrs` returns one shared frozen `EMPTY_ATTRS` when it
  collected nothing, and `foldPresentationAttrs`'s existing passthrough hands that same reference
  through. `DataGrid.Cell` is exactly this shape, and it is the most multiplied part in the library.

**§11 rejected this half for a good reason, and the reason is now gone.** The objection was that in
DEV the attrs object carries `data-bond`/`data-kind`, so a fast path could only ever fire in
production — a render path CI can never execute, in the seam this codebase has been bitten in twice.
The fix is to stop treating those two as a DEV-only append: they are declared as **real attributes
on the leaf**, whose value is `undefined` in production, and a literal attribute with an undefined
value emits nothing. One leaf, both modes, and the branch CI runs is the branch production runs.

Isolated A/B against a tree carrying only the other change, four rounds:

| layer       | before                  | after                   | Δ median  | arms          |
| ----------- | ----------------------- | ----------------------- | --------- | ------------- |
| card        | 11.69 11.35 12.36 11.31 | 9.81 11.18 10.92 9.92   | **−6.6%** | **separated** |
| datagrid    | 20.04 18.74 19.48 18.69 | 17.15 17.98 18.60 16.98 | **−7.7%** | **separated** |
| card-preset | 12.29 11.83 11.32 12.27 | 11.58 10.58 11.78 10.85 | −5.6%     | overlap       |
| cardroot    | 3.30 3.11 3.10 3.17     | 3.64 3.16 3.37 3.01     | +6.3%     | overlap       |
| collapsible | 43.02 42.02 41.70 41.46 | 42.03 43.05 44.24 39.88 | +2.5%     | overlap       |
| tree        | 59.89 60.89 59.56 55.44 | 59.58 59.55 59.71 56.91 | −0.5%     | overlap       |
| menu        | 7.80 7.68 7.90 7.19     | 7.77 7.51 8.02 7.16     | −0.4%     | overlap       |
| `plain`     | 0.22 0.22 0.26 0.23     | 0.24 0.24 0.25 0.26     | +8.7%     | drift control |

The layers that do not move are the ones that **must** not: `collapsible`, `menu` and `tree` are
declared-Atom parts whose attrs carry `id`, `role` and cross-slot ARIA, and `cardroot` has an attrs
thunk. None of them can be written as four literal attributes and none of them takes the leaf. The
`plain` control drifting +8.7% the other way means the two separated results are, if anything,
understated.

Two things the leaf must not do, both load-bearing:

- **An empty class stays on `divBranch`.** `attr_class('')` emits nothing where the spread path
  emits `class=""`, and ~25 plans declare an empty base class. `prepare()` excludes `klass === ''`
  explicitly. This is the whole reason the fingerprints did not move.
- **Attribute order is the leaf's contract.** `class`, `id`, `data-bond`, `data-kind` — the same
  order `KernelNode.spread()` builds them in. Rendered bytes must not shift.

Independent confirmation: `LAYER=card bun run profile:ssr` no longer has `is_boolean_attribute`
anywhere in the top 30, and `attributes` fell from 3.53% to 1.70% of self time. On `datagrid`,
`attributes` 2.66% → 1.31% and `is_boolean_attribute` 1.41% → 0.92%, with `divPlain` appearing at
1.13% — the cells, as intended, and the rows still on the spread.

### Dead keys in an atom's attrs thunk. Landed. Card root −20%.

The same defect as §11's stage 4b, one layer up and never looked at.

`KernelNode.spread()` merged `this.#options.attrs?.()` with `Object.assign`, which copies
`undefined` values as own keys. An atom's attrs thunk states every attribute the part can ever
carry: `card-root` declares seven — `role`, `tabindex`, `aria-disabled`, `aria-labelledby`,
`aria-describedby`, `onclick`, `onkeydown` — and on a plain card **emits two**. The other five were
own keys for Svelte's `attributes()` walk to visit and skip, each costing the unicode name regex, a
`toLowerCase` and a twenty-six-string scan.

`cardroot` is the layer that isolates this: it is one Card.Root with a text body, it has an attrs
thunk, and it therefore **cannot** take the class-only leaf. Two independent before/after runs:

- three rounds: 4.24 3.98 4.45 → 3.67 3.35 3.34, median **−21.0%**, arms separated
- five rounds: 4.38 4.07 4.64 3.73 3.44 → 3.55 3.36 3.19 3.23 3.25, median **−20.1%**

**A key the source also carries is kept even when undefined**, which is why this is byte-identical
rather than merely equivalent. Dropping it unconditionally would move that attribute to the source's
position in the object, and the rendered byte order with it.

### `NodeRegistry` cardinality scan. Landed, unmeasurable, and a scaling hazard removed.

`register` and `registerLazy` both computed `#order.some(…)` — a walk of every registration on the
Bond — _before_ checking whether the part is `cardinality: 'single'`, which is the only case that
can use the answer. For a `'many'` part that is an O(n) scan per registration, so **O(n²) over a
collection**, to prove something that cannot be true for it. Guarding it is behaviour-identical.

No fixture in the suite has enough same-Bond registrations for this to show — `bench:growth` is
unchanged (accordion 1.29, tree 1.19, datagrid 0.89, all inside the gate) and no `bench:ssr` layer
moved. Kept because it deletes an O(n²) that the growth gate exists to catch and that nothing
currently exercises, **not** because it is a win.

### Still open

- **The same dead-key waste exists on the rich lane, inside `atom.spread`, and is worth more.**
  It would reach `collapsible`, `menu`, `tree` and datagrid _rows_ — every declared-Atom part, which
  is every family this document still loses on except card. It is **not** a mechanical change:
  `renderMode`'s `hasLifecycleAttrs` tests `'global' in attrs` by presence, so dropping a
  `global: undefined` would silently move a part off the renderer, and `mergeAttributeValue` may use
  an `undefined` in a later layer to clear an earlier one. Flagged, not attempted.
- **`table` remains the worst loss and this round did not resolve it.** The datagrid −7.7% is real
  on `bench:ssr` and invisible on the parity harness. The row, not the cell, is where the remaining
  cost is: `assembleProps` (a `Object.defineProperty` per bond prop) is 2.9% of the layer,
  `BondBinding` 1.5%, `useRoot` 0.9%.
- **`get_or_init_context_map` is 3.9% of card and 4.2% of datagrid**, and it is not our code:
  Svelte's SSR `getContext` does `ssr_context.c ??= new Map(get_parent_context(...))`, so the first
  context read in **any** component copies the parent's whole context map. Every Kernel part reads
  the Bond from context, so every part pays one Map copy. There is no Svelte API that reads a parent
  context without initializing that copy.
- **`bench:ssr`'s gc-share gate failed once this session on `collapsible` (24.5% against a 23.1%
  allowance)**, exactly as §11 records it failing on `menu`. Same cause — a 2026-08-15 baseline and
  a machine that has drifted — and the same conclusion: the baseline wants re-recording quietly, as
  its own change. Runs here used `--no-gate` and checked the fingerprints directly.
- `card-root.svelte` still declares `onclick`/`onkeydown` in **both** its `source` getters and its
  `attrs()` thunk. The `source` copies are dead whenever `rest` is provided, which is always here.
  §11 flagged it; still out of scope.

---

## 13. Round 4 — the per-root allocations, and where the well runs dry (2026-08-21)

Same method as §11 and §12: interleaved A/B on `bench:ssr`, both trees rebuilt every round, the
before-tree being the working tree with exactly the change under test reverted. Every run printed,
because the arms' overlap is what says whether a delta is real. `plain` rides along as the drift
control.

**All eight `bench:ssr` fingerprints are unchanged in every run of every arm, and all 193 test
files / 1102 tests pass.** Nothing here moves a rendered byte.

**The box was noisier than in §12 and that bounds what this round can claim.** `cardroot` — a layer
none of these changes can reach — moved ±8% between arms and produced a 5.44 µs outlier against a
3.3 µs median in both arms; `plain` moved ±20%. Read that as the resolution: batch 1 clears it,
batch 2 does not.

### Batch 1 — four per-root allocations. Landed. collapsible −10.6%, tree −6.1%.

Four changes, measured together because they land on the same population (a root that owns a
controlled prop and/or passes `variantProps`) and separately have no chance against this noise
floor:

1. **`resolvePresentation` builds `variantProps` only when a variants source will read it**
   (`components/atom/presentation.svelte.ts`). `resolveLocalVariants` and `mergeVariants` are its
   only consumers and **both return before touching `props`** unless a local variants definition or
   `preset.variants` exists. Eleven roots pass `variantProps: root.props`, so each was allocating
   one object and invoking one accessor per Bond prop, per rendered root, for a value nothing read.
2. **`withDefaultBorder` stops building a padded copy of the class string**
   (`components/element/class.ts`). The whole-token test was `` ` ${flat} `.includes(' border-border ') ``
   — correct, and one throwaway string per rendered element to turn a token test into a substring
   test. It is now an `indexOf` loop with word-boundary checks, and `clsx` is skipped outright when
   the value is already a string, which the presentation kernel guarantees on every element.
3. **`controlledProp` stops calling `Object.defineProperties`** (`shared/bond/bind.svelte.ts`).
   Descriptor validation, not the array's shape transition, is the expensive half: three descriptors
   in one call measure **0.728 µs** against **0.483 µs** as three separate `defineProperty` calls and
   **0.279 µs** as two plain stores plus one accessor. Only `value` needs an accessor; the brand is a
   symbol, which `Object.keys` and `for…in` skip whatever its descriptor says, and nothing
   object-spreads a props-spec cell (`assembleProps` reads it by index, `connectControlledProps` by
   name). A WeakMap side table was measured too and is **worse** — 0.756 µs, `WeakMap.set` costing
   more than the descriptors it removes. `controlledCell` was folded into `controlledProp` in the
   same pass, deleting one object-with-accessors per root.
4. **`TreeBodyAtom` drops an `attrs` override that returned `{ ...super.attrs }`** — one allocation
   per tree body per render to reproduce the base result exactly.

| layer       | before                  | after                   | Δ median   | arms          |
| ----------- | ----------------------- | ----------------------- | ---------- | ------------- |
| collapsible | 41.87 43.31 43.56 40.31 | 37.24 37.89 38.24 38.36 | **−10.6%** | **separated** |
| tree        | 56.39 58.74 57.88 56.04 | 52.49 54.87 51.76 56.03 | **−6.1%**  | **separated** |
| card        | 9.72 10.83 10.70 10.66  | 10.20 10.62 10.37 9.16  | −3.7%      | overlap       |
| datagrid    | 16.95 18.72 19.79 17.65 | 18.18 16.63 18.97 17.19 | −2.7%      | overlap       |
| cardroot    | 3.03 3.03 3.36 3.17     | 4.66 3.36 3.38 3.29     | +8%        | overlap       |
| menu        | 7.25 7.29 7.07 7.68     | 7.47 7.27 7.48 7.34     | +1.9%      | overlap       |
| card-preset | 10.93 11.01 11.70 11.59 | 10.72 11.50 11.44 11.76 | +1.5%      | overlap       |
| `plain`     | 0.22 0.23 0.23 0.25     | 0.26 0.21 0.28 0.22     | +4%        | drift control |

The two layers that resolve are exactly the two that own a controlled prop **and** pass
`variantProps`. `card`, `cardroot`, `menu` and `card-preset` own neither and must not move; they do
not, beyond the noise. `datagrid` owns one controlled prop **per grid**, not per row, so the per-row
slope cannot see it.

### Batch 2 — four more dead-work removals. Landed, unmeasurable.

1. **`brand` stores the descriptor symbol instead of defining it** (`shared/capability/capability.ts`).
   `Object.defineProperty` + `Object.freeze` measures **0.131 µs**; a plain store + the same freeze
   measures **0.034 µs** — the freeze is the cheap half. `normalizeCapability` is the brand's only
   reader and nothing in the library spreads a capability descriptor. A stateful model rebuilds its
   descriptor per Bond: six per tree node, two per datagrid row.
2. **`defineCapability` stops allocating a throwaway object to build `meta`.** The old
   `{ ...(roles ? { projects } : {}), ...meta, host }` allocated an inner literal on **both**
   branches; two literals under one conditional produce the same key order with one allocation.
3. **`elementAttrs` drops its `Object.hasOwn` guard** (`components/atom/kernel/element.svelte.ts`),
   for the reason `KernelNode.spread()` already states: every config reaching it is a fresh object
   literal or a rest-props proxy, so it inherits nothing enumerable and the guard was one call per
   key per rendered element to prove it.
4. **`hasMotionKeys` iterates an array by index instead of a `Set` by `for…of`** (`resolve/fold.ts`,
   `resolve/constants.ts`). It runs on the fold's passthrough check, once per rendered element, and
   `for…of` over a Set allocates an iterator every time. `MOTION_SKIP` keeps its Set form for the
   membership tests that want it.

| layer       | before                        | after                         | Δ median | arms    |
| ----------- | ----------------------------- | ----------------------------- | -------- | ------- |
| card        | 10.19 11.47 11.37 12.31 10.26 | 10.70 10.42 10.15 11.34 10.76 | −5.9%    | overlap |
| collapsible | 41.35 42.96 42.05 43.57 37.70 | 39.31 40.27 39.79 41.66 36.62 | −5.4%    | overlap |
| tree        | 59.20 62.72 60.36 56.93 53.06 | 59.01 58.87 54.09 56.14 54.85 | −5.2%    | overlap |
| menu        | 7.41 8.01 7.69 8.59 7.72      | 7.82 8.23 7.35 7.07 7.44      | −3.6%    | overlap |
| datagrid    | 18.53 19.46 18.55 16.89 17.66 | 19.93 19.45 17.28 19.64 18.35 | +5.0%    | overlap |
| card-preset | 11.51 11.42 12.52 11.28 10.58 | 11.49 11.39 12.19 10.79 12.02 | +0.6%    | overlap |
| cardroot    | 3.29 5.44 3.33 3.35 3.51      | 3.32 3.48 3.80 5.48 3.32      | +3.9%    | overlap |
| `plain`     | 0.26 0.23 0.23 0.27 0.22      | 0.23 0.22 0.23 0.27 0.26      | ±0%      | control |

Four of eight layers move 3.6–5.9% the right way, one moves 5% the wrong way, and **not one arm
separates**. Kept because each deletes provably dead work at a seat the profiler named and none of
them changes a rendered byte — **not** because they are a measured win. Re-run this batch on a quiet
box before quoting a number for it.

### The parity scoreboard, this session

`bun run bench:vs-shadcn`, median of three whole runs, **load 3.7–5.3 of 16** — above the harness's
own busy threshold in two of the three, so the absolutes are inflated and only the ratios are worth
reading. shadcn's own untouched side read 5.48 µs/card here against 6.44 in the session that
prompted this round, which is the usual reminder that cross-session absolutes say nothing.

| family    | ixir  | shadcn / control | verdicts across the three runs |
| --------- | ----- | ---------------- | ------------------------------ |
| card      | 10.33 | 5.48             | +96% / +75% / +107%            |
| button    | 1.62  | 1.60             | **+12%~ / −3%~ / +8%~**        |
| accordion | 32.52 | 59.05            | **−45% / −43% / −45% WIN**     |
| table     | 16.27 | 6.47             | +209% / +143% / +136%          |
| menu      | 7.13  | 23.23            | **−69% / −69% / −70% WIN**     |
| tree      | 35.91 | 0.06             | 605× / 599× / 582× floor       |

**Button now reads at parity, `~` in all three runs** — the gap is inside its own spread, which is
what §11's stage 4a predicted and what the census already showed (210 B and 3 anchors against
shadcn's 707 B and 4). Card and table are unchanged in ratio and remain the two real losses.

### A standing flag in §11 and §12 is wrong, and should not be acted on

Both rounds recorded that `card-root.svelte` declares `onclick`/`onkeydown` in **both** its `source`
getters and its `attrs()` thunk, "dead whenever `rest` is provided, which is always here". **The
`source` copies are not dead.** The two seats serve the two lanes: `#options.attrs` is read only by
`KernelNode.spread()`, which is the class-only lane, while `elementConfig` — the rich lane — spreads
`#source()` and never looks at `#options.attrs`. A card that escalates (a consumer passing `as`, a
rich prop, a `base`) gets its click and keydown handlers **only** from `source`. Deleting them would
silently drop card activation on exactly the cards that opted into a different tag. The duplication
is load-bearing; what it wants is a comment, not a deletion.

### Where the remaining cost is, per family

Profiles re-taken this session (`LAYER=<x> bun run profile:ssr`, self time):

| bucket                                 | card  | datagrid | tree  |
| -------------------------------------- | ----- | -------- | ----- |
| garbage collector                      | 27.2% | 23.8%    | 20.6% |
| Svelte's own server renderer           | ~30%  | ~19%     | ~9%   |
| Kernel / presentation                  | ~10%  | ~11%     | ~24%  |
| Bond construction, props, capabilities | ~3%   | ~8%      | ~10%  |
| the root component's own compiled body | 10.4% | —        | ~7%   |

Read together with §6's cost model this closes the question §8 opened:

- **Card is at its structural floor for this design.** Roughly 58% of a card's SSR cost is the
  garbage collector plus Svelte's own renderer walking four component boundaries — a count shadcn
  pays too. What is left that is ours is the Bond (`cardroot` 3.3 µs against a shadcn part's 1.6)
  and, per part, one context read, one lazy-node registration and one class-lane resolve. Three
  rounds of grinding have taken card from 13.16 to ~10.3 µs; the remaining gap **is** the Bond and
  the registered semantic identity, and no further micro-lever in this file's list changes that.
- **Table's cost is one Bond root per row**, ~11–12 µs of the ~16. A row constructs a Bond, reads two
  contexts, registers two capabilities, publishes two contexts, projects two roles onto its Atom and
  resolves a full rich-lane element. The three cells are already on the cheapest path in the library
  (`Kernel.static`, `EMPTY_ATTRS`, `divPlain`).
  **Corrected 2026-08-25 (§14): that is true on the server and false on the client.**
  `datagrid-cell.svelte` authors through `Kernel.element`, so on the client each cell builds a
  `createPresentation` snapshot, a `useKernelElement` derived and an `attribute_effect` — three per
  row, and the reason a row creates 20 deriveds against a shadcn row's 8.
- **Tree's cost is one Bond per node**, exactly as `tree-node-cost-2026-08.md` §3c concluded, plus
  four rich-lane elements per node against the control's three bare tags.

### Still open, ranked by what it would actually buy

1. **A row / a node that is not a Bond root** — the only lever left that changes an order of
   magnitude, and a public-surface redesign in both families (`DataGridRowBond`, `ITreeNode`,
   `getBond`, the `{ row }` / `{ tree }` snippet arguments). Estimated: table ~16 → ~10 µs
   (+143% → ~+55%), tree ~36 → ~15 µs. Not attempted; it needs an explicit decision against the
   standing "public API stays stable" policy.
2. **Drop the per-part `id` where nothing can reference it** (§8 lever 3, §9 stage 4). Now
   quantified from the census: **all four of a card's ids are unreferenced** (`card-root`'s
   `aria-labelledby`/`aria-describedby` are `BROWSER`-gated), and **two of a tree node's three** are
   (only the header's is pulled, by the body's `aria-labelledby`). That is four attributes and ~80 B
   per card. Still gated behind the hydration-parity spec that does not exist, and still the only
   item here that changes rendered DOM.
3. **`get_or_init_context_map` is 3.2% of card and 3.6% of datagrid** and is not ours: Svelte's SSR
   `getContext`/`setContext` copies the parent context map on the first context touch in **any**
   component. A datagrid row pays four such copies (the row plus its three cells). There is no
   Svelte API that reads a parent context without initializing the copy.
4. **`divBranch` compiles to `$.attributes({ ...view.spread() })`** — the compiler copies a fresh
   object a second time on every attrs-bearing element. §11 flagged this for `dynamicBranch`; it is
   true of all three bare leaves. No template syntax hands `attributes()` an object it already owns.
5. **The rich-lane dead-key removal** (§12's first open item) is still not attempted, and is still
   not mechanical — `renderMode`'s `hasLifecycleAttrs` tests `'global' in attrs` by presence.

---

## 14. Round 5 — the client axis, and a harness that was lying (2026-08-25)

Rounds 1–4 ground the SERVER number. This round asked why the **client** was so much worse, found
that the answer was reaction count rather than any hot function, and took it out. It also corrected
two measurements this document had been reporting wrongly.

**Everything below is an interleaved A/B of two BUILT bundles** — the tree as it was before this
round against the tree after — alternating arms every round, floors over 11 rounds. Same-run
absolutes are useless here: on this box `bench:vs-shadcn:client` reported shadcn's own unchanged
card at 49.9 µs in one run and 31.6 µs in another, which is why a −10% claim cannot rest on it.

| family | mount       | hydrate     | SSR (marginal µs/unit) |
| ------ | ----------- | ----------- | ---------------------- |
| card   | **−22…25%** | **−32%**    | **−10…14%**            |
| table  | **−14…18%** | **−14…17%** | +1.6…2.8% (noise)      |
| button | ±noise      | ±noise      | ±noise                 |
| tree   | ±noise      | −6…8%       | −4…5%                  |

### What the client was actually paying: signals, not functions

The instrument that found it was not a profiler. At n=400 the CPU profile has ~150 samples and its
top frame is noise — `needsPresentation` read 10.7% at n=400 and under 1% at n=2000, on unchanged
code. Counting the Svelte primitives each side CONSTRUCTS per unit is deterministic, and it is the
number that moved:

| per unit  | derived (before → after / shadcn) | effect       | getContext | attach    |
| --------- | --------------------------------- | ------------ | ---------- | --------- |
| card      | 14 → **8** / 8                    | 40 → 36 / 29 | 11 → 7 / 0 | 2 → 1 / 0 |
| table row | 20 → **8** / 8                    | 30 / 29      | 9 / 0      | 0 / 0     |
| tree node | 17 / —                            | 42 / —       | 10 / —     | 4 / —     |

Card and a grid row now construct **exactly as many `derived`s as the shadcn equivalent**, and a row
is within one effect of it. That is the whole of this round's win; nothing here made a function
faster.

#### The plain leaf charged one signal per attribute

`divPlain`/`headingPlain` passed four expressions to `template_effect`, and `flatten` wraps every
entry in its own `derived` — four signals per rendered element, three of which only read a field.
Two of them (`data-bond`, `data-kind`) are `undefined` outside DEV.

Reading one `{@const}` instead lets the compiler hoist all four writes into the effect body and emit
**no sync array at all**:

```js
const a = derived(() => view().plainAttrs());
template_effect(() => { set_class(div, 1, clsx(get(a).class)); set_attribute(div, 'id', get(a).id); … });
```

One derived, whatever the attribute count. This is why `PlainAttrs` is one call and not four
accessors, and why the shape is fixed rather than DEV-conditional.

#### `getPreset()` was a `getContext` per render

`klass()` — the class-only lane's resolver — called `getPreset(key)` on every resolve, twice per
part per render. Preset installation is initialization-scoped (`createPresentation` already treated
it so), so `KernelNode` now reads it once in its constructor. Card: 8 per-render context reads → 0,
against 4 added at init (one per component), net 11 → 7.

#### `DataGrid.Cell` was on the rich lane, on the client

§13 said the three cells were "already on the cheapest path in the library". That is true on the
server and **false on the client**: the cell authored through `Kernel.element`, so each one built a
`createPresentation` snapshot, a `useKernelElement` derived and an `attribute_effect` — three of
each per row, and 12 of a row's 20 deriveds.

What kept it there was one attribute. `role="gridcell"` never varies, but as a config entry it is an
element attribute, and one attribute is all it takes to disqualify the class-only lane. So a plan may
now declare a **constant** `role`, which the plain leaves write literally (`PlanOptions.role`,
`definePart({ role })`). It is deliberately just `role`: a template cannot write a dynamic SET of
attribute names without a spread, and a spread is the `attribute_effect` this lane exists to avoid,
so a leaf can only carry attributes it names in its own markup — and `role` is the one attribute
parts commonly declare as a constant. The record `DataGrid.Row` moved to the same seam with its
per-row attributes in `attrs` (the `card-root` bargain), which drops its `createPresentation`
without changing its lane.

#### The lazy-node `@attach` bought nothing for a synthesized part

Every registered part carried an `{@attach}` purely to hand its DOM node to `LazyNodeDescriptor`:
a `branch` plus an `attach` effect per element, and its presence **disqualified the part from the
class-only lane** (`prepare()` requires no attachment). But a synthesized Atom contributes exactly
`{ id }`, and every consumer of one — `labelledControl`, `treeItemGroupLink`, `input`'s
`aria-controls`, `card-root`'s own attrs — resolves it through `nodeByRole(...)?.id`. **Not one reads
`.element`.** Auditing all twelve such slots (alert, card, toast, stepper/step, form/field) found no
element reader anywhere in `capability/`.

So the attachment is minted only for a part with a DECLARED Atom. `Card.Title` moved
`headingBranch → headingPlain` as a result. `LazyNodeDescriptor.element` and `Atom.element` fall
back to `document.getElementById(this.id)` for the rare late asker, since `bond.elements` is public
and enumerates every registered node.

#### An inert part's id was unreferenceable by construction

`inert` is `role === undefined && synthesized` (`bond/declaration.ts`), and an inert slot **registers
nothing** — `nodeByPart`/`nodeByRole`/`bond.elements` cannot return it, which
`define-part.svelte.spec.ts` already pinned. Its derived id could therefore never be projected onto a
sibling, and we were minting one anyway: `card-header-<seed>` on every card header, card body, grid
cell and tree indicator on the page.

Inert parts now render an `id` only when the consumer passes one. Measured on the wire: **card
607 → 566 B/unit, tree 569 → 546, datagrid 782 → 775.** The key stays present-and-`undefined` rather
than dropped, so a consumer's own id still lands in its original position and the byte order does not
move. This is §13's open item 2, finally scoped tightly enough to be provable — it is narrower than
that entry assumed (it does NOT cover a registered slot such as `card.title`, whose id
`aria-labelledby` really does pull).

#### A plan is matched by field, not by a composed key

`definePart` resolves its plan per component INSTANCE, and the cache built a
`slot\0as\0role\0class` string — ~70 characters allocated and hashed per rendered part — to look up
what is almost always the only plan its slot has. Comparing the three fields instead is three `===`
on module-constant strings, i.e. pointer tests.

This one is here because **the cell conversion regressed table SSR by 12%** and this recovered it to
+1.6%. Worth stating plainly: the node lane costs more at INIT than the element seam (a plan lookup,
a `KernelNode`, and a class resolved twice — once by `escalates()`, once by `prepare()`) and less per
UPDATE. A server render is all init and no updates, so a lane change that wins on the client can lose
on the server, and only an interleaved A/B of the two trees will show it.

### Two corrections to this document

- **§4's retained-heap column was wrong, not merely noisy** — and so were its ratios, not just its
  absolutes. `usedJSHeapSize` is page-wide. A CDP heap snapshot (full GC, then reachable `self_size`
  diffed between the two counts) gives card **25.0 kB/unit against shadcn's 13.5 (+85%, not +730%)**
  and table **29.6 vs 13.6 (+118%, not +155%)**. The heap leg now takes that snapshot: it moved out
  of `vs-client.svelte.ts` into `scripts/bench-vs-client.mjs`, because only the driver has CDP.
  Post-round: card 22.6 kB (+68%).
- **§13's "the three cells are already on the cheapest path"** was true only of SSR. Corrected in
  place.

### Not attempted, and why

- **Tree.** Its only real lever is one Bond per tree instead of one per node, which is
  `tree-node-cost-2026-08.md` §3c — investigated on 2026-08-21 and explicitly recommended against
  ("a redesign, not an optimisation, and the measured justification is weak"), with `createVirtual`
  as the library's actual answer for large trees. Tree's own failure axis is green (`bench:growth`
  k = 0.79, linear). Raised and declined this round rather than taken silently. It picked up −6…8%
  on hydrate from the shared work anyway, which is exactly what §4 of that document predicted.
- **Button.** Measured at parity before touching it (mount ±noise, 6 effects to shadcn's 8), and
  routing `defineLeaf` through the class-only lane is not the small change §9 implied: a static leaf
  has no `KernelPlan`, and the lane is built around one.
- **`{ ...$0 }` in `attribute_effect`** (§13 open item 4). A bundle-level A/B put it at −6.1% on card
  but +2.8% on table and −3.8% on tree — inside the noise, not taken.

### Still open

1. `escalates()` and `prepare()` each resolve the class once, so a node's first render resolves it
   twice. `escalates()` must not prime the cache (a value stashed at init is one render stale by the
   time anything spreads it), but it only needs the `=== undefined` answer, not the string.
2. The remaining card gap is 36 effects to shadcn's 29 and 7 context reads to 0 — the Bond, the
   registered semantic identity, and one `getContext` per component for the installed preset. Four of
   the seven are that preset read, and it cannot be hoisted further while presets are context-scoped.
3. §13 items 3–5 stand unchanged.

## 15. Round 6 investigation — card, tree, accordion bottlenecks (2026-08-25)

Investigation only; nothing below is applied. Every number is from this box on a quiet load
(≤ 2.0 of 24), client bundle built from the Round 5 tree.

### Method

Three instruments, all against the built `vs-client.js` and therefore free of source-map guesswork:

1. **Primitive creation per unit** — `create_effect`, `derived`, `getContext`, `attach`, `block`,
   `branch` patched to count, slope between n=100 and n=800 (n=50/200 for the superlinear pair).
2. **Call counts per unit at growing n** — the same patch on `render`, `update_effect`,
   `mark_reactions`, `execute_derived`, read at 100/200/400/800. A per-unit count that grows with
   n is a cascade; the primitive table cannot show one.
3. **Bundle-level A/B** — the candidate fix patched into the built bundle, then re-measured with the
   same two tools plus the mount slope (best of 5) and `bench:growth`'s driver. A cause that does not
   move when removed was not the cause.

Plus CPU profiles at n=800/2000 with and without intros (`mount(..., { intro: false })`), a
differential heap snapshot by constructor, and a DOM census.

### Accordion — two causes, one of them the OPEN k=1.31 entry

`bench:vs-shadcn:client` reads mount **1017 µs/item against bits-ui's 119** (+757%), hydrate 398 vs 93. Primitive counts do not explain it: an item constructs 55 effects and 26 deriveds to bits-ui's 52
and 41. The call-count tool does:

| calls per item, `intro:false` | 100→200 | 200→400 | 400→800 | bits-ui |
| ----------------------------- | ------: | ------: | ------: | ------: |
| `Kernel.render` (dispatch)    |     306 |     606 |    1206 |       — |
| `update_effect`               |     359 |     659 |    1259 |      53 |
| `mark_reactions`              |     918 |    1818 |    3618 |       7 |
| `execute_derived`             |      28 |      28 |      28 |      25 |

**Every `{@render Kernel.render(el)}` dispatch block re-runs once per item mounted after it**, ~1.5n
per item, while _no derived re-executes_ — so the `focusedId` equality gate (§7a) is working exactly
as documented and is being bypassed. The bypass is Svelte 5.56's eager block re-run:
`mark_reactions` adds any `BLOCK_EFFECT` reached through the derived chain to `eager_block_effects`
when a source is written during effect flush, and `flush_queued_effects` then runs those with
`update_effect(e)` and **no `is_dirty` check**. A registration happens inside `onmount` — i.e. during
flush — and the chain is `attachItem` → `items` version → `#firstEnabledId` → `focusedId` → header
`attrs` → presentation snapshot → `presentation.attrs` → `KernelElement.mode()` → the dispatch block.
The derived recomputes to the same string; the block downstream of it re-runs anyway. That is the
cause the `growth-baseline.json` note calls "NOT collection marking" and "OPEN": it never was the
marking, it was the block.

The profile agrees: `hasLifecycleAttrs` 10.9% self, `mark_reactions` 9.5%, `mode` 7.2%, the
snippet block + `BranchManager.#commit`/`ensure`/`#process` ~22% — all of it the dispatch re-running.

**Proof by bundle A/B** — `mode()` memoized after its first evaluation, so the dispatch block tracks
nothing:

| accordion, ixir            | baseline | `mode()` memo |    Δ |
| -------------------------- | -------: | ------------: | ---: |
| `render` calls/item, n=800 |     1206 |             3 |      |
| `update_effect`/item       |     1259 |            56 |      |
| mount µs/item, intro off   |      471 |           225 | −52% |
| mount µs/item, intro on    |      671 |           435 | −35% |
| `bench:growth` k           |     1.34 |          0.89 |      |
| `bench:growth` n=400       |   261 ms |         82 ms | −69% |

bits-ui: 158–180 µs/item in the same runs. After the patch the profile is flat (GC 18.7%,
`before` 6.6%) — allocation-bound like every other family, +30% against bits-ui instead of 8×.

**The second cause is the intro.** `mount()` plays `in:` transitions by default, and every open body
declares `enter: enterAccordionItemBody()` — `animate(node, { opacity: [0, 1], height: 'auto' })`.
Per body that is `measuredAutoValue` (write `height:auto`, read `scrollHeight`, restore — one forced
layout), `currentStyle` (`getComputedStyle().getPropertyValue`, a second forced style flush after the
restore wrote again) and a WAAPI `node.animate`. Profile with intros on: the enter closure 20.5% self
(the measurement inlined), `getPropertyValue` 18.0%. Slope: 703 → 456 µs/item with `intro: false`;
bits-ui 177 → 180 (its open-state animation is a CSS class). Hydration never plays intros, which is
why hydrate is "only" 4× and mount 8×.

**What the mechanism means for the rest of the library.** Any dispatch block whose `mode()`/
`prepare()` transitively reads Bond state that a registration writes will re-run per registration,
gate or no gate. `bench:growth` says tabs, select, dropdown-menu, datagrid and stepper are clean
(k ≤ 0.88) — their headers do not read an owner-wide fallback at mount. Tree breadth is clean for the
same reason (`focusedId` answers from the owner's own header, O(1), no collection read).
**`tree-depth` k=1.35 is not this bug**: the call-count tool on the growth bundle shows every count
flat per level (44 effects, 16 deriveds, 3 renders, 6 `mark_reactions`), and the `mode()` memo left
k at 1.34. Whatever grows there is per-level work in an uncounted frame — DOM insertion depth or the
effect-tree walk are the remaining suspects; it stays OPEN.

### Tree — flat profile, constant factor, the levers are the ones §3 of `tree-node-cost` priced

Mount 190 µs/node against a 2.7 µs hand-written control; intros are not a factor (197 vs 181 with
`intro: false` — the body's attachment runs its `initial` phase at duration 0, which skips
measurement). The profile is flat: GC 19.0%, `before` 5.5%, nothing else above 3.5%.

Per node, from the primitive and heap tools:

| per node                  |      ixir | control |
| ------------------------- | --------: | ------: |
| effects                   |        42 |       2 |
| deriveds                  |        17 |       0 |
| `getContext`              |        10 |       0 |
| `attach`                  |         4 |       0 |
| comment nodes (anchors)   |        10 |       0 |
| retained heap             |   36.7 KB |  0.7 KB |
| — objects / contexts      | 147 / 145 |         |
| — closures                |       304 |         |
| — Maps (9 BranchManagers) |        36 |         |

Where the 42 effects come from (sampled creation stacks): 3 attribute effects (one per declared
part, each with its `flatten` deriveds), 4 attach branch+effect pairs (three Atom element captures
and the body's motion attachment), 3 dispatch blocks + 3 branches + 3 children blocks, one `$effect`
per part from Kernel's destroy owner and one from `useRoot`, plus the component boundaries. The 17
deriveds are 3 per rendered part (config props, presentation snapshot, spread memo) and the Bond's
own (`visibleHeaderIds`, `focusedId`, disclosure selection, `controlledProp`, prop fallbacks).

This is the shape `tree-node-cost-2026-08.md` §1–2 already described, now measured on the client:
one Bond, six capability registrations, three declared Atoms on the rich lane, per node. Its §3c is
still the only order-of-magnitude lever and was declined in Round 5. What is left inside the current
architecture, in order of size:

1. **The declared-Atom element capture** — 3 × (branch + attach effect) per node, 6 of 42 effects.
   `TreeRootAtom.onmount` needs a real element (it registers with the parent) but the header and body
   only need their `id`, which the Round 5 DOM-lookup fallback already serves for synthesized parts.
   Extending "no attachment unless something reads `.element`" to declared Atoms whose only reader is
   `onmount` on a _different_ part would take two of the three.
2. **Per-part Kernel allocation** — three deriveds, a 10-closure view object and a 6-getter
   presentation object per rendered part. Shared with every family; ~30 closures/node here.
3. **Re-registering the owner's keyboard model on nested nodes** — `tree-node-cost` §3a, ~1%.

None of these reaches the control; together they are perhaps −20…25% on a number that is 70× the
floor. §4 of that document — reframe the row, point large trees at `createVirtual` — still holds.

### Card — the gap is structural, and it is now mostly the dispatch

Mount 72 µs against shadcn's 38; profiles on both sides are flat and GC/`before`-dominated (ours
GC 14.8% / `before` 12.3%, theirs 19.8% / 10.9%). Per card, after Round 5:

| per card          |    ixir |  shadcn |
| ----------------- | ------: | ------: |
| effects           |      36 |      29 |
| deriveds          |       8 |       8 |
| blocks / branches | 12 / 15 |   8 / 9 |
| BranchManagers    |      12 |       8 |
| comment nodes     |      13 |       9 |
| `getContext`      |       7 |       0 |
| retained heap     | 22.6 KB | 13.5 KB |
| — closures        |     159 |      95 |
| — Maps            |      40 |      24 |

The +4 blocks, +4 BranchManagers (12 of the 16 extra Maps), +4 comments and +4 `before` calls are
the same thing: **one `{@render Kernel.render(el)}` dispatch per part**. shadcn's parts _are_ their
element — `<div {...}>{@render children?.()}</div>` — so each pays one snippet block for its
children and nothing to choose a leaf. Ours pay that block plus the dispatch, because the leaf is
chosen per part (`as`, motion, lifecycle attrs). The rest of the delta is one `$effect` per part
(Kernel's destroy owner, 3), one context read per component (4 Map copies), the root's attach pair
and two `prop()` deriveds for the `$bindable`s. `hydration-anchor-diet-2026-08.md` already established that
`{@render}` is the cheapest dispatch Svelte offers; the only way to not pay it is for the part
component to _be_ the leaf, which means dropping `as` on the plain-lane parts — a public-API change,
estimated at −20% from the primitive delta (36 → 28 effects, 13 → 9 anchors), not measured.

### What a fix round would do, in order

1. **Kernel: decide `mode()` once, at init, untracked.** The inputs are consumer props and the
   preset (`as`, `base`, motion presence, lifecycle attrs, `global`); none is Bond state, so the
   dispatch block has no business tracking the presentation snapshot. The "props that turn rich
   later" path (`RichPart`/`prepare()`) keeps its per-render check, which reads consumer props
   only. Gate: `bench:growth` accordion k ≤ 0.9 and the call-count tool at 3 renders/item; the
   family SSR fingerprints must not move (the server path is untouched). Measured ceiling: accordion
   mount −52% / −35% (intro off / on), 261 → 82 ms at n=400. Then **strike the accordion "OPEN"
   note** from `growth-baseline.json` and re-record the exponent.
2. **Accordion motion: one forced layout per body, not two.** `height: [0, 'auto']` names the from
   value (the base class is `h-0`), so `currentStyle` never runs; only `measuredAutoValue` remains.
   Whether an accordion that _mounts_ open should animate open at all is a product question — Svelte's
   own `in:` default says yes, bits-ui's CSS-class animation says the same thing costs nothing on
   the main thread. Measuring after item 1: the intro is 210 µs/item of the remaining 435.
3. **Tree: attachment-free header/body Atoms** (item 1 above), then leave it, per
   `tree-node-cost` §4.
4. **Card: nothing inside the current API.** The dispatch is the gap; dropping `as` on plain parts
   is the lever and needs a decision, not a benchmark.

## 16. Round 6 — the four levers from §15, landed (2026-08-25)

All four items of §15's "what a fix round would do" are in. Gates: `check`, `lint`, 1112 unit
tests, `bench:ssr` (only `card`/`card-preset` shas moved, by exactly the three anchors), `bench:growth`
re-recorded, `anchor-budget` re-pinned.

### 1. `KernelElement.mode()` reads the config tracked and the snapshot untracked

`kernel/element.svelte.ts`. The dispatch block no longer reaches Bond state through the presentation
snapshot, so a registration during effect flush cannot re-run it. Call counts per item at n=800:
`render` 1206 → 3, `update_effect` 1259 → 56, `mark_reactions` 3618 → 10. `bench:growth` accordion
**k 1.34 → 0.80…0.86**, n=400 mount 261 → 82…92 ms. The accordion "OPEN" entry in
`growth-baseline.json` is closed; its history is `note5` there. The rule is in AGENTS.md: nothing
read from a dispatch block may depend on Bond state, however well gated.

### 2. `animate()` measures in one batched microtask

`utils/animate.ts`. Every run that will animate is queued and flushed together: all `auto` axes
written first, every measurement read second, restore and `node.animate` third — one layout for the
batch instead of one per element. `measuredAutoValue` is now read-only. Accordion's enter recipe
also names its from-value (`height: [0, 'auto']`), so `getComputedStyle` is never consulted for it.
The animation starts one microtask later than before, inside the same frame; `stop()` before the
flush cancels the pending start. `animate.spec.ts` unchanged and green.

Whether a panel that _mounts_ open should animate open at all is still a product question; this
round only made the answer cheap.

### 3. Tree header/body Atoms no longer capture their element

`Atom.capturesElement` (default `true`), overridden to `false` on `TreeHeaderAtom` and
`TreeBodyAtom`. `attachments` then returns a frozen empty object and `element` falls back to the
DOM lookup by rendered id. DEV throws if an opted-out Atom declares `onmount`/`ondestroy` or a
behavior/capability mount hook. Per node: attach 4 → 2, branch 18 → 14, **effects 42 → 34**.
`bench:growth` tree-depth k 1.40 → 1.23 as a side effect (fewer effects per level); still OPEN, and
`growth-baseline.json` records what this round ruled out.

### 4. Card's seven parts are their own element

`PlainPartProps<E>` (`kernel/types.ts`, exported from `authoring`) types `as`, `base`, motion and
the renderer lifecycle attributes `never`; each part renders `<tag {...node.spread() as LeafAttrs}>`
with no `{@render Kernel.render(el)}`. Per card: blocks 12 → 9, branches 15 → 12, effects 36 → 30,
anchors 13 → 10, retained heap 22.6 → 18.6 KB. A rich source (`variants`, `presetLayer`, a function
preset) still resolves fully — the node builds its `KernelElement` at init and `spread()` forwards to
it — which is why the local-variants and function-preset tests still pass on `Card.Title`. The
leaf ↔ rich switching and custom-renderer tests moved to `alert/kernel.svelte.spec.ts`, whose title
still dispatches. Public-contract change recorded in ADR 0008.

### Results

Interleaved bundle A/B, same box, card family (`scripts/bench-vs-client.mjs` against the pre-item-4
and current builds, alternating):

| card, µs/unit | pre-item-4 |  now |    Δ |
| ------------- | ---------: | ---: | ---: |
| mount         |       80.9 | 65.4 | −19% |
| hydrate       |       54.9 | 47.3 | −14% |
| broad         |       16.4 | 10.6 | −35% |

`bench:vs-shadcn:client`, one full run after all four (Round 5 medians in parentheses):

| family    | mount ixir / shadcn | vs                | hydrate     | vs               | heap B/unit | vs          |
| --------- | ------------------- | ----------------- | ----------- | ---------------- | ----------- | ----------- |
| card      | 74.7 / 49.3         | **+52%** (+91%)   | 61.1 / 41.9 | **+46%** (+102%) | 18 628      | +38% (+61%) |
| accordion | 306 / 137           | **+124%** (+757%) | 239 / 182   | **+31%** (+329%) | 55 160      | +49%        |
| tree      | 150 / 3.3           | 45× (71×)         | 167 / 1.3   | 126× (49×)       | 34 297      | 24× (25×)   |
| table     | 75.7 / 43.4         | +74%              | 47.1 / 37.7 | +25%             | 21 136      | +59%        |
| menu      | 51.0 / 60.0         | −15%              | 35.4 / 48.7 | −27%             | 12 601      | +4%         |

Tree hydrate read 167 in that run and 117 in the next (`card tree` only); the harness's own note
applies — under ~10% is below resolution, and hydrate on this family swings ±40% run to run. The
mount column moved 190 → 150…197 across runs; the primitive table (42 → 34 effects) is the number
that does not swing.

### Open, found this round

- **Card `broad` is 10–16 µs/unit against shadcn's 2–2.5.** §4 recorded 2.32 in Round 1; the
  pre-item-4 bundle already reads 16.4, so the regression landed somewhere in Rounds 2–5, not
  here. The leg changes `class` on every `Card.Root`, i.e. the root's `attrs`-lane dispatch block
  (`prepare()` reads the consumer's class) plus its attribute effect — two class resolutions per
  update, which is §14's open item 1 seen from the update side. Not bisected this round.
- `tree-depth` k=1.23, cause still unknown; the eager block re-run is ruled out (§15).
- Accordion's remaining +124% on mount is the intro (~200 µs/item of ~300, now one layout per batch
  but still a WAAPI animation per open body) plus the constant factor bits-ui does not pay.

## 17. Round 7 — what was actually wrong, and the constant-factor diet (2026-08-25)

Round 6 left the client column at card +54%, table +67%, accordion +140%, tree 53× a floor, and the
verdict was that the numbers were still bad. This round attributed every microsecond before touching
anything, with three instruments that now live in `scripts/`:

- `bench:vs-shadcn:own` — a CPU profile attributed to the **innermost component frame**: a
  component's own synchronous init, children excluded, and inside it the library frames.
- `bench:vs-shadcn:primitives` — Svelte primitives and Kernel calls created per unit at growing n,
  by instrumenting the built bundle in memory. Deterministic; a per-unit count that grows is a cascade.
- `bench:vs-shadcn:ab` — an interleaved two-bundle mount-slope A/B, the only accepted evidence for a
  µs claim on this box.

### The finding

| card, own cost µs/unit (n=2000) |     ixir |  shadcn |
| ------------------------------- | -------: | ------: |
| `Card.Root` / `Card`            | **28.0** | **6.1** |
| `Card.Header`                   |      9.8 |     5.7 |
| `Card.Title`                    |      8.2 |     3.4 |
| `Card.Body`                     |      6.0 |     3.5 |
| GC                              |     11.4 |     8.1 |

Two-thirds of the card gap was the **root**, and the file:line ledger of its mount showed the Bond
was ~free — capability host never allocated, zero effects. The 22 µs was plumbing: the dispatch block
(`{@render Kernel.render(root)}`: block + branch + `BranchManager` + anchor), the props thunk
evaluated **three times** per mount (`escalates()`, `prepare()`/`spread()`, and the `bindId` closure
re-reading `#source()` on every id read), a capture attachment minted for a root Atom that is never
constructed, `useRoot`'s allocations, a 7-key `attrs` object of which one key survived, `$derived`s
for two booleans. Every element spread exactly once — breadth, not repetition. The same shape priced
a plain part at ~4 µs of seam, a declared-Atom (rich-lane) part at ~40 µs (tree: three per node), and
a DataGrid row at 22.8 µs.

### What landed

- **W5 harness fairness.** The vs-shadcn fixtures now install `defaultPreset` (`klass()` was
  answering from a memoised fallback while shadcn ran `cn()` per element — ~0.8 µs/part in our
  favour). `Card.Root` no longer emits `aria-disabled="false"` (−22 B/card). Instruments promoted.
- **W4 allocation cuts, byte-identical.** No conditional-spread option literals in `definePart`/
  `useRoot`; `KernelNode.elementConfig` a method, not a per-node arrow; the lazy-node attachment
  minted only on the class-only lane's `spread()` and only when the plan says the Atom captures;
  `Atom#ownAttach` lazy; one module-scope descriptor in `assembleProps`.
- **W2 rich-lane diet, byte-identical.** `createSnapshot` — one `$derived.by` over
  `valuesFrom(props())` replaces eleven per-axis thunks, `readValues` and a six-accessor view object
  per rich part (the spread memo stays its own derived: `resolve-count.svelte.spec.ts` pins that an
  unrelated attribute change must not re-resolve the snapshot when the fold passes rest props through
  by reference — folding the spread in broke exactly that). `mergeBehaviorLayers` starts by reference;
  `mergeHandlerLayer` hands an empty layer's base back; `#buildSpread` copies nothing when there are
  no handlers. The default preset's class-only records are resolved once on the rich lane too
  (`resolve/default-record.ts`, shared with `klass()`). `defineAtom` takes `captures: false`;
  `AccordionItemBodyAtom` uses it.
- **W6 accordion: no enter on initial mount.** `Bond.isSettled` (false during the mount flush, true
  from the microtask `useRoot` schedules after it); `enterAccordionItemBody({ settled })` resolves
  instantly for a body that was open at mount. `accordion-intro.svelte.spec.ts`.
- **W1 the root IS its element.** `Card.Root` renders `<div {...root.spread() as LeafAttrs}>`;
  `CardRootProps extends PlainPartProps<'div', CardChildren>`. `LazyNodeDescriptor.idFor(consumerId)`
  takes the id the render already holds, so the props thunk is evaluated twice per mount, not three
  times; `escalates()` asks `classLaneAvailable()` for the boolean instead of resolving a class it
  never uses; `Atom.capturesElement` is a static the lazy-node plan copies (`plan.node.captures`), so
  `CardRootAtom` declares `false` and the root mints no capture; the card's two booleans are plain
  functions; `attrs` writes only present keys. The two Kernel fixtures that drove `base`/motion
  through `Card.Root` moved to `Alert.Root`.
- **W3 the row IS its element.** `role: 'row'` on the plan, attrs without conditional spreads,
  `style="--rows:…"` only when set (`var(--rows, auto)` in the stylesheet), `record.elementId`
  cached per id. `DatagridRowProps<T>` extends `PlainPartProps`.
- **W2b tree root/header/body and `AccordionItem.Root` are their element.** Header (polymorphic
  `as="button"`) and Body (real transitions) keep the dispatch.

Gates: 1112 unit tests; `bench:ssr` fingerprints moved only where stated — card/cardroot/card-preset
by `aria-disabled` (−22 B) then one anchor (−7 B), datagrid by one anchor + the default style (−27 B),
tree by three anchors (−21 B); `anchor-budget` re-pinned card 17→16 / 16→15 / lane rows 9→8,
datagrid 20→19, and a new tree row at 16 (was 19); public-surface and props snapshots refreshed;
ADR 0008 records the four public changes.

### Results

**Deterministic first** — these do not depend on the box. Per unit, `bench:vs-shadcn:primitives` and the
DOM census, Round 6 → Round 7 (shadcn in parentheses):

| per unit            | effects          | deriveds      | attach    | blocks       | comment anchors | retained heap             |
| ------------------- | ---------------- | ------------- | --------- | ------------ | --------------- | ------------------------- |
| card                | 30 → **24** (29) | 8 → **6** (8) | 1 → 0     | 9 → 8 (8)    | 10 → **9** (9)  | 18.6 → **15.3 KB** (13.5) |
| table row + 3 cells | 30 → 28 (29)     | 8 → 8 (8)     | 0         | 12 → 11 (8)  | 13 → 12 (9)     | 21.1 → 19.7 KB (13.3)     |
| tree node           | 34 → **28** (2)  | 17 → 17       | 2 → 2     | 9 → 6        | 10 → **7** (0)  | 34.4 → **27.9 KB** (1.5)  |
| accordion item      | 55 → **49** (52) | 26 → 26 (41)  | 5 → 4 (4) | 12 → 11 (12) | 13 → 12 (13)    | 55.2 → 39.3 KB (36.9)     |

A card now constructs fewer Svelte effects than shadcn's card and the same number of blocks and
anchors; what is left is 7 context reads, 3 `onDestroy` and the Bond's registrations. `bench:growth`:
accordion 0.91, tree 0.94, tree-depth 1.18 (never raised), datagrid 0.82.

**Timing, with the caveat stated plainly.** The final runs were made under a 3.6–5.9 load from
unrelated processes on this box, and the harness changed this round (presets installed, no
`aria-disabled="false"`), so the ratios below are not comparable to §16's. Medians of three
`bench:vs-shadcn:client` runs; SSR from one `bench:vs-shadcn` run:

| family    | SSR ixir / opp | vs               | mount ixir / opp | vs           | hydrate     | vs          | broad                      | heap        |
| --------- | -------------- | ---------------- | ---------------- | ------------ | ----------- | ----------- | -------------------------- | ----------- |
| card      | 11.33 / 5.78   | +96% (+125%)     | 60.6 / 40.1      | +51% (+54%)  | 54.4 / 23.0 | +137%       | **6.8 / 7.8** (was 11 / 2) | +14% (+38%) |
| table     | 10.85 / 6.94   | +56% (+62%)      | 75.3 / 46.0      | +64% (+67%)  | 48.1 / 28.0 | +72%        | 6.5 / 2.8                  | +48%        |
| accordion | 44.26 / 64.01  | −31% WIN         | 250.7 / 126.0    | +99% (+140%) | 210 / 111   | +89% (+74%) | 17.2 / 7.7                 | +6%         |
| menu      | 8.78 / 23.56   | −63% WIN         | 60.1 / 61.9      | **−3%**      | 46.6 / 45.7 | +2%         | 19.7 / 20.3                | −4%         |
| tree      | 48.83 / 0.06   | 817× floor       | 131.3 / 2.7      | 49× (53×)    | 172 / 2.7   | 64×         | 9.0 / 0.3                  | 19× (24×)   |
| button    | 4.90 / 1.51    | **+225%** (+23%) | 14.1 / 10.9      | +30% (+12%)  | 20.7 / 6.6  | **+215%**   | 10.2 / 4.4                 | +20%        |

Two things the table says that the primitives do not:

- **Card `broad` is fixed** — 6.8 µs against shadcn's 7.8, from 10–16 µs (§16 open item): the
  dispatch block re-ran on every class change, and the root has no dispatch now.
- **Button went from parity to +225% on SSR and +215% on hydrate — and that is W5, not a
  regression.** With `defaultPreset` installed, `defineLeaf`'s `preset: 'button'` resolves a preset
  entry that declares variants, so every button runs `resolveVariants` and `mergeClassesWithPreset`
  (tailwind-merge) per render; the unfair harness had been answering from a memoised fallback.
  shadcn's `tv()` does the equivalent work in ~1.5 µs. This is the shape every part in a real app
  takes, and it is the next lever: cache a variant-bearing entry's resolved class by (entry, variant
  values) the way the class-only lane already caches by (entry, plan).

### Open after this round

1. **Preset resolution with variants, per leaf per render** — the button finding above; likely worth
   more than anything in this round for real apps, where every part has the preset installed.
2. Card at +51% mount / table +64%: the remaining root cost is `useRoot` + the Bond's registration and
   context, and the remaining row cost is the record registration; the honest ceiling table in §15
   stands. Parity is the decision recorded there (Card without a Bond).
3. `tree-depth` k = 1.18, still unexplained.
4. The card `hydrate` ratio (+137%) swung with shadcn's side (23 µs here, 34–42 in every earlier run);
   re-measure on a quiet box before reading anything into it.

---

## §18 — After the whiteboard migration (2026-08-27)

Every family is on the redesigned Kernel and the Bond/Atom runtime is deleted. Re-measured with
`bench:vs-shadcn` and `bench:vs-shadcn:client`, three runs each, medians (the harness resolves ~10%;
shadcn's SSR side carries ±46% IQR, which is why its percentages move between runs).

| family      | SSR µs/unit | vs         | mount | vs       | hydrate | vs       | broad | vs       |
| ----------- | ----------: | ---------- | ----: | -------- | ------: | -------- | ----: | -------- |
| accordion   |        17.6 | **−74%**   |  70.0 | **−68%** |    44.0 | **−60%** |   4.7 | −28%     |
| menu (item) |         4.7 | **−83%**   |  37.3 | **−37%** |    18.7 | **−64%** |   8.3 | **−60%** |
| button      |         3.5 | +80%~      |   9.3 | −17%     |     8.1 | +8%      |   5.6 | +44%     |
| card        |        11.2 | +70%       |  45.9 | +22%     |    57.7 | +70%     |   8.3 | +251%    |
| table (row) |        14.3 | +100%      |  72.4 | +51%     |    48.9 | +27%     |   6.7 | +198%    |
| tree (node) |        18.7 | 249× floor |  65.3 | 24×      |   110.7 | 41×      |   4.3 | 9×       |

Against Round 6 (card +54%/+77%, table +67%/+25%, accordion +140%/+74%, tree 53×): **accordion
flipped from +140% to −68% on mount**, tree halved to 24×, card mount +54% → +22%, table +67% → +51%.
Retained heap tracks the same split — accordion −41%, menu −42%, button −15%, card +5%, table +55%.

### The `-wb` arms were measuring the wrong thing

`card-wb`/`accordion-wb` compared the shipped family against a design-phase prototype. Once the
shipped family moved onto the same seam, the arms differed only in how the FIXTURE imported them —
the prototype used direct imports, the shipped one the `Card` namespace. They are now `card-direct`
and `accordion-direct`: the same shipped components, imported part by part, so the arm prices the
barrel and nothing else.

### Did the shipped families keep the prototype's numbers?

`whiteboard-2026-08.md` reported the prototype card at −46% mount / −43% hydrate against shadcn and
the prototype accordion at −87% / −82% against bits-ui, with the real families 2.2× and 7.5× above
them. Both prototypes were re-measured beside the shipped families on 2026-08-27, from the same
fixture shape (direct imports on both sides).

|                                 | shipped (direct) |        prototype | delta  |
| ------------------------------- | ---------------: | ---------------: | ------ |
| card SSR                        | 511 B, 9 anchors | 510 B, 9 anchors | 1 byte |
| card own-cost, mount (n=2000)   |          49.5 µs |          51.0 µs | parity |
| card own-cost, hydrate (n=2000) |          50.3 µs |          50.1 µs | parity |
| accordion SSR                   | 760 B, 9 anchors | 722 B, 9 anchors | +38 B  |

**The shipped card IS the prototype**, one byte and no anchors apart, and its own-cost profile is
within 3% on both mount and hydrate. The accordion's 38 bytes are the extra ARIA the shipped family
projects (`aria-selected`, longer part ids) — the same 9 anchors, ~13% more SSR µs.

Where the two instruments disagree, believe the profiler: the client bench's mount and hydrate
columns are interleaved slopes and carry enough spread to show the prototype 10 µs ahead in one
session and behind in the next (`whiteboard-2026-08.md` said the same thing: card mount read 22–45
for the prototype across its own runs). The own-cost profile at n=2000 is the steadier instrument and
puts them at parity.

Absolute µs are also not comparable across sessions: W5 made the harness fair by installing
`defaultPreset` in every fixture, which charges us preset resolution shadcn was already paying
through `cn()`/`tv()`, and shadcn's own card mount reads ~48 µs today against the 25–38 recorded in
the whiteboard doc. Read verdicts within a run, never µs between rounds.

### The barrel is worth more than anything left in the card

Identical components, identical props, one call-site difference:

| axis          | `Card.Root` (namespace) |    direct import | delta             |
| ------------- | ----------------------: | ---------------: | ----------------- |
| SSR           |       561 B, 15 anchors | 511 B, 9 anchors | −50 B, −6 anchors |
| mount         |                 45.9 µs |          36.9 µs | **−20%**          |
| hydrate       |                 57.9 µs |          42.1 µs | **−27%**          |
| broad update  |                  8.3 µs |           4.9 µs | **−41%**          |
| retained heap |                 14.1 kB |          11.2 kB | **−21%**          |

~2.2 µs and ~1.5 hydration anchors per part — four to five times the +0.5 µs/+2 anchors §16
recorded. A member expression is a dynamic component, so the compiler wraps each part's output in a
fragment boundary. Against shadcn (which also renders `Card.Root`, so the barrel row stays the fair
comparison) the direct call site turns card's mount from **+23% into −23%**.

**It lands hardest on the families that multiply parts.** A table row is four parts, so the same
change measured far larger there than on a card:

| table, per row  | `DataGrid.Row` (namespace) |     direct import | delta      |
| --------------- | -------------------------: | ----------------: | ---------- |
| SSR             |          703 B, 19 anchors | 660 B, 14 anchors | −5 anchors |
| mount           |                   82–84 µs |          46–56 µs | **−37%**   |
| hydrate         |                   45–56 µs |          33–35 µs | **−28%**   |
| targeted update |                   15–16 µs |              7 µs | **−55%**   |

Hydrate flips from **+53…+88% against shadcn to −23…−27%** — a loss becomes a win on the call site
alone. `table-direct` is a permanent arm for this reason.

**Shipped as an addition, not a change:** every family barrel now exports the parts by name beside
the namespace — `import { CardRoot } from '@ixirjs/ui/components/card'`,
`import { DataGridRow, DataGridCell } from '@ixirjs/ui/components/datagrid'`. Nothing breaks.

Two traps found while shipping it. The first sweep missed exactly the parts that matter most:
`Row`/`Cell`/`Column` reach `DataGrid` through SUB-BARRELS (`export { Row } from './row'`), not
`export { default as … }`, so the pattern-based pass skipped the multiplied parts and caught only the
one-per-tree ones. The second: the published barrels (`src/lib/public/components/*.ts`) export the
namespace and the types and nothing else, so internal-barrel exports are invisible to a consumer —
the additions had to be made there too, which is what moves the public surface. `DropdownMenuItem`
cannot be named in the internal barrel (the item's TYPE owns it there) but is free in the published
one, which is where the multiplied menu part now ships from.

### Splitting the presentation memo — tried, measured worse, reverted

The obvious lever for broad update was to split `resolve()` in two: an expensive memo (preset lookup,
variant merge, `tailwind-merge`) reading only `preset`/`class`/`variants`/the selectors, and a cheap
one merging the consumer's attributes, so an unrelated attribute change would re-run only the merge.

Implemented and measured, three runs each side:

| axis              | one memo | two memos |
| ----------------- | -------: | --------: |
| card broad        |   8.3 µs |    9.2 µs |
| card-direct broad |   4.9 µs |    8.5 µs |
| card mount        |  45.9 µs |   47.4 µs |
| card-direct mount |  36.9 µs |   38.4 µs |

Worse on every axis, and worst on the one it targeted. Two reasons, both visible in hindsight: a
**broad update changes `class`**, so the expensive half re-runs anyway and the split only adds a
second signal and a `{ base, consumed }` wrapper per part; and the win it was chasing only exists for
a change that touches _no_ presentation input, which the broad-update arm is not. Reverted, with the
reasoning left in `kernel.svelte.ts` so it is not re-tried blind.

`resolve-count.svelte.spec.ts` did not move either way, because its probe spreads `restProps` into
the config thunk — which reads every key inside whichever memo calls it. A fixture that passes the
proxy through (`() => restProps`, what every shipped part does) is the shape that would show a
difference; the probe cannot see one.

### Then the broad arm was profiled, and it was not the class merge

`bench-vs-profile.mjs` gained a `--broad` mode for this (mount once, then write the one prop every
unit reads and flush, ×40 — the mount profile cannot see a re-resolution cost). Card's broad profile,
before:

```
20.0%  consumerAttrs      ← the single biggest frame
 7.1%  ownKeys            ← the props PROXY's trap
 7.8%  resolve
 5.5%  mergeClassesWithPreset
 2.4%  cn / 2.0% clsx
```

**Twenty-seven percent of a broad update was walking the rest-props proxy** — not `tailwind-merge`,
which the memo split had assumed. `consumerAttrs` walked it twice per resolve: `for…in` for the
string keys and `Object.getOwnPropertySymbols` for the attachments, each hitting the proxy's
`ownKeys` trap. One `Reflect.ownKeys` returns both in one pass, in the same order.

| axis            |  before |    after |
| --------------- | ------: | -------: |
| card broad      |  8.4 µs |  **4.7** |
| table broad     |  6.8 µs |  **5.7** |
| accordion broad |  4.7 µs |  **4.0** |
| card hydrate    | 57.7 µs | **45.2** |
| table hydrate   | 49.0 µs | **38.7** |
| SSR `cardroot`  |  4.5 µs | **2.35** |
| SSR `menu`      |  5.4 µs | **4.23** |

Every SSR fingerprint unchanged, every test green. Card's broad went from **+251% to +85%** against
shadcn and its hydrate from **+70% to +5%**; the SSR root layer halved. The lesson is the one the
failed memo split should have taught first: **profile the axis before proposing a fix for it.**

### Open after this round

1. **Broad update is still behind** — card +85%, table +145% — but the remaining self time is now
   spread across `resolve`, `mergeClassesWithPreset` and Svelte's own `set_class`/`set_attributes`,
   with no single dominant frame. The next candidate is the per-resolve rebuild of the whole attribute
   object when only `class` changed.
2. **A function-form preset entry resolves twice per part on mount** (init reads `render.as`/`render.base`,
   the memo re-runs it to subscribe). Only function entries pay it; a static record is cached.
3. Preset resolution with variants per leaf per render (§17's open item 1) is unchanged and still the
   biggest lever for a real app, where every part has a preset installed.
