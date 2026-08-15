<script lang="ts">
	import { untrack } from 'svelte';
	import { createAtomInstance, type Bond } from '$ixirjs/ui/shared/bond';

	let { bond, events }: { bond: Bond; events: string[] } = $props();

	const atom = createAtomInstance('probe', {
		bond: untrack(() => bond),
		capabilities: [
			() => {
				events.push('setup');
				return () => events.push('teardown');
			}
		]
	});
	const sibling = createAtomInstance('sibling', { bond: untrack(() => bond) });
</script>

<div data-id={atom.id} data-sibling-id={sibling.id}>probe</div>
