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
