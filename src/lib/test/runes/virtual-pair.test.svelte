<script lang="ts">
	// Two lists with different geometry: each rune call must own its window, measurements and
	// observers.
	import { createVirtual } from '$ixirjs/ui/runes/virtual.svelte';

	const keysA = Array.from({ length: 500 }, (_, index) => `a-${index}`);
	const keysB = Array.from({ length: 500 }, (_, index) => `b-${index}`);

	const a = createVirtual({
		count: () => keysA.length,
		getKey: (index) => keysA[index],
		estimateSize: 10,
		overscan: 0,
		height: 100
	});
	const b = createVirtual({
		count: () => keysB.length,
		getKey: (index) => keysB[index],
		estimateSize: 20,
		overscan: 0,
		height: 100
	});
</script>

<div {...a.viewport()} data-testid="viewport-a">
	<div {...a.content()}>
		{#each a.items as item (item.key)}
			<div {...a.item(item, 'height:10px;')} data-testid="row-a" data-key={item.key}>
				{item.key}
			</div>
		{/each}
	</div>
</div>
<code data-testid="total-a">{a.totalSize}</code>

<div {...b.viewport()} data-testid="viewport-b">
	<div {...b.content()}>
		{#each b.items as item (item.key)}
			<div {...b.item(item, 'height:20px;')} data-testid="row-b" data-key={item.key}>
				{item.key}
			</div>
		{/each}
	</div>
</div>
<code data-testid="total-b">{b.totalSize}</code>
