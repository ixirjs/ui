<script lang="ts">
	import { DatePicker } from '@ixirjs/ui/components/date-picker';
	import { Button } from '@ixirjs/ui/components/button';

	let value: Date | undefined = $state(undefined);
</script>

<!-- Root owns selection state; Trigger toggles the popover; Calendar renders the grid. -->
<DatePicker.Root bind:value>
	{#snippet children({ datePicker })}
		<DatePicker.Trigger base={Button} class="w-64 justify-between">
			<span>{datePicker.formattedValue || 'Select a date'}</span>
			<DatePicker.Indicator class="ml-auto" />
		</DatePicker.Trigger>
		<DatePicker.Calendar />
		<!-- Read the root-owned interface; no factory or manual teardown. -->
		<code class="text-muted-foreground block font-mono text-xs"
			>profile: {datePicker.profile.name} · open: {String(datePicker.isOpen)}</code
		>
	{/snippet}
</DatePicker.Root>
