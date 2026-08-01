<script lang="ts">
	import { ComboboxBond } from './bond.svelte';
	import { Trigger } from '$svelte-atoms/core/components/select/atoms';
	import { openOverlay } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';

	const bond = ComboboxBond.getOrThrow('ComboboxTrigger must be used within a Combobox');

	let {
		class: klass = '',
		as = 'button',
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();

	const presentation = $derived({ preset: preset ?? 'combobox.trigger' });
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
	{...restProps}
>
	{@render children?.({ dropdown: bond })}
</Trigger>
