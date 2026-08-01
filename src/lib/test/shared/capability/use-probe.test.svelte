<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import type { Bond } from '$ixirjs/ui/shared/bond';

	let { bond }: { bond: Bond } = $props();
	const owner = untrack(() => bond);
	owner.activateCapabilities(owner);
	onDestroy(() => owner.destroy());
</script>
