<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Divider } from '..';

	const { Story } = defineMeta({
		title: 'Atoms/Divider',
		parameters: { layout: 'centered' },
		args: { vertical: false, transparent: false },
		argTypes: {
			vertical: {
				control: 'boolean',
				description: 'Switches from a horizontal rule to a vertical separator.'
			},
			transparent: {
				control: 'boolean',
				description: 'Preserves layout spacing while hiding the separator surface.'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="w-80">
			<p class="text-sm font-medium">Section heading</p>
			<Divider {...args} />
			<p class="text-muted-foreground text-sm">Separated content keeps its normal rhythm.</p>
		</div>
	{/snippet}
</Story>

<Story name="Vertical">
	<div class="flex h-16 items-center">
		<span class="text-sm">Overview</span>
		<Divider vertical />
		<span class="text-sm">Activity</span>
		<Divider vertical />
		<span class="text-sm">Settings</span>
	</div>
</Story>

<!-- Real-world use: metadata groups in a compact account summary. -->
<Story name="Account Summary">
	<div class="border-border bg-card w-96 rounded-lg border p-4">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm font-medium">Personal workspace</p>
				<p class="text-muted-foreground text-xs">Updated a moment ago</p>
			</div>
			<span class="text-sm font-medium">Pro</span>
		</div>
		<Divider />
		<div class="grid grid-cols-3 gap-3 text-center">
			<div>
				<p class="text-lg font-semibold">12</p>
				<p class="text-muted-foreground text-xs">Projects</p>
			</div>
			<div>
				<p class="text-lg font-semibold">4</p>
				<p class="text-muted-foreground text-xs">Members</p>
			</div>
			<div>
				<p class="text-lg font-semibold">83%</p>
				<p class="text-muted-foreground text-xs">Storage</p>
			</div>
		</div>
	</div>
</Story>
