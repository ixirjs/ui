<script lang="ts">
	// The DEPTH axis. The node fixture next door renders n siblings at depth 2, which cannot see the
	// reads that walk the ANCESTOR chain: `keyboardOwner` recurses `#parentNode?.keyboardOwner`, and
	// every header's `attrs` reads it (`bond.keyboardOwner.focusedId`). With n siblings that walk is
	// O(1) per header; with n nested nodes it is O(depth), so n headers cost O(n^2) -- invisible on
	// the breadth axis, which is the only axis the gate had.
	//
	// One node per level, so `n` IS the depth: the unit under test is nesting, not fan-out.
	import Level from './tree-depth-level.test.svelte';

	let { n = 50 }: { n?: number } = $props();
</script>

<Level depth={n} />
