<script lang="ts">
	import type { Snippet } from 'svelte';
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import { fastClass } from '$ixirjs/ui/test/perf/ceiling/fast-context';
	let { children }: { children?: Snippet } = $props();
	const bond = CardBond.getOrThrow();
	const klass = fastClass('card-content border-border px-4 pb-4 $preset', 'card.content');
</script>

<div class={klass} id="card-content-{bond.id}">{@render children?.()}</div>
