<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
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

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(Kernel.static, () => ({
		class: ['flex flex-wrap items-center gap-2', klass],
		...restProps
	}));
</script>

{@render (isMultiple && selections.length
	? multipleSelections
	: children && selections[0]
		? consumerSelection
		: selections[0]
			? singleLabel
			: undefined)?.()}

{#snippet multipleSelections()}
	{@render Kernel.render(el)(el, children ? consumerSelection : selectionChips)}
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
