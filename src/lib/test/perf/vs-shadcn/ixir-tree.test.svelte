<script module lang="ts">
	// Installed once at module scope — the recommended app setup — rather than per-render
	// `setPreset`. See preset/context.svelte.ts `installPreset`.
	import { defaultPreset, installPreset } from '$ixirjs/ui/preset';

	installPreset(defaultPreset);
</script>

<script lang="ts">
	// One tree of `n` sibling nodes under one open root — NOT `n` separate roots.
	//
	// That distinction is the whole point of this fixture. `src/lib/test/perf/tree-ablation.test.svelte`
	// renders n independent `Tree.Root`s, so each one is its own keyboard owner with an empty child
	// collection, and the per-tree cost never multiplies. A real tree has one keyboard owner and many
	// nodes, which is where a per-node read of an owner-wide list becomes O(n²).
	//
	// The unit is one NODE: a Bond, a registered root/header/body/indicator, disclosure, the
	// treeitem↔group ARIA link, and a share of the tree-wide roving model.
	import { Tree } from '$ixirjs/ui/components/tree';
	import type { FixtureProps } from './props.js';

	let { n = 100, tint = '', bump = '' }: FixtureProps = $props();
</script>

<Tree.Root open>
	<Tree.Header>Root</Tree.Header>
	<Tree.Body>
		{#each { length: n } as _, i (i)}
			<Tree.Root open class={tint}>
				<Tree.Header>Node {i}</Tree.Header>
				<Tree.Body>Body {i}</Tree.Body>
			</Tree.Root>
		{/each}
		<Tree.Root open class={bump}>
			<Tree.Header>Probe</Tree.Header>
			<Tree.Body>Probe</Tree.Body>
		</Tree.Root>
	</Tree.Body>
</Tree.Root>
