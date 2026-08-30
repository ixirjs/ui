<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionItemBond, AccordionItemContext } from './bond.svelte';
	import type { AccordionItemRootProps } from './types';

	const ID = $props.id();

	let {
		value,
		as = undefined,
		base = undefined,
		data = undefined,
		disabled = false,
		factory = undefined,
		children = undefined,
		presets = undefined,
		...restProps
	}: AccordionItemRootProps = $props();

	const bondProps = {
		get id() {
			return ID;
		},
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get data() {
			return data;
		},
		get presets() {
			return presets;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = AccordionItemContext.share(
		build ? build(bondProps) : AccordionItemBond.create(bondProps)
	);
	// Registered at init — document order — and released on teardown.
	const detach = bond.parent.attachItem(bond.id, bond);
	$effect(() => detach);
	export const getBond = () => bond;

	// Dispatches rather than writing a literal `<div>`: an item is the part a theme retags — the docs
	// preset renders it as `<li>` through `render.as` — and `as`/`base` stay available to a consumer.
	// The price is the dispatch (+1 anchor, ~2–3 µs per item), paid only here.
	const el = Kernel.element(() => restProps, {
		preset: 'accordion.item',
		class: 'border-border',
		state: bond,
		layer: () => presets?.root,
		as: () => as,
		base: () => base,
		attrs: () => ({ id: bond.rootId })
	});
	// Bound once, in the script: `{@render leaf(...)}` with a plain identifier compiles to a direct
	// call on both platforms — no snippet block, no hydration anchor. The inline
	// `Kernel.render(el)(...)` form is a block with an anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { accordionItem: bond })}
