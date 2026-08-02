# Hydration-anchor diet — investigation and plan (2026-08-02)

Status: **A6 + A1 + A2 + A3 implemented** (same day); A4/A5 remain decision-gated. The ratchet
lives in `src/lib/test/contracts/anchor-budget.spec.ts` — budgets moved 34→24 (card), 32→22
(card + defaultPreset), 29→17 (collapsible), 36→23 (datagrid row), control pinned at 2.
Follows the 2026-08 performance pass; supersedes "filter is unprofiled" (compare `NEXT.md` P1)
with a measured root cause and a ranked fix list.

## 1. Problem

At identical element counts, `@ixirjs/ui`'s table DOM is twice the size of shadcn-svelte's — in
**comment nodes**. Measured on the compare apps (`/table?rows=1000`, live DOM after hydration,
TreeWalker census):

| | elements | comments | texts | total nodes |
|---|---|---|---|---|
| @ixirjs/ui | 11,085 | **93,363** | 15,099 | **119,547** |
| shadcn-svelte | 11,073 | **34,138** | 15,040 | **60,251** |

Server HTML marginals agree: **93 comments/row vs 34/row** (slope between `rows=2` and `rows=12`).
Comments are 78% of our DOM nodes. Every DOM-proportional cost scales with them:

- **Hydration** walks every anchor (`hydrate_next` traverses comments); 5000 rows ≈ 465k comments.
- **Filter interaction** (2.5× slower than shadcn, sort at parity): CDP profiles show 59–74% of
  self time in native DOM `remove`/`insertBefore` + GC on *both* apps and only ~10% in library
  code — the differential is the node mass being torn down and recreated, not resolution math.
- **Heap**: ~93k extra live `Comment` objects per 1000 rows, plus their effect-anchor references.
- **The bench never saw it**: `client.mjs` counts `getElementsByTagName('*').length` — elements
  only. The 2× node gap was invisible to every recorded metric except time.

## 2. Verified anchor cost model (Svelte 5.56.8)

Method: compile micro-templates with the repo's own compiler (`generate: 'server'`), render, count
comments (script preserved in the perf pass session; re-runnable in minutes). Emission sites
verified in `svelte/src/internal/server/index.js` (`element()`, `props_id()`) and `renderer.js`
(`child_block`, `BLOCK_OPEN/CLOSE`).

| Construct | Extra anchors | Notes |
|---|---|---|
| static element (`<div>`) | **0** | |
| component boundary (`<C/>`) | **0** | boundaries are free |
| `{@render localSnippet(args)}` — statically known callee | **0** | args are free too |
| `{@render someParam?.()` / ternary callee | **+1** | each *dynamic-callee* level pays 1 |
| children projected through a component boundary | **+2** | |
| `{#if}` block (any number of branches) | **+2** | `<!--[N-->` + `<!--]-->` |
| `{#each}` | +2 block, +2 per item | |
| **`<svelte:element this={…}>`** | **+3** | before-tag, inner-close, after-tag (`element()` helper) |
| `$props.id()` | **+1** | `<!--$sN-->` per component instance |

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
`presentation.as ?? 'div'` is `'div'`). Selection happens inside the *existing* dynamic-callee
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
`root-identity-audit.spec.ts` and an SSR-determinism argument (`value` *is* the stable identity).
Small win, contract-sensitive: do last, or not at all.

### A5 — `isHidden` semantics (−2/cell; decision needed, parked)

The per-cell `{#if !isHidden}` is the remaining block. CSS-hiding (class + `aria-hidden`) would
remove it but changes documented remove-from-DOM semantics for hidden columns. Product decision,
not a perf call — park unless hidden columns matter at scale.

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

| Metric | Before | Predicted | **Measured after A1–A3** | shadcn | Residual |
|---|---|---|---|---|---|
| comments/row (live, 1000 rows) | 93.4 | ~55–62 | **68.3** (compare row carries Badge + spans beyond the fixture arithmetic) | 34.1 | per-cell if-block (A5), `$sN` (A4), children-args hops, each-item |
| comments @1000 rows | 93,363 | ~85–90k total nodes | **68,305** (−125k nodes at 5000 rows) | 34,138 | same |
| table HTML bytes @1000 rows | 1.998 MB | — | **1.823 MB** (below shadcn's 2.016 MB) | 2.016 MB | — |
| anchor budgets (contract spec) | card 34 · preset 32 · collapsible 29 · row 36 | ~17–24 | **24 · 22 · 17 · 23** | — | pinned exactly |
| interleaved A/B vs pre-diet HEAD | — | — | htmlatom −14%, card −10%, collapsible −18%, datagrid −32%, tree −21% (µs/unit) | — | — |

Hydration integrity after landing: zero console diagnostics across all routes/both apps, fidelity
valid, table parity 1.0, full unit suite green (872).

Time-domain predictions (hydration-ready, filter, heap) should improve proportionally to node
mass but are **only claimable from the interleaved A/B and a calm-machine compare run** — route
medians drifted ±15% intra-day on unchanged code during the 2026-08 pass.

## 5. Constraints carried forward

- ADR 0008: presentation precedence, spread identity, lifecycle guarantees untouched — this plan
  changes *markup plumbing*, not resolution or behavior. Rich path stays on `HtmlAtom`.
- Seam rules: no per-part `$derived` added; `bodyArg` objects built at init, never inside a
  tracked boundary; restProps stay by-reference.
- Every fingerprint change lands as its own re-record commit with the snapshot diff reviewed
  (the 2c discipline).
- E2E hydration smoke on `/table` before/after each PR (anchors are hydration structure; a
  server/client branch mismatch is a blank screen, not a slow one).
