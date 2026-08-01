<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { BreadcrumbRootProps } from './types';

	let {
		class: klass = '',
		as = 'div',
		preset = undefined,
		children = undefined,
		...restProps
	}: BreadcrumbRootProps<E, B> = $props();

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
