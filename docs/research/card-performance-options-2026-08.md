# Making ixir Card faster

**Status:** recommendation report; no implementation  
**Baseline:** `17.0 µs/card` vs shadcn-svelte `13.0 µs/card` on marginal SSR (**+4.0 µs,
1.31×**)  
**Companion evidence:** [`card-performance-2026-08.md`](card-performance-2026-08.md)

## Recommendation

Do **not** add a Card-specific fast path yet.

The measured penalty is about 4 µs per card: ~16 µs on a normal four-card dashboard and ~3.2 ms at
800 cards. A Card-specific rewrite would trade away or duplicate the Bond contract to improve a
synthetic high-cardinality case. That is poor leverage unless production traces show many hundreds
of Cards per response.

The right order is:

1. finish and measure the current Kernel render-operand reduction;
2. optimize the shared default native lane only where an interleaved A/B proves a win;
3. stop once Card reaches statistical parity;
4. reclassify Card as static only if the product explicitly decides its Bond interface is not worth
   keeping.

Expected practical target: recover **3–5 µs/card** through shared Kernel/context/allocation work. The
clean equivalent-output ceiling proves up to ~9 µs/card is machinery, but removing all of it also
removes capabilities and is not a valid implementation target.

## Performance budget

| Metric               |             Current |             Target |        Hard guard |
| -------------------- | ------------------: | -----------------: | ----------------: |
| marginal SSR         |             17.0 µs |           ≤13.5 µs |     ≤1.10× shadcn |
| full Card anchors    |                  19 |      ≤15 initially |    never increase |
| bytes/card           |               663 B | unchanged or lower |   no >1% increase |
| default markup/attrs | current fingerprint |          identical |    exact equality |
| Button and Badge     |  faster than shadcn |          unchanged | no >3% regression |

The target is parity, not the 5.8 µs ceiling arm. Chasing the ceiling would optimize away public
behavior.

## Option 0 — accept the current result

**Recommended unless Card is high-cardinality in production.**

At normal dashboard counts the absolute difference is below a tenth of a millisecond. ixir also
emits fewer bytes and provides coordination shadcn does not. No code is the cheapest and safest
optimization.

Reopen only when one of these is true:

- a production route renders hundreds of Cards;
- Card appears in a measured SSR CPU profile;
- the same Kernel cost is proven across high-cardinality families such as menus or grids;
- Card's client hydration/heap, rather than only SSR, misses a product budget.

## Option 1 — tighten the shared Kernel native lane

**Recommended implementation direction when optimization is justified.**

Card repeats the Kernel lane four times, so small shared improvements compound. Button and Badge
already beat shadcn, which means the seam can be competitive; the remaining work is specific to
bonded nodes and repeated descendants.

### 1. Resolve one server packet per node

Today a node is prepared, its branch is selected, and the branch then asks it for class and attrs.
The implementation retains prepared source/rest/class state across those calls. The desired server
shape is one internal result:

```text
resolve node once → { branch, tag, class, attrs, content }
```

This must remain an internal seam; component authors should still provide only the existing plan,
props thunk, and render call. On the server the packet can contain plain values. In the browser the
same interface may remain backed by tracked accessors.

What to remove:

- repeated source/rest reads;
- temporary prepared fields used only to bridge adjacent calls;
- duplicate rich-prop scans;
- duplicate semantic-attr assembly;
- per-axis closures that SSR immediately invokes.

What not to do:

- expose the packet to component authors;
- cache packets across instances or requests;
- include IDs, handlers, Bond state, attachments, or rest props in a global cache.

**Plausible ceiling:** 0.5–1.5 µs/card plus lower GC.  
**Proof:** byte-identical interleaved A/B; CPU profile must show lower Kernel helper and GC self-time.

### 2. Complete the compact render calling convention

The working tree is already changing the native branches from seven operands to a node plus one
`[children, argument]` operand. Finish that change coherently across Kernel, rich renderers, and
`HtmlElement`, then benchmark it before adding another design.

The win must come from fewer generated arguments/closures or less branch work—not merely fewer
source lines. Reject it if:

- `bench:ceiling` fails equivalence;
- any branch receives a non-view value;
- anchor count increases;
- Card improves while Button, motion, or custom-renderer lanes regress.

**Plausible ceiling:** unknown until measured; do not assign credit from code shape alone.

### 3. Remove one internal render anchor where possible

The real Card emits 19 anchors; the equivalent fast arm emits 9. Some of the difference is the
general render dispatch. For the common literal `div`/`h3`, class-only, motionless lane, determine
whether Kernel can dispatch without another component/snippet layer.

Constraints:

- consumer `as`, `base`, motion, lifecycle, preset renderers, and custom renderers must still
  escalate;
- no `{#if}` replacement that trades one render anchor for two block anchors;
- no duplicated literal markup in every Card part;
- hydration output must remain deterministic.

If Svelte cannot express a zero-anchor dynamic escalation without duplicating branches, stop. An
anchor-removal design that enlarges every component's implementation is a shallow module and is not
worth a few microseconds.

**Plausible ceiling:** 0.5–1.5 µs/card plus client DOM/teardown savings.

### 4. Specialize inert bonded descendants inside Kernel

`Card.Header` and `Card.Body` are already declared inert: they construct no Atom and do not register.
They still create a Kernel node, resolve Card context, derive an ID, inspect presentation props, and
dispatch a branch.

Deepen `Kernel.node` so an inert plan with default literal tag, class-only preset, no rich props, and
no consumer class takes one internal native lane. Escalate lazily when any condition stops holding.
The family component must not know this lane exists.

Preserve:

- deterministic IDs;
- arbitrary element attrs;
- consumer `class`, `as`, and `part`;
- function-form and Bond-dependent presets;
- custom renderer and lifecycle escalation;
- nested Card providers.

Do not remove registration again; inert parts already skip it. The profile prices remaining lazy
registration at only ~0.10 µs/card.

**Plausible ceiling:** 1–3 µs/card because two of four fixture elements are inert.

## Option 2 — consolidate context work

The sustained profile attributes about **1.44 µs/card** to Svelte context lookup on ixir's Card.
This is the clearest bounded target, but it is architecture-wide and easier to make worse than it
looks.

A valid design would let one internal environment read answer both:

- which Bond owns this part;
- which preset environment applies here.

The seam belongs inside Kernel/root publication, not in Card call sites. Component authors must not
thread an environment prop through every family.

Required behavior:

- nested family roots shadow only their own Bond;
- nested preset providers keep existing precedence;
- context remains request-local during SSR;
- no global mutable current-context cache;
- reading a preset function still receives the correct Bond;
- optional and required part error behavior remains unchanged.

A combined environment Map may cost more allocation and lookup than two native `getContext` calls.
Prototype it as an internal adapter and delete it unless an A/B recovers at least **0.5 µs/card**
without increasing client heap.

**Maximum observed target:** 1.44 µs/card; expected recoverable amount is lower.

## Option 3 — reduce root setup

The root-only fixture is +3.85 µs over shadcn. Its work includes deterministic identity, Bond and
registry construction, `labelledControl`, context publication, semantic attrs, and Kernel setup.

Before changing it, add ablation arms that isolate:

1. Bond + registry construction;
2. capability registration/activation;
3. context publication;
4. root Kernel node/attrs;
5. teardown ownership.

Only optimize the largest proven arm.

Likely low-risk candidates:

- precompute immutable capability metadata at module scope;
- avoid allocating empty capability/registry indexes until first use;
- avoid duplicate root semantic handler/attr closures on the default non-clickable path;
- keep server values plain where no reactive tracking survives render.

Do not lazily create the Bond based only on root props. Descendant snippets are opaque, consumers can
call exported `getBond`, and function presets can observe the Bond. There is no safe default predicate
that proves the Bond will not be used.

**Plausible ceiling:** unknown; measure the ablations first.

## Option 4 — reclassify Card as a static family

**Fastest result, highest contract cost; not recommended without an explicit product decision.**

The equivalent fast arm renders in ~5.8 µs/card, faster than shadcn's 13 µs. This suggests Card could
become a Button-shaped static family with a lightweight private context for deterministic title and
description IDs. Clickable keyboard behavior can remain local to the root.

That change would need to remove or redefine:

- `CardBond` as the runtime owner;
- `factory`;
- exported `getBond` behavior;
- the Bond snippet argument;
- Bond queries for parts/elements;
- function presets that depend on live Bond state;
- capability composition through Card's Bond.

Trying to preserve all of those with a lazily materialized compatibility Bond would relocate the
same complexity behind a more fragile interface. Either retain the real Bond or consciously remove
its contract; do not build two Card architectures.

Choose this only if:

1. repository usage proves the Bond-facing Card interface is effectively unused;
2. a breaking release is acceptable;
3. Card is expected at high cardinality;
4. the static design passes accessibility and preset requirements without compatibility machinery.

**Potential result:** 6–9 µs/card saved.  
**Cost:** breaking architecture and public behavior.

## Rejected shortcuts

### Memoize final Card output

Unsafe. IDs, rest props, handlers, renderer selection, lifecycle, preset provider state, and Bond
state are instance/request-specific. Existing class-only caches already cover the safe shared axis.

### Optimize `cn` or Tailwind merging

Wrong target. ixir Button and Badge already beat shadcn, and preset lookup/merge accounts for only
~0.30 µs/card in the profile.

### Remove semantic registration

Already mostly done. Header and Body are inert; only meaningful root/title semantics remain.
Remaining registration is ~0.10 µs/card.

### Add a `fast` prop

This enlarges Card's public interface and makes consumers understand internal performance modes.
That is a shallow module. Kernel should choose the lane from existing props and immutable plan
metadata.

### Add separate `StaticCard` and `Card`

Two nearly identical families move the performance decision to every caller and duplicate presets,
types, tests, and documentation. If static Card is strategically correct, reclassify Card instead.

### Inline every Card part

It can remove dispatch but duplicates Kernel's presentation contract across the family. The deletion
test fails: renderer, preset, motion, lifecycle, and attr complexity would reappear in every file.

## Execution sequence

### Phase 1 — establish a trustworthy baseline

1. Finish or revert the active render-operand refactor until `bench:ceiling` runs.
2. Run `bun run setup` in `../compare`; linked builds currently leave stale tarball provenance.
3. Record three complete `bench:micro`, `bench:parts`, and `bench:ceiling` runs.
4. Archive output fingerprints, anchor counts, and profiles under one subject hash.

### Phase 2 — one shared experiment at a time

1. Measure compact render operands.
2. Prototype one-resolve server packets.
3. Prototype the inert native lane.
4. Prototype context consolidation only if Card remains >1.10×.
5. Profile root ablations only if the root-only fixture remains materially behind.

For each experiment:

- one implementation change;
- interleaved old/new arms in the same process;
- at least three runs;
- exact output equivalence before timing;
- retain only wins larger than run-to-run noise;
- rerun Button, Badge, Card, DataGrid/menu layers, and client anchor budgets.

### Phase 3 — stop

Stop when Card is ≤1.10× shadcn or the remaining absolute gap is <1 µs/card. Do not spend interface
complexity to win benchmark noise.

## Decision table

| Situation                                                | Action                                          |
| -------------------------------------------------------- | ----------------------------------------------- |
| Ordinary pages render tens of Cards                      | accept current result                           |
| Shared Kernel work improves several families             | ship shared optimization                        |
| Only Card improves through a special case                | reject unless production Card count proves need |
| Inert lane preserves every contract and wins ≥1 µs/card  | ship inside Kernel                              |
| Context consolidation wins <0.5 µs/card                  | delete prototype                                |
| Static Card contract is acceptable in a breaking release | reclassify; do not maintain dual modes          |
| Card reaches ≤1.10× shadcn                               | stop                                            |

## Bottom line

The smallest correct move is probably no Card-specific move. Finish the shared Kernel refactor,
measure it, then pursue one-resolve SSR state and the inert descendant lane. Those changes deepen the
Kernel module: more behavior and better performance behind the same component-author interface.

If parity still matters after those steps, the only large remaining lever is architectural:
Card must stop being a Bond. That can make it much faster, but it is a product/interface decision,
not a low-level optimization.
