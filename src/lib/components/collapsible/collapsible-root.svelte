<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { CollapsibleBond, CollapsibleContext } from './bond.svelte';
	import type { CollapsibleRootProps } from './types';

	const ID = $props.id();

	let {
		open = $bindable(false),
		value = undefined,
		data = undefined,
		disabled = false,
		factory = undefined,
		onopenchange = undefined,
		children = undefined,
		...restProps
	}: CollapsibleRootProps = $props();

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
		get value() {
			return value;
		},
		get data() {
			return data;
		}
	};
	// `factory` is read once, at init, by design. The Bond reads its parent from context BEFORE
	// this node shares its own.
	const build = untrack(() => factory);
	const bond = CollapsibleContext.share(
		build ? build(bondProps) : CollapsibleBond.create(bondProps)
	);
	// Controlled state: the Bond decides, the root writes, the callback fires after the write.
	bond.bindCommit((next, context) => {
		open = next;
		onopenchange?.(next, context);
	});
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'collapsible',
		class: 'border-border flex w-full flex-col overflow-hidden',
		state: bond,
		variantProps: () => ({ open, disabled }),
		attrs: () => ({ id: bond.rootId })
	});
</script>

<div {...el.attrs}>{@render children?.({ collapsible: bond })}</div>
