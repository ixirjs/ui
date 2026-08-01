<script module>
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

<Story name="Basic">
	{#snippet template(args)}
		<div class="w-64 p-4">
			<Tree_.Root bind:open={args.open} disabled={args.disabled}>
				<Tree_.Header class="flex items-center gap-2 rounded px-2 py-1 hover:bg-foreground/5">
					<Tree_.Indicator class="text-muted-foreground">
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
					</Tree_.Indicator>
					<span class="text-sm font-medium select-none">Vehicles</span>
				</Tree_.Header>
				<Tree_.Body class="border-l border-l-border">
					<Tree_.Root>
						<Tree_.Header class="flex items-center gap-2 rounded px-2 py-1 hover:bg-foreground/5">
							<Tree_.Indicator class="text-muted-foreground">
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
							</Tree_.Indicator>
							<span class="text-sm select-none">Cars</span>
						</Tree_.Header>
						<Tree_.Body class="border-l border-l-border">
							<div class="px-2 py-1 text-sm text-muted-foreground">Sedan</div>
							<div class="px-2 py-1 text-sm text-muted-foreground">SUV</div>
							<div class="px-2 py-1 text-sm text-muted-foreground">Hatchback</div>
						</Tree_.Body>
					</Tree_.Root>

					<Tree_.Root>
						<Tree_.Header class="flex items-center gap-2 rounded px-2 py-1 hover:bg-foreground/5">
							<Tree_.Indicator class="text-muted-foreground">
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
							</Tree_.Indicator>
							<span class="text-sm select-none">Trucks</span>
						</Tree_.Header>
						<Tree_.Body class="border-l border-l-border">
							<div class="px-2 py-1 text-sm text-muted-foreground">Pickup</div>
							<div class="px-2 py-1 text-sm text-muted-foreground">Semi</div>
						</Tree_.Body>
					</Tree_.Root>

					<Tree_.Root>
						<Tree_.Header class="flex items-center gap-2 rounded px-2 py-1 hover:bg-foreground/5">
							<Tree_.Indicator class="text-muted-foreground">
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
							</Tree_.Indicator>
							<span class="text-sm select-none">Bikes</span>
						</Tree_.Header>
						<Tree_.Body class="border-l border-l-border">
							<div class="px-2 py-1 text-sm text-muted-foreground">Road</div>
							<div class="px-2 py-1 text-sm text-muted-foreground">Mountain</div>
						</Tree_.Body>
					</Tree_.Root>
				</Tree_.Body>
			</Tree_.Root>
		</div>
	{/snippet}
</Story>

<Story name="FileSystem">
	<div class="w-72 p-4">
		<Tree_.Root open>
			<Tree_.Header class="flex items-center gap-1 rounded px-2 py-1 hover:bg-foreground/5">
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
			<Tree_.Body class="border-l border-l-border">
				<Tree_.Root open>
					<Tree_.Header class="flex items-center gap-1 rounded px-2 py-1 hover:bg-foreground/5">
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
							<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
							></path>
						</svg>
						<span class="text-sm select-none">components</span>
					</Tree_.Header>
					<Tree_.Body class="border-l border-l-border">
						<div class="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground">
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
							Button.svelte
						</div>
						<div class="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground">
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
							Input.svelte
						</div>
					</Tree_.Body>
				</Tree_.Root>
				<Tree_.Root>
					<Tree_.Header class="flex items-center gap-1 rounded px-2 py-1 hover:bg-foreground/5">
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
							<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
							></path>
						</svg>
						<span class="text-sm select-none">utils</span>
					</Tree_.Header>
					<Tree_.Body class="border-l border-l-border">
						<div class="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground">
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
							helpers.ts
						</div>
					</Tree_.Body>
				</Tree_.Root>
				<div class="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground">
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
					App.svelte
				</div>
			</Tree_.Body>
		</Tree_.Root>
	</div>
</Story>

<Story name="Disabled">
	<div class="w-64 p-4">
		<Tree_.Root open disabled>
			<Tree_.Header class="flex items-center gap-2 rounded px-2 py-1 opacity-50 cursor-not-allowed">
				<span class="text-sm font-medium select-none">Vehicles (disabled)</span>
			</Tree_.Header>
			<Tree_.Body class="border-l border-l-border">
				<div class="px-2 py-1 text-sm text-muted-foreground/60">Cars</div>
				<div class="px-2 py-1 text-sm text-muted-foreground/60">Trucks</div>
				<div class="px-2 py-1 text-sm text-muted-foreground/60">Bikes</div>
			</Tree_.Body>
		</Tree_.Root>
	</div>
</Story>
