<script lang="ts" module>
	import type { ComboboxBond } from './bond.svelte';

	export let capturedBond: ComboboxBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$svelte-atoms/core/components/root';
	import { Combobox } from './index';

	function capture(bond: ComboboxBond | undefined): string {
		capturedBond = bond;
		return '';
	}
</script>

<Root>
	<Combobox.Root open={true}>
		{#snippet children({ combobox }: { combobox: ComboboxBond | undefined })}
			{capture(combobox)}
			<Combobox.Trigger as="div">
				<Combobox.Placeholder>Choose</Combobox.Placeholder>
				<Combobox.Control />
				<Combobox.Query />
			</Combobox.Trigger>
			<Combobox.Content>
				<Combobox.Item value="alpha">Alpha</Combobox.Item>
				<Combobox.Arrow />
				<Combobox.Indicator />
			</Combobox.Content>
		{/snippet}
	</Combobox.Root>
</Root>
