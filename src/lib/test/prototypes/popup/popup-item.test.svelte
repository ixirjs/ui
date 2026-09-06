<script lang="ts">
	import { untrack } from 'svelte';
	import { PopupContext, isDropdownMenuBond } from './bond.svelte';
	import { PopupAtom } from './atom.svelte';

	let { value }: { value: string } = $props();
	const bond = PopupContext.getOrThrow();
	if (!isDropdownMenuBond(bond)) throw new Error('Popup items require a collection profile');
	// One handle per keyed datum. All family items use the same implementation.
	const item = bond.item(untrack(() => value));
	const el = PopupAtom.item(item);
</script>

<div {...el.attrs}>{item.label}</div>
