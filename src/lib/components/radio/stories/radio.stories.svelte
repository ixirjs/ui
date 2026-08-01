<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { default as RadioModule } from '$ixirjs/ui/components/radio/radio.svelte';

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
	let shippingValue = $state('standard');

	const shipping = [
		{ value: 'standard', label: 'Standard', eta: '5–7 business days', price: 'Free' },
		{ value: 'express', label: 'Express', eta: '2–3 business days', price: '$9.00' },
		{ value: 'overnight', label: 'Overnight', eta: 'Next business day', price: '$24.00' }
	];
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

<!-- Real-world: a shipping picker. Each row binds to a shared `group` value. -->
<Story name="Shipping Method">
	<fieldset class="border-border bg-card w-80 rounded-xl border p-4">
		<legend class="text-foreground px-1 text-sm font-semibold">Shipping method</legend>
		<div class="mt-1 flex flex-col gap-1">
			{#each shipping as opt (opt.value)}
				<label class="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg p-3">
					<RadioModule class="size-5" value={opt.value} bind:group={shippingValue} />
					<div class="flex-1">
						<p class="text-foreground text-sm font-medium">{opt.label}</p>
						<p class="text-muted-foreground text-xs">{opt.eta}</p>
					</div>
					<span class="text-foreground text-sm font-medium">{opt.price}</span>
				</label>
			{/each}
		</div>
		<p class="text-muted-foreground mt-2 px-1 text-xs">
			Selected: <strong>{shippingValue}</strong>
		</p>
	</fieldset>
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
