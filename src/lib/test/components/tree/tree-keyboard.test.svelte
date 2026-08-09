<script lang="ts">
	import { Tree } from '$ixirjs/ui/components/tree';

	// root(open) ─┬─ a(closed, has a1)
	//             └─ b(open, has b1)
	// Visible treeitems are therefore: root, a, b, b1 — `a1` is behind a collapsed node.
</script>

<Tree.Root open>
	<Tree.Header>root</Tree.Header>
	<Tree.Body>
		<Tree.Root>
			<Tree.Header>a</Tree.Header>
			<Tree.Body>
				<Tree.Root>
					<Tree.Header>a1</Tree.Header>
					<Tree.Body>leaf</Tree.Body>
				</Tree.Root>
			</Tree.Body>
		</Tree.Root>
		<Tree.Root open>
			<Tree.Header>b</Tree.Header>
			<Tree.Body>
				<Tree.Root>
					<Tree.Header>b1</Tree.Header>
					<Tree.Body>leaf</Tree.Body>
				</Tree.Root>
			</Tree.Body>
		</Tree.Root>
	</Tree.Body>
</Tree.Root>
