<script lang="ts">
	import type { Bond } from '../bond';
	import { useCapabilities } from './use.svelte';

	type Props = { bond: Bond };

	const { bond }: Props = $props();

	// svelte-ignore state_referenced_locally
	useCapabilities(bond);
</script>

<div data-testid="capability-probe"></div>
