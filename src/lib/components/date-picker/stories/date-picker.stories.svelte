<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { DatePicker as ADatePicker } from '..';
	import { Button } from '../../button';

	const { Story } = defineMeta({
		title: 'Atoms/DatePicker',
		parameters: { layout: 'fullscreen' },
		args: {
			type: 'single',
			disabled: false,
			placeholder: 'Select a date',
			format: 'MM/dd/yyyy',
			offset: 2,
			placement: 'bottom-start'
		},
		argTypes: {
			type: {
				control: 'select',
				options: ['single', 'range'],
				description: 'Selection mode — pick a single date or a date range'
			},
			disabled: {
				control: 'boolean',
				description: 'Disable the date picker trigger'
			},
			placeholder: {
				control: 'text',
				description: 'Placeholder text shown when no date is selected'
			},
			format: {
				control: 'select',
				options: ['MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'],
				description: 'Display format for the selected date value'
			},
			offset: {
				control: 'number',
				description: 'Pixel offset between the trigger and the calendar popover'
			},
			placement: {
				control: 'select',
				options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end'],
				description: 'Preferred placement of the calendar popover relative to the trigger'
			}
		}
	});
</script>

<script lang="ts">
	import { addDays, subDays } from 'date-fns';

	let value: Date | undefined = $state(undefined);
	let rangeStart: Date | undefined = $state(undefined);
	let rangeEnd: Date | undefined = $state(undefined);

	let min = $state(subDays(new Date(), 5));
	let max = $state(addDays(new Date(), 15));
</script>

<Story name="Basic">
	{#snippet template(args)}
		<div class="flex h-screen items-start justify-center pt-24">
			<ADatePicker.Root
				bind:value
				{min}
				{max}
				type={args.type}
				disabled={args.disabled}
				placeholder={args.placeholder}
				format={args.format}
				offset={args.offset}
				placement={args.placement}
			>
				<ADatePicker.Trigger base={Button} class="w-64 gap-4">
					{#if value}
						<div>{value.toDateString()}</div>
					{:else}
						<div>{args.placeholder}</div>
					{/if}
					<ADatePicker.Indicator class="ml-auto" />
				</ADatePicker.Trigger>
				<ADatePicker.Calendar />
			</ADatePicker.Root>
		</div>
	{/snippet}
</Story>

<Story name="Range Selection">
	<div class="flex h-screen items-start justify-center pt-24">
		<ADatePicker.Root type="range" bind:start={rangeStart} bind:end={rangeEnd}>
			<ADatePicker.Trigger base={Button} class="w-72 gap-4">
				{#if rangeStart && rangeEnd}
					<div>{rangeStart.toDateString()} – {rangeEnd.toDateString()}</div>
				{:else if rangeStart}
					<div>{rangeStart.toDateString()} – …</div>
				{:else}
					<div>Select date range</div>
				{/if}
				<ADatePicker.Indicator class="ml-auto" />
			</ADatePicker.Trigger>
			<ADatePicker.Calendar />
		</ADatePicker.Root>
	</div>
</Story>

<Story name="With Min and Max">
	<div class="flex h-screen items-start justify-center pt-24">
		<ADatePicker.Root bind:value {min} {max}>
			<ADatePicker.Trigger base={Button} class="w-64 gap-4">
				{#if value}
					<div>{value.toDateString()}</div>
				{:else}
					<div>Pick within ±15 days</div>
				{/if}
				<ADatePicker.Indicator class="ml-auto" />
			</ADatePicker.Trigger>
			<ADatePicker.Calendar />
		</ADatePicker.Root>
	</div>
</Story>

<Story name="Disabled">
	<div class="flex h-screen items-start justify-center pt-24">
		<ADatePicker.Root disabled>
			<ADatePicker.Trigger base={Button} class="w-64 gap-4">
				<div>Select a date</div>
				<ADatePicker.Indicator class="ml-auto" />
			</ADatePicker.Trigger>
			<ADatePicker.Calendar />
		</ADatePicker.Root>
	</div>
</Story>
