<script lang="ts">
	import { Tab, Tabs } from '$ixirjs/ui/components/tabs';

	let { n = 100 }: { n?: number } = $props();
</script>

<Tabs.Root value="0">
	<Tabs.Header>
		{#each { length: n } as _, i (i)}
			<Tab.Root value={String(i)}>
				<Tab.Header>Tab {i}</Tab.Header>
				<Tab.Body>Panel {i}</Tab.Body>
			</Tab.Root>
		{/each}
	</Tabs.Header>
</Tabs.Root>
