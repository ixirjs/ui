# Hydration-anchor diet — investigation and plan (2026-08-02)

Historical note: the adapter paths and budgets below predate Kernel-only authoring; current budgets
live in `src/lib/test/contracts/anchor-budget.spec.ts`.

Status: **A6 + A1 + A2 + A3 implemented** (same day); A4/A5 remain decision-gated. The ratchet
lives in `src/lib/test/contracts/anchor-budget.spec.ts` — budgets moved 34→24 (card), 32→22
(card + defaultPreset), 29→17 (collapsible), 36→20 (datagrid row — the cell dispatches by
computing which snippet to render, one dynamic-callee anchor, instead of an {#if} chain at two),
control pinned at 2.
Follows the 2026-08 performance pass; supersedes "filter is unprofiled" (compare `NEXT.md` P1)
with a measured root cause and a ranked fix list.

## 1. Problem

At identical element counts, `@ixirjs/ui`'s table DOM is twice the size of shadcn-svelte's — in
**comment nodes**. Measured on the compare apps (`/table?rows=1000`, live DOM after hydration,
TreeWalker census):

|               | elements | comments   | texts  | total nodes |
| ------------- | -------- | ---------- | ------ | ----------- |
| @ixirjs/ui    | 11,085   | **93,363** | 15,099 | **119,547** |
| shadcn-svelte | 11,073   | **34,138** | 15,040 | **60,251**  |

Server HTML marginals agree: **93 comments/row vs 34/row** (slope between `rows=2` and `rows=12`).
Comments are 78% of our DOM nodes. Every DOM-proportional cost scales with them:

- **Hydration** walks every anchor (`hydrate_next` traverses comments); 5000 rows ≈ 465k comments.
- **Filter interaction** (2.5× slower than shadcn, sort at parity): CDP profiles show 59–74% of
  self time in native DOM `remove`/`insertBefore` + GC on _both_ apps and only ~10% in library
  code — the differential is the node mass being torn down and recreated, not resolution math.
- **Heap**: ~93k extra live `Comment` objects per 1000 rows, plus their effect-anchor references.
- **The bench never saw it**: `client.mjs` counts `getElementsByTagName('*').length` — elements
  only. The 2× node gap was invisible to every recorded metric except time.

## 2. Verified anchor cost model (Svelte 5.56.8)

Method: compile micro-templates with the repo's own compiler (`generate: 'server'`), render, count
comments (script preserved in the perf pass session; re-runnable in minutes). Emission sites
verified in `svelte/src/internal/server/index.js` (`element()`, `props_id()`) and `renderer.js`
(`child_block`, `BLOCK_OPEN/CLOSE`).

| Construct                                                | Extra anchors         | Notes                                                   |
| -------------------------------------------------------- | --------------------- | ------------------------------------------------------- |
| static element (`<div>`)                                 | **0**                 |                                                         |
| component boundary (`<C/>`)                              | **0**                 | boundaries are free                                     |
| `{@render localSnippet(args)}` — statically known callee | **0**                 | args are free too                                       |
| `{@render someParam?.()` / ternary callee                | **+1**                | each _dynamic-callee_ level pays 1                      |
| children projected through a component boundary          | **+2**                |                                                         |
| `{#if}` block (any number of branches)                   | **+2**                | `<!--[N-->` + `<!--]-->`                                |
| `{#each}`                                                | +2 block, +2 per item |                                                         |
| **`<svelte:element this={…}>`**                          | **+3**                | before-tag, inner-close, after-tag (`element()` helper) |
| `$props.id()`                                            | **+1**                | `<!--$sN-->` per component instance                     |

The two "free" rows above are free on this axis **only**. `nesting-component-vs-snippet-2026-08.md`
prices a boundary against a module snippet in time, allocation and live heap at nesting depth, and
finds them byte-identical here while differing ~28% on SSR time and ~17% on retained heap. It also
records that the +2 for children through a boundary is paid by a snippet's body dispatch too, so it
is not a reason to prefer one seam over the other.

**Transition transparency (secondary benefit of snippet dispatch).** Svelte's local-transition
boundaries follow `EFFECT_TRANSPARENT`: snippet/render-tag branches carry it
(`svelte/src/internal/client/dom/blocks/snippet.js:38`) and so do `<svelte:element>` and dynamic
components, but an `{#if}` branch is transparent **only** as an `{:else if}` continuation
(`if.js:30` — the initial branch is opaque). So a computed-snippet dispatch
(`{@render picked?.()}`) never interposes a transition boundary: consumer content inside keeps
reacting to an outer block's enter/exit with default-local transitions, no `|global` needed —
while an `{#if}`-chain dispatch would swallow them. The `partElement` seam's own dispatch is
render-tag based, so it has always been transparent; the snippet-dispatch cell now matches it.

The three shared render seams route the whole library through `<svelte:element>`:
`components/atom/part-element.svelte` (74 seam parts), `components/atom/html-atom.svelte` (all
HtmlAtom users), `components/element/html-element.svelte` (rich path). 60 part files also pay a
dynamic-callee level for a `{#snippet body()}` wrapper whose only job is currying children args.

### Where the 93/row goes (7-cell data row)

Per cell (~7): if-block +2, `svelte:element` +3, children-through-boundary +2. Per row (~10):
`$props.id` +1, partElement ternary +1, body-param hop +1, children-args hop +1, `svelte:element`
+3, row-children boundary +2, each-item +2 — plus Badge (an HtmlAtom user, +3 element +2 children)
and name-cell spans. shadcn's cell is component 0 + children +2 = **2/cell**, static `<tr>`/`<td>`.

## 3. Plan

Ranked by (anchors removed × breadth) ÷ risk. Items A1–A3 are pure template/seam mechanics — no
public API change, no resolution change, no new signals; output bytes change deliberately
(fingerprints + `family-ssr` snapshots re-record, like the 2c commit).

### A1 — Static-tag fast path in the two native snippets (−3 per div-rendering part, whole library from 2 files)

In `part-element.svelte` and `html-atom.svelte`, add a `nativeDiv` snippet rendering a literal
`<div class={…} {...attrs}>` and select it when `el.tag() === 'div'` (resp.
`presentation.as ?? 'div'` is `'div'`). Selection happens inside the _existing_ dynamic-callee
render — `{@render (el.native() ? (el.tag() === 'div' ? nativeDiv : native) : component)(…)}` — so
it adds **no** new anchors. `<svelte:element>` remains for genuine `as` polymorphism.
Hydration safety: branch choice is a pure function of the same resolved inputs on server and
client, so the hydration walk sees the structure SSR emitted. Same treatment for
`html-element.svelte`/`svg-element.svelte` is optional (rich path is cold).
Estimated: −3 × (4 elements/card, 8 units/table-row incl. Badge) ⇒ roughly −25 anchors/row, −12/card.

### A2 — Cell: static-div branch in the flat template (−3/cell, included in A1's arithmetic)

`datagrid-cell.svelte` already renders a flat `{#if isHidden}{:else if el.native()}` chain; add the
`{:else if el.tag() === 'div'}` literal-div branch (branch count doesn't change the block's anchor
cost). Cells become if(+2) + children(+2) = 4/cell — two away from shadcn's floor.

### A3 — Kill the body-wrapper hop: `partElement(el, body, bodyArg?)` (−1 per bonded part, deletes ~240 lines across 60 files)

Today every part with args-taking children declares `{#snippet body()}{@render children?.({ x })}
{/snippet}` — one extra dynamic-callee level. Give the `partElement` snippet an optional third
parameter forwarded as the body's argument: `{@render body?.(bodyArg)}`. Parts then pass
`children` directly plus the arg object built once at init (not per render — keep it out of any
tracked scope). Call-site migration is mechanical; parts with argless children already pass
`children` directly and are unaffected.

### A4 — `$props.id()` seed for value-identified collection children (−1/row; defer)

Rows whose identity is the consumer's `value` never render the seed-derived id, yet still emit
`<!--$sN-->` per row (5000 at scale). Skipping `$props.id()` there collides with the
root-identity audit's blanket rule — needs an explicit classification in
`root-identity-audit.spec.ts` and an SSR-determinism argument (`value` _is_ the stable identity).
Small win, contract-sensitive: do last, or not at all.

### A5 — `isHidden` semantics (mostly superseded)

The cell no longer pays an `{#if}` block at all: it computes which snippet to render (hidden →
`undefined`) through one optional-chained `{@render …?.()}` — one anchor for every state,
including hidden. The remaining per-cell floor is that single dispatch anchor plus the
children-boundary pair; CSS-hiding could not beat it without changing remove-from-DOM semantics.

### A6 — Close the measurement gap (do first, it's the gate)

1. Add comment/total-node counts to `compare/bench/src/client.mjs`'s census (TreeWalker, one
   evaluate) so node mass is a recorded metric, and to `fidelity` reporting.
2. Add a deterministic **anchors-per-unit contract spec** in the ui repo: render the card and
   datagrid fixtures, count `<!--` per card/row, assert against a pinned budget (like
   `resolve-count.svelte.spec.ts` but for markup). Machine-independent — this is the ratchet that
   keeps the diet from regressing, immune to the ±15% thermal drift that plagued route medians.

### Sequencing

A6 (gates) → A1+A2 (one PR: seam + cell + snapshot/baseline re-record) → A3 (mechanical sweep,
own PR) → re-measure → A4/A5 only if the calm-machine numbers say the remaining gap matters.

## 4. Expected end-state (pre-registered)

| Metric                           | Before                                        | Predicted           | **Measured after A1–A3**                                                                          | shadcn   | Residual                                                                |
| -------------------------------- | --------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| comments/row (live, 1000 rows)   | 93.4                                          | ~55–62              | **61.3** (snippet-dispatch cell; compare row carries Badge + spans beyond the fixture arithmetic) | 34.1     | `$sN` (A4), children-args hops, each-item, per-cell dispatch floor of 1 |
| comments @1000 rows              | 93,363                                        | ~85–90k total nodes | **61,305** (−160k nodes at 5000 rows)                                                             | 34,138   | same                                                                    |
| table HTML bytes @1000 rows      | 1.998 MB                                      | —                   | **1.746 MB** (13% below shadcn's 2.016 MB)                                                        | 2.016 MB | —                                                                       |
| anchor budgets (contract spec)   | card 34 · preset 32 · collapsible 29 · row 36 | ~17–24              | **24 · 22 · 17 · 20**                                                                             | —        | pinned exactly                                                          |
| interleaved A/B vs pre-diet HEAD | —                                             | —                   | htmlatom −14%, card −10%, collapsible −18%, datagrid −32%, tree −21% (µs/unit)                    | —        | —                                                                       |

Hydration integrity after landing: zero console diagnostics across all routes/both apps, fidelity
valid, table parity 1.0, full unit suite green (872).

Time-domain predictions (hydration-ready, filter, heap) should improve proportionally to node
mass but are **only claimable from the interleaved A/B and a calm-machine compare run** — route
medians drifted ±15% intra-day on unchanged code during the 2026-08 pass.

## 5. Constraints carried forward

- ADR 0008: presentation precedence, spread identity, lifecycle guarantees untouched — this plan
  changes _markup plumbing_, not resolution or behavior. Rich path stays on `HtmlAtom`.
- Seam rules: no per-part `$derived` added; `bodyArg` objects built at init, never inside a
  tracked boundary; restProps stay by-reference.
- Every fingerprint change lands as its own re-record commit with the snapshot diff reviewed
  (the 2c discipline).
- E2E hydration smoke on `/table` before/after each PR (anchors are hydration structure; a
  server/client branch mismatch is a blank screen, not a slow one).

## 6. Follow-up: `{#if}` → snippet dispatch across `src/lib` (same day)

Every conditional in the **product components** of `src/lib` (59 blocks across 44 files) now
dispatches a snippet instead of opening an `{#if}` block:

```svelte
{@render (cond ? branchA : branchB)()}
<!-- two outcomes -->
{@render (cond ? branch : undefined)?.()}
<!-- optional -->
{@render (children ?? fallback)(arg)}
<!-- consumer-or-default -->
```

Three reasons, in order of weight:

1. **One anchor instead of two.** An `{#if}` block emits `<!--[N-->` + `<!--]-->`; a render tag
   emits one. Where the block only wrapped another render tag (`{#if children}{@render
children(…)}{/if}`) the saving is 2 of 3.
2. **Transition transparency.** Snippet branches carry `EFFECT_TRANSPARENT`
   (`svelte/src/internal/client/dom/blocks/snippet.js:38`); an `{#if}` branch carries it **only**
   as an `{:else if}` continuation (`if.js:30`). Consumer content inside a dispatched snippet
   keeps reacting to an outer block's enter/exit with default-local transitions; inside an
   `{#if}` it would not.
3. **Redundant guards disappear.** `{#if children}{@render children()}{/if}` is just
   `{@render children?.()}` — the compiler emits `?? $.noop` for an optional render tag, so an
   absent snippet renders nothing without a block.

### Constraints found while converting (read before extending this)

- **TypeScript narrowing does not cross into a snippet body.** `{#if bond}` narrowed `bond` for
  its branch; a snippet cannot see that. Sites that relied on it carry an explicit assertion with
  a comment naming the dispatch that proves it (`teleport`, `accordion-item-header`,
  `accordion-item-indicator`, `popover-dialog-dialog`, `lazy`, `avatar`).
- **A snippet written among a component's children is passed to it as a prop**, not defined as a
  local snippet. Declare dispatch branches at template top level (or inside a plain element).
  `swatch` failed exactly this way before being moved out of `<HtmlAtom>`.
- **`{@const}` does not survive** the block that scoped it: `color-control`'s three template
  consts were hoisted to `$derived` in the script.
- **Snippets declared outside an `{#each}` must take the item** as a parameter
  (`calendar-body`, `color-control`'s channel segments).

### Deliberately not converted

- `src/lib/**/stories/*.svelte` and `src/lib/test/**` fixtures — neither ships. Story conditionals
  live inside nested snippet/each scopes, so converting them means threading demo-local scope
  through parameters, which makes the examples harder to read for no runtime gain; and
  `test/perf/ablation.test.svelte` is the benchmark's own control instrument, whose anchor
  emission the `plain` budget exists to hold still.
