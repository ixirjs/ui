<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ButtonCmp from './button.svelte';

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
