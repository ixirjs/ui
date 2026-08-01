<script lang="ts">
	import { Tabs, Tab } from '$lib/components/tabs';

	let activeTab = $state('t1');

	const previewTabs = [
		['t1', 'Overview'],
		['t2', 'Details'],
		['t3', 'Settings']
	] as const;
</script>

<div class="w-56">
	<Tabs.Root bind:value={activeTab}>
		<Tabs.Header class="border-b border-border">
			{#each previewTabs as [val, label] (val)}
				<Tab.Root value={val}>
					<Tab.Header class="px-3 py-2 text-xs font-medium">{label}</Tab.Header>
					<Tab.Body class="pt-3">
						<p class="text-xs text-muted-foreground">{label} content here.</p>
					</Tab.Body>
				</Tab.Root>
			{/each}
		</Tabs.Header>
		<Tabs.Body class="pt-2">
			<Tabs.Content />
		</Tabs.Body>
	</Tabs.Root>
</div>
