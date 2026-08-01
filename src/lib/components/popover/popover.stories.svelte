<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Popover as Popover_ } from '.';
	import { Dialog as Dialog_ } from '../dialog';
	import { Drawer as Drawer_ } from '../drawer';
	import { Sidebar as Sidebar_ } from '../sidebar';
	import { Button } from '../button';

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
	import { animateDrawerContent } from '../drawer';
	import { animateSidebarContent } from '../sidebar';

	let open = $state(false);
	let isDialogOpen = $state(false);
	let isDrawerOpen = $state(false);
	let isSidebarOpen = $state(true);

	// Real data for the popover menus — the host pages around them are skeletons.
	const options = ['Design', 'Engineering', 'Product', 'Marketing', 'Operations'];
	const sortOptions = ['Name A → Z', 'Name Z → A', 'Date newest', 'Date oldest', 'Priority high → low'];
	let selectedSort = $state('Date newest');
	const settingsOptions = ['Account settings', 'Appearance', 'Notifications', 'Security', 'Billing', 'Sign out'];
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="bg-background bg-dot-grid flex h-screen w-full flex-col items-center justify-center gap-7 p-8">
			<p class="text-muted-foreground text-[11px] font-medium uppercase tracking-[0.25em]">Account</p>

			<Popover_.Root bind:open {...args}>
				<Popover_.Trigger
					class="border-border bg-card hover:border-foreground/40 flex items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-4 text-sm transition-colors"
				>
					<span
						class="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
					>
						JD
					</span>
					<span class="text-foreground font-medium">Jane Doe</span>
					<Popover_.Indicator />
				</Popover_.Trigger>

				<Popover_.Content class="bg-card border-border w-64 rounded-lg border p-0 shadow-sm" autoClose>
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
					<div class="p-1">
						{#each [['👤', 'Profile'], ['⚙️', 'Settings'], ['🔔', 'Notifications'], ['💳', 'Billing']] as [icon, label] (label)}
							<button
								class="hover:bg-muted text-foreground flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-sm transition-colors"
							>
								<span class="shrink-0 text-base">{icon}</span>
								<span class="flex-1">{label}</span>
							</button>
						{/each}
					</div>
					<div class="border-border border-t p-1">
						<button
							class="hover:bg-muted flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-sm text-destructive transition-colors"
						>
							<span class="shrink-0 text-base">↩</span>
							<span class="flex-1">Sign out</span>
						</button>
					</div>
				</Popover_.Content>
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
	<div class="bg-background bg-dot-grid flex h-screen items-center justify-center p-8">
		<Button onclick={() => (isDialogOpen = true)}>Open Dialog</Button>

		<Dialog_.Root bind:open={isDialogOpen}>
			<!-- Dialog Content Portal z-index = 10 -->
			<Dialog_.Content class="relative flex max-h-[85svh] w-120 flex-col overflow-y-auto p-0 shadow-sm">
				<Dialog_.Header
					class="bg-inherit border-border sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b px-5"
				>
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
						<Popover_.Root placement="bottom-start">
							<Popover_.Trigger
								class="border-border hover:border-foreground/40 gap-2 rounded-lg border px-3 py-2 text-sm font-normal transition-colors"
							>
								Category
								<Popover_.Indicator />
							</Popover_.Trigger>
							<!-- z-index=12 lifts the portalled content above the sticky header. -->
							<Popover_.Content class="min-w-60 p-1" z-index={12}>
								{#each options as opt (opt)}
									<button class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm">
										{opt}
									</button>
								{/each}
							</Popover_.Content>
						</Popover_.Root>
					</div>

					<!-- List: skeleton rows, each with a real row-action popover -->
					<div class="space-y-1 px-5 pb-4">
						{#each Array.from({ length: 16 }, (_, i) => i) as i (i)}
							{@const w = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20'][i % 6]}
							<div class="group flex items-center gap-3.5 rounded-lg px-3 py-3">
								<div class="bg-muted h-2 w-2 shrink-0 rounded-full"></div>
								<div class="min-w-0 flex-1 space-y-1.5">
									<div class={['bg-muted h-3 rounded-full', w]}></div>
									<div class="bg-muted/60 h-2.5 w-40 rounded-full"></div>
								</div>
								<Popover_.Root placement="bottom-end" placements={['bottom-end', 'top-end', 'left']}>
									<Popover_.Trigger
										class="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-md p-1.5 opacity-0 transition group-hover:opacity-100"
									>
										⋯
									</Popover_.Trigger>
									<Popover_.Content class="min-w-40 p-1" autoClose>
										{#each ['Edit', 'Duplicate', 'Archive'] as action (action)}
											<button class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm">
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
				<Dialog_.Footer
					class="bg-inherit border-border sticky bottom-0 flex items-center justify-between border-t px-5 py-3.5"
				>
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
				<div class="mt-8 grid min-h-0 flex-1 grid-cols-1 gap-x-10 overflow-y-auto pr-1 sm:grid-cols-2">
					{#each Array.from({ length: 18 }, (_, i) => i) as i (i)}
						{@const w = ['w-28', 'w-36', 'w-24', 'w-32', 'w-40', 'w-20'][i % 6]}
						<div class="group border-border flex items-center gap-3.5 border-b px-2 py-3">
							<div class="bg-muted h-2 w-2 shrink-0 rounded-full"></div>
							<div class="min-w-0 flex-1 space-y-1.5">
								<div class={['bg-muted h-3 rounded-full', w]}></div>
								<div class="bg-muted/60 h-2.5 w-40 rounded-full"></div>
							</div>
							<Popover_.Root placement="bottom-end" placements={['bottom-end', 'top-end', 'left']}>
								<Popover_.Trigger
									class="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-md p-1.5 opacity-0 transition group-hover:opacity-100"
								>
									⋯
								</Popover_.Trigger>
								<Popover_.Content class="min-w-40 p-1" autoClose>
									{#each ['Open', 'Duplicate', 'Archive'] as action (action)}
										<button class="hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm">
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
			<Drawer_.Content
				class="bg-background border-border h-full w-90 overflow-y-auto border-l shadow-sm"
				fallback={{ animate: animateDrawerContent() }}
			>
				<Drawer_.Header
					class="bg-background border-border sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4"
				>
					<Drawer_.Title class="text-base font-semibold tracking-tight">Filters</Drawer_.Title>
					<button
						class="text-muted-foreground hover:text-foreground -mr-1.5 rounded-md p-1.5 leading-none transition-colors"
						onclick={() => (isDrawerOpen = false)}
					>
						✕
					</button>
				</Drawer_.Header>

				<Drawer_.Body class="space-y-7 px-6 py-5">
					<!-- Skeleton search -->
					<div class="bg-muted/60 h-10 rounded-lg"></div>

					<!-- Real Sort popover -->
					<section>
						<p class="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-[0.18em]">
							Sort
						</p>
						<Popover_.Root>
							<Popover_.Trigger
								class="border-border hover:border-foreground/40 w-full justify-between gap-2 rounded-lg border px-3 py-2 text-sm font-normal transition-colors"
							>
								{selectedSort}
								<Popover_.Indicator />
							</Popover_.Trigger>
							<Popover_.Content class="min-w-56 p-1" autoClose z-index={1}>
								{#each sortOptions as opt (opt)}
									<button
										onclick={() => (selectedSort = opt)}
										class={[
											'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm',
											opt === selectedSort ? 'text-primary font-medium' : 'hover:bg-muted'
										]}
									>
										{opt}
										{#if opt === selectedSort}<span class="text-xs">✓</span>{/if}
									</button>
								{/each}
							</Popover_.Content>
						</Popover_.Root>
					</section>

					<!-- Skeleton filter sections -->
					{#each ['Status', 'Range', 'Type', 'Labels', 'Assignee', 'Priority', 'Display', 'Saved views'] as title (title)}
						<section>
							<p class="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-[0.18em]">
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
					class="bg-background border-border sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t px-6 py-4"
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
					class="bg-card border-border shrink-0 border-r"
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
									onclick={() => sidebar.state.toggle()}
									title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
								>
									{isSidebarOpen ? '◀' : '▶'}
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
									<Popover_.Trigger
										class="hover:bg-muted w-full justify-start gap-2.5 rounded-md text-sm font-normal transition-colors"
									>
										<div
											class="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium"
										>
											JD
										</div>
										<div class="min-w-0 text-left">
											<p class="text-foreground truncate text-sm font-medium leading-tight">Jane Doe</p>
											<p class="text-muted-foreground truncate text-xs leading-tight">jane@example.com</p>
										</div>
									</Popover_.Trigger>
									<Popover_.Content class="min-w-52 p-1">
										{#each settingsOptions as opt (opt)}
											<button
												class={[
													'hover:bg-muted block w-full rounded-md px-3 py-1.5 text-left text-sm',
													opt === 'Sign out' && 'text-destructive mt-1 border-t border-border pt-2'
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
								{#each Array.from({ length: 14 }, (_, i) => i) as i (i)}
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
