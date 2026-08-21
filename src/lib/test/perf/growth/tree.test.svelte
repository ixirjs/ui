<script lang="ts">
	// ONE tree of n nodes under one open root — NOT n separate roots, which is what
	// `src/lib/test/perf/tree-ablation.test.svelte` renders and why it could never see the O(n²).
	import { Tree } from '$ixirjs/ui/components/tree';

	let { n = 100 }: { n?: number } = $props();
</script>

<Tree.Root open>
	<Tree.Header>Root</Tree.Header>
	<Tree.Body>
		{#each { length: n } as _, i (i)}
			<Tree.Root open>
				<Tree.Header>Node {i}</Tree.Header>
				<Tree.Body>Body {i}</Tree.Body>
			</Tree.Root>
		{/each}
	</Tree.Body>
</Tree.Root>
