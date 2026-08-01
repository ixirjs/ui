<script lang="ts" generics="T">
	import type { VirtualListViewportProps } from './types';
	import { throttle } from 'es-toolkit';
	import { onMount, tick, untrack } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	let {
		class: klass = '',
		data = [],
		itemHeight,
		overscan = 5,
		children,
		header,
		onScroll,
		scrollToIndex,
		...restProps
	}: VirtualListViewportProps<T> = $props();

	let start = $state(0);
	let end = $state(0);

	const visibleItems = $derived(
		data.slice(start, end).map((d, i) => ({ index: i + start, data: d }))
	);

	let viewportElement: HTMLElement | undefined = $state();
	let contentElement: HTMLElement | undefined = $state();
	let top = $state(0);
	let bottom = $state(0);
	let viewportHeight = $state(0);

	// Estimated heights via exponential moving average (for unmeasured/dynamic-height items).
	let heightMap: number[] = $state([]);
	let averageHeight = $state(untrack(() => itemHeight || 50));
	let heightSampleCount = $state(0);

	let rows: HTMLElement[] = $state([]);
	let mounted = $state(false);

	onMount(() => {
		if (!contentElement) return;

		rows = Array.from(contentElement.getElementsByClassName('virtual-list-row')) as HTMLElement[];

		mounted = true;

		// Defer one tick so the browser renders and the viewport can be measured.
		setTimeout(() => {
			if (viewportElement) {
				viewportHeight = viewportElement.offsetHeight;
			}

			refresh();
		}, 0);
	});

	// Watch for data changes and viewport size changes
	$effect(() => {
		if (mounted) refresh();
	});

	$effect(() => {
		if (scrollToIndex !== undefined && viewportElement && mounted) {
			scrollToItem(scrollToIndex);
		}
	});

	const handleScroll = throttle(async () => {
		if (!viewportElement) return;

		const { scrollTop } = viewportElement;

		onScroll?.(scrollTop);

		await refresh();
	}, 1000 / 60);

	function updateAverageHeight(newHeight: number) {
		if (heightSampleCount < 1) {
			averageHeight = newHeight;
			heightSampleCount = 1;
		} else {
			// EMA capped at alpha = 0.1 for stability.
			const alpha = Math.min(0.1, 1 / heightSampleCount);
			averageHeight = alpha * newHeight + (1 - alpha) * averageHeight;
			heightSampleCount++;
		}
	}

	function getItemHeight(index: number): number {
		return heightMap[index] || itemHeight || averageHeight;
	}

	async function refresh() {
		if (!viewportElement || !mounted) return;

		const { scrollTop } = viewportElement;

		// Visible range plus overscan buffer.
		const startIndex = Math.max(0, findStartIndex(scrollTop) - overscan);
		const endIndex = Math.min(data.length, findEndIndex(scrollTop, startIndex) + overscan);

		start = startIndex;
		end = endIndex;

		await tick();

		updateHeights();
		updatePadding();
	}

	function findStartIndex(scrollTop: number): number {
		let index = 0;
		let accumulatedHeight = 0;

		while (index < data.length && accumulatedHeight + getItemHeight(index) <= scrollTop) {
			accumulatedHeight += getItemHeight(index);
			index++;
		}

		return index;
	}

	function findEndIndex(scrollTop: number, startIndex: number): number {
		let index = startIndex;
		let accumulatedHeight = 0;

		// Seed accumulator with the total height of items before startIndex.
		for (let i = 0; i < startIndex; i++) {
			accumulatedHeight += getItemHeight(i);
		}

		// Floor the viewport height so the initial render emits enough rows.
		const effectiveViewportHeight = Math.max(viewportHeight, 800);

		while (index < data.length && accumulatedHeight <= scrollTop + effectiveViewportHeight) {
			accumulatedHeight += getItemHeight(index);
			index++;
		}

		return index;
	}

	function updateHeights() {
		if (!contentElement) return;

		rows = Array.from(contentElement.getElementsByClassName('virtual-list-row')) as HTMLElement[];

		rows.forEach((row, i) => {
			const actualIndex = start + i;
			const measuredHeight = itemHeight || row.offsetHeight;

			if (heightMap[actualIndex] !== measuredHeight) {
				heightMap[actualIndex] = measuredHeight;
				if (!itemHeight) {
					updateAverageHeight(measuredHeight);
				}
			}
		});
	}

	function updatePadding() {
		// Spacer height for the items above the visible window.
		let topPadding = 0;
		for (let i = 0; i < start; i++) {
			topPadding += getItemHeight(i);
		}

		// Spacer height for the items below the visible window.
		let bottomPadding = 0;
		for (let i = end; i < data.length; i++) {
			bottomPadding += getItemHeight(i);
		}

		top = topPadding;
		bottom = bottomPadding;
	}

	async function scrollToItem(index: number) {
		if (!viewportElement || index < 0 || index >= data.length) return;

		let targetScrollTop = 0;
		for (let i = 0; i < index; i++) {
			targetScrollTop += getItemHeight(i);
		}

		viewportElement.scrollTo({
			top: targetScrollTop,
			behavior: 'smooth'
		});
	}
</script>

<div class="absolute inset-0 block size-full max-h-full">
	<div
		bind:this={viewportElement}
		bind:offsetHeight={viewportHeight}
		class={twMerge(
			'virtual-list-viewport virtual-list-viewport relative block h-full max-h-full w-full flex-1 overflow-y-auto',
			klass
		)}
		onscroll={handleScroll}
	>
		<table class={twMerge('virtual-list-contents w-full')} {...restProps}>
			{@render header?.()}

			<tbody bind:this={contentElement}>
				<!-- Top spacer row -->
				{#if top > 0}
					<tr style="height: {top}px;">
						<td colspan="100" style="padding: 0; border: none;"></td>
					</tr>
				{/if}

				{@render children?.({ items: visibleItems })}

				<!-- Bottom spacer row -->
				{#if bottom > 0}
					<tr style="height: {bottom}px;">
						<td colspan="100" style="padding: 0; border: none;"></td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	.virtual-list-viewport {
		-webkit-overflow-scrolling: touch;
	}
</style>
