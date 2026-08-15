<script lang="ts">
	import { useRoot } from '$ixirjs/ui/public/shared';
	import { LifetimeBond } from './part-lifetime-bond.test.svelte';
	import Part from './part-lifetime-part.test.svelte';

	let { show = true }: { show?: boolean } = $props();

	const ID = $props.id();
	const root = useRoot(LifetimeBond, {}, { id: () => ID });

	export function registeredTriggers() {
		return root.bond.nodesByPart('trigger').length;
	}
</script>

<button data-testid="lifetime-root" data-triggers={root.bond.nodesByPart('trigger').length}>
	root
</button>
{@render (show ? part : undefined)?.()}

{#snippet part()}
	<Part />
{/snippet}
