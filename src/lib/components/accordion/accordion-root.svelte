<script lang="ts">
	import { untrack } from 'svelte';
	import { BROWSER } from 'esm-env';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { AccordionBond, AccordionContext } from './bond.svelte';
	import type { AccordionRootProps } from './types';

	const ID = $props.id();

	let {
		value = $bindable(undefined),
		values = $bindable([]),
		data = $bindable([]),
		multiple = false,
		collapsible = false,
		disabled = false,
		onvaluechange = undefined,
		onvalueschange = undefined,
		children = undefined,
		factory = undefined,
		presets = undefined,
		...restProps
	}: AccordionRootProps = $props();

	// Live props: read through getters wherever the Bond needs them.
	const bondProps = {
		get id() {
			return ID;
		},
		get values(): string[] {
			return multiple ? values : ([value].filter(Boolean) as string[]);
		},
		get multiple() {
			return multiple;
		},
		get collapsible() {
			return collapsible;
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
	const bond = AccordionContext.share(build ? build(bondProps) : AccordionBond.create(bondProps));
	// Controlled state: the Bond decides, the root writes, the callback fires after the write.
	bond.bindCommit((next, context) => {
		values = next;
		value = next[0];
		if (multiple) onvalueschange?.(next, context);
		else onvaluechange?.(next[0], context);
	});
	if (BROWSER) queueMicrotask(() => (bond.settled = true));
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'accordion',
		class: 'bg-card border-border flex list-none flex-col',
		state: bond,
		layer: () => presets?.root,
		attrs: () => {
			const attrs: Record<string, unknown> = { id: Kernel.id(ID, 'accordion-root') };
			if (disabled) attrs['aria-disabled'] = true;
			if (multiple) attrs['aria-multiselectable'] = true;
			return attrs;
		}
	});
</script>

<div {...el.attrs}>{@render children?.({ accordion: bond })}</div>
