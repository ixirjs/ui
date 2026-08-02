<script lang="ts">
	import { HtmlAtom } from '$ixirjs/ui/components/atom';
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

{@render (isMultiple && selections.length
	? multipleSelections
	: children && selections[0]
		? consumerSelection
		: selections[0]
			? singleLabel
			: undefined)?.()}

{#snippet multipleSelections()}
	<HtmlAtom class={['flex flex-wrap items-center gap-2', klass]} {...restProps}>
		{@render (children ? consumerSelection : selectionChips)()}
	</HtmlAtom>
{/snippet}

{#snippet consumerSelection()}
	{@render children?.({ selections, selection: selections[0] })}
{/snippet}

{#snippet selectionChips()}
	{#each selections as selection (selection.id)}
		<Selection {selection}>
			{selection.label}
		</Selection>
	{/each}
{/snippet}

{#snippet singleLabel()}
	{selections[0]?.label}
{/snippet}
