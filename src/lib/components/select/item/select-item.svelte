<script lang="ts" generics="D">
	import { SelectItemAtom, type SelectItemAtomProps } from './bond.svelte';
	import type { SelectItemProps } from './types';
	import { SelectBond } from '../bond.svelte';
	import { List } from '../../list';

	const select = SelectBond.get();

	if (!select) {
		throw new Error('<SelectItem> must be used within a <Select>.');
	}

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		id=ID,
		value,
		data = undefined,
		children = undefined,
		onclick = undefined as ((ev: MouseEvent) => void) | undefined,
		...restProps
	}: SelectItemProps<D> = $props();

	// `atom`'s name is value-specific (`item-<value>`), so read the shared
	// `select.item` preset from the bond's canonical item atom instead.
	const presentation = $derived({ preset: preset ?? select.item().preset });

	// Create reactive props object for the atom
	const itemProps = $derived({
		id,
		value,
		data
	} as SelectItemAtomProps<D>);

	// Create the atom instance
	const atom = new SelectItemAtom<D>(itemProps, select);

	// Derived reactive properties
	const isHighlighted = $derived(atom.isHighlighted);
	const isSelected = $derived(atom.isSelected);

	// Merge atom attrs with custom props
	const itemAttrs = $derived({
		...atom.spread,
		...restProps
	});

	// Register item with select state and handle mounting
	$effect.pre(() => {
		select.state.registerItem(ID, atom);

		return () => {
			select.state.unregisterItem(ID);
		};
	});

	function handleClick(ev: MouseEvent) {
		(onclick as ((ev: MouseEvent) => void) | undefined)?.(ev);

		if (ev.defaultPrevented) {
			return;
		}

		ev.preventDefault();

		atom.select();
		select?.state?.close();
	}
</script>

<List.Item
	class={[
		'cursor-pointer',
		isHighlighted && 'bg-foreground/5',
		isSelected && 'bg-primary/5 hover:bg-primary/10 active:bg-primary/15',
		'$preset',
		klass
	]
		.filter(Boolean)
		.join(' ')}
	{...presentation}
	{...itemAttrs}
	onclick={handleClick}
>
	{@render children?.({ selectItem: atom as unknown as import('./controller.svelte').SelectItemController<D> })}
</List.Item>
