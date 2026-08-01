<script module lang="ts">
	import { Atom, Bond } from '$ixirjs/ui/public/experimental';
	import { defineBond } from '$ixirjs/ui/public/shared';

	export class LifetimeRootAtom extends Atom<Bond> {
		constructor(bond: Bond | undefined) {
			super(bond, 'root', { namespace: 'lifetime-probe' });
		}
	}

	export class LifetimeTriggerAtom extends Atom<Bond> {
		constructor(bond: Bond | undefined) {
			super(bond, 'trigger', { namespace: 'lifetime-probe' });
		}
	}

	export const LifetimeBond = defineBond({
		name: 'lifetime-probe',
		atoms: { root: LifetimeRootAtom, trigger: LifetimeTriggerAtom }
	});
</script>

<script lang="ts">
	import { useRoot } from '$ixirjs/ui/public/shared';
	import Part from './part-lifetime-part.test.svelte';

	// A part inside an `{#if}`: on the client a part is destroyed independently of its root, which is
	// a lifetime the server render never has. This probe exists to pin that difference.
	let { show = true }: { show?: boolean } = $props();

	const ID = $props.id();
	const root = useRoot(LifetimeBond, {}, { id: () => ID });

	export function registeredTriggers() {
		return root.bond.nodesByPart('trigger').length;
	}
</script>

<button data-testid="lifetime-root" data-triggers={root.bond.nodesByPart('trigger').length}>
	root
</button>
{#if show}
	<Part />
{/if}
