<script module lang="ts">
	import { DialogBond, type DialogBondProps } from '$ixirjs/ui/components/dialog/bond.svelte';
	import { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';
	import { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import { createInput, inputCapability } from '$ixirjs/ui/shared/capability/models';
	import { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import { TreeBond } from '$ixirjs/ui/components/tree/bond.svelte';

	export type ConstructSubject =
		| 'dialog'
		| 'select'
		| 'collapsible'
		| 'card'
		| 'select-input-only'
		| 'menu'
		| 'tree';

	/**
	 * Population A of the on-demand-init study: what one Bond costs to construct, which is where the
	 * stateful models (`createDisclosure`, `createSelection`, `createInput`) and their per-host
	 * descriptors are built. These are the N-per-page Bonds, so this is the SSR-relevant cost.
	 */
	const FACTORIES: Record<ConstructSubject, () => { destroy(): void }> = {
		dialog: () => {
			const props = $state<DialogBondProps>({ open: false, disabled: false });
			return DialogBond.create(props);
		},
		select: () => {
			const props = $state({ open: false, disabled: false, values: [] as string[] });
			return SelectBond.create(props as never);
		},
		collapsible: () => {
			const props = $state({ open: false, disabled: false });
			return CollapsibleBond.create(props);
		},
		card: () => CardBond.create({ disabled: false, clickable: false }),
		// Select extends the menu base; this splits inherited cost from Select's own.
		menu: () => {
			const props = $state({ open: false, disabled: false });
			return DropdownMenuBond.create(props as never);
		},
		tree: () => {
			const props = $state({ open: false, disabled: false });
			return TreeBond.create(props as never);
		},
		// Just the piece Select builds for every instance and a non-filterable Select never uses:
		// the query input model plus its per-host descriptor. This is what deferral would reclaim.
		'select-input-only': () => {
			const props = $state({ query: '' });
			const model = createInput({
				query: { get: () => props.query, set: (v: string) => (props.query = v) }
			});
			void inputCapability(model, {
				itemDomId: (id: string) => id,
				expanded: () => false,
				disabled: () => false
			});
			return { destroy: () => undefined };
		}
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let { n = 100, subject = 'card' }: { n?: number; subject?: ConstructSubject } = $props();

	// Read through `untrack`: this is a one-shot measurement taken during init, and a reactive read
	// would re-run it.
	const bonds: Array<{ destroy(): void }> = [];
	const start = performance.now();
	untrack(() => {
		const make = FACTORIES[subject];
		for (let i = 0; i < n; i++) bonds.push(make());
	});
	export const elapsed = performance.now() - start;
	export const teardown = () => {
		for (const bond of bonds) bond.destroy();
	};
</script>
