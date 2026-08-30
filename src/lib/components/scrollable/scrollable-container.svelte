<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { resizeObserver } from '$ixirjs/ui/attachments/resize-observer.svelte';
	import { ScrollableContext } from './bond.svelte';
	import type { ScrollableContainerProps } from './types';
	import './scrollable-container.css';

	let {
		as = undefined,
		base = undefined,
		children,
		...restProps
	}: ScrollableContainerProps = $props();
	const bond = ScrollableContext.getOrThrow(
		'<Scrollable.Container /> must be used within a <Scrollable.Root />'
	);

	// `{@attach}` is markup syntax; the seam takes an attrs object, so the measurement rides its
	// own key. Key AND function are minted once per instance so the attachment is not torn down
	// and rebuilt on every invalidation of the attrs.
	const measureKey = createAttachmentKey();
	const measure = (node: HTMLElement) => {
		let mounted = true;
		queueMicrotask(() => {
			if (mounted) bond.updateScrollState();
		});
		const stop = resizeObserver(() => {
			bond.props.clientWidth = node.clientWidth;
			bond.props.clientHeight = node.clientHeight;
			bond.props.scrollWidth = node.scrollWidth;
			bond.props.scrollHeight = node.scrollHeight;
		})(node);
		return () => {
			mounted = false;
			stop();
		};
	};

	const el = Kernel.element(() => restProps, {
		preset: 'scrollable.container',
		class: 'scrollable-container h-full max-h-full w-full overflow-auto',
		state: bond,
		as: () => as,
		base: () => base,
		attrs: () => ({
			id: bond.partId('container'),
			onscroll: () => bond.updateScrollState(),
			[measureKey]: measure
		})
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
