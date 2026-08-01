<script lang="ts">
	import { Tree } from '$ixirjs/ui/components/tree';

	let { open = $bindable(false) }: { open?: boolean } = $props();
</script>

<Tree.Root bind:open>
	<Tree.Header>
		<Tree.Indicator data-testid="indicator">▸</Tree.Indicator>
		Node
	</Tree.Header>
	<Tree.Body data-testid="body">Body</Tree.Body>
</Tree.Root>
