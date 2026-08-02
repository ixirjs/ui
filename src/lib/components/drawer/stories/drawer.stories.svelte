<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { clickoutDrawer, Drawer as Drawer_ } from '..';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Drawer',
		parameters: {
			// https://storybook.js.org/docs/configure/story-layout
			layout: 'fullscreen'
		},
		args: {
			side: 'right',
			disabled: false,
			open: false
		},
		argTypes: {
			side: {
				control: 'select',
				options: ['left', 'right', 'top', 'bottom'],
				description: 'Which edge the drawer slides in from'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable opening and closing the drawer'
			},
			open: {
				control: 'boolean',
				description: 'Controlled open state'
			}
		}
	});
</script>

<script lang="ts">
	import { animateDrawerContent } from '$ixirjs/ui/components/drawer/motion.svelte';

	let isOpen = $state(false);

	// Real-world navigation drawer: brand header, icon nav with an active item + count
	// badge, and a user-profile footer. `active` drives the highlighted row.
	let active = $state('dashboard');

	const nav = [
		{ id: 'dashboard', label: 'Dashboard' },
		{ id: 'projects', label: 'Projects', badge: 12 },
		{ id: 'team', label: 'Team' },
		{ id: 'settings', label: 'Settings' },
		{ id: 'help', label: 'Help' }
	];
</script>

<Story name="Basic">
	{#snippet template(args)}
		{@const side = args.side as 'left' | 'right' | 'top' | 'bottom'}
		{@const disabled = args.disabled as boolean}

		<div class="relative flex h-screen w-full items-start justify-start p-8">
			<Drawer_.Root bind:open={isOpen} {side} {disabled}>
				<Drawer_.Backdrop />
				<Drawer_.Content
					class="flex h-full w-80 flex-col border-r"
					animate={animateDrawerContent()}
					{@attach clickoutDrawer((_, bond) => {
						bond?.close?.();
					})}
				>
					<Drawer_.Header>
						<div class="flex items-center gap-3">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white"
							>
								A
							</div>
							<div class="flex flex-col">
								<Drawer_.Title>Acme Inc</Drawer_.Title>
								<Drawer_.Description>Product workspace</Drawer_.Description>
							</div>
						</div>
						{@render closeButton()}
					</Drawer_.Header>

					<Drawer_.Body class="flex-1 overflow-y-auto p-3">
						<p class="text-muted-foreground px-3 pb-2 text-xs font-medium tracking-wide uppercase">
							Menu
						</p>
						<nav class="flex flex-col gap-0.5">
							{#each nav as item (item.id)}
								{@const isActive = active === item.id}
								<button
									onclick={() => (active = item.id)}
									class={[
										'flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
										isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
									]}
									aria-current={isActive ? 'page' : undefined}
								>
									{@render navIcon(item.id)}
									<span class="flex-1">{item.label}</span>
									{#if item.badge}
										<span
											class="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-xs font-semibold"
										>
											{item.badge}
										</span>
									{/if}
								</button>
							{/each}
						</nav>
					</Drawer_.Body>

					<Drawer_.Footer>
						<div class="flex items-center gap-3">
							<div
								class="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
							>
								SC
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-foreground truncate text-sm font-medium">Sarah Chen</p>
								<p class="text-muted-foreground truncate text-xs">sarah@acme.io</p>
							</div>
							<button
								class="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
								aria-label="Sign out"
								onclick={() => (isOpen = false)}
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="size-4"
								>
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
									<polyline points="16 17 21 12 16 7" />
									<line x1="21" x2="9" y1="12" y2="12" />
								</svg>
							</button>
						</div>
					</Drawer_.Footer>
				</Drawer_.Content>
			</Drawer_.Root>

			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
				onclick={() => {
					isOpen = !isOpen;
				}}
			>
				Open Drawer ({args.side})
			</button>
		</div>
	{/snippet}
</Story>

<Story name="Left">
	<div class="relative flex h-screen w-full items-start justify-start p-8">
		<Drawer_.Root bind:open={isOpen} side="left">
			<Drawer_.Backdrop />
			<Drawer_.Content
				class="flex h-full w-80 flex-col border-r"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.close?.();
				})}
			>
				<Drawer_.Header>
					<div class="flex flex-col gap-0.5">
						<Drawer_.Title>Navigation</Drawer_.Title>
						<Drawer_.Description>Browse available sections.</Drawer_.Description>
					</div>
					{@render closeButton()}
				</Drawer_.Header>
				<Drawer_.Body class="flex-1 overflow-y-auto p-3">
					<nav class="flex flex-col gap-0.5">
						{#each nav as item (item.id)}
							<button
								class="hover:bg-muted text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors"
							>
								{@render navIcon(item.id)}
								{item.label}
							</button>
						{/each}
					</nav>
				</Drawer_.Body>
			</Drawer_.Content>
		</Drawer_.Root>

		<button
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
			onclick={() => {
				isOpen = !isOpen;
			}}
		>
			Open Left Drawer
		</button>
	</div>
</Story>

<Story name="Right">
	<div class="relative flex h-screen w-full items-start justify-end p-8">
		<Drawer_.Root bind:open={isOpen} side="right">
			<Drawer_.Backdrop />
			<Drawer_.Content
				class="flex h-full w-80 flex-col border-l"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.close?.();
				})}
			>
				<Drawer_.Header>
					<div class="flex flex-col gap-0.5">
						<Drawer_.Title>Notifications</Drawer_.Title>
						<Drawer_.Description>Your recent activity.</Drawer_.Description>
					</div>
					{@render closeButton()}
				</Drawer_.Header>
				<Drawer_.Body class="flex-1 space-y-2 overflow-y-auto p-3">
					{#each ['Deploy succeeded — production', 'New comment on PR #42', 'Scheduled maintenance tonight', 'Invite accepted by Alex'] as note (note)}
						<div
							class="hover:bg-muted flex items-start gap-3 rounded-md px-3 py-2 transition-colors"
						>
							<span class="bg-primary mt-1.5 size-2 shrink-0 rounded-full"></span>
							<span class="text-foreground text-sm">{note}</span>
						</div>
					{/each}
				</Drawer_.Body>
				<Drawer_.Footer>
					<button
						class="text-muted-foreground hover:text-foreground w-full text-center text-sm font-medium transition-colors"
						onclick={() => (isOpen = false)}
					>
						Mark all as read
					</button>
				</Drawer_.Footer>
			</Drawer_.Content>
		</Drawer_.Root>

		<button
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
			onclick={() => {
				isOpen = !isOpen;
			}}
		>
			Open Right Drawer
		</button>
	</div>
</Story>

<Story name="Top">
	<div class="relative flex h-screen w-full flex-col items-start p-8">
		<Drawer_.Root bind:open={isOpen} side="top">
			<Drawer_.Backdrop />
			<Drawer_.Content
				class="flex w-full flex-col border-b p-6"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.close?.();
				})}
			>
				<Drawer_.Header variant="plain" class="mb-4">
					<div class="flex flex-col gap-0.5">
						<Drawer_.Title>Search</Drawer_.Title>
						<Drawer_.Description>Find anything in your workspace.</Drawer_.Description>
					</div>
					{@render closeButton()}
				</Drawer_.Header>
				<Drawer_.Body>
					<input
						class="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-4 py-2 text-sm outline-none"
						placeholder="Type to search..."
						type="text"
					/>
				</Drawer_.Body>
			</Drawer_.Content>
		</Drawer_.Root>

		<button
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
			onclick={() => {
				isOpen = !isOpen;
			}}
		>
			Open Top Drawer
		</button>
	</div>
</Story>

<Story name="Bottom">
	<div class="relative flex h-screen w-full flex-col items-start justify-end p-8">
		<Drawer_.Root bind:open={isOpen} side="bottom">
			<Drawer_.Backdrop />
			<Drawer_.Content
				class="flex w-full flex-col border-t p-6"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.close?.();
				})}
			>
				<Drawer_.Header variant="plain" class="mb-4">
					<div class="flex flex-col gap-0.5">
						<Drawer_.Title>Share</Drawer_.Title>
						<Drawer_.Description>Share this item with others.</Drawer_.Description>
					</div>
					{@render closeButton()}
				</Drawer_.Header>
				<Drawer_.Body class="flex flex-col gap-2">
					{#each ['Copy link', 'Share via email', 'Export as PDF'] as action (action)}
						<button
							class="hover:bg-muted text-foreground rounded-md px-3 py-2 text-left text-sm transition-colors"
						>
							{action}
						</button>
					{/each}
				</Drawer_.Body>
			</Drawer_.Content>
		</Drawer_.Root>

		<button
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
			onclick={() => {
				isOpen = !isOpen;
			}}
		>
			Open Bottom Drawer
		</button>
	</div>
</Story>

{#snippet closeButton()}
	<button
		class="text-muted-foreground hover:text-foreground hover:bg-muted -mr-1 rounded-md p-1.5 transition-colors"
		onclick={() => (isOpen = false)}
		aria-label="Close drawer"
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4">
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	</button>
{/snippet}

{#snippet navIcon(id: string)}
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="size-4.5 shrink-0"
	>
		{#if id === 'dashboard'}
			<rect x="3" y="3" width="7" height="9" rx="1" />
			<rect x="14" y="3" width="7" height="5" rx="1" />
			<rect x="14" y="12" width="7" height="9" rx="1" />
			<rect x="3" y="16" width="7" height="5" rx="1" />
		{:else if id === 'projects'}
			<path
				d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"
			/>
		{:else if id === 'team'}
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
		{:else if id === 'settings'}
			<path
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"
			/>
			<circle cx="12" cy="12" r="3" />
		{:else}
			<circle cx="12" cy="12" r="10" />
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
			<path d="M12 17h.01" />
		{/if}
	</svg>
{/snippet}
