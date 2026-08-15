<script lang="ts">
	import { untrack } from 'svelte';
	import type { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	let { card, onbond }: { card: CardBond; onbond: (bond: CardBond) => void } = $props();
	untrack(() => onbond(card));
</script>
