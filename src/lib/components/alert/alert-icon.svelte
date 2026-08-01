<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Icon } from '$svelte-atoms/core/components/icon';
	import { mergePresetProps, type Base, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { AlertBond } from './bond.svelte';
	import type { AlertIconProps } from './types';

	const bond = AlertBond.get();

	let {
		class: klass = '',
		base = Icon as unknown as B,
		preset = undefined,
		children = undefined,
		...restProps
	}: AlertIconProps<E, B> = $props();

	const iconProps = $derived(
		mergePresetProps(preset, 'alert.icon', { ...bond?.icon(), ...restProps })
	);
</script>

<HtmlAtom
	{bond}
	{base}
	class={[
		'alert-icon border-border inline-flex aspect-square h-5 items-center justify-center rounded-full text-sm font-medium',
		'$preset',
		klass
	]}
	{...iconProps}
>
	{@render children?.({ alert: bond! })}
</HtmlAtom>
