<script lang="ts" module>
	import type { PopoverBond } from '$ixirjs/ui/components/popover/bond.svelte';

	export let capturedBond: PopoverBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Popover } from '$ixirjs/ui/components/popover';

	function capture(bond: PopoverBond | undefined): string {
		capturedBond = bond;
		return '';
	}
</script>

<Root>
	<Popover.Root open={true}>
		{#snippet children({ popover }: { popover: PopoverBond | undefined })}
			{capture(popover)}
			<Popover.Trigger>Open</Popover.Trigger>
			<Popover.Content>
				<Popover.Tail />
				<Popover.Indicator />
				Panel
			</Popover.Content>
		{/snippet}
	</Popover.Root>
</Root>
