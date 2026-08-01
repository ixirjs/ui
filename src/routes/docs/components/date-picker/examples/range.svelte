<script lang="ts">
	import { DatePicker } from '$lib/components/date-picker';
	import { Button } from '$lib/components/button';

	let start: Date | undefined = $state(undefined);
	let end: Date | undefined = $state(undefined);
</script>

<!-- In range mode, bind `start` and `end`; the trigger label reflects the partial range. -->
<DatePicker.Root type="range" bind:start bind:end>
	<DatePicker.Trigger base={Button} class="w-72 justify-between">
		{#if start && end}
			<span>{start.toDateString()} – {end.toDateString()}</span>
		{:else if start}
			<span>{start.toDateString()} – …</span>
		{:else}
			<span class="text-muted-foreground">Select date range</span>
		{/if}
		<DatePicker.Indicator class="ml-auto" />
	</DatePicker.Trigger>
	<DatePicker.Calendar />
</DatePicker.Root>
