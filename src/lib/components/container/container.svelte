<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { resizeObserver } from '$ixirjs/ui/attachments/resize-observer.svelte';
	import type { ContainerProps } from './types';

	let {
		type = 'inline-size',
		name = undefined,
		clientWidth = $bindable(0),
		clientHeight = $bindable(0),
		children = undefined,
		...restProps
	}: ContainerProps = $props();

	const containerTypeStype = $derived(type ? `container-type: ${type};` : '');
	const containerNameStyle = $derived(name ? `container-name: ${name};` : '');

	// The attachment travels through `attrs` as a symbol key. Minted ONCE per instance, not per
	// resolution: a fresh key — or a fresh function — each time would tear the observer down and
	// rebuild it on every invalidation.
	const measureKey = createAttachmentKey();
	const measure = (node: HTMLElement) => {
		const updateSize = () => {
			clientWidth = node.clientWidth;
			clientHeight = node.clientHeight;
		};
		updateSize();

		return resizeObserver(updateSize)(node);
	};

	const el = Kernel.element(() => restProps, {
		preset: 'container',
		class: 'border-border',
		attrs: () => ({
			[measureKey]: measure,
			style: [containerTypeStype, containerNameStyle].filter(Boolean).join('; ')
		})
	});
</script>

<div {...el.attrs}>{@render children?.({ clientWidth, clientHeight })}</div>
