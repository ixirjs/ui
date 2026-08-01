<script lang="ts">
	import { ComboboxBond } from './bond.svelte';
	import { Selections } from '../select/atoms';
	import type { ComboboxSelectionsProps } from './types';

	const bond = ComboboxBond.getOrThrow('ComboboxSelections must be used within a Combobox');

	let { ...restProps }: ComboboxSelectionsProps = $props();

	let selections = $derived(bond.state.allSelections);
</script>

<Selections getSelections={() => selections} {...restProps} />
