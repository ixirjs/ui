<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { StepperBond } from './bond.svelte';
	import type { StepperFooterProps } from './types';

	const bond = StepperBond.getOrThrow('StepperFooter must be used within a Stepper component.');

	let {
		class: klass = '',
		children = undefined,
		preset = undefined,
		...restProps
	}: StepperFooterProps<E, B> & BasePropsOf<B> = $props();

	const footerProps = $derived(mergePresetProps(preset, 'stepper.footer', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const bodyArg = { stepper: bond };
	const el = Kernel.element(Kernel.static, () => ({
		bond,
		class: ['stepper-footer w-full', '$preset', klass],
		...footerProps
	}));
</script>

{@render Kernel.render(el)(el, children, bodyArg)}
