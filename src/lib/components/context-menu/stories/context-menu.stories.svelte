<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ContextMenu as AContextMenu } from '..';
	import { Button } from '../../button';
	import { Avatar } from '../../avatar';
	import { DataGrid as ADataGrid } from '../../datagrid';
	import CopyIcon from '$svelte-atoms/core/icons/icon-copy.svelte';
	import CloseIcon from '$svelte-atoms/core/icons/icon-close.svelte';
	import MoreIcon from '$svelte-atoms/core/icons/icon-more-vert.svelte';
	import ArrowIcon from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { Icon } from '../../icon';

	const { Story } = defineMeta({
		title: 'Atoms/ContextMenu',
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			disabled: false,
			placement: 'bottom-start'
		},
		argTypes: {
			disabled: {
				control: 'boolean',
				description: 'Disable the context menu so right-clicking does nothing'
			},
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
				description: 'Preferred placement of the menu relative to the cursor position'
			}
		}
	});
</script>

<script lang="ts">
	// Basic story state
	let basicAction = $state('');
	let zoneAction = $state('');

	// Button story state
	let buttonAction = $state('');

	// Input story state
	let inputValue = $state('Right-click this input…');
	let inputAction = $state('');

	// Avatar story state
	const users = $state([
		{ name: 'Alice Chen', role: 'Engineer', src: '' },
		{ name: 'Bob Martinez', role: 'Designer', src: '' },
		{ name: 'Charlie Kim', role: 'Product', src: '' }
	]);
	let avatarAction = $state('');

	// Datagrid story state
	let rows = $state([
		{ id: 1, name: 'Alice Chen', role: 'Engineer', email: 'alice@example.com' },
		{ id: 2, name: 'Bob Martinez', role: 'Designer', email: 'bob@example.com' },
		{ id: 3, name: 'Charlie Kim', role: 'Product', email: 'charlie@example.com' },
		{ id: 4, name: 'Dana White', role: 'Marketing', email: 'dana@example.com' },
		{ id: 5, name: 'Eve Johnson', role: 'Sales', email: 'eve@example.com' }
	]);
	let contextRow = $state('');

	// Image story state
	const images = $state([
		{ id: 1, src: 'https://picsum.photos/seed/forest/400/300', alt: 'Forest', label: 'Forest' },
		{ id: 2, src: 'https://picsum.photos/seed/ocean/400/300', alt: 'Ocean', label: 'Ocean' },
		{
			id: 3,
			src: 'https://picsum.photos/seed/mountain/400/300',
			alt: 'Mountain',
			label: 'Mountain'
		},
		{ id: 4, src: 'https://picsum.photos/seed/city/400/300', alt: 'City', label: 'City' }
	]);
	let imageAction = $state('');
</script>

<!-- Default (configurable) -->
<Story name="Basic" args={{ disabled: false, placement: 'bottom-start' }}>
	{#snippet template(args)}
		<div class="flex h-screen flex-col items-center justify-center gap-4">
			<AContextMenu.Root disabled={args.disabled} placement={args.placement}>
				<AContextMenu.Trigger>
					<div
						class="flex h-40 w-72 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted text-sm font-medium"
					>
						Right-click to open the context menu
					</div>
				</AContextMenu.Trigger>
				<AContextMenu.Content
					preset="context-menu.content"
					class="min-w-48 rounded-lg border bg-popover shadow-sm"
				>
					<AContextMenu.Item
						preset="context-menu.item"
						class="flex items-center gap-2 border-none"
						onclick={() => (basicAction = 'Copy')}
					>
						<Icon src={CopyIcon} class="size-4 text-muted-foreground" />
						Copy
					</AContextMenu.Item>
					<AContextMenu.Item
						preset="context-menu.item"
						class="flex items-center gap-2 border-none"
						onclick={() => (basicAction = 'Paste')}
					>
						<Icon src={MoreIcon} class="size-4 text-muted-foreground" />
						Paste
					</AContextMenu.Item>
					<AContextMenu.Divider />
					<AContextMenu.Item
						preset="context-menu.item"
						class="flex items-center gap-2 border-none text-destructive"
						onclick={() => (basicAction = 'Delete')}
					>
						<Icon src={CloseIcon} class="size-4" />
						Delete
					</AContextMenu.Item>
				</AContextMenu.Content>
			</AContextMenu.Root>
			<p class="text-sm text-muted-foreground">
				Last action: <strong>{basicAction || '—'}</strong>
			</p>
		</div>
	{/snippet}
</Story>

<!-- Basic zone -->
<Story name="Basic Zone" args={{}}>
	<div class="flex flex-col items-start gap-4">
		<AContextMenu.Root>
			<AContextMenu.Trigger>
				<div
					class="flex h-40 w-72 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted text-sm font-medium"
				>
					Right-click to open the context menu
				</div>
			</AContextMenu.Trigger>
			<AContextMenu.Content
				preset="context-menu.content"
				class="min-w-48 rounded-lg border bg-popover shadow-sm"
			>
				<AContextMenu.Item
					preset="context-menu.item"
					class="border-none"
					onclick={() => (zoneAction = 'Copy')}>Copy</AContextMenu.Item
				>
				<AContextMenu.Item
					preset="context-menu.item"
					class="border-none"
					onclick={() => (zoneAction = 'Paste')}>Paste</AContextMenu.Item
				>
				<AContextMenu.Divider />
				<AContextMenu.Item
					preset="context-menu.item"
					class="border-none text-destructive"
					onclick={() => (zoneAction = 'Delete')}>Delete</AContextMenu.Item
				>
			</AContextMenu.Content>
		</AContextMenu.Root>
		<p class="text-sm text-muted-foreground">Last action: <strong>{zoneAction || '—'}</strong></p>
	</div>
</Story>

<!-- Button -->
<Story name="On Button" args={{}}>
	<div class="flex flex-col items-center gap-4">
		<p class="text-sm text-muted-foreground">Right-click the button to see its context menu</p>

		<AContextMenu.Root>
			<AContextMenu.Trigger base={Button} variant="outline" class="gap-2 px-3">
				Edit Document
				<Icon src={ArrowIcon} class="size-4" />
			</AContextMenu.Trigger>

			<AContextMenu.Content
				preset="context-menu.content"
				class="min-w-44 rounded-lg border bg-popover shadow-sm"
			>
				<AContextMenu.Item
					preset="context-menu.item"
					class="flex items-center gap-2 border-none"
					onclick={() => (buttonAction = 'copy')}
				>
					<Icon src={CopyIcon} class="size-4 text-muted-foreground" />
					Copy link
				</AContextMenu.Item>
				<AContextMenu.Item
					preset="context-menu.item"
					class="flex items-center gap-2 border-none"
					onclick={() => (buttonAction = 'open-new-tab')}
				>
					<Icon src={MoreIcon} class="size-4 text-muted-foreground" />
					Open in new tab
				</AContextMenu.Item>
				<AContextMenu.Divider />
				<AContextMenu.Item
					preset="context-menu.item"
					class="flex items-center gap-2 border-none text-destructive"
					onclick={() => (buttonAction = 'remove')}
				>
					<Icon src={CloseIcon} class="size-4" />
					Remove
				</AContextMenu.Item>
			</AContextMenu.Content>
		</AContextMenu.Root>

		{#if buttonAction}
			<p class="text-sm">Last action: <strong>{buttonAction}</strong></p>
		{/if}
	</div>
</Story>

<!-- Input -->
<Story name="On Input" args={{}}>
	<div class="flex w-80 flex-col gap-4">
		<p class="text-sm text-muted-foreground">Right-click the input for text actions</p>

		<AContextMenu.Root>
			<AContextMenu.Trigger>
				<input
					bind:value={inputValue}
					placeholder="Right-click me…"
					class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				/>
			</AContextMenu.Trigger>

			<AContextMenu.Content
				preset="context-menu.content"
				class="min-w-44 rounded-lg border bg-popover shadow-sm"
			>
				<AContextMenu.Item
					preset="context-menu.item"
					class="flex items-center gap-2 border-none"
					onclick={() => {
						navigator.clipboard?.writeText(inputValue);
						inputAction = 'copied';
					}}
				>
					<Icon src={CopyIcon} class="size-4 text-muted-foreground" />
					Copy
				</AContextMenu.Item>
				<AContextMenu.Item
					preset="context-menu.item"
					class="flex items-center gap-2 border-none"
					onclick={async () => {
						const text = await navigator.clipboard?.readText();
						if (text) inputValue = text;
						inputAction = 'pasted';
					}}
				>
					<Icon src={MoreIcon} class="size-4 text-muted-foreground" />
					Paste
				</AContextMenu.Item>
				<AContextMenu.Divider />
				<AContextMenu.Item
					preset="context-menu.item"
					class="flex items-center gap-2 border-none text-destructive"
					onclick={() => {
						inputValue = '';
						inputAction = 'cleared';
					}}
				>
					<Icon src={CloseIcon} class="size-4" />
					Clear
				</AContextMenu.Item>
			</AContextMenu.Content>
		</AContextMenu.Root>

		{#if inputAction}
			<p class="text-sm text-muted-foreground">Last action: <strong>{inputAction}</strong></p>
		{/if}
	</div>
</Story>

<!-- Avatar -->
<Story name="On Avatar" args={{}}>
	<div class="flex flex-col items-center gap-6">
		<p class="text-sm text-muted-foreground">Right-click an avatar for profile actions</p>

		<div class="flex items-center gap-4">
			{#each users as user (user.name)}
				<AContextMenu.Root>
					<AContextMenu.Trigger>
						<div class="flex cursor-context-menu flex-col items-center gap-1">
							<Avatar
								alt={user.name}
								class="size-12 ring-2 ring-transparent transition-all hover:ring-primary"
							/>
							<span class="text-xs font-medium">{user.name.split(' ')[0]}</span>
						</div>
					</AContextMenu.Trigger>

					<AContextMenu.Content
						preset="context-menu.content"
						class="min-w-44 rounded-lg border bg-popover shadow-sm"
					>
						<div class="border-b px-3 py-2">
							<p class="text-sm font-semibold">{user.name}</p>
							<p class="text-xs text-muted-foreground">{user.role}</p>
						</div>
						<AContextMenu.Item
							preset="context-menu.item"
							class="flex items-center gap-2 border-none"
							onclick={() => (avatarAction = `View ${user.name}`)}
						>
							<Icon src={ArrowIcon} class="size-4 text-muted-foreground" />
							View profile
						</AContextMenu.Item>
						<AContextMenu.Item
							preset="context-menu.item"
							class="flex items-center gap-2 border-none"
							onclick={() => (avatarAction = `Message ${user.name}`)}
						>
							<Icon src={CopyIcon} class="size-4 text-muted-foreground" />
							Send message
						</AContextMenu.Item>
						<AContextMenu.Divider />
						<AContextMenu.Item
							preset="context-menu.item"
							class="flex items-center gap-2 border-none text-destructive"
							onclick={() => (avatarAction = `Remove ${user.name}`)}
						>
							<Icon src={CloseIcon} class="size-4" />
							Remove user
						</AContextMenu.Item>
					</AContextMenu.Content>
				</AContextMenu.Root>
			{/each}
		</div>

		{#if avatarAction}
			<p class="text-sm text-muted-foreground">Last action: <strong>{avatarAction}</strong></p>
		{/if}
	</div>
</Story>

<!-- Datagrid row -->
<Story name="On Datagrid Row" args={{}}>
	<div class="w-full max-w-2xl">
		<p class="mb-4 text-sm text-muted-foreground">Right-click any row for row-level actions</p>

		<ADataGrid.Root class="w-full rounded-lg border">
			<ADataGrid.Header>
				<ADataGrid.Row header>
					<ADataGrid.Column>Name</ADataGrid.Column>
					<ADataGrid.Column>Role</ADataGrid.Column>
					<ADataGrid.Column>Email</ADataGrid.Column>
				</ADataGrid.Row>
			</ADataGrid.Header>

			<ADataGrid.Body>
				{#each rows as row (row.id)}
					<AContextMenu.Root>
						<AContextMenu.Trigger
							base={ADataGrid.Row}
							class="cursor-context-menu transition-colors hover:bg-muted/50 rounded-none px-4"
						>
							<ADataGrid.Cell>{row.name}</ADataGrid.Cell>
							<ADataGrid.Cell>{row.role}</ADataGrid.Cell>
							<ADataGrid.Cell class="text-muted-foreground">{row.email}</ADataGrid.Cell>
						</AContextMenu.Trigger>

						<AContextMenu.Content
							preset="context-menu.content"
							class="min-w-44 rounded-lg border bg-popover shadow-sm p-0"
						>
							<div class="border-b border-border px-3 py-2">
								<p class="text-xs font-semibold text-muted-foreground">
									Row #{row.id} — {row.name}
								</p>
							</div>
							<AContextMenu.Item
								preset="context-menu.item"
								class="flex items-center gap-2 border-none"
								onclick={() => console.log('Edit', row)}
							>
								<Icon src={ArrowIcon} class="size-4 text-muted-foreground" />
								Edit row
							</AContextMenu.Item>
							<AContextMenu.Item
								preset="context-menu.item"
								class="flex items-center gap-2 border-none"
								onclick={() => navigator.clipboard?.writeText(row.email)}
							>
								<Icon src={CopyIcon} class="size-4 text-muted-foreground" />
								Copy email
							</AContextMenu.Item>
							<AContextMenu.Divider />
							<AContextMenu.Item
								preset="context-menu.item"
								class="flex items-center gap-2 border-none text-destructive"
								onclick={() => {
									rows = rows.filter((r) => r.id !== row.id);
									contextRow = row.name;
								}}
							>
								<Icon src={CloseIcon} class="size-4" />
								Delete row
							</AContextMenu.Item>
						</AContextMenu.Content>
					</AContextMenu.Root>
				{/each}
			</ADataGrid.Body>
		</ADataGrid.Root>

		{#if contextRow}
			<p class="mt-3 text-sm text-muted-foreground">Last deleted: <strong>{contextRow}</strong></p>
		{/if}
	</div>
</Story>

<!-- Image gallery -->
<Story name="On Image Gallery" args={{}}>
	<div class="flex w-full max-w-2xl flex-col items-center gap-4">
		<p class="text-sm text-muted-foreground">Right-click an image for media actions</p>

		<div class="grid w-full grid-cols-2 gap-3">
			{#each images as image (image.id)}
				<AContextMenu.Root>
					<AContextMenu.Trigger
						class="group relative w-64 cursor-context-menu overflow-hidden rounded-lg border border-border p-0"
					>
						<img
							src={image.src}
							alt={image.alt}
							width="256"
							height="144"
							class="h-36 w-64 object-cover transition-transform group-hover:scale-105"
						/>
						<div
							class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2"
						>
							<span class="text-xs font-medium text-white">{image.label}</span>
						</div>
					</AContextMenu.Trigger>

					<AContextMenu.Content
						preset="context-menu.content"
						class="min-w-44 rounded-lg border bg-popover/70 shadow-sm backdrop-blur-xs"
					>
						<AContextMenu.Item
							preset="context-menu.item"
							class="flex items-center gap-2 border-none"
							onclick={() => {
								navigator.clipboard?.writeText(image.src);
								imageAction = `Copied URL: ${image.label}`;
							}}
						>
							<Icon src={CopyIcon} class="size-4 text-muted-foreground" />
							Copy image URL
						</AContextMenu.Item>
						<AContextMenu.Item
							preset="context-menu.item"
							class="flex items-center gap-2 border-none"
							onclick={() => {
								const a = document.createElement('a');
								a.href = image.src;
								a.download = image.label;
								a.click();
								imageAction = `Downloaded: ${image.label}`;
							}}
						>
							<Icon src={ArrowIcon} class="size-4 text-muted-foreground" />
							Download
						</AContextMenu.Item>
						<AContextMenu.Item
							preset="context-menu.item"
							class="flex items-center gap-2 border-none"
							onclick={() => (imageAction = `Open: ${image.label}`)}
						>
							<Icon src={MoreIcon} class="size-4 text-muted-foreground" />
							Open full size
						</AContextMenu.Item>
						<AContextMenu.Divider />
						<AContextMenu.Item
							preset="context-menu.item"
							class="flex items-center gap-2 border-none text-destructive"
							onclick={() => {
								images.splice(
									images.findIndex((i) => i.id === image.id),
									1
								);
								imageAction = `Deleted: ${image.label}`;
							}}
						>
							<Icon src={CloseIcon} class="size-4" />
							Delete image
						</AContextMenu.Item>
					</AContextMenu.Content>
				</AContextMenu.Root>
			{/each}
		</div>

		{#if imageAction}
			<p class="text-sm text-muted-foreground">Last action: <strong>{imageAction}</strong></p>
		{/if}
	</div>
</Story>
