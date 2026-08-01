<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Label } from '.';

	const { Story } = defineMeta({
		title: 'Atoms/Label',
		component: Label,
		parameters: { layout: 'centered' },
		args: {
			for: '',
			disabled: false
		},
		argTypes: {
			for: {
				control: 'text',
				description: 'The id of the form control this label is associated with'
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the label appears in a disabled state'
			}
		}
	});
</script>

<Story name="Basic">
	{#snippet template(args)}
		<Label {...args}>Email address</Label>
	{/snippet}
</Story>

<Story name="WithInput">
	<div class="flex flex-col gap-1.5">
		<Label for="email-input">Email address</Label>
		<input
			id="email-input"
			type="email"
			placeholder="you@example.com"
			class="rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
		/>
	</div>
</Story>

<Story name="Required">
	<div class="flex flex-col gap-1.5">
		<Label for="name-input">
			Full name <span class="text-destructive" aria-hidden="true">*</span>
		</Label>
		<input
			id="name-input"
			type="text"
			required
			placeholder="Jane Doe"
			class="rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
		/>
	</div>
</Story>

<Story name="Disabled">
	<div class="flex flex-col gap-1.5 opacity-50">
		<Label for="disabled-input">Username</Label>
		<input
			id="disabled-input"
			type="text"
			disabled
			value="john_doe"
			class="rounded-md border border-border bg-muted px-3 py-2 text-sm cursor-not-allowed"
		/>
	</div>
</Story>

<Story name="FormGroup">
	<form class="flex flex-col gap-4 w-72">
		<div class="flex flex-col gap-1.5">
			<Label for="fg-name">Full name</Label>
			<input
				id="fg-name"
				type="text"
				placeholder="Jane Doe"
				class="rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<Label for="fg-email">Email address</Label>
			<input
				id="fg-email"
				type="email"
				placeholder="you@example.com"
				class="rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>
		<div class="flex flex-col gap-1.5">
			<Label for="fg-password">Password</Label>
			<input
				id="fg-password"
				type="password"
				placeholder="••••••••"
				class="rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>
	</form>
</Story>
