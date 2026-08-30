# What a tree node costs, and what it would take to change (2026-08-21)

Companion to `perf-vs-shadcn-2026-08.md`. That document reports Tree as a `× floor` row and says to
read it as "what the behaviour costs" rather than as a gap. This one asks whether that is actually
true, and prices the alternatives.

**Scope: investigation only. No tree code was changed.**

## 0. Summary

- Tree is **39.01 µs/node** against a **0.06 µs** hand-written control (`bench:vs-shadcn`, this
  session, after this round's Kernel work — it was 43.90 before). The control is `ul`/`li` markup
  with the same ARIA attributes and **no keyboard model at all**, so it is a floor, not a rival.
- Growth is **linear** (`bench:growth` k = 1.04). Whatever tree costs, it costs once per node. There
  is no superlinearity left to find here — round 1 already fixed that one (k 2.51 → 0.94, 92×).
- The cost is **distributed, not concentrated**. The CPU profile has no single frame above 5.4%
  outside the garbage collector. There is no lever of the kind Stage 1 was.
- **Two of the three obvious structural levers are dead on measurement**, and the third is a large
  architectural change. Details in §3.

## 1. Where the time goes

`LAYER=tree bun run profile:ssr`, 219 renders × 400 units, 45.89 µs/unit in the profile harness
(the profiler's own overhead makes this run higher than `bench:vs-shadcn`'s 39.01; the _shape_ is
what matters).

| bucket                                 | self %    | frames                                                                                                                                                                   |
| -------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| garbage collector                      | **22.2%** | —                                                                                                                                                                        |
| Kernel / presentation                  | **~20%**  | `elementAttrs` 5.33, `mergeSpreadProps` 4.75, `valuesFrom` 3.64, `spread` 3.45, `resolvePresentation` 2.54, `buildKernelElement` 1.57, `useKernelElement` 1.06           |
| Svelte's own server renderer           | **~8.7%** | `attributes` 3.00, `#collect_content` 1.83, `#traverse_components` 1.53, `escape_html` 1.19, `child` 1.10                                                                |
| Bond construction, props, capabilities | **~10%**  | `controlledProp` 1.92, `get stateProps` 1.34, `createSelection` 1.32, `defineCapability` 1.21, `brand` 1.16, `createRovingFocus` 1.14, `assembleProps` 0.98, `role` 0.96 |

**A class-merging frame does not appear anywhere in the top 30.** Before this round it did. That
absence is this round's Stage 1 (the resolved-class memo in `atom/resolve/classes.ts`) showing up
from the other side, and it is why tree moved −5.2% on `bench:ssr` and 43.90 → 39.01 here.

The single largest identified bucket is the garbage collector, and the second is our own element
seam — three elements per node (Root, Header, Body), each resolving a presentation and spreading an
attribute object.

## 2. What a node actually registers

Every `Tree.Root` — and in a real tree every _node_ is a nested `Tree.Root` — constructs a full Bond
and registers **six** capabilities (`components/tree/bond.svelte.ts:148-165`):

| #   | capability                                          | owned by this node?                    |
| --- | --------------------------------------------------- | -------------------------------------- |
| 1   | `collection('children')` (via `void this.children`) | yes                                    |
| 2   | `disclosureCapability`                              | yes                                    |
| 3   | `treeItemGroupLink`                                 | yes                                    |
| 4   | `disclosureTrigger`                                 | yes                                    |
| 5   | `rovingCapability`                                  | **no — the outermost node's instance** |
| 6   | `navigationCapability`                              | **no — the outermost node's instance** |

Rows 5 and 6 are the tree-wide keyboard model. A nested node does not create it — it walks to
`keyboardOwner` and re-registers the _same instances_ — but it still pays a registration each, so its
own header Atom can project them.

## 3. The three levers, priced

### (a) Stop re-registering the owner's keyboard model on nested nodes — small, real, cheap

Rows 5 and 6 above are 2 of 6 registrations per node for a model the node does not own. Capability
machinery (`defineCapability` 1.21% + `brand` 1.16% + `role` 0.96%) is ~3.3% of self time, so removing
a third of the registrations is worth roughly **1%**. Contained, low risk, and it removes a genuine
oddity — but it is a rounding error against a 660× floor.

### (b) Lazy capability activation — DEAD

`capability-cost.svelte.spec.ts` exists as "Phase A probe for the on-demand-init study", whose premise
is that a closed overlay pays an `$effect.root` plus one effect per **setup-declaring** capability to
observe a state it is not in. That premise does not apply here: **none of the four capability models a
tree node uses declares `setup` at all** —

```
disclosure.svelte.ts    setup= 0
relationship.svelte.ts  setup= 0
roving.svelte.ts        setup= 0
navigation.svelte.ts    setup= 0
```

so there is no lifecycle owner to defer and nothing for on-demand activation to save. This lever
should be struck from the tree's list; it remains live for overlays, which is where it came from.

### (c) One Bond per tree instead of one per node — large, and the only thing that would move the number

The 660× is not any one of the buckets in §1; it is that a node is a component with a Bond, three
elements, four Atoms and six capabilities, against a control that is three tags and no behaviour.
Halving §1's Kernel bucket would take 39.01 to about 35. Only removing the per-node Bond changes the
order of magnitude.

Shape: one keyboard owner per tree (which already exists — `keyboardOwner`), holding lightweight node
records instead of Bonds; nodes keep their disclosure state in the owner keyed by id.

**Cost, honestly:**

- `Tree.Root` is the public API for a node. `ITreeNode`/`ITreeKeyboard` are exported contracts, and
  `getBond` is re-exported from the root. Changing what a node _is_ is a public-surface change, which
  this round's constraints forbid and which the standing "internals churn freely, public API stays
  stable" policy would have to sanction explicitly.
- Nesting is expressed through Svelte context (`TreeBond.getOptional()`), so a node's identity and its
  parent link are the component tree. Flattening them means the owner has to reconstruct order, and
  today order _is_ mount order and needs no DOM query — a property worth keeping.
- Every consumer-facing behaviour that reads `bond` per node (`factory`, `presets`, the
  `{ tree: bond }` snippet argument) would need a replacement.

**Recommendation: do not do (c) now.** It is a redesign, not an optimisation, and the measured
justification is weak — a tree that renders 400 nodes is already the case for `createVirtual`
(`runes/virtual.svelte.ts`), which bounds rendered nodes by the window rather than the source and is
the answer this library already ships for large collections.

## 4. What to do instead

1. **Take (a)** if someone is in that file anyway. ~1%, contained.
2. **Reframe the row.** `bench:vs-shadcn` prints `× floor` and the fixture comment already says to
   read it as behaviour cost. The number that matters for tree is `bench:growth` k = 1.04, which is
   green, and that is the axis a tree can actually fail on.
3. **Point large trees at `createVirtual`.** A windowed tree renders window-many nodes regardless of
   source size; `anchor-budget.spec.ts` already pins that a 1k and a 10k list render the same anchors.
4. **Leave the Kernel bucket to the shared work.** Tree gets whatever the element seam gets — it took
   −5.2% from Stage 1 this round without a line of tree code changing, which is the argument for
   spending effort there rather than here.
