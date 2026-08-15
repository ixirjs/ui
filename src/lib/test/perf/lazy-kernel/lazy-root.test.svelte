<script module lang="ts">
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import { resolveBondPart } from '$ixirjs/ui/shared/authoring/metadata';
	const ROOT = resolveBondPart(CardBond, 'root').nodePlan;
</script>

<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import { lazyNodeAttachment } from '$ixirjs/ui/shared/bond/node-registry.svelte';
	import { fastClass } from '$ixirjs/ui/test/perf/ceiling/fast-context';

	const ID = $props.id();
	let {
		children,
		onbond
	}: {
		children?: Snippet<[{ card: CardBond }]>;
		onbond?: (bond: CardBond) => void;
	} = $props();
	const bond = CardBond.create({ id: ID, disabled: false, clickable: false }).share();
	const root = bond.registerLazyNode(ROOT);
	const attachment = BROWSER ? lazyNodeAttachment(root) : undefined;
	untrack(() => onbond?.(bond));
	const klass = fastClass(
		'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm $preset',
		'card'
	);
	if (BROWSER) onDestroy(() => bond.destroy());
	export const getBond = () => bond;
</script>

<div
	class={klass}
	id={root.id}
	aria-disabled="false"
	aria-labelledby={BROWSER ? bond.nodeIdByRole('label') : undefined}
	{...attachment}
>
	{@render children?.({ card: bond })}
</div>
