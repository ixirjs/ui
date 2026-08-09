<script lang="ts">
	import { Tab, Tabs } from '$ixirjs/ui/components/tabs';
	import type { TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';

	// `three` is disabled: keyboard navigation must skip it, so ArrowLeft from `one` wraps to `two`.
	const values = [
		{ value: 'one', disabled: false },
		{ value: 'two', disabled: false },
		{ value: 'three', disabled: true }
	];
</script>

<Tabs.Root value="one">
	{#snippet children(_: { tabs: TabsBond })}
		<Tabs.Header>
			{#each values as tab (tab.value)}
				<Tab.Root value={tab.value} disabled={tab.disabled}>
					<Tab.Header>{tab.value}</Tab.Header>
					<Tab.Body>panel {tab.value}</Tab.Body>
				</Tab.Root>
			{/each}
		</Tabs.Header>
		<Tabs.Body>
			<Tabs.Content />
		</Tabs.Body>
	{/snippet}
</Tabs.Root>
