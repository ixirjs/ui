<script lang="ts">
	import { ComboboxBond } from './bond.svelte';
	import { Trigger } from '$svelte-atoms/core/components/select/atoms';

	const bond = ComboboxBond.getOrThrow('Combobox atom was not found');

	let {
		class: klass = '',
		as = 'button',
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();

	const atom = bond.atom('trigger');

	const presentation = $derived({ preset: preset ?? atom.preset });
</script>

<Trigger
	{as}
	{bond}
	class={['border-border h-8 w-40', '$preset', klass]}
	onclick={(ev: Event) => {
		ev.preventDefault();

		bond?.state?.open();
	}}
	{...presentation}
	{...restProps}
>
	{@render children?.({ dropdown: bond })}
</Trigger>
