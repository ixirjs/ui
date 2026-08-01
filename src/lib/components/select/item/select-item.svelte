<script lang="ts" generics="D">
	import { SelectItemAtom, type SelectItemAtomProps } from './bond.svelte';
	import type { SelectItemProps } from './types';
	import { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';
	import { List } from '$ixirjs/ui/components/list';
	import { mergeAtomProps } from '$ixirjs/ui/components/atom';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';
	import { closeOverlay } from '$ixirjs/ui/components/overlay/policies/overlay-view';

	const select = SelectBond.getOrThrow('<SelectItem> must be used within a <Select>.');

	const ID = $props.id();

	let {
		class: klass = '',
		preset = undefined,
		id = ID,
		value,
		data = undefined,
		children = undefined,
		onclick = undefined as ((ev: MouseEvent) => void) | undefined,
		...restProps
	}: SelectItemProps<D> = $props();

	const itemProps = $derived({
		id,
		value,
		data
	} as SelectItemAtomProps<D>);

	const atom = createAtomInstance<SelectItemAtom<D, typeof select>, typeof select, HTMLElement>(
		undefined,
		{
			resolveKey: () => `item-${value}`,
			resolveBond: () => select,
			required: true,
			register: { key: 'item', cardinality: 'many' },
			factory: () => new SelectItemAtom<D, typeof select>(itemProps, select)
		}
	);

	const isHighlighted = $derived(atom.isHighlighted);
	const isSelected = $derived(atom.isSelected);

	// `atom`'s name is value-specific (`item-<value>`), so use the shared item preset key.
	const itemAttrs = $derived(
		mergeAtomProps(atom, preset ?? 'select.item', restProps, select.presetLayer('item'))
	);

	// Register into select state; unregister on teardown.
	$effect.pre(() => {
		const itemValue = value;
		if (itemValue == null) return;

		select.registerItem(itemValue, atom);

		return () => {
			select.unregisterItem(itemValue);
		};
	});

	function handleClick(ev: MouseEvent) {
		(onclick as ((ev: MouseEvent) => void) | undefined)?.(ev);

		if (ev.defaultPrevented) {
			return;
		}

		ev.preventDefault();

		atom.select();
		closeOverlay(select);
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
	{...itemAttrs}
	onclick={handleClick}
>
	{@render children?.({
		selectItem: atom as unknown as import('./controller.svelte').SelectItemController<D>
	})}
</List.Item>
