<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'label', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { LabelProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		as = 'label' as E,
		for: labelfor = null,
		children,
		...restProps
	}: LabelProps<E, B> = $props();

	const labelProps = $derived(mergePresetProps(preset, 'label', restProps));
</script>

<HtmlAtom {as} class={['font-medium', '$preset', klass]} for={labelfor} {...labelProps}>
	{@render children?.({})}
</HtmlAtom>
