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
	// `outsidePressListener({ listen: false })` re-registers the same slot (last-wins) with its
	// listener suppressed, leaving every other overlay policy intact.
	import { DropdownMenu } from '$ixirjs/ui/components/dropdown-menu';
	import {
		DropdownMenuBond,
		type DropdownMenuBondProps
	} from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import { outsidePressListener } from '$ixirjs/ui/shared/capability/models';

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
	function factory(props: DropdownMenuBondProps) {
		const bond = DropdownMenuBond.create(props);
		bond.capability(outsidePressListener({ listen: false }));
		const staged = bond.stageOpenChange.bind(bond);
		bond.stageOpenChange = (context) => {
			if (context?.reason === 'item-select') onselect?.();
			staged(context);
		};
		return bond;
	}
</script>

<DropdownMenu.Root bind:open {factory}>
	<DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
	<DropdownMenu.Item {onclick} data-testid="item">Item</DropdownMenu.Item>
</DropdownMenu.Root>
