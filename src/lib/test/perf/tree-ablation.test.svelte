<script lang="ts">
	// The nested-disclosure path, measured on its own.
	//
	// A SEPARATE fixture from `ablation.test.svelte` for the reason spelled out in
	// `datagrid-ablation.test.svelte`: that file's per-rung output SHA is the equivalence anchor,
	// and adding a differently-shaped branch to it would move the bytes of every existing rung.
	//
	// The unit is one TREE NODE: a Root owning a Bond, a Header, an Indicator and a Body — four
	// registered Atoms, cross-part ARIA from the trigger/content relationship, and TWO parts that
	// declare motion. Collapsible has one such part; this is the shape where that cost doubles.
	import { Tree } from '$ixirjs/ui/components/tree';

	let { n = 100 }: { n?: number } = $props();
</script>

{#each { length: n } as _, i (i)}
	<Tree.Root open>
		<Tree.Header>
			<Tree.Indicator>▸</Tree.Indicator>
			Node {i}
		</Tree.Header>
		<Tree.Body>Body {i}</Tree.Body>
	</Tree.Root>
{/each}
