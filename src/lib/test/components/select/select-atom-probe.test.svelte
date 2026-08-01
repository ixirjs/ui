<script lang="ts" module>
	import type { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';

	export let capturedBond: SelectBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Select } from '$ixirjs/ui/components/select';

	function capture(bond: SelectBond | undefined): string {
		capturedBond = bond;
		return '';
	}
</script>

<Root>
	<Select.Root open={true}>
		{#snippet children({ select }: { select: SelectBond | undefined })}
			{capture(select)}
			<Select.Trigger>
				<Select.Placeholder>Choose</Select.Placeholder>
				<Select.Query />
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="alpha">Alpha</Select.Item>
				<Select.Tail />
				<Select.Indicator />
			</Select.Content>
		{/snippet}
	</Select.Root>
</Root>
