<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { StepperBond } from './bond.svelte';
	import type { StepperHeaderProps } from './types';

	const bond = StepperBond.getOrThrow('Stepper.Header must be used within a Stepper component.');

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperHeaderProps<E, B> & BasePropsOf<B> = $props();

	const headerProps = $derived(mergePresetProps(preset, 'stepper.header', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const bodyArg = { stepper: bond };
	const el = Kernel.element(Kernel.static, () => ({
		bond,
		class: ['stepper-header w-full', '$preset', klass],
		...headerProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), children, bodyArg, el.motion(), el)}
