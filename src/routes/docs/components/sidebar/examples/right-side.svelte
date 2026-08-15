<script lang="ts">
	import { Sidebar, animateSidebarContent } from '$lib/components/sidebar';
	import { Button } from '$lib/components/button';

	// `onopenchange` fires after the transition commits, not when the click happens — so it is the
	// hook for persisting the collapsed state without writing a value the animation may still undo.
	let open = $state(true);
	let lastCommit = $state('—');
</script>

<div class="border-border flex h-64 overflow-hidden rounded-lg border">
	<Sidebar.Root bind:open onopenchange={(next) => (lastCommit = next ? 'open' : 'collapsed')}>
		<div class="flex size-full">
			<main class="flex flex-1 flex-col gap-3 p-4">
				<Button size="sm" variant="outline" onclick={() => (open = !open)}>
					{open ? 'Collapse' : 'Expand'}
				</Button>
				<code class="text-muted-foreground text-xs">committed: {lastCommit}</code>
			</main>

			<Sidebar.Content
				animate={animateSidebarContent({ '0': '0rem', '1': '180px' })}
				class="border-border overflow-hidden border-l p-3"
			>
				<p class="text-sm font-semibold whitespace-nowrap">Details</p>
				<p class="text-muted-foreground mt-2 text-xs whitespace-nowrap">
					An inspector panel on the trailing edge.
				</p>
			</Sidebar.Content>
		</div>
	</Sidebar.Root>
</div>
