<script lang="ts">
	// One level of `tree-depth.test.svelte`, recursing through a self-import rather than a
	// self-referencing snippet: a snippet that renders itself compiles to a terminating recursion in
	// DEV and to an unbounded one in the production bundle the bench builds, which is the only build
	// this fixture ever runs under. Self-import is also what a consumer's own tree looks like.
	import { Tree } from '$ixirjs/ui/components/tree';
	import Self from './tree-depth-level.test.svelte';

	let { depth }: { depth: number } = $props();
</script>

<Tree.Root open>
	<Tree.Header>Level {depth}</Tree.Header>
	<Tree.Body>
		{#if depth > 1}
			<Self depth={depth - 1} />
		{/if}
	</Tree.Body>
</Tree.Root>
