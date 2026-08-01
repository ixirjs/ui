<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { resizeObserver } from '$svelte-atoms/core/attachments/resize-observer.svelte';
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
</script>

<HtmlAtom
	{@attach (node: HTMLElement) => {
		const updateSize = () => {
			clientWidth = node.clientWidth;
			clientHeight = node.clientHeight;
		};
		updateSize();

		return resizeObserver(updateSize)(node);
	}}
	class={['border-border', '$preset', klass]}
	style={[containerTypeStype, containerNameStyle].filter(Boolean).join('; ')}
	{...containerProps}
>
	{@render children?.({ clientWidth, clientHeight })}
</HtmlAtom>
