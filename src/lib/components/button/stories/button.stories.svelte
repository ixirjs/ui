<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ButtonCmp from '$ixirjs/ui/components/button/button.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Button',
		parameters: { layout: 'centered' },
		args: {
			variant: 'primary',
			disabled: false,
			type: 'button'
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['primary', 'secondary', 'destructive', 'outline', 'ghost'],
				description: 'Visual style variant of the button',
				table: { defaultValue: { summary: 'primary' } }
			},
			disabled: {
				control: 'boolean',
				description: 'Disable the button, preventing interaction'
			},
			type: {
				control: 'select',
				options: ['button', 'submit', 'reset'],
				description: 'HTML button type attribute',
				table: { defaultValue: { summary: 'button' } }
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<ButtonCmp {...args}>Click me</ButtonCmp>
	{/snippet}
</Story>

<!-- Real-world scene: a settings card footer where each variant plays its
     natural role — destructive for the dangerous action, ghost to dismiss,
     primary for the confirming action. -->
<Story name="Account Settings">
	<div class="border-border bg-card w-80 rounded-lg border p-4">
		<h3 class="text-foreground text-sm font-semibold">Account</h3>
		<p class="text-muted-foreground mt-1 text-sm">Manage your account and preferences.</p>
		<div class="mt-4 flex items-center justify-between">
			<ButtonCmp variant="destructive">
				<span class="inline-flex items-center gap-2">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-4"
					>
						<path d="M3 6h18" />
						<path
							d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
						/>
					</svg>
					Delete
				</span>
			</ButtonCmp>
			<div class="flex gap-2">
				<ButtonCmp variant="ghost">Cancel</ButtonCmp>
				<ButtonCmp variant="primary">Save changes</ButtonCmp>
			</div>
		</div>
	</div>
</Story>

<Story name="Variants">
	<div class="flex flex-wrap gap-3 items-center">
		<ButtonCmp variant="primary">Primary</ButtonCmp>
		<ButtonCmp variant="secondary">Secondary</ButtonCmp>
		<ButtonCmp variant="destructive">Destructive</ButtonCmp>
		<ButtonCmp variant="outline">Outline</ButtonCmp>
		<ButtonCmp variant="ghost">Ghost</ButtonCmp>
	</div>
</Story>

<Story name="Disabled">
	<div class="flex flex-wrap gap-3 items-center">
		<ButtonCmp variant="primary" disabled>Primary</ButtonCmp>
		<ButtonCmp variant="secondary" disabled>Secondary</ButtonCmp>
		<ButtonCmp variant="destructive" disabled>Destructive</ButtonCmp>
		<ButtonCmp variant="outline" disabled>Outline</ButtonCmp>
		<ButtonCmp variant="ghost" disabled>Ghost</ButtonCmp>
	</div>
</Story>
