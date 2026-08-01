<script lang="ts">
	import { Checkbox } from '$ixirjs/ui/components/checkbox';
	import type { StateChangeCallback } from '$ixirjs/ui/types';

	interface Props {
		oncheckedchange?: StateChangeCallback<boolean>;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
	}

	let { oncheckedchange, oninput, onchange }: Props = $props();

	let checked = $state(false);
	let committed = $state<boolean[]>([]);

	function handleCheckedChange(
		nextChecked: boolean,
		context: Parameters<StateChangeCallback<boolean>>[1]
	) {
		committed.push(checked === nextChecked);
		oncheckedchange?.(nextChecked, context);
	}
</script>

<Checkbox
	bind:checked
	oncheckedchange={handleCheckedChange}
	{...oninput ? { oninput } : {}}
	{...onchange ? { onchange } : {}}
/>
<output data-testid="checkbox-value">{checked}</output>
<output data-testid="checkbox-committed">{committed.join(',')}</output>
