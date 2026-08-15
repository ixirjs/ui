<script lang="ts">
	import type { Snippet } from 'svelte';
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import { fastClass } from '$ixirjs/ui/test/perf/ceiling/fast-context';
	let { children }: { children?: Snippet } = $props();
	const bond = CardBond.getOrThrow();
	const klass = fastClass(
		'card-header border-border flex flex-col space-y-1.5 px-4 py-4 $preset',
		'card.header'
	);
</script>

<div class={klass} id="card-header-{bond.id}">{@render children?.()}</div>
