import { createAttachmentKey } from 'svelte/attachments';
import { isBrowser } from '$ixirjs/ui/utils/dom.svelte';
import { createVirtualLayout, type VirtualItem } from './virtual-layout.svelte';

export type { VirtualItem };

/** Index attribute, read back inside the shared observer callback. */
const INDEX_ATTRIBUTE = 'data-virtual-index';

export interface VirtualOptions {
	/** Total item count, window or not. Reactive. */
	count: () => number;
	/**
	 * Stable, unique key per index — the measurement cache is keyed by it, so an index would make a
	 * size follow the position instead of the item. `undefined` past the end of the source.
	 */
	getKey: (index: number) => string | undefined;
	/**
	 * Size before measurement. A **number** means uniform, which selects a pure-arithmetic layout that
	 * allocates nothing; a per-index function switches to a measured prefix sum.
	 * @default 40
	 */
	estimateSize?: number | ((index: number) => number) | undefined;
	/**
	 * Items rendered beyond each edge of the viewport.
	 * @default 4
	 */
	overscan?: number | (() => number | undefined);
	/** Height of the scrolling element. A number also seeds the SSR window; a string renders minimal until measured. */
	height?: number | string | (() => number | string | undefined);
	/** Index kept rendered outside the window, so `aria-activedescendant` always resolves. */
	pinned?: () => number | undefined;
	/**
	 * Also scroll the pinned index into view — rendering it and moving to it are separate decisions.
	 * @default false
	 */
	follow?: boolean | (() => boolean | undefined);
	/**
	 * Identity token compared on every layout — pass the source array. Any change rebuilds. Omit only
	 * when index → key never changes; a reorder keeping `count` is otherwise invisible.
	 */
	version?: () => unknown;
}

export interface Virtualizer {
	/** The window to render, in index order, including overscan and the pinned item. */
	readonly items: readonly VirtualItem[];
	/** Bounds of the ordinary window, excluding the pinned item. */
	readonly range: { first: number; last: number };
	/** Size of the whole scrollable content. */
	readonly totalSize: number;
	/**
	 * Spread onto the scrolling element. All three take your style as an argument, not as a `style`
	 * attribute — an attribute cannot combine with a spread in either order, one just wins.
	 */
	viewport(style?: string): Record<string, unknown>;
	/** Spread onto the sized spacer directly inside the viewport. */
	content(style?: string): Record<string, unknown>;
	/** Spread onto each rendered item. */
	item(item: VirtualItem, style?: string): Record<string, unknown>;
	/** Scroll so `index` is visible, moving by the minimum needed. */
	scrollToIndex(index: number): void;
}

/**
 * Windowed rendering for a list of any length, as three spreads.
 *
 * ```svelte
 * const virtual = createVirtual({ count: () => rows.length, getKey: (i) => rows[i].id, height: 400 });
 *
 * <div {...virtual.viewport()}>
 *   <div {...virtual.content()}>
 *     {#each virtual.items as item (item.key)}
 *       <div {...virtual.item(item)}>{rows[item.index].name}</div>
 *     {/each}
 *   </div>
 * </div>
 * ```
 *
 * The spreads own scrolling, measuring and positioning; the markup stays yours. Call it during
 * component initialisation, like any rune.
 */
export function createVirtual(options: VirtualOptions): Virtualizer {
	let scrollOffset = $state(0);
	let measuredViewport = $state(0);
	let viewportElement: HTMLElement | undefined;

	const height = $derived(typeof options.height === 'function' ? options.height() : options.height);
	// Measured once the element exists; a numeric `height` stands in before that, which is what lets
	// the server render a real first screen. One definition, so layout and scroll maths agree.
	const viewportSize = () => measuredViewport || (typeof height === 'number' ? height : 0);

	const layout = createVirtualLayout({
		count: () => options.count(),
		keyAt: (index) => options.getKey(index),
		// A getter, so a reactive estimate stays reactive through the backing.
		get estimateSize() {
			return options.estimateSize;
		},
		viewportSize,
		scrollOffset: () => scrollOffset,
		overscan: () =>
			typeof options.overscan === 'function' ? options.overscan() : options.overscan,
		pinnedIndex: () => options.pinned?.(),
		version: () => options.version?.()
	});

	// One observer for all items, and the index read off the element rather than closed over: an
	// inline `(node) => observe(node, index)` is a fresh attachment identity per render, so every
	// window move would tear down and rebuild every observation.
	let itemObserver: ResizeObserver | undefined;
	function observeItem(node: Element) {
		if (!isBrowser() || typeof ResizeObserver === 'undefined') return;
		itemObserver ??= new ResizeObserver((entries) => {
			for (const entry of entries) {
				const element = entry.target as HTMLElement;
				const index = element.getAttribute(INDEX_ATTRIBUTE);
				if (index === null) continue;
				layout.measure(Number(index), entry.borderBoxSize?.[0]?.blockSize ?? element.offsetHeight);
			}
		});
		itemObserver.observe(node, { box: 'border-box' });
		return () => itemObserver?.unobserve(node);
	}

	function observeViewport(node: Element) {
		// Reference and first measurement before the observer guard: without `ResizeObserver` the size
		// stops updating, but `scrollToIndex` still needs the element.
		viewportElement = node as HTMLElement;
		measuredViewport = viewportElement.clientHeight || measuredViewport;
		if (!isBrowser() || typeof ResizeObserver === 'undefined') return;
		// `clientHeight`, not the border box: the space items actually scroll through.
		const observer = new ResizeObserver(() => {
			const next = viewportElement?.clientHeight ?? 0;
			if (next > 0 && next !== measuredViewport) measuredViewport = next;
		});
		observer.observe(node);
		return () => {
			observer.disconnect();
			viewportElement = undefined;
		};
	}

	// Minted once; a key minted per read remounts the element every render.
	const viewportKey = createAttachmentKey();
	const itemKey = createAttachmentKey();

	const heightStyle = $derived(typeof height === 'number' ? `${height}px` : height);

	function scrollToOffset(next: number): void {
		if (viewportElement && next !== scrollOffset) viewportElement.scrollTop = next;
	}

	/** Minimum scroll that brings `index` fully into view, or the current offset if it already is. */
	function offsetRevealing(index: number): number {
		const viewport = viewportSize();
		if (viewport <= 0) return scrollOffset;
		const start = layout.offsetOf(index);
		const end = start + layout.sizeOf(index);
		if (start < scrollOffset) return start;
		if (end > scrollOffset + viewport) return end - viewport;
		return scrollOffset;
	}

	$effect(() => {
		const following =
			typeof options.follow === 'function' ? options.follow() : (options.follow ?? false);
		if (!following) return;
		const pinned = layout.pinnedIndex;
		if (pinned === undefined) return;
		// Setting scrollTop fires scroll, which writes the offset back and re-runs this once — where it
		// settles, with the item in view.
		scrollToOffset(offsetRevealing(pinned));
	});

	$effect(() => () => {
		itemObserver?.disconnect();
		itemObserver = undefined;
		layout.dispose();
	});

	return {
		get items() {
			return layout.items;
		},
		get range() {
			return layout.range;
		},
		get totalSize() {
			return layout.totalSize;
		},
		viewport(style) {
			return {
				// `overflow` and `position` are structural: this element *is* the scrollport the window is
				// computed against, and items are positioned against it.
				style: `position:relative;overflow:auto;${heightStyle === undefined ? '' : `height:${heightStyle};`}${style ?? ''}`,
				onscroll: (event: Event) => {
					const target = event.currentTarget;
					if (target instanceof HTMLElement) scrollOffset = target.scrollTop;
				},
				[viewportKey]: observeViewport
			};
		},
		content(style) {
			return { style: `position:relative;height:${layout.totalSize}px;${style ?? ''}` };
		},
		item(item, style) {
			return {
				[INDEX_ATTRIBUTE]: item.index,
				style: `position:absolute;inset-inline:0;transform:translateY(${item.start}px);${style ?? ''}`,
				[itemKey]: observeItem
			};
		},
		scrollToIndex(index) {
			scrollToOffset(offsetRevealing(index));
		}
	};
}
