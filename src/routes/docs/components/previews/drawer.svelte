<script lang="ts">
	import { Button } from '$lib/components/button';
	import { Drawer } from '$lib/components/drawer';

	let drawerOpen = $state(false);
</script>

<div>
	<Button size="sm" variant="outline" onclick={() => (drawerOpen = true)}>Open Drawer</Button>
	<Drawer.Root bind:open={drawerOpen} class="z-100" side="right">
		<Drawer.Content class="w-64 flex flex-col">
			<Drawer.Header class="border-b border-border px-4 py-3">
				<Drawer.Title class="text-sm font-semibold">Navigation</Drawer.Title>
			</Drawer.Header>
			<Drawer.Body class="flex-1 px-4 py-4 space-y-2">
				{#each ['Dashboard', 'Projects', 'Team', 'Settings'] as item (item)}
					<button
						class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted text-left"
					>
						{item}
					</button>
				{/each}
			</Drawer.Body>
			<Drawer.Footer class="border-t border-border px-4 py-3">
				<Button variant="outline" size="sm" onclick={() => (drawerOpen = false)} class="w-full">
					Close
				</Button>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</div>
