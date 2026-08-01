<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'label', B extends Base = Base">
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		mergePresetProps,
		HtmlAtom,
		type ElementType,
		type Base
	} from '$svelte-atoms/core/components/atom';
	import type { LabelProps } from './types';

	type Element = ElementType<E>;

	let {
		class: klass = '',
		preset = undefined,
		as = 'label' as E,
		for: labelfor = null,
		children,
		...restProps
	}: LabelProps<E, B> & HTMLAttributes<Element> = $props();

	const labelProps = $derived(mergePresetProps(preset, 'label', restProps));
</script>

<HtmlAtom {as} class={['font-medium', '$preset', klass]} for={labelfor} {...labelProps}>
	{@render children?.()}
</HtmlAtom>
