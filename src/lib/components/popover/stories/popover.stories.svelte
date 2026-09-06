<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Popover as Popover_ } from '..';
	import { Dialog as Dialog_ } from '$ixirjs/ui/components/dialog';
	import { Drawer as Drawer_ } from '$ixirjs/ui/components/drawer';
	import { Sidebar as Sidebar_ } from '$ixirjs/ui/components/sidebar';
	import { Button } from '$ixirjs/ui/components/button';

	const { Story } = defineMeta({
		title: 'Atoms/Popover',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			placement: 'bottom',
			disabled: false,
			offset: 2
		},
		argTypes: {
			placement: {
				control: 'select',
				options: [
					'top',
					'top-start',
					'top-end',
					'bottom',
					'bottom-start',
					'bottom-end',
					'left',
					'left-start',
					'left-end',
					'right',
					'right-start',
					'right-end'
				],
				description: 'Preferred placement of the popover relative to its trigger'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable trigger interaction and prevent the popover from opening'
			},
			offset: {
				control: 'number',
				description: 'Distance in pixels between the trigger and the popover content'
			}
		}
	});
</script>

<script lang="ts">
	import { animateSidebarContent } from '$ixirjs/ui/components/sidebar';

	let open = $state(false);
	let isDialogOpen = $state(false);
	let isDrawerOpen = $state(false);
	let isSidebarOpen = $state(true);

	// Real data for the popover menus — the host pages around them are skeletons.
	const options = ['Design', 'Engineering', 'Product', 'Marketing', 'Operations'];
	const sortOptions = ['Name A-Z', 'Name Z-A', 'Date newest', 'Date oldest', 'Priority high-low'];
	let selectedSort = $state('Date newest');
	const settingsOptions = [
		'Account settings',
		'Appearance',
		'Notifications',
		'Security',
		'Billing',
		'Sign out'
	];
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex h-screen w-full flex-col items-center justify-center gap-7 p-8">
			<p class="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.25em]">
				Account
			</p>

			<Popover_.Root bind:open {...args}>
				{#snippet children({ popover })}
					<Popover_.Trigger variant="chip">
						<span
							class="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
						>
							JD
						</span>
						<span class="text-foreground font-medium">Jane Doe</span>
						<Popover_.Indicator />
					</Popover_.Trigger>

					<Popover_.Content class="bg-card w-64 p-0" autoClose>
						<Popover_.Tail />

						<div class="border-border flex items-center gap-3 border-b px-4 py-3">
							<span
								class="bg-primary text-primary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
							>
								JD
							</span>
							<div class="min-w-0">
								<p class="text-foreground truncate text-sm font-medium leading-tight">Jane Doe</p>
								<p class="text-muted-foreground truncate text-xs leading-tight">jane@example.com</p>
							</div>
						</div>
						{#snippet userIcon()}
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="h-4 w-4 shrink-0"
							>
								<circle cx="12" cy="7" r="4"></circle>
								<path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
							</svg>
						{/snippet}
						{#snippet settingsIcon()}
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="h-4 w-4 shrink-0"
							>
								<circle cx="12" cy="12" r="3"></circle>
								<path
									d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
								></path>
							</svg>
						{/snippet}
						{#snippet bellIcon()}
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="h-4 w-4 shrink-0"
							>
								<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
								<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
							</svg>
						{/snippet}
						{#snippet billingIcon()}
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="h-4 w-4 shrink-0"
							>
								<rect x="2" y="5" width="20" height="14" rx="2"></rect>
								<line x1="2" y1="10" x2="22" y2="10"></line>
							</svg>
						{/snippet}

						<div class="p-1">
							{#each [[userIcon, 'Profile'], [settingsIcon, 'Settings'], [bellIcon, 'Notifications'], [billingIcon, 'Billing']] as [icon, label] (label)}
								{@const iconSnippet = icon as import('svelte').Snippet}
								<button
									class="hover:bg-muted text-foreground flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-sm transition-colors"
								>
									{@render iconSnippet()}
									<span class="flex-1">{label}</span>
								</button>
							{/each}
						</div>
						<div class="border-border border-t p-1">
							<button
								class="hover:bg-muted flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-sm text-destructive transition-colors"
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									class="h-4 w-4 shrink-0"
								>
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
									<polyline points="16 17 21 12 16 7"></polyline>
									<line x1="21" y1="12" x2="9" y2="12"></line>
								</svg>
								<span class="flex-1">Sign out</span>
							</button>
						</div>
					</Popover_.Content>
					<!-- The root supplies a family interface; no constructor injection or manual disposal. -->
					<code class="text-muted-foreground font-mono text-xs"
						>profile: {popover.profile.name} · open: {String(popover.isOpen)}</code
					>
				{/snippet}
			</Popover_.Root>

			<p class="text-muted-foreground/70 text-xs">Click the chip to open the account menu</p>
		</div>
	{/snippet}
</Story>

<!--
	The composite stories below render a skeleton host layout (muted placeholder
	blocks) so focus stays on the popover. Every Popover_.* lives in its real spot
	and is fully rendered/interactive.
-->

<Story name="Popover in Dialog">
	<div class="flex h-screen items-center justify-center p-8">
		<Button onclick={() => (isDialogOpen = true)}>Open Dialog</Button>

		<Dialog_.Root bind:open={isDialogOpen}>
			<!-- Dialog Content Portal z-index = 10 -->
			<Dialog_.Content class="relative flex max-h-[85svh] w-120 flex-col overflow-y-auto p-0">
				<Dialog_.Header class="bg-inherit sticky top-0 z-20 h-16 shrink-0">
					<div class="bg-muted h-9 w-9 shrink-0 rounded-lg"></div>
					<div class="min-w-0 flex-1 space-y-1.5">
						<div class="bg-muted h-3.5 w-24 rounded-full"></div>
						<div class="bg-muted/60 h-2.5 w-32 rounded-full"></div>
					</div>
					<Dialog_.CloseButton />
				</Dialog_.Header>

				<Dialog_.Body class="bg-inherit p-0">
					<!-- Sticky toolbar under the header. -->
					<div class="bg-inherit sticky top-16 z-10 flex items-center gap-2 px-5 pb-3 pt-4">
						<div class="bg-muted/60 h-9 flex-1 rounded-lg"></div>
						<Popover_.Root placement="bottom-start" position="fixed">
							<Popover_.Trigger variant="field">
								Category
								<Popover_.Indicator />
							</Popover_.Trigger>
							<!-- z-index=12 lifts the portalled content above the sticky header. -->
							<Popover_.Content variant="menu" class="min-w-60" z-index={(z) => z + 2}>
								{#each options as opt (opt)}
									<button
										class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm"
									>
										{opt}
									</button>
								{/each}
							</Popover_.Content>
						</Popover_.Root>
					</div>

					<!-- List: skeleton rows, each with a real row-action popover -->
					<div class="space-y-1 px-5 pb-4">
						{#each Array.from({ length: 7 }, (_, i) => i) as i (i)}
							{@const w = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20'][i % 6]}
							<div class="group flex items-center gap-3.5 rounded-lg px-3 py-3">
								<div class="bg-muted h-2 w-2 shrink-0 rounded-full"></div>
								<div class="min-w-0 flex-1 space-y-1.5">
									<div class={['bg-muted h-3 rounded-full', w]}></div>
									<div class="bg-muted/60 h-2.5 w-40 rounded-full"></div>
								</div>
								<Popover_.Root
									placement="bottom-end"
									placements={['bottom-end', 'top-end', 'left']}
								>
									<Popover_.Trigger
										variant="ghost-icon"
										class="shrink-0 opacity-0 group-hover:opacity-100"
									>
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											class="h-4 w-4"
										>
											<circle cx="12" cy="12" r="1"></circle>
											<circle cx="19" cy="12" r="1"></circle>
											<circle cx="5" cy="12" r="1"></circle>
										</svg>
									</Popover_.Trigger>
									<Popover_.Content variant="menu" class="min-w-40" autoClose>
										{#each ['Edit', 'Duplicate', 'Archive'] as action (action)}
											<button
												class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm"
											>
												{action}
											</button>
										{/each}
										<div class="bg-border my-1 h-px"></div>
										<button
											class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm text-destructive"
										>
											Delete
										</button>
									</Popover_.Content>
								</Popover_.Root>
							</div>
						{/each}
					</div>
				</Dialog_.Body>

				<!-- Footer: skeleton -->
				<Dialog_.Footer class="bg-inherit sticky bottom-0 items-center justify-between py-3.5">
					<div class="bg-muted/60 h-3 w-28 rounded-full"></div>
					<div class="flex gap-2">
						<div class="bg-muted/60 h-8 w-20 rounded-md"></div>
						<div class="bg-muted h-8 w-20 rounded-md"></div>
					</div>
				</Dialog_.Footer>
			</Dialog_.Content>
		</Dialog_.Root>
	</div>
</Story>

<Story name="Popover in Drawer">
	<div class="bg-background relative flex h-screen w-full flex-col">
		<header class="border-border flex h-16 shrink-0 items-center gap-4 border-b px-8">
			<div class="bg-muted h-2.5 w-24 rounded-full"></div>
			<button
				onclick={() => (isDrawerOpen = true)}
				class="border-border text-muted-foreground hover:text-foreground hover:border-border ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors"
			>
				Filters
			</button>
		</header>

		<main class="flex-1 overflow-hidden">
			<div class="mx-auto flex h-full w-full max-w-4xl flex-col px-8 pb-8 pt-10">
				<!-- Hero: skeleton -->
				<div class="bg-muted/60 h-2.5 w-20 rounded-full"></div>
				<div class="bg-muted mt-4 h-12 w-40 rounded-lg"></div>

				<!-- Record grid: skeleton rows in a scrollable area, each with a real row-action popover -->
				<div
					class="mt-8 grid min-h-0 flex-1 grid-cols-1 gap-x-10 overflow-y-auto pr-1 sm:grid-cols-2"
				>
					{#each Array.from({ length: 8 }, (_, i) => i) as i (i)}
						{@const w = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20'][i % 6]}
						<div class="group border-border flex items-center gap-3.5 border-b px-2 py-3">
							<div class="bg-muted h-2 w-2 shrink-0 rounded-full"></div>
							<div class="min-w-0 flex-1 space-y-1.5">
								<div class={['bg-muted h-3 rounded-full', w]}></div>
								<div class="bg-muted/60 h-2.5 w-40 rounded-full"></div>
							</div>
							<Popover_.Root placement="bottom-end" placements={['bottom-end', 'top-end', 'left']}>
								<Popover_.Trigger
									variant="ghost-icon"
									class="shrink-0 opacity-0 group-hover:opacity-100"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										class="h-4 w-4"
									>
										<circle cx="12" cy="12" r="1"></circle>
										<circle cx="19" cy="12" r="1"></circle>
										<circle cx="5" cy="12" r="1"></circle>
									</svg>
								</Popover_.Trigger>
								<Popover_.Content variant="menu" class="min-w-40" autoClose>
									{#each ['Open', 'Duplicate', 'Archive'] as action (action)}
										<button
											class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm"
										>
											{action}
										</button>
									{/each}
									<div class="bg-border my-1 h-px"></div>
									<button
										class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm text-destructive"
									>
										Delete
									</button>
								</Popover_.Content>
							</Popover_.Root>
						</div>
					{/each}
				</div>
			</div>
		</main>

		<Drawer_.Root bind:open={isDrawerOpen} side="right">
			<Drawer_.Content class="bg-background h-full w-90 overflow-y-auto border-l shadow-sm">
				<Drawer_.Header class="bg-background sticky top-0 z-20 px-6">
					<Drawer_.Title class="text-base font-semibold tracking-tight">Filters</Drawer_.Title>
					<button
						class="text-muted-foreground hover:text-foreground -mr-1.5 rounded-md p-1.5 leading-none transition-colors"
						aria-label="Close filters"
						onclick={() => (isDrawerOpen = false)}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							class="h-4 w-4"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</Drawer_.Header>

				<Drawer_.Body class="space-y-7 px-6 py-5">
					<!-- Skeleton search -->
					<div class="bg-muted/60 h-10 rounded-lg"></div>

					<!-- Real Sort popover -->
					<section>
						<p
							class="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-[0.18em]"
						>
							Sort
						</p>
						<Popover_.Root>
							<Popover_.Trigger variant="field" class="w-full justify-between">
								{selectedSort}
								<Popover_.Indicator />
							</Popover_.Trigger>
							<Popover_.Content variant="menu" class="min-w-56" autoClose z-index={1}>
								{#each sortOptions as opt (opt)}
									<button
										onclick={() => (selectedSort = opt)}
										class={[
											'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm',
											opt === selectedSort ? 'text-primary font-medium' : 'hover:bg-muted'
										]}
									>
										{opt}
										{#if opt === selectedSort}
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												class="h-3.5 w-3.5"
											>
												<polyline points="20 6 9 17 4 12"></polyline>
											</svg>
										{/if}
									</button>
								{/each}
							</Popover_.Content>
						</Popover_.Root>
					</section>

					<!-- Skeleton filter sections -->
					{#each ['Status', 'Range', 'Type', 'Labels', 'Assignee', 'Priority', 'Display', 'Saved views'] as title (title)}
						<section>
							<p
								class="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-[0.18em]"
							>
								{title}
							</p>
							<div class="space-y-2.5">
								{#each Array.from({ length: 4 }, (_, i) => i) as i (i)}
									{@const w = ['w-2/3', 'w-1/2', 'w-3/5', 'w-3/4'][i % 4]}
									<div class="flex items-center gap-3">
										<div class="bg-muted/60 h-4 w-4 shrink-0 rounded"></div>
										<div class={['bg-muted h-3 rounded-full', w]}></div>
									</div>
								{/each}
							</div>
						</section>
					{/each}
				</Drawer_.Body>

				<Drawer_.Footer
					class="bg-background sticky bottom-0 z-10 flex items-center justify-between gap-3 px-6 py-4"
				>
					<div class="bg-muted/60 h-3 w-16 rounded-full"></div>
					<div class="bg-muted h-9 w-28 rounded-full"></div>
				</Drawer_.Footer>
			</Drawer_.Content>
		</Drawer_.Root>
	</div>
</Story>

<Story name="Popover in Sidebar">
	<Sidebar_.Root bind:open={isSidebarOpen}>
		{#snippet children({ sidebar })}
			<div class="flex h-screen w-full">
				<Sidebar_.Content
					class="shrink-0"
					animate={animateSidebarContent({ axis: 'x', '0': '52px', '1': '224px' })}
					initial={animateSidebarContent({ axis: 'x', '0': '52px', '1': '224px', duration: 0 })}
				>
					<!--
						Clip to the animated panel width; the inner layer keeps its full expanded width
						so content preserves its position instead of reflowing as the sidebar collapses.
					-->
					<div class="max-h-screen w-full overflow-x-hidden overflow-y-auto">
						<div class="w-56">
							<!-- Brand: collapse toggle (kept flush-left so it stays reachable at 52px) + skeleton label -->
							<div
								class="bg-card border-border sticky top-0 z-2 flex h-13 shrink-0 items-center gap-2.5 border-b px-3"
							>
								<button
									class="text-muted-foreground hover:text-foreground hover:bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm leading-none transition-colors"
									onclick={() => sidebar.toggle()}
									title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										class="h-4 w-4"
									>
										{#if isSidebarOpen}
											<polyline points="15 18 9 12 15 6"></polyline>
										{:else}
											<polyline points="9 18 15 12 9 6"></polyline>
										{/if}
									</svg>
								</button>
								<div class="bg-muted h-3 w-20 rounded-full"></div>
							</div>

							<!-- Nav: skeleton rows — icons stay flush-left, labels clip away with the panel -->
							<nav class="py-2">
								{#each Array.from({ length: 6 }, (_, g) => g) as g (g)}
									{@const gw = ['w-16', 'w-12', 'w-20', 'w-14'][g % 4]}
									<div class="px-2 pb-2">
										<div class={['bg-muted/60 mx-2 mt-3 mb-2 h-2 rounded-full', gw]}></div>
										{#each Array.from({ length: 4 }, (_, i) => i) as i (i)}
											{@const w = ['w-2/3', 'w-1/2', 'w-3/5', 'w-1/2'][i % 4]}
											<div class="flex items-center gap-2.5 px-2 py-1.5">
												<div class="bg-muted h-5 w-5 shrink-0 rounded"></div>
												<div class={['bg-muted h-3 rounded-full', w]}></div>
											</div>
										{/each}
									</div>
								{/each}
							</nav>

							<!-- Footer: real account popover — avatar stays flush-left, identity text clips away -->
							<div class="bg-card border-border sticky bottom-0 z-2 border-t px-2 py-2">
								<Popover_.Root
									placement="right-end"
									placements={['right-end', 'right-start', 'right', 'top-start']}
								>
									<Popover_.Trigger variant="ghost" class="w-full justify-start">
										<div
											class="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium"
										>
											JD
										</div>
										<div class="min-w-0 text-left">
											<p class="text-foreground truncate text-sm font-medium leading-tight">
												Jane Doe
											</p>
											<p class="text-muted-foreground truncate text-xs leading-tight">
												jane@example.com
											</p>
										</div>
									</Popover_.Trigger>
									<Popover_.Content variant="menu" class="min-w-52 px-3">
										{#each settingsOptions as opt (opt)}
											<button
												class={[
													'hover:bg-muted block w-full px-3 py-1.5 text-left text-sm transition-colors',
													opt === 'Sign out' && 'text-destructive border-border mt-1 border-t pt-2'
												]}
											>
												{opt}
											</button>
										{/each}
									</Popover_.Content>
								</Popover_.Root>
							</div>
						</div>
					</div>
				</Sidebar_.Content>

				<main class="bg-background flex-1 overflow-y-auto">
					<!-- Topbar: skeleton -->
					<div class="border-border flex h-13 items-center gap-3 border-b px-6">
						<div class="bg-muted h-3.5 w-28 rounded-full"></div>
						<div class="ml-auto flex items-center gap-2">
							<div class="bg-muted/60 h-8 w-40 rounded-full"></div>
							<div class="bg-muted h-8 w-20 rounded-full"></div>
						</div>
					</div>

					<!-- Content: skeleton -->
					<div class="mx-auto w-full max-w-5xl p-6">
						<div class="bg-muted/60 h-2.5 w-20 rounded-full"></div>
						<div class="mt-4 grid grid-cols-3 gap-4">
							{#each ['w-20', 'w-16', 'w-24'] as vw, i (i)}
								<div class="border-border bg-card rounded-lg border p-4">
									<div class="bg-muted/60 h-2.5 w-24 rounded-full"></div>
									<div class={['bg-muted mt-3 h-7 rounded-md', vw]}></div>
									<div class="bg-muted/60 mt-3 h-2.5 w-28 rounded-full"></div>
								</div>
							{/each}
						</div>

						<div class="border-border bg-card mt-6 rounded-lg border">
							<div class="border-border flex items-center justify-between border-b px-4 py-3">
								<div class="bg-muted h-3 w-28 rounded-full"></div>
								<div class="bg-muted/60 h-2.5 w-12 rounded-full"></div>
							</div>
							<div class="divide-border divide-y">
								{#each Array.from({ length: 7 }, (_, i) => i) as i (i)}
									{@const w = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20'][i % 6]}
									<div class="flex items-center gap-3 px-4 py-3">
										<div class="bg-muted h-2 w-2 shrink-0 rounded-full"></div>
										<div class="min-w-0 flex-1 space-y-1.5">
											<div class={['bg-muted h-3 rounded-full', w]}></div>
											<div class="bg-muted/60 h-2.5 w-40 rounded-full"></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</main>
			</div>
		{/snippet}
	</Sidebar_.Root>
</Story>
