<script lang="ts">
	import { Drawer } from '$lib/components/drawer';
	import { Button } from '$lib/components/button';
	import { Home, Folder, Users, Settings, LogOut, Moon, Zap } from 'lucide-svelte';

	let leftOpen = $state(false);
	let bottomOpen = $state(false);

	const navLinks = [
		{
			section: 'Main',
			items: [
				{ label: 'Dashboard', href: '#', icon: Home },
				{ label: 'Projects', href: '#', icon: Folder },
				{ label: 'Team', href: '#', icon: Users }
			]
		},
		{
			section: 'Settings',
			items: [
				{ label: 'Preferences', href: '#', icon: Settings },
				{ label: 'Appearance', href: '#', icon: Moon },
				{ label: 'Performance', href: '#', icon: Zap }
			]
		}
	];
</script>

<div class="flex flex-wrap gap-3">
	<Button onclick={() => (leftOpen = true)}>Open Nav</Button>
	<Button variant="outline" onclick={() => (bottomOpen = true)}>Delete Item</Button>

	<Drawer.Root bind:open={leftOpen} side="left">
		<Drawer.Content class="w-72 flex flex-col">
			<Drawer.Header class="border-b border-border px-6 py-4">
				<Drawer.Title>Navigation</Drawer.Title>
			</Drawer.Header>
			<Drawer.Body class="flex-1 overflow-y-auto px-4 py-6">
				<nav class="space-y-6">
					{#each navLinks as section, i (i)}
						<div>
							<h4
								class="text-foreground/60 mb-2 px-2 text-xs font-semibold uppercase tracking-wider"
							>
								{section.section}
							</h4>
							<div class="space-y-1">
								{#each section.items as link (link.label)}
									{@const Icon = link.icon}
									<a
										href={link.href}
										class="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted active:bg-muted/80"
										onclick={() => (leftOpen = false)}
									>
										<Icon class="w-4 h-4 shrink-0" />
										<span>{link.label}</span>
									</a>
								{/each}
							</div>
						</div>
					{/each}
				</nav>
			</Drawer.Body>
			<Drawer.Footer class="border-t border-border px-6 py-4 mt-auto">
				<Button
					variant="ghost"
					class="w-full flex items-center gap-2 justify-center"
					onclick={() => (leftOpen = false)}
				>
					<LogOut class="w-4 h-4" />
					<span>Sign Out</span>
				</Button>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>

	<Drawer.Root bind:open={bottomOpen} side="bottom">
		<Drawer.Content class="mx-auto max-w-lg rounded-t-2xl">
			<Drawer.Header class="border-b border-border px-6 pt-6 pb-4">
				<div>
					<Drawer.Title class="text-lg font-semibold">Delete this item?</Drawer.Title>
					<Drawer.Description class="text-muted-foreground mt-2 text-sm leading-relaxed"
						>This action cannot be undone. The item will be permanently removed from your account.</Drawer.Description
					>
				</div>
			</Drawer.Header>
			<Drawer.Footer class="flex gap-3 px-6 py-4">
				<Button
					variant="destructive"
					class="flex-1 font-medium"
					onclick={() => (bottomOpen = false)}>Delete</Button
				>
				<Button variant="outline" class="flex-1" onclick={() => (bottomOpen = false)}>Cancel</Button
				>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</div>
