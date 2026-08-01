<script lang="ts">
	import { Sidebar, animateSidebarContent } from '$lib/components/sidebar';
	import type { SidebarBond } from '$lib/components/sidebar/bond.svelte';
	import { LayoutDashboard, BarChart2, Settings } from 'lucide-svelte';

	let sidebarOpen = $state(true);

	const navItems = [
		{ icon: LayoutDashboard, label: 'Dashboard' },
		{ icon: BarChart2, label: 'Analytics' },
		{ icon: Settings, label: 'Settings' }
	];
</script>

<div class="flex h-64 overflow-hidden rounded-lg border border-border">
	<Sidebar.Root bind:open={sidebarOpen}>
		{#snippet children({ sidebar }: { sidebar: SidebarBond })}
			<div class="flex size-full">
				<Sidebar.Content
					animate={animateSidebarContent({ '0': '2.75rem', '1': '160px' })}
					class="overflow-hidden border-r border-border p-2"
				>
					<nav class="flex flex-col gap-1">
						{#each navItems as item (item)}
							{@const Icon = item.icon}
							<button
								class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted whitespace-nowrap"
							>
								<Icon size={16} class="shrink-0" />
								{#if sidebarOpen}<span>{item.label}</span>{/if}
							</button>
						{/each}
					</nav>
				</Sidebar.Content>
				<main class="flex flex-1 flex-col gap-3 p-4">
					<p class="text-muted-foreground text-sm">Main content area</p>
					<button onclick={() => sidebar?.toggle?.()} class="text-sm underline">
						{sidebarOpen ? 'Collapse' : 'Expand'} sidebar
					</button>
				</main>
			</div>
		{/snippet}
	</Sidebar.Root>
</div>
