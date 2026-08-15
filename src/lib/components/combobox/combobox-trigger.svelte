<script lang="ts" generics="E extends HtmlElementTagName = 'button', B extends Base = Base">
	import { ComboboxBond } from './bond.svelte';
	import { Trigger } from '$ixirjs/ui/components/select/atoms';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import type { ComboboxTriggerProps } from './types';
	import { openOverlay } from '$ixirjs/ui/components/overlay/policies/overlay-view';

	const bond = ComboboxBond.getOrThrow('ComboboxTrigger must be used within a Combobox');

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		...restProps
	}: ComboboxTriggerProps<E, B> & BasePropsOf<B> = $props();

	const presentation = $derived(mergePresetProps(preset, 'combobox.trigger', restProps));
</script>

<Trigger
	{as}
	{bond}
	class={['border-border h-8 w-40', '$preset', klass]}
	onclick={(ev: Event) => {
		ev.preventDefault();

		openOverlay(bond);
	}}
	{...presentation}
>
	{@render children?.({ combobox: bond })}
</Trigger>
