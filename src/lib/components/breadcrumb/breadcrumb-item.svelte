<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'a', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { BreadcrumbItemProps } from './types';

	let {
		class: klass = '',
		href = '',
		as = 'a',
		preset = undefined,
		children = undefined,
		...restProps
	}: BreadcrumbItemProps<E, B> = $props();

	const itemProps = $derived(mergePresetProps(preset, 'breadcrumb.item', restProps));
</script>

<HtmlAtom
	{as}
	{href}
	class={[
		'border-border text-foreground/70 hover:text-foreground flex gap-2 rounded-lg px-2 py-1',
		'$preset',
		klass
	]}
	data-kind="breadcrumb-item"
	{...itemProps}
>
	{@render children?.()}
</HtmlAtom>
