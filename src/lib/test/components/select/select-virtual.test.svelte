<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Select } from '$ixirjs/ui/components/select';
	import type { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';
	import { createVirtual } from '$ixirjs/ui/runes/virtual.svelte';

	type Option = { id: string; name: string };

	let {
		count = 5000,
		open = true,
		selectTarget = 'opt-4000'
	}: { count?: number; open?: boolean; selectTarget?: string } = $props();

	const options: Option[] = $derived(
		Array.from({ length: count }, (_, index) => ({ id: `opt-${index}`, name: `Option-${index}` }))
	);
	const indexOf = $derived(new Map(options.map((option, index) => [option.id, index])));

	// The Bond is only reachable inside the children snippet, but the rune is created at init — so
	// `pinned` reads through a reference the snippet fills in. `roving.activeId` is reactive, so the
	// thunk re-runs once it is set.
	let bond: SelectBond | undefined;
	const capture = (select: SelectBond) => {
		bond = select;
		return '';
	};

	const virtual = createVirtual({
		count: () => options.length,
		getKey: (index) => options[index]?.id,
		estimateSize: 10,
		overscan: 0,
		height: 100,
		pinned: () => {
			const active = bond?.roving.activeId;
			return active == null ? undefined : indexOf.get(active);
		},
		follow: true,
		version: () => options
	});
</script>

<Root>
	<Select.Root
		bind:open
		{options}
		optionValue={(option: Option) => option.id}
		optionLabel={(option: Option) => option.name}
	>
		{#snippet children({ select }: { select: SelectBond })}
			{capture(select)}
			<Select.Trigger data-testid="trigger">
				<Select.Placeholder>Pick one</Select.Placeholder>
			</Select.Trigger>
			<Select.Content>
				<div {...virtual.viewport()} data-testid="scroller">
					<div {...virtual.content()}>
						{#each virtual.items as item (item.key)}
							<Select.Item
								{...virtual.item(item)}
								value={item.key}
								data-testid="option"
								data-value={item.key}
							>
								{options[item.index]!.name}
							</Select.Item>
						{/each}
					</div>
				</div>
			</Select.Content>
			<button data-testid="select-far" onclick={() => select.select([selectTarget])}>pick</button>
			<code data-testid="active">{select.roving.activeId ?? 'none'}</code>
			<code data-testid="label">{select.props.label ?? ''}</code>
		{/snippet}
	</Select.Root>
</Root>
