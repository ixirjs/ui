<script lang="ts" module>
	// Mount/cleanup tallies for the capability probe in the spec.
	export const tally = { mount: 0, cleanup: 0 };
	export function resetTally() {
		tally.mount = 0;
		tally.cleanup = 0;
	}
</script>

<script lang="ts">
	import type { Bond } from './bond.svelte';

	let { bond, tick = 0 }: { bond: Bond; tick?: number } = $props();

	// `tick` (a prop) forces the derived to re-run, re-reading atom.spread — the same trigger a real
	// consumer hits whenever any projected state (selection, isOpen, …) changes. The regression is that
	// re-reading spread used to re-mint attachment keys and remount the element. bond.atom('item') is
	// cached, so reading it inside the derived returns the same atom each pass.
	const props = $derived({ 'data-tick': tick, ...bond.atom('item').spread });
</script>

<div {...props} data-testid="el">x</div>
