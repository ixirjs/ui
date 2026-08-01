# Resolver stages — from inline presentation to a staged pipeline

Companion to [presentation-kernel-perf.md](../presentation-kernel-perf.md) (the
class-memo journey) and [atom-utils-hot-path.md](./atom-utils-hot-path.md) (the
cache-identity round). Those documents cover the _utils_ under the cascade; this one
covers the cascade's **orchestration layer**:
[`resolvers.ts`](../../src/lib/components/atom/resolvers.ts), which replaced the
presentation logic that previously lived **inline in `html-atom.svelte`**.

The old shape, verbatim from the pre-branch `html-atom.svelte`:

```svelte
const preset = $derived.by(() => {
  if (!presetKey) return undefined;
  const result = getPreset(presetKey as PresetModuleName)?.(bond);
  return resolvePreset(result);
});
const localVariants  = $derived(resolveLocalVariants(variants, bond, restProps));
const mergedVariants = $derived.by(() => mergeVariants(preset?.variants, preset?.class, …));
const finalKlass     = $derived(mergeClassesWithPreset(klass, preset?.class, mergedVariants?.class));
const finalRestProps = $derived(extractRestProps(preset, mergedVariants, restProps, fallback));
```

Five anonymous `$derived` bodies, calling utils directly, testable only by mounting
a component. What changed, and why each change is a performance change and not just
a refactor:

---

## 1. Pure stages → minimal dependency sets per `$derived`

Every stage is now a named, pure, exported function — `resolvePreset`,
`resolveLocalVariants`, `resolveVariants`, `foldLayers`, `resolveClass`,
`resolveBase`, `resolveAs` — and `html-atom.svelte` is reduced to one `$derived`
per stage.

The performance content: **a `$derived` tracks exactly what its stage reads.**
`resolveBase(base, preset)` depends on two values; it cannot accidentally pick up a
dependency on `restProps` because some inline expression nearby read it. With the
inline shape, dependency sets were whatever the surrounding expression happened to
touch; with stages, invalidation granularity is a _reviewed contract_ — each stage's
signature is its dependency list. The component-identity consequence is the visible
one: `RendererComponent` only flips when `base`/`atom` change, so prop changes
re-render in place instead of tearing down and remounting the subtree.

The non-performance dividend that protects the performance work:
[`resolvers.spec.ts`](../../src/lib/components/atom/resolvers.spec.ts) pins the
cascade order (`fallback → preset → variants → restProps`) as plain function tests.
Every optimization round since (kernel, cache-identity) refactored these paths
freely _because_ the contract was pinned outside the component.

## 2. One kernel walk, two consumers — `foldLayers` + `resolveClass`

The old shape walked the four presentation layers **twice per invalidation**:
`extractRestProps` walked them for the attrs, and `mergeClassesWithPreset`
separately read `preset?.class` / `mergedVariants?.class` and re-merged (the legacy
merge itself ran two `twMerge` passes on the array shape — see the kernel doc's v0).

`foldLayers` runs the merge kernel (`foldPresentation`, ADR 0004 Decision 5)
**once**, producing both axes from the same walk:

- `attrs` — the spread-ready cascade-merged attributes;
- `presetClass` / `variantClass` — the class axis _captured during the walk_,
  not re-extracted.

`resolveClass(klass, folded)` then resolves the final class string from the fold's
captures, and because `mergeClassesWithPreset` memoizes all-string inputs in the
generational trie, a **rest-prop-only invalidation re-resolves the class from cache**
(~28 ns) instead of re-merging. Symbol-key precedence across layers also became a
documented kernel contract here — previously it was an undocumented artifact of
call order in the inline code.

## 3. Preset fallback chains without paying for them

`resolvePreset` accepts an ordered chain — `['combobox.arrow', 'popover.arrow']`,
first **registered** key wins — which the old inline lookup couldn't express
(single `getPreset(presetKey)` call). The chain walk costs one registry lookup per
miss and nothing per hit; since the cache-identity round, the common single-string
key takes a dedicated branch with **no wrapper-array allocation** (the original
implementation allocated `[presetKey]` on every derived re-run just to reuse the
loop).

## 4. The stabilization hook — `resolveEntry`

The cache-identity round's structural fix lives here (full analysis in
[atom-utils-hot-path.md](./atom-utils-hot-path.md), finding 1). `resolveEntry` is
the one place every hot preset resolution passes through, which makes it the right
seam to restore reference identity to factory-fresh preset records:

```ts
function resolveEntry(entry, bond) {
	const fresh = utils.resolvePreset(entry(bond)); // factory STILL runs — reactive reads stay tracked
	if (!fresh) return undefined;
	return utils.stabilizePresetRecord(entry, bond, fresh);
}
```

Two properties of the staged design made this a three-line integration instead of a
redesign:

- the stage boundary is the **only** path from preset key to record on the hot
  path, so identity is fixed once, for every downstream consumer;
- because stages are separate `$derived`s, returning the previous reference stops
  invalidation propagation right here — `resolveVariants`, `foldLayers`,
  `resolveClass` never re-run on a preset-neutral invalidation. In the inline
  shape, the same trick would have helped less: the downstream deriveds read
  `preset?.variants`, `preset?.class` etc. as expressions inside larger bodies
  with wider dependency sets.

(The cold-path callers — `input-*-control.svelte` resolve their preset once at init,
untracked — intentionally bypass `resolvers.resolvePreset` and gain nothing from
stabilization; that's correct, they have no recompute to save.)

---

## Shape of the win, per invalidation of one atom

|                                 | old (inline presentation)                   | new (staged resolvers)                                  |
| ------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| layer walks                     | 2 (extract + class re-merge)                | **1** (fold; class from captures)                       |
| class merge on rest-prop change | full re-merge (2x `twMerge` legacy)         | trie hit, ~28 ns                                        |
| preset record identity          | fresh per call → all downstream caches miss | stabilized → caches hit; equal output stops propagation |
| preset key chain                | unsupported                                 | supported, zero-alloc single-key path                   |
| dependency sets                 | incidental (inline expressions)             | contractual (stage signatures)                          |
| cascade contract                | implicit in component                       | pinned by `resolvers.spec.ts` + `fold.spec.ts`          |

The per-call fold is roughly at parity with the legacy extract (the kernel doc's
"rest-props" row — the copy loop was never the problem); the wins are the _removed
second walk_, the _memoized class axis_, and — since stabilization — the
invalidations that **don't happen at all**.

## Lessons, condensed

1. **Name the stages.** A cascade expressed as anonymous derived bodies has
   incidental dependency sets and no seams. The same cascade as pure named stages
   has contractual dependencies, unit-pinnable precedence, and exactly one place to
   install a cross-cutting fix (stabilization took three lines).
2. **Walk once, capture everything.** When two outputs (attrs, class) need the same
   layered inputs, derive both from one walk and let the cheaper consumer read
   captures.
3. **Identity fixes belong at stage boundaries.** Reference stabilization works
   because the stage's return value _is_ the `$derived` value — the reactive graph
   itself becomes the cache.
