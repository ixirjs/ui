<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StackContext } from './bond.svelte';
	import type { StackItemProps } from './types';

	const bond = StackContext.getOrThrow('Stack.Item must be used within a Stack.Root component.');

	let {
		value,
		as = undefined,
		base = undefined,
		motion = undefined,
		initial = undefined,
		enter = undefined,
		exit = undefined,
		animate = undefined,
		presetLayer = undefined,
		children,
		...restProps
	}: StackItemProps = $props();

	$effect.pre(() => {
		if (value == null) return;
		bond.registerItem(value);
		return () => bond.unregisterItem(value);
	});

	const el = Kernel.element(() => restProps, {
		preset: 'stack.item',
		class: 'stack-item',
		state: bond,
		as: () => as,
		base: () => base,
		layer: () => presetLayer,
		// A consumer transition (Radio's indicator) rides the transition leaf.
		motion: () =>
			motion ??
			(initial || enter || exit || animate ? { initial, enter, exit, animate } : undefined),
		attrs: () => ({
			'data-value': value,
			'data-active': bond.props.value === value,
			id: bond.itemId(value),
			'data-atom': bond.id,
			'data-kind': 'stack-item',
			'data-stack-item': value,
			style: `z-index: ${bond.getZIndex(value)}`
		})
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
