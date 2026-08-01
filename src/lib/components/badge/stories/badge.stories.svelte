<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Badge } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Badge',
		parameters: { layout: 'centered' },
		args: {
			variant: 'primary'
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['primary', 'secondary', 'destructive', 'outline', 'ghost'],
				description: 'Visual style variant of the badge'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<Badge {...args}>New</Badge>
	{/snippet}
</Story>

<Story name="Variants">
	<div class="flex flex-wrap items-center gap-3">
		<Badge variant="primary">Primary</Badge>
		<Badge variant="secondary">Secondary</Badge>
		<Badge variant="destructive">Destructive</Badge>
		<Badge variant="outline">Outline</Badge>
		<Badge variant="ghost">Ghost</Badge>
	</div>
</Story>

<Story name="Labels">
	<div class="flex flex-wrap items-center gap-3">
		<Badge variant="primary">New</Badge>
		<Badge variant="secondary">Beta</Badge>
		<Badge variant="destructive">Deprecated</Badge>
		<Badge variant="outline">Stable</Badge>
		<Badge variant="ghost">Draft</Badge>
	</div>
</Story>

<Story name="Release List">
	<!-- Real-world use case: a changelog list where each entry carries a status badge -->
	<ul class="w-96 divide-y rounded-xl border">
		<li class="flex items-center justify-between p-3">
			<div>
				<p class="text-sm font-medium">Command palette</p>
				<p class="text-muted-foreground text-xs">v2.4.0</p>
			</div>
			<Badge variant="primary">New</Badge>
		</li>
		<li class="flex items-center justify-between p-3">
			<div>
				<p class="text-sm font-medium">Realtime sync</p>
				<p class="text-muted-foreground text-xs">v2.3.1</p>
			</div>
			<Badge variant="secondary">Beta</Badge>
		</li>
		<li class="flex items-center justify-between p-3">
			<div>
				<p class="text-sm font-medium">Legacy export API</p>
				<p class="text-muted-foreground text-xs">v1.9.0</p>
			</div>
			<Badge variant="destructive">Deprecated</Badge>
		</li>
	</ul>
</Story>
