<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import SelectSelection from './select-selection.svelte';
	import { SelectContext } from './bond.svelte';
	import type { SelectSelectionsProps } from './types';
	import { onMount, type Component } from 'svelte';

	const bond = SelectContext.getOrThrow('SelectSelections must be used within a Select');

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
	const el = Kernel.element(() => restProps, {
		class: 'flex flex-wrap items-center gap-2',
		attrs: () => ({ class: klass as string })
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block, no
	// hydration anchor. A part whose props turn rich after init keeps this leaf (trade-off accepted, 2026-08-26).
	const leaf = Kernel.render(el);
</script>

{@render (isMultiple && selections.length
	? multipleSelections
	: children && selections[0]
		? consumerSelection
		: selections[0]
			? singleLabel
			: undefined)?.()}

{#snippet multipleSelections()}
	{@render leaf(el, children ? consumerSelection : selectionChips)}
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
