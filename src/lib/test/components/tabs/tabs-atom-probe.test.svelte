<script lang="ts" module>
	import type { TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';
	import type { TabBond } from '$ixirjs/ui/components/tabs/tab/bond.svelte';

	export let capturedTabsBond: TabsBond | undefined;
	export let capturedTabBond: TabBond | undefined;

	export function resetCapturedBonds() {
		capturedTabsBond = undefined;
		capturedTabBond = undefined;
	}
</script>

<script lang="ts">
	import { Tab, Tabs } from '$ixirjs/ui/components/tabs';

	function captureTabs(bond: TabsBond): string {
		capturedTabsBond = bond;
		return '';
	}

	function captureTab(bond: TabBond): string {
		capturedTabBond = bond;
		return '';
	}
</script>

<Tabs.Root value="one">
	{#snippet children({ tabs }: { tabs: TabsBond })}
		{captureTabs(tabs)}
		<Tabs.Header>
			<Tab.Root value="one">
				{#snippet children({ tab }: { tab: TabBond })}
					{captureTab(tab)}
					<Tab.Header>One</Tab.Header>
					<Tab.Description>First tab</Tab.Description>
					<Tab.Body>
						<span>Panel one</span>
					</Tab.Body>
				{/snippet}
			</Tab.Root>
		</Tabs.Header>
		<Tabs.Body>
			<Tabs.Content />
		</Tabs.Body>
	{/snippet}
</Tabs.Root>
