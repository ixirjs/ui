<script lang="ts">
	import { untrack } from 'svelte';
	import { createAtomInstance, type AtomCapabilityEntry, type Bond } from '$ixirjs/ui/shared/bond';

	let {
		bond,
		nodeKey = 'part',
		required = false,
		capabilities = []
	}: {
		bond?: Bond;
		nodeKey?: string;
		required?: boolean | string;
		capabilities?: readonly AtomCapabilityEntry[];
	} = $props();

	// createAtomInstance reads its inputs once, at construction.
	const node = createAtomInstance(
		untrack(() => nodeKey),
		{
			bond: untrack(() => bond),
			required: untrack(() => required),
			capabilities: untrack(() => capabilities)
		}
	);
</script>

<div {...node.spread}></div>
