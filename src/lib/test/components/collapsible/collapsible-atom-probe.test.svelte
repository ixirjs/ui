<script lang="ts" module>
	import type { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';

	export let capturedBond: CollapsibleBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Collapsible } from '$ixirjs/ui/components/collapsible';

	function capture(bond: CollapsibleBond): string {
		capturedBond = bond;
		return '';
	}
</script>

<Collapsible.Root open>
	{#snippet children({ collapsible }: { collapsible: CollapsibleBond })}
		{capture(collapsible)}
		<Collapsible.Header>
			<span>Toggle</span>
			<Collapsible.Indicator />
		</Collapsible.Header>
		<Collapsible.Body>
			<span>Body</span>
		</Collapsible.Body>
	{/snippet}
</Collapsible.Root>
