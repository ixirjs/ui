<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { default as RadioModule } from './radio.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Radio',
		parameters: { layout: 'centered' },
		args: {
			disabled: false,
			required: false,
			readonly: false
		},
		argTypes: {
			disabled: { control: 'boolean', description: 'Disable the radio button' },
			required: { control: 'boolean', description: 'Mark the radio button as required' },
			readonly: { control: 'boolean', description: 'Make the radio button read-only' }
		}
	});
</script>

<script lang="ts">
	let value = $state<string | undefined>(undefined);
	let groupValue = $state<string | undefined>(undefined);
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex items-center gap-4">
			<RadioModule class="size-5" value="option1" bind:group={value} {...args} />
			<RadioModule class="size-5" value="option2" bind:group={value} {...args} />
			<RadioModule class="size-5" value="option3" bind:group={value} {...args} />
		</div>
		<p class="mt-4 text-sm">Selected: {value ?? 'none'}</p>
	{/snippet}
</Story>

<Story name="Disabled">
	<div class="flex flex-col gap-4">
		<p class="text-sm font-medium">Disabled unselected</p>
		<div class="flex items-center gap-4">
			<RadioModule class="size-5" value="a" disabled />
			<RadioModule class="size-5" value="b" disabled />
		</div>
		<p class="text-sm font-medium">Disabled selected</p>
		<div class="flex items-center gap-4">
			<RadioModule class="size-5" value="a" group="a" disabled />
			<RadioModule class="size-5" value="b" group="a" disabled />
		</div>
	</div>
</Story>

<Story name="Sizes">
	<div class="flex items-center gap-6">
		<RadioModule class="size-3" value="sm" bind:group={groupValue} />
		<RadioModule class="size-4" value="md" bind:group={groupValue} />
		<RadioModule class="size-5" value="lg" bind:group={groupValue} />
		<RadioModule class="size-6" value="xl" bind:group={groupValue} />
	</div>
	<p class="mt-4 text-sm">Selected: {groupValue ?? 'none'}</p>
</Story>
