<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Sidebar as Sidebar_, animateSidebarContent } from '.';
	import {
		LayoutDashboard,
		ChartLine,
		FolderKanban,
		Users,
		FileText,
		Settings2,
		Mail,
		Bell,
		Search,
		PanelLeftClose,
		PanelLeftOpen,
		LogOut,
		Sparkles
	} from 'lucide-svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Sidebar',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			open: true,
			disabled: false,
			overlay: false
		},
		argTypes: {
			open: {
				control: 'boolean',
				description: 'Whether the sidebar is expanded'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable sidebar interaction'
			},
			overlay: {
				control: 'boolean',
				description: 'Render as a teleported overlay (modal ZLayer) instead of an in-flow rail. Structural — read once at mount, not toggled at runtime.'
			}
		}
	});
</script>

<script lang="ts">
	const navSections = [
		{
			title: 'Overview',
			items: [
				{ icon: LayoutDashboard, label: 'Dashboard', badge: null },
				{ icon: ChartLine, label: 'Analytics', badge: null },
				{ icon: FolderKanban, label: 'Projects', badge: '4' }
			]
		},
		{
			title: 'Management',
			items: [
				{ icon: Users, label: 'Team Members', badge: null },
				{ icon: FileText, label: 'Documents', badge: null },
				{ icon: Settings2, label: 'Settings', badge: null }
			]
		},
		{
			title: 'Support',
			items: [
				{ icon: Mail, label: 'Messages', badge: '12' },
				{ icon: Bell, label: 'Notifications', badge: '3' }
			]
		}
	];

	let activeItem = $state('Dashboard');

	const statSlots = [0, 1, 2];
	const listSlots = [0, 1, 2, 3];
	const rowSlots = [0, 1, 2, 3, 4];
	const barHeights = [42, 68, 55, 80, 47, 92, 63, 74, 58, 88, 70, 96];
</script>

<Story name="Basic" args={{ open: true, disabled: false, overlay: false }}>
	{#snippet template(args)}
		{@const isOpen = args.open ?? true}
		<Sidebar_.Root bind:open={args.open} disabled={args.disabled} overlay={args.overlay}>
			{#snippet children({ sidebar })}
				<div class="bg-background flex h-screen w-full">
					<Sidebar_.Content
						class="bg-card border-border flex flex-col border-r whitespace-nowrap"
						animate={animateSidebarContent({ axis: 'x', 0: '64px', 1: '264px' })}
						initial={animateSidebarContent({ axis: 'x', 0: '64px', 1: '264px', duration: 0 })}
					>
						<!-- Logo & Toggle -->
						<div class="border-border flex h-14 items-center gap-2.5 border-b px-3">
							<div
								class="from-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br to-violet-500 text-white shadow-sm"
							>
								<Sparkles size={16} />
							</div>
							{#if isOpen}
								<span class="text-foreground text-base font-semibold tracking-tight">Atoms UI</span>
								<button
									class="text-muted-foreground hover:bg-foreground/5 hover:text-foreground ml-auto rounded-md p-1.5 transition-colors"
									onclick={() => sidebar.state.toggle()}
									title="Collapse sidebar"
								>
									<PanelLeftClose size={18} />
								</button>
							{/if}
						</div>

						{#if !isOpen}
							<button
								class="text-muted-foreground hover:bg-foreground/5 hover:text-foreground mx-3 mt-3 flex items-center justify-center rounded-md p-1.5 transition-colors"
								onclick={() => sidebar.state.toggle()}
								title="Expand sidebar"
							>
								<PanelLeftOpen size={18} />
							</button>
						{/if}

						<!-- Search -->
						{#if isOpen}
							<div class="px-3 pt-3">
								<div
									class="border-border bg-background text-muted-foreground flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
								>
									<Search size={15} />
									<span class="flex-1">Search…</span>
									<kbd
										class="border-border bg-card rounded border px-1 text-[10px] font-medium">⌘K</kbd
									>
								</div>
							</div>
						{/if}

						<!-- Navigation -->
						<nav class="flex-1 overflow-y-auto px-3 py-3">
							{#each navSections as section (section.title)}
								{#if isOpen}
									<p
										class="text-muted-foreground mt-5 mb-1 px-2 text-[11px] font-semibold tracking-wider uppercase first:mt-0"
									>
										{section.title}
									</p>
								{:else}
									<div class="bg-border mx-auto my-2 h-px w-6 first:hidden"></div>
								{/if}
								{#each section.items as item (item.label)}
									{@const Icon = item.icon}
									<button
										class={[
											'group flex w-full items-center gap-3 rounded-md py-2 text-sm transition-colors',
											isOpen ? 'px-2.5' : 'justify-center px-0',
											activeItem === item.label
												? 'bg-primary/10 text-primary font-medium'
												: 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
										]}
										onclick={() => (activeItem = item.label)}
										title={item.label}
									>
										<span class="relative shrink-0">
											<Icon size={18} />
											<!-- Collapsed: badge count shrinks to a dot. -->
											{#if !isOpen && item.badge}
												<span
													class="bg-primary absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-(--color-card)"
												></span>
											{/if}
										</span>
										{#if isOpen}
											<span class="flex-1 text-left">{item.label}</span>
											{#if item.badge}
												<span
													class="bg-primary/15 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
												>
													{item.badge}
												</span>
											{/if}
										{/if}
									</button>
								{/each}
							{/each}
						</nav>

						<!-- User -->
						<div class="border-border border-t p-3">
							<div
								class={[
									'hover:bg-foreground/5 flex items-center gap-2.5 rounded-md transition-colors',
									isOpen ? 'p-1.5' : 'justify-center p-1.5'
								]}
							>
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 text-xs font-semibold text-white"
								>
									JD
								</div>
								{#if isOpen}
									<div class="min-w-0 flex-1">
										<p class="text-foreground truncate text-sm font-medium">Jane Doe</p>
										<p class="text-muted-foreground truncate text-xs">jane@example.com</p>
									</div>
									<LogOut size={16} class="text-muted-foreground" />
								{/if}
							</div>
						</div>
					</Sidebar_.Content>

					<!-- Main Content -->
					<div class="flex min-w-0 flex-1 flex-col">
						<!-- Top bar -->
						<header
							class="border-border bg-card/50 flex h-14 shrink-0 items-center gap-3 border-b px-6 backdrop-blur"
						>
							<div>
								<p class="text-muted-foreground text-[11px]">Workspace / Acme Inc.</p>
								<h1 class="text-foreground -mt-0.5 text-sm font-semibold">{activeItem}</h1>
							</div>
							<!-- Action placeholders -->
							<div class="bg-foreground/10 ml-auto h-8 w-28 rounded-md"></div>
							<div class="bg-foreground/10 h-8 w-8 rounded-md"></div>
						</header>

						<main class="flex-1 overflow-auto p-6">
							<!-- Page heading placeholder -->
							<div class="mb-6 space-y-2">
								<div class="bg-foreground/10 h-6 w-56 rounded"></div>
								<div class="bg-foreground/10 h-3.5 w-80 rounded"></div>
							</div>

							<!-- Stat card placeholders -->
							<div class="mb-4 grid grid-cols-3 gap-4">
								{#each statSlots as i (i)}
									<div class="border-border bg-card space-y-3 rounded-xl border p-4">
										<div class="flex items-center justify-between">
											<div class="bg-foreground/10 h-3 w-20 rounded"></div>
											<div class="bg-foreground/10 h-7 w-7 rounded-md"></div>
										</div>
										<div class="bg-foreground/10 h-7 w-28 rounded"></div>
										<div class="bg-foreground/10 h-3 w-24 rounded"></div>
									</div>
								{/each}
							</div>

							<div class="grid grid-cols-3 gap-4">
								<!-- Chart placeholder -->
								<div class="border-border bg-card col-span-2 space-y-4 rounded-xl border p-4">
									<div class="space-y-2">
										<div class="bg-foreground/10 h-4 w-36 rounded"></div>
										<div class="bg-foreground/10 h-3 w-20 rounded"></div>
									</div>
									<div class="bg-foreground/5 flex h-44 items-end gap-2 rounded-lg p-3">
										{#each barHeights as h, i (i)}
											<div class="bg-foreground/10 flex-1 rounded-t" style="height: {h}%"></div>
										{/each}
									</div>
								</div>

								<!-- List placeholder -->
								<div class="border-border bg-card space-y-4 rounded-xl border p-4">
									<div class="bg-foreground/10 h-4 w-28 rounded"></div>
									{#each listSlots as i (i)}
										<div class="flex items-center gap-3">
											<div class="bg-foreground/10 h-8 w-8 shrink-0 rounded-full"></div>
											<div class="flex-1 space-y-1.5">
												<div class="bg-foreground/10 h-3 w-full rounded"></div>
												<div class="bg-foreground/10 h-2.5 w-16 rounded"></div>
											</div>
										</div>
									{/each}
								</div>
							</div>

							<!-- Table placeholder -->
							<div class="border-border bg-card mt-4 overflow-hidden rounded-xl border">
								<div class="border-border flex items-center justify-between border-b p-4">
									<div class="bg-foreground/10 h-4 w-32 rounded"></div>
									<div class="bg-foreground/10 h-3 w-16 rounded"></div>
								</div>
								{#each rowSlots as i (i)}
									<div class="border-border flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
										<div class="bg-foreground/10 h-3.5 flex-3 rounded"></div>
										<div class="bg-foreground/10 h-3.5 flex-2 rounded"></div>
										<div class="bg-foreground/10 h-1.5 flex-2 rounded-full"></div>
										<div class="bg-foreground/10 h-5 w-16 shrink-0 rounded-full"></div>
									</div>
								{/each}
							</div>
						</main>
					</div>
				</div>
			{/snippet}
		</Sidebar_.Root>
	{/snippet}
</Story>
