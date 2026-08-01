<script lang="ts">
	import { DatePicker } from '$lib/components/date-picker';
	import { Button } from '$lib/components/button';

	let value: Date | undefined = $state(undefined);
</script>

<!-- Root owns selection state; Trigger toggles the popover; Calendar renders the grid. -->
<DatePicker.Root bind:value>
	<DatePicker.Trigger base={Button} class="w-64 justify-between">
		{#if value}
			<span>{value.toDateString()}</span>
		{:else}
			<span class="text-muted-foreground">Select a date</span>
		{/if}
		<DatePicker.Indicator class="ml-auto" />
	</DatePicker.Trigger>
	<DatePicker.Calendar />
</DatePicker.Root>
