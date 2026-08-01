<script lang="ts" module>
	import type { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import type { PopoverBond } from '$ixirjs/ui/components/popover/bond.svelte';

	export let capturedBond: DropdownMenuBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';

	function capture(bond: DropdownMenuBond | undefined): string {
		capturedBond = bond;
		return '';
	}
</script>

<Root>
	<DropdownMenu.Root open={true}>
		{#snippet children({ popover }: { popover: PopoverBond | undefined })}
			{capture(popover as unknown as DropdownMenuBond | undefined)}
			<DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				<DropdownMenu.Item id="alpha">Alpha</DropdownMenu.Item>
				<DropdownMenu.Tail />
				<DropdownMenu.Indicator />
			</DropdownMenu.Content>
		{/snippet}
	</DropdownMenu.Root>
</Root>
