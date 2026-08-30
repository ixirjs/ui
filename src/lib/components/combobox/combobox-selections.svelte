<script lang="ts">
	import { Selections } from '$ixirjs/ui/components/select/atoms';
	import { ComboboxContext } from './bond.svelte';
	import type { ComboboxSelectionsProps } from './types';

	const bond = ComboboxContext.getOrThrow('ComboboxSelections must be used within a Combobox');

	let { ...restProps }: ComboboxSelectionsProps = $props();

	let selections = $derived(bond.allSelections);
</script>

<Selections getSelections={() => selections} {...restProps} />
