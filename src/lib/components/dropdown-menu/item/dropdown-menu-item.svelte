<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base"
>
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { DropdownMenuItemAtom, type DropdownMenuItemAtomProps } from './bond.svelte';
	import { DropdownMenuBond } from '../bond.svelte';
	import type { DropdownMenuItemProps } from './types';
	import { List } from '../../list';

	const menu = DropdownMenuBond.get();

	if (!menu) {
		throw new Error('<DropdownMenuItem> must be used within a <DropdownMenu>.');
	}

	const ID = $props.id();
	let {
		class: klass = '',
		id = ID,
		preset = undefined,
		disabled = undefined,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DropdownMenuItemProps = $props();

	// `atom`'s name is id-specific (`item-<id>`), so read the shared
	// `dropdown-menu.item` preset from the bond's canonical item atom instead.
	const presentation = $derived({ preset: preset ?? menu.item().preset });

	// Create reactive props object for the atom
	const itemProps = $derived<DropdownMenuItemAtomProps>({
		id,
		disabled
	});

	// Create the atom instance
	const atom = new DropdownMenuItemAtom<typeof menu>(itemProps, menu);

	// Merge atom spread (attrs + handlers + element attachment + roving projection)
	// with custom props.
	const itemAttrs = $derived({
		...atom.spread,
		...restProps
	});

	// Register the item into the bond so roving focus / keyboard navigation can see
	// it. Stable (outside the reactive `spread`), so it never feeds the mount loop.
	$effect.pre(() => {
		menu.state.registerItem(ID, atom);

		return () => {
			menu.state.unregisterItem(ID);
		};
	});

	function handleClick(ev: MouseEvent) {
		onclick?.(ev);

		if (ev.defaultPrevented) {
			return;
		}

		ev.preventDefault();

		atom.close();
	}

	export function getController() {
		return atom;
	}
</script>

<List.Item
	class={[
		'border-border last:border-b-0 hover:bg-foreground/5 active:bg-foreground/10 outline-primary cursor-pointer border-b',
		'$preset',
		klass
	]
		.filter(Boolean)
		.join(' ')}
	{...presentation}
	{...itemAttrs}
	onclick={handleClick}
>
	{@render children?.({ menuItem: atom })}
</List.Item>
