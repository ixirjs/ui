# Runtime Kernel

`Kernel` is the sole internal rendering interface.

```svelte
<script module lang="ts">
	const PLAN = Kernel.plan(CardBond, 'title', { as: 'h3', class: 'card-title …' });
</script>

<script lang="ts">
	const props = $props();
	const node = Kernel.node(PLAN, () => props);
</script>

{@render Kernel.render(node)(node, [props.children])}
```

The interface has four operations plus two shared operands:

- `plan` compiles immutable authoring metadata once per module.
- `node` binds a first-party Bond part, preserving lazy Atom identity while keeping the default
  literal-element path allocation-light. A node IS a renderable handle — `definePart` returns one
  directly for a synthesized-Atom slot rather than wrapping it in `element`.
- `element` resolves the complete public presentation contract: presets, variants, motion,
  lifecycle, Atom spreads, renderer targets, and reactive mode changes.
- `render` returns the exact compiled snippet to dispatch once: literal leaf, dynamic element,
  transition leaf, `HtmlElement`, or custom renderer. It is dispatched with the handle and, when the
  part has one, `[body, arg]` — the branch reads `tag`/`class`/`attrs`/`motion` off the handle
  itself. It cannot close over the handle instead: a fresh closure per render would change the
  `{@render}` target's identity and tear the block down each time.
- `static` is the shared seam for elements without a Bond or Atom; `forward` tells a custom renderer
  to forward its snippet argument unchanged.

Every first-party component and the scaffold author directly through Kernel. Kernel remains
internal; no parallel rendering or descendant-binding adapter is published.
