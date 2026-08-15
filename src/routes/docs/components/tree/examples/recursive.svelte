<script lang="ts">
	import { Tree } from '$lib/components/tree';

	// A tree is usually data-shaped rather than hand-nested. A recursive snippet renders arbitrary
	// depth from one definition, and `Tree.Indicator` gives each branch its own disclosure arrow.
	type Node = { name: string; children?: Node[] };

	const data: Node = {
		name: 'app',
		children: [
			{
				name: 'routes',
				children: [{ name: '+page.svelte' }, { name: '+layout.svelte' }]
			},
			{ name: 'lib', children: [{ name: 'index.ts' }] },
			{ name: 'app.css' }
		]
	};
</script>

<div class="bg-muted rounded-lg p-4 text-sm">
	{@render node(data)}
</div>

{#snippet node(item: Node)}
	{#if item.children}
		<Tree.Root open>
			<Tree.Header class="flex items-center gap-1 px-2 py-1">
				<Tree.Indicator />
				📁 {item.name}
			</Tree.Header>
			<Tree.Body class="ml-4 border-l pl-2">
				{#each item.children as child (child.name)}
					{@render node(child)}
				{/each}
			</Tree.Body>
		</Tree.Root>
	{:else}
		<div class="px-2 py-1">📄 {item.name}</div>
	{/if}
{/snippet}
