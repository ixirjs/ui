<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Tree as Tree_ } from '..';

	// https://storybook.js.org/docs/writing-stories
	const { Story } = defineMeta({
		title: 'Atoms/Tree',
		// Autodocs: https://storybook.js.org/docs/writing-docs/autodocs

		parameters: {
			// https://storybook.js.org/docs/configure/story-layout
			layout: 'centered'
		},
		args: {
			open: true,
			disabled: false
		},
		argTypes: {
			open: {
				control: 'boolean',
				description: 'Whether the tree node is expanded'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable interaction with the tree node'
			}
		}
	});
</script>

<!-- Shared inline icons, reused across the stories below to avoid repeated SVG walls. -->
{#snippet chevron()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<polyline points="9 18 15 12 9 6"></polyline>
	</svg>
{/snippet}

{#snippet folderIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
	</svg>
{/snippet}

{#snippet fileIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
		<polyline points="13 2 13 9 20 9"></polyline>
	</svg>
{/snippet}

<Story name="Basic">
	{#snippet template(args)}
		{@const groups = [
			{ label: 'Cars', items: ['Sedan', 'SUV', 'Hatchback'] },
			{ label: 'Trucks', items: ['Pickup', 'Semi'] },
			{ label: 'Bikes', items: ['Road', 'Mountain'] }
		]}
		<div class="w-64 p-4">
			<Tree_.Root bind:open={args.open} disabled={args.disabled}>
				<Tree_.Header>
					<Tree_.Indicator>{@render chevron()}</Tree_.Indicator>
					<span class="text-sm font-medium select-none">Vehicles</span>
				</Tree_.Header>
				<Tree_.Body>
					{#each groups as group (group.label)}
						<Tree_.Root>
							<Tree_.Header>
								<Tree_.Indicator>{@render chevron()}</Tree_.Indicator>
								<span class="text-sm select-none">{group.label}</span>
							</Tree_.Header>
							<Tree_.Body>
								{#each group.items as item (item)}
									<div class="px-2 py-1 text-sm text-muted-foreground">{item}</div>
								{/each}
							</Tree_.Body>
						</Tree_.Root>
					{/each}
				</Tree_.Body>
			</Tree_.Root>
		</div>
	{/snippet}
</Story>

{#snippet fileRow(name: string)}
	<div class="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground">
		{@render fileIcon()}
		{name}
	</div>
{/snippet}

<Story name="FileSystem">
	<div class="w-72 p-4">
		<Tree_.Root open>
			<Tree_.Header class="gap-1">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
				<span class="text-sm font-semibold select-none">src</span>
			</Tree_.Header>
			<Tree_.Body>
				<Tree_.Root open>
					<Tree_.Header class="gap-1">
						{@render folderIcon()}
						<span class="text-sm select-none">components</span>
					</Tree_.Header>
					<Tree_.Body>
						{@render fileRow('Button.svelte')}
						{@render fileRow('Input.svelte')}
					</Tree_.Body>
				</Tree_.Root>
				<Tree_.Root>
					<Tree_.Header class="gap-1">
						{@render folderIcon()}
						<span class="text-sm select-none">utils</span>
					</Tree_.Header>
					<Tree_.Body>
						{@render fileRow('helpers.ts')}
					</Tree_.Body>
				</Tree_.Root>
				{@render fileRow('App.svelte')}
			</Tree_.Body>
		</Tree_.Root>
	</div>
</Story>

<Story name="Disabled">
	<div class="w-64 p-4">
		<Tree_.Root open disabled>
			<Tree_.Header class="opacity-50 cursor-not-allowed hover:bg-transparent">
				<span class="text-sm font-medium select-none">Vehicles (disabled)</span>
			</Tree_.Header>
			<Tree_.Body>
				<div class="px-2 py-1 text-sm text-muted-foreground/60">Cars</div>
				<div class="px-2 py-1 text-sm text-muted-foreground/60">Trucks</div>
				<div class="px-2 py-1 text-sm text-muted-foreground/60">Bikes</div>
			</Tree_.Body>
		</Tree_.Root>
	</div>
</Story>
