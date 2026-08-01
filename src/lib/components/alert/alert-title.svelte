<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$svelte-atoms/core/components/atom';
	import { AlertBond } from './bond.svelte';
	import type { AlertTitleProps } from './types';

	const bond = AlertBond.get();

	let {
		as = 'h4' as E,
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertTitleProps<E, B> = $props();

	const titleProps = $derived(
		mergePresetProps(preset, 'alert.title', { ...bond?.title(), ...restProps })
	);
</script>

<HtmlAtom
	{as}
	{bond}
	class={['alert-title border-border text-sm leading-tight font-medium', '$preset', klass]}
	{...titleProps}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
