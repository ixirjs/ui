<script lang="ts">
	import { Sidebar, animateSidebarContent } from '$lib/components/sidebar';

	let sidebarOpen = $state(true);
</script>

<div class="flex h-28 w-56 overflow-hidden rounded-lg border border-border">
	<Sidebar.Root bind:open={sidebarOpen}>
		{#snippet children({ sidebar })}
			<div class="flex size-full">
				<Sidebar.Content
					animate={animateSidebarContent({ '0': '2.5rem', '1': '130px' })}
					class="overflow-hidden border-r border-border"
				>
					<div class="flex flex-col gap-1 p-2">
						{#each [['📊', 'Dashboard'], ['📁', 'Projects'], ['⚙️', 'Settings']] as [icon, label] (label)}
							<button
								class="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-muted whitespace-nowrap w-full text-left"
							>
								<span class="shrink-0 text-sm">{icon}</span>
								{#if sidebarOpen}<span>{label}</span>{/if}
							</button>
						{/each}
					</div>
				</Sidebar.Content>
				<div class="flex flex-1 flex-col justify-between p-2">
					<div class="space-y-1.5">
						<div class="h-1.5 rounded bg-muted w-full"></div>
						<div class="h-1.5 rounded bg-muted w-3/4"></div>
						<div class="h-1.5 rounded bg-muted w-1/2"></div>
					</div>
					<button
						onclick={() => sidebar?.toggle?.()}
						class="text-xs text-primary hover:underline text-left"
					>
						{sidebarOpen ? '← Collapse' : '→ Expand'}
					</button>
				</div>
			</div>
		{/snippet}
	</Sidebar.Root>
</div>
