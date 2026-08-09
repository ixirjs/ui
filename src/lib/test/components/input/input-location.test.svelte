<!--
  Input.LocationControl renders through <SegmentedField>. This fixture proves the wiring the
  migration could break: the bound value reaches the field, and typing coordinates back out of it
  still drives the `lat`/`lng` bindables.
-->
<script lang="ts">
	import * as Input from '$ixirjs/ui/components/input/atoms';

	let {
		value = $bindable(''),
		lat = $bindable<number | undefined>(undefined),
		lng = $bindable<number | undefined>(undefined)
	}: { value?: string; lat?: number; lng?: number } = $props();
</script>

<Input.Root>
	<Input.LocationControl bind:value bind:lat bind:lng placeholder="coords" />
</Input.Root>

<output data-testid="lat">{lat ?? '—'}</output>
<output data-testid="lng">{lng ?? '—'}</output>
