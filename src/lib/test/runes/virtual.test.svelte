<script lang="ts">
	import { createVirtual } from '$ixirjs/ui/runes/virtual.svelte';

	let {
		count = 1000,
		height = 100,
		estimateSize = 10,
		// Real rendered height. Differs from `estimateSize` to exercise measurement.
		rowHeight = 10,
		overscan = 0,
		pinned = undefined,
		follow = false,
		scrollTarget = 0,
		viewportStyle = undefined
	}: {
		count?: number;
		height?: number;
		estimateSize?: number;
		rowHeight?: number;
		overscan?: number;
		pinned?: number;
		follow?: boolean;
		scrollTarget?: number;
		viewportStyle?: string;
	} = $props();

	const keys = $derived(Array.from({ length: count }, (_, index) => `row-${index}`));

	const virtual = createVirtual({
		count: () => keys.length,
		getKey: (index) => keys[index],
		estimateSize: () => estimateSize,
		overscan: () => overscan,
		height: () => height,
		pinned: () => pinned,
		follow: () => follow,
		version: () => keys
	});
</script>

<div {...virtual.viewport(viewportStyle)} data-testid="viewport">
	<div {...virtual.content()} data-testid="content">
		{#each virtual.items as item (item.key)}
			<div {...virtual.item(item, `height:${rowHeight}px;`)} data-testid="row" data-key={item.key}>
				{item.key}
			</div>
		{/each}
	</div>
</div>
<button data-testid="scroll-to" onclick={() => virtual.scrollToIndex(scrollTarget)}>go</button>
<code data-testid="total">{virtual.totalSize}</code>
<code data-testid="range">{virtual.range.first}-{virtual.range.last}</code>
