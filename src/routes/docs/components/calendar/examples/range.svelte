<script lang="ts">
	import { Calendar } from '$lib/components/calendar';
	import type { CalendarRange, Day } from '$lib/components/calendar/types';

	let range = $state<CalendarRange>([undefined, undefined]);
	let pivote = $state(new Date());
</script>

<!-- In range mode, bind the `range` tuple; Body highlights the in-between days. -->
<Calendar.Root bind:pivote bind:range type="range">
	<Calendar.Header />
	<Calendar.Body weekday={undefined}>
		{#snippet children({ day }: { day: Day })}
			<Calendar.Day {day} />
		{/snippet}
	</Calendar.Body>
</Calendar.Root>
