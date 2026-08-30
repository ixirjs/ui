<script lang="ts" generics="D">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { LIST_ITEM_AS, LIST_ITEM_CLASS } from '$ixirjs/ui/components/list/item-class';
	import { SelectContext } from '$ixirjs/ui/components/select/bond.svelte';
	import { SelectItemAtom } from './bond.svelte';
	import type { SelectItemProps } from './types';

	const select = SelectContext.getOrThrow('<SelectItem> must be used within a <Select>.');

	const ID = $props.id();
	// `class` and `preset` deliberately stay in restProps: the seam reads the consumer's class from
	// there and falls back to `spec.preset` when no explicit key is passed.
	let {
		id = ID,
		value,
		data = undefined,
		as = LIST_ITEM_AS,
		children = undefined,
		...restProps
	}: SelectItemProps<D> = $props();

	// Live getters, not a `$derived` snapshot: the option is constructed once and read through.
	const item = new SelectItemAtom<D, typeof select>(
		{
			get id() {
				return id;
			},
			get value() {
				return value;
			},
			get data() {
				return data;
			}
		} as never,
		select
	);

	// `onmount`/`ondestroy` and the motion props are Kernel-owned and need the motion rune. Declaring
	// it unconditionally would put EVERY item on the motion leaf, so the question is asked once, at
	// init, and only an item that actually declares one pays for it.
	const declaresMotion = untrack(() =>
		Boolean(
			restProps.onmount ??
			restProps.ondestroy ??
			restProps.animate ??
			restProps.enter ??
			restProps.exit ??
			restProps.initial ??
			restProps.motion
		)
	);

	// Registered by VALUE, at init, so membership follows document order.
	const key = untrack(() => value);
	const release = key == null ? undefined : select.registerItem(key, item);
	$effect(() => release);

	// Composed by the seam ahead of a consumer's own `onclick`: theirs runs first and this is
	// skipped when they prevented the default. `Combobox.Item` relies on exactly that.
	function onclick(event: MouseEvent) {
		event.preventDefault();
		item.select();
		select.close();
	}

	const el = Kernel.element(() => restProps, {
		preset: 'select.item' as PresetModuleName,
		class: LIST_ITEM_CLASS,
		state: select,
		as: () => as,
		layer: () => select.props.presets?.item,
		...(declaresMotion ? { motion: () => restProps.motion as never } : {}),
		attrs: () => {
			const isSelected = item.isSelected;
			return {
				class: [
					'cursor-pointer',
					item.isHighlighted && 'bg-foreground/5',
					isSelected && 'bg-primary/5 hover:bg-primary/10 active:bg-primary/15'
				]
					.filter(Boolean)
					.join(' '),
				id: item.domId,
				role: 'option',
				'data-highlighted': item.isHighlighted,
				'aria-selected': isSelected,
				'data-selected': isSelected ? '' : undefined,
				onclick
			};
		}
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block,
	// no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, {
	selectItem: item as unknown as import('./controller.svelte').SelectItemController<D>
})}
