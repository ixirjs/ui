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
	import { animateDrawerContent } from '../motion';

	let isOpen = $state(false);
</script>

<Story name="Basic">
	{#snippet template(args)}
		{@const side = args.side as 'left' | 'right' | 'top' | 'bottom'}
		{@const disabled = args.disabled as boolean}

		<div class="relative flex h-screen w-full items-start justify-start p-8">
			<Drawer_.Root bind:open={isOpen} {side} {disabled}>
				<Drawer_.Backdrop class="bg-black/40 backdrop-blur-sm" />
				<Drawer_.Content
					class="flex h-full w-80 flex-col border-r shadow-sm"
					animate={animateDrawerContent()}
					{@attach clickoutDrawer((_, bond) => {
						bond?.state?.close?.();
					})}
				>
					<Drawer_.Header>
						<div class="flex flex-col gap-1">
							<Drawer_.Title>Navigation</Drawer_.Title>
							<Drawer_.Description>Browse available sections.</Drawer_.Description>
						</div>
						<button
							class="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
							onclick={() => (isOpen = false)}
							aria-label="Close drawer"
						>
							&#x2715;
						</button>
					</Drawer_.Header>
					<Drawer_.Body class="flex-1 overflow-y-auto px-4 py-4">
						<nav class="flex flex-col gap-1">
							{#each ['Dashboard', 'Projects', 'Team', 'Settings', 'Help'] as item (item)}
								<button
									class="hover:bg-muted text-foreground rounded-md px-3 py-2 text-left text-sm transition-colors"
								>
									{item}
								</button>
							{/each}
						</nav>
					</Drawer_.Body>
					<Drawer_.Footer>
						<button
							class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
							onclick={() => (isOpen = false)}
						>
							Close
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
				Open Drawer ({args.side})
			</button>
		</div>
	{/snippet}
</Story>

<Story name="Left">
	<div class="relative flex h-screen w-full items-start justify-start p-8">
		<Drawer_.Root bind:open={isOpen} side="left">
			<Drawer_.Backdrop class="bg-black/40 backdrop-blur-sm" />
			<Drawer_.Content
				class="flex h-full w-80 flex-col border-r shadow-sm"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.state?.close?.();
				})}
			>
				<Drawer_.Header>
					<div class="flex flex-col gap-1">
						<Drawer_.Title>Navigation</Drawer_.Title>
						<Drawer_.Description>Browse available sections.</Drawer_.Description>
					</div>
					<button
						class="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
						onclick={() => (isOpen = false)}
						aria-label="Close drawer"
					>
						&#x2715;
					</button>
				</Drawer_.Header>
				<Drawer_.Body class="flex-1 overflow-y-auto px-4 py-4">
					<nav class="flex flex-col gap-1">
						{#each ['Dashboard', 'Projects', 'Team', 'Settings', 'Help'] as item (item)}
							<button
								class="hover:bg-muted text-foreground rounded-md px-3 py-2 text-left text-sm transition-colors"
							>
								{item}
							</button>
						{/each}
					</nav>
				</Drawer_.Body>
				<Drawer_.Footer>
					<button
						class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
						onclick={() => (isOpen = false)}
					>
						Close
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
			Open Left Drawer
		</button>
	</div>
</Story>

<Story name="Right">
	<div class="relative flex h-screen w-full items-start justify-end p-8">
		<Drawer_.Root bind:open={isOpen} side="right">
			<Drawer_.Backdrop class="bg-black/40 backdrop-blur-sm" />
			<Drawer_.Content
				class="flex h-full w-80 flex-col border-l shadow-sm"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.state?.close?.();
				})}
			>
				<Drawer_.Header>
					<div class="flex flex-col gap-1">
						<Drawer_.Title>Notifications</Drawer_.Title>
						<Drawer_.Description>Your recent activity.</Drawer_.Description>
					</div>
					<button
						class="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
						onclick={() => (isOpen = false)}
						aria-label="Close drawer"
					>
						&#x2715;
					</button>
				</Drawer_.Header>
				<Drawer_.Body class="flex-1 overflow-y-auto px-4 py-4">
					<div class="flex flex-col gap-3">
						{#each ['Deploy succeeded — production', 'New comment on PR #42', 'Scheduled maintenance tonight', 'Invite accepted by Alex'] as note (note)}
							<div class="bg-muted rounded-md px-3 py-2 text-sm">{note}</div>
						{/each}
					</div>
				</Drawer_.Body>
				<Drawer_.Footer>
					<button
						class="text-muted-foreground hover:text-foreground w-full text-center text-sm transition-colors"
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
			<Drawer_.Backdrop class="bg-black/40 backdrop-blur-sm" />
			<Drawer_.Content
				class="flex w-full flex-col border-b p-6 shadow-sm"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.state?.close?.();
				})}
			>
				<Drawer_.Header class="mb-4 flex items-center justify-between">
					<div class="flex flex-col gap-1">
						<Drawer_.Title>Search</Drawer_.Title>
						<Drawer_.Description>Find anything in your workspace.</Drawer_.Description>
					</div>
					<button
						class="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
						onclick={() => (isOpen = false)}
						aria-label="Close drawer"
					>
						&#x2715;
					</button>
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
			<Drawer_.Backdrop class="bg-black/40 backdrop-blur-sm" />
			<Drawer_.Content
				class="flex w-full flex-col border-t p-6 shadow-sm"
				animate={animateDrawerContent()}
				{@attach clickoutDrawer((_, bond) => {
					bond?.state?.close?.();
				})}
			>
				<Drawer_.Header class="mb-4 flex items-center justify-between">
					<div class="flex flex-col gap-1">
						<Drawer_.Title>Share</Drawer_.Title>
						<Drawer_.Description>Share this item with others.</Drawer_.Description>
					</div>
					<button
						class="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
						onclick={() => (isOpen = false)}
						aria-label="Close drawer"
					>
						&#x2715;
					</button>
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
