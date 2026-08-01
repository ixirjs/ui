<script lang="ts">
	import { Tabs, Tab } from '$lib/components/tabs';

	const demoTabs = [
		{ value: 'overview', label: 'Overview', content: 'High-level summary of your component.' },
		{ value: 'details', label: 'Details', content: 'In-depth details and configuration options.' },
		{ value: 'settings', label: 'Settings', content: 'Configure preferences and defaults.' }
	];

	let activeTab = $state(demoTabs[0]?.value ?? 'overview');
</script>

<div class="w-full max-w-lg">
	<Tabs.Root bind:value={activeTab}>
		<Tabs.Header class="border-b">
			{#each demoTabs as tab, i (i)}
				<Tab.Root value={tab.value}>
					<Tab.Header class="px-4 py-2 text-sm">{tab.label}</Tab.Header>
					<Tab.Body class="p-4">
						<p class="text-muted-foreground text-sm">{tab.content}</p>
					</Tab.Body>
				</Tab.Root>
			{/each}
		</Tabs.Header>
		<Tabs.Body>
			<Tabs.Content />
		</Tabs.Body>
	</Tabs.Root>
</div>
