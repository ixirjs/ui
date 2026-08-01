<script lang="ts" module>
	// Mount/cleanup tallies for the capability probe in the spec.
	export const tally = { mount: 0, cleanup: 0 };
	export function resetTally() {
		tally.mount = 0;
		tally.cleanup = 0;
	}
</script>

<script lang="ts">
	import { createAtomInstance } from './use-atom.svelte';
	import { untrack } from 'svelte';
	import type { Bond } from './bond.svelte';

	type ProbeProps = { bond: Bond; tick?: number };

	let { bond, tick = 0 }: ProbeProps = $props();

	const atom = createAtomInstance('item', { bond: untrack(() => bond) }).role('item', 'x');

	// `tick` (a prop) forces the derived to re-run, re-reading atom.spread — the same trigger a real
	// consumer hits whenever any projected state (selection, isOpen, ...) changes. The node is created
	// once by the rendered part, so reading spread keeps attachment identity stable across passes.
	const attrs = $derived({ 'data-tick': tick, ...atom.spread });
</script>

<div {...attrs} data-testid="el">x</div>
