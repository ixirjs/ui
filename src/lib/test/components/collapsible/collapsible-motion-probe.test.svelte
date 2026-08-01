<script lang="ts">
	import { Collapsible } from '$ixirjs/ui/components/collapsible';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<Collapsible.Root bind:open>
	<Collapsible.Header>Header</Collapsible.Header>
	<Collapsible.Body data-testid="body">Body</Collapsible.Body>
</Collapsible.Root>
