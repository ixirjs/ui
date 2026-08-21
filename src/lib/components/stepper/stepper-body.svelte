<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { Stack } from '$ixirjs/ui/components/stack';
	import { StepperBond } from './bond.svelte';
	import type { StepperBodyProps } from './types';

	const bond = StepperBond.getOrThrow('Stepper.Body must be used within a Stepper component.');

	let {
		class: klass = '',
		base = Stack.Root as unknown as B,
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperBodyProps<E, B> & BasePropsOf<B> = $props();

	const bodyProps = $derived(mergePresetProps(preset, 'stepper.body', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	// Built once at init, never inside a tracked boundary — the constraint anchor-diet A3 set
	// when `bodyArg` replaced the per-part wrapper snippet.
	const bodyArg = { stepper: bond };
	const el = Kernel.element(Kernel.static, () => ({
		bond,
		base,
		class: ['stepper-body w-full', '$preset', klass],
		...bodyProps
	}));
</script>

{@render Kernel.render(el)(el, children, bodyArg)}
