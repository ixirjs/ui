<script lang="ts" generics="D">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { untrack } from 'svelte';
	import { SelectItemAtom, type SelectItemAtomProps } from './bond.svelte';
	import type { SelectItemProps } from './types';
	import { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';
	import { LIST_ITEM_AS, listItemClass } from '$ixirjs/ui/components/list/item-class';
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
		untrack(() => `item-${value}`),
		{
			bond: select,
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

	// Renders the item element itself instead of mounting `<List.Item>` to do it — see the same
	// comment on `dropdown-menu-item.svelte` for the measured cost of that wrapper. This one also
	// shortens the combobox chain, whose items are `Select.Item` output, from three boundaries to two.
	//
	// The class carried TWO `$preset` sentinels before: this component's, inside the string it handed
	// down, and `List.Item`'s own. Only the last one ever placed — `mergeClassesWithPreset` uses
	// `lastIndexOf` and strips the earlier ones — so this component's sentinel always won and
	// `List.Item`'s never did. `listItemClass` puts these classes exactly where that resolved to,
	// with one sentinel.
	//
	// `preset` keeps its `?? 'select.item'` default and stays on the config: `List.Item`'s own
	// `'list.item'` fallback was already dead here, because `mergeAtomProps` always supplies a truthy
	// preset. That is load-bearing — `list.item` resolves to `px-4 py-3` where `select.item` resolves
	// to `px-2 py-1.5`, so letting the fallback wake up would restyle every option in every app.
	const el = Kernel.element(Kernel.static, () => ({
		as: LIST_ITEM_AS,
		class: listItemClass(
			[
				'cursor-pointer',
				isHighlighted && 'bg-foreground/5',
				isSelected && 'bg-primary/5 hover:bg-primary/10 active:bg-primary/15'
			],
			klass
		),
		...itemAttrs,
		onclick: handleClick
	}));
</script>

{@render Kernel.render(el)(el, children, {
	selectItem: atom as unknown as import('./controller.svelte').SelectItemController<D>
})}
