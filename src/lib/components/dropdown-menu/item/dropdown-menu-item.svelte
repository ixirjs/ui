<script lang="ts">
	import { DropdownMenuItemAtom, type DropdownMenuItemAtomProps } from './bond.svelte';
	import { DropdownMenuBond } from '../bond.svelte';
	import type { DropdownMenuItemProps } from './types';
	import { List } from '../../list';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';

	const menu = DropdownMenuBond.getOrThrow(
		'<DropdownMenuItem> must be used within a <DropdownMenu>.'
	);

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

	const itemProps = $derived<DropdownMenuItemAtomProps>({
		id,
		disabled
	});

	const atom = createAtomInstance<DropdownMenuItemAtom<typeof menu>, typeof menu, HTMLElement>(
		() => `item-${id}`,
		{
			bond: () => menu,
			required: true,
			register: { key: 'item', cardinality: 'many' },
			factory: () => new DropdownMenuItemAtom<typeof menu>(itemProps, menu)
		}
	);

	const presentation = $derived({ preset: preset ?? atom.preset });

	// Atom spread (attrs + handlers + element attachment + roving projection) plus custom props.
	const itemAttrs = $derived({
		...atom.spread,
		...restProps
	});

	// Register the item into the bond so roving focus / keyboard navigation can see
	// it. Stable (outside the reactive `spread`), so it never feeds the mount loop.
	$effect.pre(() => {
		const itemId = id;
		menu.registerItem(itemId, atom);

		return () => {
			menu.unregisterItem(itemId);
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
