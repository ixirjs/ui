<script lang="ts">
	import { usePart } from '$ixirjs/ui/public/shared';
	import { LifetimeBond } from './part-lifetime-probe.test.svelte';

	const part = usePart(LifetimeBond, 'trigger', () => ({}));
</script>

<button data-testid="lifetime-trigger" data-atom={part.atom.name}>trigger</button>
