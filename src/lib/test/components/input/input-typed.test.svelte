<!--
  `bond.number` and `bond.date` gate on the control Atom's type. Before the controls registered an
  Atom, `nodeByPart('input')` was empty for every typed control and both getters were permanently
  `undefined`. This fixture reads them back out of the bond.
-->
<script lang="ts">
	import * as Input from '$ixirjs/ui/components/input/atoms';

	let { kind = 'number' }: { kind?: 'number' | 'date' } = $props();
</script>

<Input.Root>
	{#snippet children({ input })}
		{@render (kind === 'number' ? numberControl : dateControl)()}
		<output data-testid="number">{input.number ?? '—'}</output>
		<output data-testid="date">{input.date?.toISOString() ?? '—'}</output>
		<output data-testid="raw">{input.value.get() || '—'}</output>
	{/snippet}
</Input.Root>

{#snippet numberControl()}
	<Input.NumberControl showControls={false} placeholder="amount" />
{/snippet}

{#snippet dateControl()}
	<!-- Date-only, with no mode to pass: three segments, and bond.date parses YYYY-MM-DD. -->
	<Input.DateControl />
{/snippet}
