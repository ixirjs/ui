<script lang="ts">
	import { Calendar } from '$lib/components/calendar';
	import type { CalendarRange, Day } from '$lib/components/calendar/types';

	let range = $state<CalendarRange>([undefined, undefined]);
	let pivote = $state(new Date());
</script>

<!--
	Root owns pivote (the month in view) + the selection tuple.
	Header renders the month label / nav; Body iterates days via its children snippet; Day renders a cell.
	`type="single"` restricts selection to one date within the `range` tuple.
-->
<Calendar.Root bind:pivote bind:range type="single">
	<Calendar.Header />
	<Calendar.Body weekday={undefined}>
		{#snippet children({ day }: { day: Day })}
			<Calendar.Day {day} />
		{/snippet}
	</Calendar.Body>
</Calendar.Root>
