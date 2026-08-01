<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Breadcrumb as BreadcrumbModule } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Breadcrumb',
		parameters: { layout: 'centered' },
		args: {
			separator: '/'
		},
		argTypes: {
			separator: {
				control: 'select',
				options: ['/', '›', '»', '•', '>'],
				description: 'Character used between breadcrumb items'
			}
		}
	});
</script>

{#snippet chevron()}
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="size-3.5"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
{/snippet}

<Story name="Basic">
	{#snippet template(args)}
		<BreadcrumbModule.Root>
			<BreadcrumbModule.Item href="/">Home</BreadcrumbModule.Item>
			<BreadcrumbModule.Separator>{args.separator}</BreadcrumbModule.Separator>
			<BreadcrumbModule.Item href="/vehicles">Vehicles</BreadcrumbModule.Item>
			<BreadcrumbModule.Separator>{args.separator}</BreadcrumbModule.Separator>
			<BreadcrumbModule.Item href="/vehicles/cars">Cars</BreadcrumbModule.Item>
		</BreadcrumbModule.Root>
	{/snippet}
</Story>

<!-- Real-world scene: breadcrumb trail sitting above a page title, the way it
     appears in an app header. The last item is the current page (no href). -->
<Story name="Page Header">
	<div class="w-96 space-y-3">
		<BreadcrumbModule.Root>
			<BreadcrumbModule.Item href="/">Dashboard</BreadcrumbModule.Item>
			<BreadcrumbModule.Separator>{@render chevron()}</BreadcrumbModule.Separator>
			<BreadcrumbModule.Item href="/team">Team</BreadcrumbModule.Item>
			<BreadcrumbModule.Separator>{@render chevron()}</BreadcrumbModule.Separator>
			<BreadcrumbModule.Item>Members</BreadcrumbModule.Item>
		</BreadcrumbModule.Root>
		<div>
			<h1 class="text-foreground text-xl font-semibold">Members</h1>
			<p class="text-muted-foreground text-sm">Manage who has access to this workspace.</p>
		</div>
	</div>
</Story>

<Story name="Short">
	<BreadcrumbModule.Root>
		<BreadcrumbModule.Item href="/">Home</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator />
		<BreadcrumbModule.Item href="/settings">Settings</BreadcrumbModule.Item>
	</BreadcrumbModule.Root>
</Story>

<Story name="Chevron Separator">
	<BreadcrumbModule.Root>
		<BreadcrumbModule.Item href="/">Home</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator>{@render chevron()}</BreadcrumbModule.Separator>
		<BreadcrumbModule.Item href="/products">Products</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator>{@render chevron()}</BreadcrumbModule.Separator>
		<BreadcrumbModule.Item href="/products/electronics">Electronics</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator>{@render chevron()}</BreadcrumbModule.Separator>
		<BreadcrumbModule.Item href="/products/electronics/laptops">Laptops</BreadcrumbModule.Item>
	</BreadcrumbModule.Root>
</Story>
