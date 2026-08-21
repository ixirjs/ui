<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { resizeObserver } from '$ixirjs/ui/attachments/resize-observer.svelte';
	import type { ContainerProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		type = 'inline-size',
		name = undefined,
		clientWidth = $bindable(0),
		clientHeight = $bindable(0),
		children = undefined,
		...restProps
	}: ContainerProps = $props();

	const containerTypeStype = $derived(type ? `container-type: ${type};` : '');
	const containerNameStyle = $derived(name ? `container-name: ${name};` : '');

	const containerProps = $derived(mergePresetProps(preset, 'container', restProps));

	// `{@attach}` is markup syntax and the seam takes a props object, so the attachment is re-minted
	// as its own key. Minted ONCE per instance, not per config evaluation: a fresh key each time
	// would tear the observer down and rebuild it on every invalidation.
	const measureKey = createAttachmentKey();

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(Kernel.static, () => ({
		[measureKey]: (node: HTMLElement) => {
			const updateSize = () => {
				clientWidth = node.clientWidth;
				clientHeight = node.clientHeight;
			};
			updateSize();

			return resizeObserver(updateSize)(node);
		},
		class: ['border-border', '$preset', klass],
		style: [containerTypeStype, containerNameStyle].filter(Boolean).join('; '),
		...containerProps
	}));
</script>

{@render Kernel.render(el)(el, children, { clientWidth, clientHeight })}
