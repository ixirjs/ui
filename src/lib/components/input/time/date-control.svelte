<!--
  Date-only segments (MM / DD / YYYY). It is `datetime-control` pinned to `mode="date"` — the two
  share every parsing and segment concern and differ only in which segments render, so the mode
  lives in one component and this file is the date-only entry point.

  It exists because the previous `DateControl` was a bare re-export of `datetime-control`, whose
  `mode` defaults to `'datetime'`: `<Input.DateControl />` rendered a datetime picker, and the only
  way to get a date was to pass the mode yourself. `mode` is not part of this component's surface.
-->
<script lang="ts">
	import DateTimeControl from './datetime-control.svelte';
	import type { InputDateControlProps } from '$ixirjs/ui/components/input/types';

	let {
		value = $bindable(''),
		date = $bindable<Date | null>(null),
		...restProps
	}: InputDateControlProps = $props();
</script>

<!-- restProps first so `mode` cannot be overridden from outside. -->
<DateTimeControl {...restProps} bind:value bind:date mode="date" />
