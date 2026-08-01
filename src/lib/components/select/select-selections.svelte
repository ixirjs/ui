<script lang="ts">
	import { HtmlAtom } from '../atom';
	import SelectSelection from './select-selection.svelte';
	import { SelectBond } from './bond.svelte';
	import type { SelectSelectionsProps } from './types';
	import { onMount, type Component } from 'svelte';

	const bond = SelectBond.getOrThrow('SelectSelections must be used within a Select');

	let {
		class: klass = '',
		children,
		getSelections = undefined,
		Selection = SelectSelection as unknown as Component,
		...restProps
	}: SelectSelectionsProps = $props();

	let isMounted = $state(false);

	onMount(() => {
		isMounted = true;
	});

	const selections = $derived.by(() => {
		void isMounted; // ensure re-computation after mount

		if (getSelections) {
			return getSelections(bond);
		}

		return bond.selections.map((controller) => ({
			id: controller.id,
			value: controller.value,
			get label() {
				return controller.label;
			},
			unselect() {
				controller.unselect();
			},
			get createdAt() {
				return controller.createdAt;
			},
			controller
		}));
	});
	const isMultiple = $derived(bond.props.multiple);
</script>

{#if isMultiple && selections.length}
	<HtmlAtom class={['flex flex-wrap items-center gap-2', klass]} {...restProps}>
		{#if children}
			{@render children?.({ selections: selections, selection: selections[0] })}
		{:else}
			{#each selections as selection (selection.id)}
				<Selection {selection}>
					{selection.label}
				</Selection>
			{/each}
		{/if}
	</HtmlAtom>
{:else if children && selections[0]}
	{@render children?.({ selections: selections, selection: selections[0] })}
{:else if selections[0]}
	{@const selection = selections[0]}
	{selection.label}
{/if}
