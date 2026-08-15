<script lang="ts">
	// The static, Bond-less shape: Button and Badge, which between them stand in for the ~60
	// components that render a presentation-resolved element with no Atom and no registration.
	// A separate fixture so the card ladder's per-rung fingerprints stay put.
	import { Button } from '$ixirjs/ui/components/button';
	import { Badge } from '$ixirjs/ui/components/badge';

	export type StaticArm = 'button' | 'badge';

	let { n = 100, arm = 'button' }: { n?: number; arm?: StaticArm } = $props();
</script>

{#each { length: n } as _, i (i)}
	{#if arm === 'button'}
		<Button>Item {i}</Button>
	{:else}
		<Badge>Item {i}</Badge>
	{/if}
{/each}
