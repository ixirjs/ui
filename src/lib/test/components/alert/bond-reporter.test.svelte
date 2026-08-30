<script lang="ts">
	import { untrack } from 'svelte';
	import type { AlertBond } from '$ixirjs/ui/components/alert/bond.svelte';
	let { alert, onbond }: { alert: AlertBond; onbond: (bond: AlertBond) => void } = $props();
	untrack(() => onbond(alert));
</script>
