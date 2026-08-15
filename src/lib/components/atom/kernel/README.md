# Runtime Kernel

`Kernel` is the sole internal rendering interface.

```svelte
<script module lang="ts">
	const PLAN = Kernel.part(CardBond, 'title', { as: 'h3', class: 'card-title …' });
</script>

<script lang="ts">
	const props = $props();
	const node = Kernel.node(PLAN, () => props);
</script>

{@render Kernel.render(node)(
	node.tag(),
	node.class(),
	node.attrs(),
	props.children,
	undefined,
	undefined,
	node
)}
```

The interface has four operations plus two shared operands:

- `part` / `root` compile immutable authoring metadata once per module.
- `node` binds a first-party Bond part, preserving lazy Atom identity while keeping the default
  literal-element path allocation-light.
- `element` resolves the complete public presentation contract: presets, variants, motion,
  lifecycle, Atom spreads, renderer targets, and reactive mode changes.
- `render` returns the exact compiled snippet to dispatch once: literal leaf, dynamic element,
  transition leaf, `HtmlElement`, or custom renderer.
- `static` is the shared seam for elements without a Bond or Atom; `forward` tells a custom renderer
  to forward its snippet argument unchanged.

Every first-party component and the scaffold author directly through Kernel. Kernel remains
internal; no parallel rendering or descendant-binding adapter is published.
