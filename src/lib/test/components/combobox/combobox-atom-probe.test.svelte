<script lang="ts" module>
	import type { ComboboxBond } from '$ixirjs/ui/components/combobox/bond.svelte';

	export let capturedBond: ComboboxBond | undefined;

	export function resetCapturedBond() {
		capturedBond = undefined;
	}
</script>

<script lang="ts">
	import { Root } from '$ixirjs/ui/components/root';
	import { Combobox } from '$ixirjs/ui/components/combobox';

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
				<Combobox.Tail />
				<Combobox.Indicator />
			</Combobox.Content>
		{/snippet}
	</Combobox.Root>
</Root>
