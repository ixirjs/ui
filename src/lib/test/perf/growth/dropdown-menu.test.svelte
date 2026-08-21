<script lang="ts">
	// Items sit directly under an open root rather than inside `Content`: a portal renders nothing
	// on the server and adds a host to tear down per round here, and an item's registration with the
	// menu Bond does not depend on a portal being in its ancestry.
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';

	let { n = 100 }: { n?: number } = $props();
</script>

<DropdownMenu.Root open>
	<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
	{#each { length: n } as _, i (i)}
		<DropdownMenu.Item>Item {i}</DropdownMenu.Item>
	{/each}
</DropdownMenu.Root>
