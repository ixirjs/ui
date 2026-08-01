<script lang="ts">
	import * as Input from '$ixirjs/ui/components/input/atoms';
	import type {
		InputControlChangeDetails,
		InputStateChangeCallback
	} from '$ixirjs/ui/components/input/types';

	let {
		value = $bindable(''),
		oninput = undefined,
		onvaluechange = undefined
	}: {
		value?: string;
		oninput?: (event: Event) => void;
		onvaluechange?: InputStateChangeCallback<unknown, InputControlChangeDetails>;
	} = $props();

	const callbackProps = $derived({
		...(oninput ? { oninput } : {}),
		...(onvaluechange ? { onvaluechange } : {})
	});
</script>

<Input.Root>
	{#snippet children({ input })}
		<Input.Control bind:value placeholder="field" {...callbackProps} />
		<!-- `bond.value.get()` reflects `props.value`, which Input.Control writes via `bond.value.set`. -->
		<output data-testid="model">{input.value.get()}</output>
	{/snippet}
</Input.Root>
<output data-testid="out">{value}</output>
