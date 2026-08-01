<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { default as RadioComponent } from './radio.svelte';
	import { default as RadioGroupComponent } from './radio-group.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/RadioGroup',
		parameters: { layout: 'centered' },
		args: {
			disabled: false,
			readonly: false,
			required: false
		},
		argTypes: {
			disabled: { control: 'boolean', description: 'Disable all radio buttons in the group' },
			readonly: { control: 'boolean', description: 'Make all radio buttons read-only' },
			required: { control: 'boolean', description: 'Mark the group as required' }
		}
	});
</script>

<script lang="ts">
	let value = $state('option1');
	let controlledValue = $state('option1');
	let disabledValue = $state('option2');
	let horizontalValue = $state('monthly');
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex flex-col gap-4">
			<RadioGroupComponent class="gap-3" name="default-group" bind:value {...args}>
				<label class="flex cursor-pointer items-center gap-2">
					<RadioComponent value="option1" />
					<span class="text-sm font-medium">Option 1</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<RadioComponent value="option2" />
					<span class="text-sm font-medium">Option 2</span>
				</label>
				<label class="flex cursor-pointer items-center gap-2">
					<RadioComponent value="option3" />
					<span class="text-sm font-medium">Option 3</span>
				</label>
			</RadioGroupComponent>
			<p class="text-muted-foreground text-xs">Selected: <strong>{value}</strong></p>
		</div>
	{/snippet}
</Story>

<Story name="Group">
	<RadioGroupComponent class="gap-4" name="choice" bind:value={controlledValue}>
		<label class="flex items-center gap-2">
			<RadioComponent class="size-8" value="t1" />
			<div>Test 1</div>
		</label>

		<label class="flex items-center gap-2">
			<RadioComponent class="size-8" value="t2" />
			<div>Test 2</div>
		</label>

		<label class="flex items-center gap-2">
			<RadioComponent class="size-8" value="t3" />
			<div>Test 3</div>
		</label>

		<label class="flex items-center gap-2">
			<RadioComponent class="size-8" value="t4" />
			<div>Test 4</div>
		</label>
	</RadioGroupComponent>

	<div class="mt-8">
		Selected value: <strong>{controlledValue}</strong>
	</div>
</Story>

<Story name="Disabled">
	<RadioGroupComponent class="gap-3" name="disabled-group" disabled bind:value={disabledValue}>
		<label class="flex items-center gap-2">
			<RadioComponent value="option1" />
			<span class="text-sm font-medium">Option 1</span>
		</label>
		<label class="flex items-center gap-2">
			<RadioComponent value="option2" />
			<span class="text-sm font-medium">Option 2</span>
		</label>
		<label class="flex items-center gap-2">
			<RadioComponent value="option3" />
			<span class="text-sm font-medium">Option 3</span>
		</label>
	</RadioGroupComponent>
</Story>

<Story name="Horizontal">
	<div class="flex flex-col gap-4">
		<p class="text-sm font-semibold">Billing cycle</p>
		<div class="flex gap-6">
			<RadioGroupComponent name="billing-group" bind:value={horizontalValue}>
				{#each [
					{ value: 'monthly', label: 'Monthly' },
					{ value: 'quarterly', label: 'Quarterly' },
					{ value: 'annually', label: 'Annually' }
				] as option}
					<label class="flex cursor-pointer items-center gap-2">
						<RadioComponent value={option.value} />
						<span class="text-sm font-medium">{option.label}</span>
					</label>
				{/each}
			</RadioGroupComponent>
		</div>
		<p class="text-muted-foreground text-xs">Selected: <strong>{horizontalValue}</strong></p>
	</div>
</Story>

<Story name="WithDescriptions">
	<RadioGroupComponent class="gap-4 w-72" name="plan-group">
		{#each [
			{ value: 'starter', label: 'Starter', description: 'Up to 5 users and 10 projects' },
			{ value: 'pro', label: 'Pro', description: 'Unlimited users and projects' },
			{ value: 'enterprise', label: 'Enterprise', description: 'Custom limits and SLA' }
		] as plan}
			<label class="flex cursor-pointer items-start gap-3">
				<RadioComponent value={plan.value} class="mt-0.5" />
				<div class="flex flex-col gap-0.5">
					<span class="text-sm font-medium">{plan.label}</span>
					<span class="text-muted-foreground text-xs">{plan.description}</span>
				</div>
			</label>
		{/each}
	</RadioGroupComponent>
</Story>
