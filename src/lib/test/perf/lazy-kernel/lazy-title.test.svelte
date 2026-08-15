<script module lang="ts">
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import { resolveBondPart } from '$ixirjs/ui/shared/authoring/metadata';
	const TITLE = resolveBondPart(CardBond, 'title').nodePlan;
</script>

<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { onDestroy, type Snippet } from 'svelte';
	import { lazyNodeAttachment } from '$ixirjs/ui/shared/bond/node-registry.svelte';
	import { fastClass } from '$ixirjs/ui/test/perf/ceiling/fast-context';

	let { children }: { children?: Snippet } = $props();
	const bond = CardBond.getOrThrow();
	const title = bond.registerLazyNode(TITLE);
	const attachment = BROWSER ? lazyNodeAttachment(title) : undefined;
	const klass = fastClass(
		'card-title border-border text-lg leading-none font-semibold tracking-tight $preset',
		'card.title'
	);
	if (BROWSER) onDestroy(() => bond.unregisterLazyNode(title));
</script>

<h3 class={klass} id={title.id} {...attachment}>{@render children?.()}</h3>
