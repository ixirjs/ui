<script module lang="ts">
	import { PopupBond } from '$ixirjs/ui/components/overlay/popup/bond.svelte';
	import { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';
	import { AlertBond } from '$ixirjs/ui/components/alert/bond.svelte';
	import { createInput } from '$ixirjs/ui/capability/models';
	import { TreeBond } from '$ixirjs/ui/components/tree/bond.svelte';

	export type ConstructSubject =
		| 'context-menu'
		| 'select'
		| 'collapsible'
		| 'card'
		| 'select-input-only'
		| 'menu'
		| 'tree';

	/**
	 * Population A of the on-demand-init study: what one Bond costs to construct, which is where the
	 * stateful models (`createDisclosure`, `createSelection`, `createInput`) are built. These are the N-per-page Bonds, so this is the SSR-relevant cost.
	 */
	const FACTORIES: Record<ConstructSubject, () => { destroy(): void }> = {
		// ContextMenu is a plain state class on the redesigned Kernel: nothing to destroy. It is the
		// deepest overlay in the library — a menu bundle plus its own manual trigger.
		'context-menu': () => {
			const props = $state({ open: false, disabled: false });
			const bond = PopupBond.create('context-menu', props as never);
			return { destroy: () => bond.dispose() };
		},
		// Select is a plain state class on the redesigned Kernel: nothing to destroy.
		select: () => {
			const props = $state({ open: false, disabled: false, values: [] as string[] });
			const bond = PopupBond.create('select', props as never);
			return { destroy: () => bond.dispose() };
		},
		// Collapsible is a plain state class on the redesigned Kernel: nothing to destroy.
		collapsible: () => {
			const props = $state({ open: false, disabled: false });
			CollapsibleBond.create(props);
			return { destroy: () => undefined };
		},
		// The presentation-family baseline: a Bond with no models at all.
		card: () => {
			AlertBond.create({ disabled: false });
			return { destroy: () => undefined };
		},
		// Select extends the menu base; this splits inherited cost from Select's own.
		menu: () => {
			const props = $state({ open: false, disabled: false });
			const bond = PopupBond.create('dropdown-menu', props as never);
			return { destroy: () => bond.dispose() };
		},
		// Tree is a plain state class on the redesigned Kernel: nothing to destroy.
		tree: () => {
			const props = $state({ open: false, disabled: false });
			TreeBond.create(props);
			return { destroy: () => undefined };
		},
		// Just the piece Select builds for every instance and a non-filterable Select never uses:
		// the query input model. This is what deferral would reclaim. The per-host descriptor that
		// used to be measured alongside it went with the capability runtime on 2026-08-27.
		'select-input-only': () => {
			const props = $state({ query: '' });
			void createInput({
				query: { get: () => props.query, set: (v: string) => (props.query = v) }
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
