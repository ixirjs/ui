<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';

	let {
		class: klass = '',
		as = 'div',
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();

	const rootProps = $derived(mergePresetProps(preset, 'breadcrumb', restProps));
</script>

<HtmlAtom
	{as}
	class={['border-border flex flex-nowrap items-center gap-1', '$preset', klass]}
	data-kind="breadcrumb-root"
	{...rootProps}
>
	{@render children?.()}
</HtmlAtom>
