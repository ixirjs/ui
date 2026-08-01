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

<Story name="Short">
	<BreadcrumbModule.Root>
		<BreadcrumbModule.Item href="/">Home</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator />
		<BreadcrumbModule.Item href="/settings">Settings</BreadcrumbModule.Item>
	</BreadcrumbModule.Root>
</Story>

<Story name="Deep Navigation">
	<BreadcrumbModule.Root>
		<BreadcrumbModule.Item href="/">Home</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator />
		<BreadcrumbModule.Item href="/docs">Documentation</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator />
		<BreadcrumbModule.Item href="/docs/components">Components</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator />
		<BreadcrumbModule.Item href="/docs/components/breadcrumb">Breadcrumb</BreadcrumbModule.Item>
	</BreadcrumbModule.Root>
</Story>

<Story name="Chevron Separator">
	<BreadcrumbModule.Root>
		<BreadcrumbModule.Item href="/">Home</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator>›</BreadcrumbModule.Separator>
		<BreadcrumbModule.Item href="/products">Products</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator>›</BreadcrumbModule.Separator>
		<BreadcrumbModule.Item href="/products/electronics">Electronics</BreadcrumbModule.Item>
		<BreadcrumbModule.Separator>›</BreadcrumbModule.Separator>
		<BreadcrumbModule.Item href="/products/electronics/laptops">Laptops</BreadcrumbModule.Item>
	</BreadcrumbModule.Root>
</Story>
