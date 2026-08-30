<script lang="ts" generics="D extends string">
	import { onMount, untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { TabsBond, TabsContext } from './bond.svelte';
	import type { TabsRootProps } from './types';

	const ID = $props.id();

	let {
		value = $bindable(),
		as = undefined,
		base = undefined,
		children,
		onvaluechange = undefined,
		presets = undefined,
		factory = undefined,
		...restProps
	}: TabsRootProps<D> = $props();

	// Callbacks report transitions after mount, never the ones registration makes during it.
	let callbacksReady = false;
	onMount(() => {
		callbacksReady = true;
	});

	// Live props; the `value` setter is the commit: the callback fires after the write, never for
	// an equal value.
	const bondProps = {
		get id() {
			return ID;
		},
		get value(): string | undefined {
			return value;
		},
		set value(next: string | undefined) {
			const changed = next !== value;
			value = next as D | undefined;
			if (changed && callbacksReady) onvaluechange?.(next as D | undefined, { bond });
		},
		get presets() {
			return presets;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = TabsContext.share(build ? build(bondProps) : TabsBond.create(bondProps));
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'tabs',
		class: 'flex w-full flex-1 flex-col',
		state: bond,
		variantProps: () => bondProps,
		layer: () => presets?.root,
		as: () => as,
		base: () => base,
		attrs: () => ({ id: bond.rootId, 'aria-orientation': 'horizontal' })
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { tabs: bond })}
