<script lang="ts">
	import { createAtomInstance, type Bond } from '$ixirjs/ui/shared/bond';

	let { bond, events }: { bond: Bond; events: string[] } = $props();

	const atom = createAtomInstance('probe', {
		resolveBond: () => bond,
		capabilities: [
			() => {
				events.push('setup');
				return () => events.push('teardown');
			}
		]
	});
	const sibling = createAtomInstance('sibling', { resolveBond: () => bond });
</script>

<div data-id={atom.id} data-sibling-id={sibling.id}>probe</div>
