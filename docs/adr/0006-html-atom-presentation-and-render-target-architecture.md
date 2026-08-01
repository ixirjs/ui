# ADR 0006: HtmlAtom presentation and render-target architecture

## Status

Accepted

## Date

2026-06-24

## Context

`HtmlAtom` is the lowest-level rendering module behind most component parts. Its public
interface is intentionally small: callers pass atom/preset/base/variant/rest props and receive a
rendered element, component, or snippet with the correct presentation cascade.

The current implementation already moved the expensive presentation work out of inline component
expressions and into staged pure resolver functions:

- `resolvePreset`
- `resolveLocalVariants`
- `resolveVariants`
- `foldLayers`
- `resolveClass`
- `resolveBase`
- `resolveAs`

This shape is load-bearing for performance. In Svelte 5, `$derived` values propagate by reference
identity: when a stage returns the previous reference, downstream stages can be skipped. Preset
record stabilization and the one-pass fold therefore are not incidental optimizations; they are part
of the architecture.

The current architecture also has some pressure points:

- `html-atom.svelte` still combines presentation orchestration, lifecycle activation, renderer
  selection, snippet adaptation, and child forwarding.
- The renderer contract is implicit: a renderer is expected to accept `class`, `as`, spread attrs,
  and `children`, but this is not named as an internal interface.
- Snippet-vs-component detection currently relies on a runtime heuristic (`function` without a
  prototype). That preserves flexibility, but it is not a strong DX contract.
- Lifecycle handling is intentionally separate and fast in the no-lifecycle case, but that separation
  should remain explicit as the module grows.

## Decision

Keep `HtmlAtom` as the public interface and evolve its internals around four explicit
responsibilities:

1. **Presentation pipeline**

   Keep the staged resolver design. Each stage stays pure and is wrapped by its own `$derived` in
   the Svelte component so dependency sets remain narrow and reviewable.

   The presentation cascade remains:

   ```txt
   fallback -> preset -> variants -> restProps
   ```

   Later layers win. `foldLayers` remains the one-pass merge over that cascade and returns both the
   spread-ready attrs axis and captured class inputs.

2. **Lifecycle activation**

   Keep lifecycle behavior behind `runLifecycle`. Presentation stages must not own mount/destroy
   behavior, and lifecycle attachments must not be folded into ad hoc component effects.

3. **Render-target normalization**

   Introduce an internal render-target normalization module before changing caller behavior. The
   target should be explicit, for example:

   ```ts
   type RenderTarget =
   	| { kind: 'component'; component: Component }
   	| { kind: 'snippet'; snippet: Snippet };
   ```

   `html-atom.svelte` should render from this normalized target instead of directly interpreting the
   `base` value.

4. **Renderer adapter contract**

   Name the internal contract for renderer components: they receive the resolved `class`, resolved
   `as`, folded attrs, and forwarded children. The default renderer remains `HtmlElement`, with the
   root bond renderer override still taking precedence.

## Principles

### Performance

- Preserve reference identity at stage boundaries when the semantic value is unchanged.
- Keep the one-pass fold; do not restore separate attrs and class walks.
- Avoid allocating before cache lookups on hot paths.
- Do not combine all presentation work into one coarse `$derived` object unless benchmarks prove the
  dependency loss is worth it.
- Add fast paths only when the invariant is clear and covered by tests or benchmarks. A possible
  candidate is a no-preset/no-variant/no-fallback passthrough for attrs.

### DX

- Keep the public `HtmlAtom` interface small.
- Prefer explicit render target helpers over asking users to rely on runtime function-shape
  heuristics.
- Preserve backward compatibility for current `base` usage while introducing clearer forms such as
  explicit snippet/component wrappers.
- Make renderer expectations discoverable through types, not just examples.

### Reusability

- Presentation stages stay pure and independently testable.
- Lifecycle remains a reusable module rather than per-root effects.
- Render-target normalization should be usable by future HTML/SVG atom variants if they need the
  same base/snippet/component semantics.

### Maintainability

- `html-atom.svelte` should become a thin reactive shell, not the place where every rule is encoded.
- Each internal module owns one kind of rule: presentation, lifecycle, render target, or renderer
  props.
- Existing tests around resolver precedence, fold behavior, lifecycle phases, and class merging are
  the contract for future refactors.

## Rejected Alternatives

### Re-inline the presentation logic in `html-atom.svelte`

Rejected. It makes dependency sets incidental, weakens testability, and makes cross-cutting
performance fixes harder to install at a single stage boundary.

### Replace the staged pipeline with one `presentationState` derived

Rejected for now. It would reduce local wiring but widen the reactive dependency set. A change to
one input could force unrelated work to re-run and would weaken the current reference-stability
strategy.

### Keep snippet/component detection as the only contract

Rejected as the long-term architecture. The heuristic should remain as compatibility behavior, but
new code should have an explicit way to state whether a base is a component or a snippet.

### Move lifecycle into presentation folding

Rejected. Lifecycle attachments and presentation attrs have different timing, SSR, and effect
semantics. Folding them through the same conceptual stage would make both harder to reason about.

## Consequences

Positive consequences:

- The hot path keeps its current performance model: narrow `$derived` stages, reference-stable preset
  records, and one-pass presentation folding.
- The public `HtmlAtom` interface remains stable while internals become easier to reason about.
- Snippet/component/base behavior gets a clearer DX story.
- Renderer customization becomes easier to document and test.

Negative consequences:

- There will be a few more internal modules and names.
- Explicit base helpers add a small API surface if they become public.
- Migration must preserve the existing heuristic until downstream usage is known.

## Implementation

The first implementation extracts render-target normalization into
`src/lib/components/atom/render-target.ts`. `html-atom.svelte` remains the public reactive shell and
now asks that module to resolve three things:

- the normalized render target (`component` or `snippet`)
- the renderer component (`HtmlElement`, a root renderer override, a base component, or the snippet
  adapter)
- the renderer props (`class`, `as`, folded attrs, and `snippet` only for snippet targets)

The legacy snippet heuristic remains for compatibility. New code can use explicit `componentBase`
and `snippetBase` helpers when function shape is ambiguous.

## Migration Plan

1. Add tests for the current renderer/base behavior before changing implementation.
2. Extract render-target normalization into an internal module and keep the existing heuristic as the
   fallback path.
3. Update `html-atom.svelte` to render from the normalized target while preserving the current public
   props.
4. Consider explicit helpers for snippet and component bases, then document them in the atom docs.
5. Only after the shape is stable, consider a no-layer passthrough fast path for attrs and verify it
   with focused tests and benchmarks.

## Verification

Any implementation of this ADR should run the focused atom checks:

```sh
bunx vitest run src/lib/components/atom/resolvers.spec.ts src/lib/components/atom/utils/fold.spec.ts src/lib/components/atom/lifecycle.svelte.spec.ts
```

If presentation hot paths change, also run the presentation benchmark:

```sh
bunx vitest bench --run src/lib/components/atom/utils/presentation.bench.ts
```

## Open Questions

- What should explicit base helpers be named if exposed publicly?
- Should render-target normalization support SVG atoms immediately or stay HTML-only until a real
  SVG caller needs it?
- Should the no-layer attrs passthrough return `restProps` by identity, or would that expose too much
  of Svelte's rest-props proxy behavior to downstream renderer components?
