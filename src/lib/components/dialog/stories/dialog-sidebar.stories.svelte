<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Dialog as ADialog } from '..';
	import { Sidebar, animateSidebarContent } from '../../sidebar';
	import { Button } from '../../button';
	import {
		LayoutDashboard,
		Users,
		Settings2,
		Bell,
		PanelLeftClose,
		PanelLeftOpen
	} from 'lucide-svelte';

	// A Sidebar composed *inside* Dialog content — the collapsible rail lives in the dialog's
	// own layout, so its in-flow width animation reflows the card body, not the viewport.
	const { Story } = defineMeta({
		title: 'Atoms/Dialog/Sidebar',
		parameters: { layout: 'fullscreen' }
	});
</script>

<script lang="ts">
	const navItems = [
		{ icon: LayoutDashboard, label: 'General' },
		{ icon: Users, label: 'Members' },
		{ icon: Bell, label: 'Notifications' },
		{ icon: Settings2, label: 'Advanced' }
	];

	let open = $state(false);
	let active = $state('General');
</script>

<!-- Sidebar-in-Dialog: the rail's collapse animation reflows the dialog body, not the page. -->
<Story name="Sidebar">
	<div class="flex flex-col items-start gap-3 p-8">
		<Button variant="primary" onclick={() => (open = true)}>Open settings</Button>
		<code class="text-muted-foreground text-xs font-mono">active section: {active}</code>

		<ADialog.Root class="bg-neutral-900/40" z-index={10} bind:open type="modal">
			<ADialog.Content class="h-128 max-w-4xl overflow-hidden p-0">
				<div class="flex h-full">
					<Sidebar.Root open>
						{#snippet children({ sidebar })}
							{@const isOpen = sidebar.isOpen}
							<Sidebar.Content
								class="bg-card border-border flex h-full flex-col border-r whitespace-nowrap"
								animate={animateSidebarContent({ axis: 'x', 0: '60px', 1: '200px' })}
								initial={animateSidebarContent({ axis: 'x', 0: '60px', 1: '200px', duration: 0 })}
							>
								<div class="border-border flex h-12 items-center gap-2 border-b px-3">
									{#if isOpen}
										<span class="text-foreground flex-1 text-sm font-semibold">Settings</span>
									{/if}
									<button
										class="text-muted-foreground hover:bg-foreground/5 hover:text-foreground rounded-md p-1.5 transition-colors"
										onclick={() => sidebar.toggle()}
										title={isOpen ? 'Collapse' : 'Expand'}
									>
										{#if isOpen}
											<PanelLeftClose size={16} />
										{:else}
											<PanelLeftOpen size={16} />
										{/if}
									</button>
								</div>

								<nav class="flex-1 overflow-y-auto p-2">
									{#each navItems as item (item.label)}
										{@const Icon = item.icon}
										<button
											class={[
												'group flex w-full items-center gap-3 rounded-md py-2 text-sm transition-colors',
												isOpen ? 'px-2.5' : 'justify-center px-0',
												active === item.label
													? 'bg-primary/10 text-primary font-medium'
													: 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
											]}
											onclick={() => (active = item.label)}
											title={item.label}
										>
											<Icon size={16} class="shrink-0" />
											{#if isOpen}
												<span class="flex-1 text-left">{item.label}</span>
											{/if}
										</button>
									{/each}
								</nav>
							</Sidebar.Content>
						{/snippet}
					</Sidebar.Root>

					<div class="flex min-w-0 flex-1 flex-col">
						<ADialog.Header class="flex items-center">
							<ADialog.Title>{active}</ADialog.Title>
							<ADialog.CloseButton class="ml-auto" />
						</ADialog.Header>
						<ADialog.Body class="flex-1 overflow-y-auto">
							<ADialog.Description>
								Editing the <strong>{active}</strong> section. Collapse the rail to reclaim space — the
								width animation reflows this body, since the sidebar is part of the dialog's layout.
							</ADialog.Description>
						</ADialog.Body>
						<ADialog.Footer class="flex justify-end gap-2">
							<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
							<Button variant="primary" onclick={() => (open = false)}>Save</Button>
						</ADialog.Footer>
					</div>
				</div>
			</ADialog.Content>
		</ADialog.Root>
	</div>
</Story>
