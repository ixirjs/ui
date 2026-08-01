<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'ul'">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';

	let {
		class: klass = '',
		as = 'ul' as T,
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();

	const rootProps = $derived(mergePresetProps(preset, 'list.root', restProps));
</script>

<HtmlAtom {as} class={['flex flex-col', '$preset', klass]} {...rootProps}>
	{@render children?.()}
</HtmlAtom>
