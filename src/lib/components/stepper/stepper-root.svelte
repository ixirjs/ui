<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { StepperBond, StepperContext } from './bond.svelte';
	import type { StepperRootProps } from './types';

	const ID = $props.id();

	let {
		step = $bindable(0),
		as = undefined,
		base = undefined,
		linear = false,
		disabled = false,
		orientation = 'horizontal',
		onstepchange = undefined,
		children = undefined,
		factory = undefined,
		...restProps
	}: StepperRootProps = $props();

	// Live props; the `step` setter is the commit: the callback fires after the write, never for
	// an equal value.
	const bondProps = {
		get id() {
			return ID;
		},
		get step() {
			return step;
		},
		set step(next: number) {
			const changed = next !== step;
			step = next;
			if (changed) onstepchange?.(next, { bond });
		},
		get linear() {
			return linear;
		},
		get disabled() {
			return disabled;
		},
		get orientation() {
			return orientation;
		}
	};
	// `factory` is read once, at init, by design.
	const build = untrack(() => factory);
	const bond = StepperContext.share(build ? build(bondProps) : StepperBond.create(bondProps));
	export const getBond = () => bond;

	const el = Kernel.element(() => restProps, {
		preset: 'stepper',
		class: 'flex flex-col',
		state: bond,
		variantProps: () => bondProps,
		as: () => as,
		base: () => base,
		attrs: () => ({ id: bond.rootId, role: 'group' })
	});
	// Bound once: an identifier callee compiles to a direct call — no snippet block, no anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { stepper: bond })}
