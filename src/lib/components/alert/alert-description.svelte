<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AlertBond } from './bond.svelte';
	import type { AlertDescriptionProps } from './types';

	const bond = AlertBond.get();

	let {
		class: klass = '',
		as = 'p' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertDescriptionProps<E, B> = $props();

	const descriptionProps = $derived(
		mergePresetProps(preset, 'alert.description', { ...bond?.description(), ...restProps })
	);
</script>

<HtmlAtom
	{bond}
	class={['alert-description border-border mt-1 text-sm leading-relaxed', '$preset', klass]}
	{as}
	{...descriptionProps}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
