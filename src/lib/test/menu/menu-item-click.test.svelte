<script lang="ts">
	// The item sits directly under the Root, as `menu-ablation.test.svelte` also does: inside
	// `Content` it would portal, and resolving that needs a portal host this fixture has no reason to
	// stand up.
	//
	// The consequence has to be neutralised rather than tolerated. `Content` is the dismissible
	// surface, so a click on an item hoisted out of it reads as an OUTSIDE press — and that fires on
	// `pointerdown`, i.e. BEFORE the click handler under test. Left in place it closes the menu first,
	// which both reorders the callbacks and masks the double-fire this fixture exists to detect: the
	// item's own `close()` on an already-closed menu is a no-op, so the `onopenchange` count would
	// read 1 whether the Atom's handler fired once or twice.
	//
	// The root's outside-press dismissal stages `reason: 'outside-press'`, never `'item-select'`, so
	// it cannot inflate the count this fixture reads; the item's own handler is the only source.
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
	import type { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';

	let {
		open = $bindable(true),
		// A no-op default rather than `undefined`: under exactOptionalPropertyTypes an optional prop
		// cannot be forwarded as possibly-undefined, and a no-op is equivalent for this fixture.
		onclick = () => undefined,
		onselect = undefined
	}: {
		open?: boolean;
		onclick?: (event: MouseEvent) => void;
		/** Called once per `stageOpenChange({ reason: 'item-select' })` — the double-fire probe. */
		onselect?: () => void;
	} = $props();

	// `onopenchange` cannot see a double-fire: the second `close()` lands on an already-closed menu and
	// changes nothing, so the count reads 1 either way (verified by mutation — dropping the item's
	// `preventDefault` left an "exactly once" assertion still passing). `stageOpenChange` is called
	// unconditionally by both the Atom's handler and `atom.close()`, so counting it does have teeth.
	function observe(bond: DropdownMenuBond) {
		const staged = bond.stageOpenChange.bind(bond);
		bond.stageOpenChange = (context) => {
			if (context?.reason === 'item-select') onselect?.();
			staged(context);
		};
		return '';
	}
</script>

<DropdownMenu.Root bind:open>
	{#snippet children({ popover })}
		{observe(popover)}
		<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
		<DropdownMenu.Item {onclick} data-testid="item">Item</DropdownMenu.Item>
	{/snippet}
</DropdownMenu.Root>
