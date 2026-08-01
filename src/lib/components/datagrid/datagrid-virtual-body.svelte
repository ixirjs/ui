<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { DataGridBond } from './bond.svelte';

	type VirtualRowContext<T> = {
		item: T;
		index: number;
		key: string;
		selected: boolean;
	};

	type Props<T> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		items: readonly T[];
		getKey: (item: T, index: number) => string;
		estimateSize?: number | ((item: T, index: number) => number);
		overscan?: number;
		height?: number | string;
		activeKey?: string | undefined;
		children: Snippet<[VirtualRowContext<T>]>;
	};

	let {
		items,
		getKey,
		estimateSize = 40,
		overscan = 4,
		height = 480,
		activeKey = undefined,
		children,
		class: klass = '',
		style = undefined,
		...restProps
	}: Props<T> = $props();

	const bond = DataGridBond.required<T>('DataGrid.VirtualBody must be used within DataGrid.Root.');
	// Key-addressed cache survives reorder and invalidates naturally when a key changes.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const measurements = new Map<string, number>();
	let measurementRevision = $state(0);
	let scrollTop = $state(0);
	let measuredViewportHeight = $state<number>();
	const viewportHeight = $derived(
		measuredViewportHeight ?? (typeof height === 'number' ? height : 480)
	);

	type Entry = { item: T; index: number; key: string; start: number; size: number };
	type Layout = { entries: Entry[]; total: number };

	const layout = $derived.by((): Layout => {
		void measurementRevision;
		let start = 0;
		const entries = items.map((item, index) => {
			const key = getKey(item, index);
			const estimate =
				typeof estimateSize === 'function' ? estimateSize(item, index) : estimateSize;
			const size = measurements.get(key) ?? estimate;
			const entry = { item, index, key, start, size };
			start += size;
			return entry;
		});
		return { entries, total: start };
	});

	const visible = $derived.by(() => {
		const entries = layout.entries;
		if (entries.length === 0) return [];
		const end = scrollTop + viewportHeight;
		let first = lowerBound(entries, scrollTop);
		let last = lowerBound(entries, end);
		first = Math.max(0, first - overscan);
		last = Math.min(entries.length - 1, last + overscan);
		const window = entries.slice(first, last + 1);

		if (activeKey && !window.some((entry) => entry.key === activeKey)) {
			const active = entries.find((entry) => entry.key === activeKey);
			if (active) window.push(active);
		}
		return window.sort((left, right) => left.index - right.index);
	});

	function lowerBound(entries: Entry[], offset: number): number {
		let low = 0;
		let high = entries.length;
		while (low < high) {
			const middle = (low + high) >>> 1;
			const entry = entries[middle]!;
			if (entry.start + entry.size < offset) low = middle + 1;
			else high = middle;
		}
		return Math.min(low, entries.length - 1);
	}

	function observeViewport(node: HTMLDivElement) {
		measuredViewportHeight = node.clientHeight || viewportHeight;
		const observer = new ResizeObserver(() => {
			measuredViewportHeight = node.clientHeight || viewportHeight;
		});
		observer.observe(node);
		return () => observer.disconnect();
	}

	function observeRow(node: HTMLDivElement, key: string) {
		const commit = () => {
			const next = node.getBoundingClientRect().height;
			if (!next || Object.is(measurements.get(key), next)) return;
			measurements.set(key, next);
			measurementRevision += 1;
		};
		commit();
		const observer = new ResizeObserver(commit);
		observer.observe(node);
		return () => observer.disconnect();
	}

	const heightStyle = $derived(typeof height === 'number' ? `${height}px` : height);
	const mergedStyle = $derived(
		`${typeof style === 'string' ? style : ''};height:${heightStyle};overflow:auto;position:relative;`
	);
</script>

<div
	{...restProps}
	class={klass}
	style={mergedStyle}
	role="grid"
	aria-rowcount={items.length}
	onscroll={(event) => (scrollTop = event.currentTarget.scrollTop)}
	{@attach observeViewport}
>
	<div role="rowgroup" style={`height:${layout.total}px;position:relative;min-width:100%;`}>
		{#each visible as entry (entry.key)}
			<div
				role="row"
				aria-rowindex={entry.index + 1}
				aria-selected={bond.isSelected(entry.key)}
				data-key={entry.key}
				data-active={entry.key === activeKey ? 'true' : undefined}
				style={`position:absolute;inset-inline:0;transform:translateY(${entry.start}px);`}
				{@attach (node) => observeRow(node, entry.key)}
			>
				{@render children({
					item: entry.item,
					index: entry.index,
					key: entry.key,
					selected: bond.isSelected(entry.key)
				})}
			</div>
		{/each}
	</div>
</div>
