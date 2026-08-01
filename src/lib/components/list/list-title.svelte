<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'h3', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { ListTitleProps } from './types';

	let {
		class: klass = '',
		as = 'h3' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ListTitleProps<E, B> = $props();

	const titleProps = $derived(mergePresetProps(preset, 'list.title', restProps));
</script>

<HtmlAtom {as} class={['mb-1 flex w-full px-6 py-1 font-medium', '$preset', klass]} {...titleProps}>
	{@render children?.()}
</HtmlAtom>
