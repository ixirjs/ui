<script lang="ts">
	// Ceiling arm: Card.Root with the machinery removed. Keeps the component boundary (the public
	// API is `<Card.Root>`, so conditional dispatch would happen INSIDE the part, not instead of it)
	// and keeps the template shape, so hydration anchors match the real card exactly.
	//
	// Skipped versus the real root: useRoot, Bond construction, capability activation, context
	// share, controlled-prop wiring, the root Atom, registration, and the whole presentation
	// snapshot. What remains is a seed, a preset lookup and a class merge.
	import type { Snippet } from 'svelte';
	import { fastClass, setSeed } from './fast-context';

	const ID = $props.id();
	let { children }: { children?: Snippet } = $props();

	setSeed(ID);
	const klass = fastClass('card overflow-clip flex flex-col $preset', 'card');
</script>

<div class={klass} id="card-root-{ID}">{@render children?.()}</div>
