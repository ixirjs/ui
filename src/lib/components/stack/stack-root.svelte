<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StackBond, StackContext } from './bond.svelte';
	import type { StackRootProps } from './types';
	import './stack.css';

	const ID = $props.id();

	let {
		value = $bindable<string | undefined>(undefined),
		as = undefined,
		base = undefined,
		factory = undefined,
		onvaluechange = undefined,
		children,
		...restProps
	}: StackRootProps = $props();

	// Live props; the `value` setter is the commit: the callback fires after the write, never for
	// an equal value.
	const bondProps = {
		get id() {
			return ID;
		},
		get value() {
			return value;
		},
		set value(next: string | undefined) {
			const changed = next !== value;
			value = next;
			if (changed) onvaluechange?.(next, { bond });
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = StackContext.share(build ? build(bondProps) : StackBond.create(bondProps));
	export const getBond: () => StackBond = () => bond;

	const el = Kernel.element(() => restProps, {
		// `stack.root` is the preset key, not the Bond name — keep the existing selection.
		preset: 'stack.root',
		class: 'stack-root',
		state: bond,
		variantProps: () => bondProps,
		as: () => as,
		base: () => base,
		attrs: () => ({ id: bond.rootId, 'data-atom': bond.id, 'data-kind': 'stack-root' })
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, {})}
