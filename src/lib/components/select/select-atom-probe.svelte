<script lang="ts" module>
	import type { SelectBond } from './bond.svelte';

	export let capturedBond: SelectBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$svelte-atoms/core/components/root';
	import { Select } from './index';

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
				<Select.Arrow />
				<Select.Indicator />
			</Select.Content>
		{/snippet}
	</Select.Root>
</Root>
