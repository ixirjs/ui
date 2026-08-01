<script lang="ts">
	import { Tab, Tabs } from '$ixirjs/ui/components/tabs';
	import type { TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';
	import type { StateChangeCallback } from '$ixirjs/ui/types';

	let {
		onclick,
		onvaluechange
	}: {
		onclick?: (event: MouseEvent) => void;
		onvaluechange?: StateChangeCallback<string | undefined, TabsBond>;
	} = $props();
</script>

<Tabs.Root {onvaluechange}>
	<Tabs.Header>
		<Tab.Root value="one">
			<Tab.Header {onclick}>One</Tab.Header>
		</Tab.Root>
		<Tab.Root value="two">
			<Tab.Header>Two</Tab.Header>
		</Tab.Root>
	</Tabs.Header>
</Tabs.Root>
