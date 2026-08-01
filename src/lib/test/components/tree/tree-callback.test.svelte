<script lang="ts">
	import TreeRoot from '$ixirjs/ui/components/tree/tree-root.svelte';
	import TreeHeader from '$ixirjs/ui/components/tree/tree-header.svelte';
	import type { TreeBond } from '$ixirjs/ui/components/tree/bond.svelte';
	import type { TreeRootProps } from '$ixirjs/ui/components/tree/types';

	let { open = false, onopenchange = undefined }: Pick<TreeRootProps, 'open' | 'onopenchange'> =
		$props();
	let treeRoot: { getBond(): TreeBond };

	export function getBond(): TreeBond {
		return treeRoot.getBond();
	}
</script>

<TreeRoot bind:this={treeRoot} {open} {onopenchange}>
	{#snippet children()}
		<TreeHeader data-testid="tree-header">Node</TreeHeader>
	{/snippet}
</TreeRoot>
