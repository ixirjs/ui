<script lang="ts">
	import type { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import LazyRoot from './lazy-root.test.svelte';
	import LazyTitle from './lazy-title.test.svelte';
	let { onbond }: { onbond: (bond: CardBond) => void } = $props();
</script>

<LazyRoot {onbond}>
	<LazyTitle>Title</LazyTitle>
</LazyRoot>
