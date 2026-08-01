<script lang="ts" generics="D">
	import { SelectItemAtom, type SelectItemAtomProps } from './bond.svelte';
	import type { SelectItemProps } from './types';
	import { SelectBond } from '../bond.svelte';
	import { List } from '../../list';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';
	import { closeOverlay } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';

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

	// `atom`'s name is value-specific (`item-<value>`), so use the shared item preset key.
	const presentation = $derived({ preset: preset ?? 'select.item' });

	const itemProps = $derived({
		id,
		value,
		data
	} as SelectItemAtomProps<D>);

	const atom = createAtomInstance<SelectItemAtom<D, typeof select>, typeof select, HTMLElement>(
		() => `item-${value}`,
		{
			bond: () => select,
			required: true,
			register: { key: 'item', cardinality: 'many' },
			factory: () => new SelectItemAtom<D, typeof select>(itemProps, select)
		}
	);

	const isHighlighted = $derived(atom.isHighlighted);
	const isSelected = $derived(atom.isSelected);

	const itemAttrs = $derived({
		...atom.spread,
		...restProps
	});

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
	{...presentation}
	{...itemAttrs}
	onclick={handleClick}
>
	{@render children?.({
		selectItem: atom as unknown as import('./controller.svelte').SelectItemController<D>
	})}
</List.Item>
