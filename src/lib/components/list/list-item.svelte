<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'li', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { ListItemProps } from './types';

	let {
		class: klass = '',
		as = 'li' as T,
		preset = undefined,
		children = undefined,
		...restProps
	}: ListItemProps<T, B> = $props();

	const itemProps = $derived(mergePresetProps(preset, 'list.item', restProps));
</script>

<HtmlAtom {as} class={['flex w-full gap-2 px-4 py-1', '$preset', klass]} {...itemProps}>
	{@render children?.()}
</HtmlAtom>
