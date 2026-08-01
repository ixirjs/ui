<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'ul', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { ListRootProps } from './types';

	let {
		class: klass = '',
		as = 'ul' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ListRootProps<E, B> = $props();

	const rootProps = $derived(mergePresetProps(preset, 'list.root', restProps));
</script>

<HtmlAtom {as} class={['flex flex-col', '$preset', klass]} {...rootProps}>
	{@render children?.()}
</HtmlAtom>
