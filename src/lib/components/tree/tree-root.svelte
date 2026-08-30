<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { TreeBond, TreeContext } from './bond.svelte';
	import type { TreeRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		presets = undefined,
		children = undefined,
		factory = undefined,
		onopenchange = undefined,
		...restProps
	}: TreeRootProps = $props();

	// Live props: read through getters wherever the Bond needs them.
	const bondProps = {
		get id() {
			return ID;
		},
		get open() {
			return open;
		},
		set open(next: boolean) {
			open = next;
		},
		get disabled() {
			return disabled;
		},
		get presets() {
			return presets;
		}
	};
	// `factory` is read once, at init, by design. The Bond reads its parent from context BEFORE
	// this node shares its own.
	const build = untrack(() => factory);
	const bond = TreeContext.share(build ? build(bondProps) : TreeBond.create(bondProps));
	// Controlled state: the Bond decides, the root writes, the callback fires after the write.
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});
	// Registered with the parent node at init — document order — and released on teardown.
	const detach = bond.attachToParent();
	$effect(() => detach);
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'tree',
		class: 'flex flex-col',
		state: bond,
		layer: () => presets?.root,
		variantProps: () => ({ open, disabled }),
		// The root is labelled by its header; `aria-expanded` lives on the header (treeitem).
		attrs: () => ({
			id: bond.rootId,
			'aria-labelledby': bond.headerId,
			'aria-disabled': disabled
		})
	});
</script>

<div {...el.attrs}>{@render children?.({ tree: bond })}</div>
