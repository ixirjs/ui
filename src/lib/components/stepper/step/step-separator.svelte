<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { StepBond } from './bond.svelte';
	const PART = Kernel.plan(StepBond, 'separator', { class: '' });
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { StepperBond } from '$ixirjs/ui/components/stepper/bond.svelte';
	import type { StepSeparatorProps } from './types';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: StepSeparatorProps<E, B> & BasePropsOf<B> = $props();

	const part = Kernel.node(PART, () => ({ preset }), { context: 'required' });
	const stepperBond = StepperBond.getOrThrow(
		'StepSeparator must be used within a Stepper component.'
	);

	const isVertical = $derived(stepperBond?.props?.orientation === 'vertical');

	const el = Kernel.element(part, () => ({
		class: [
			'flex-1 data-[active=true]:bg-primary data-[completed=true]:bg-primary/70',
			isVertical ? 'h-8 w-0.5 mx-auto' : 'h-0.5 w-full my-auto',
			'bg-border',
			'$preset',
			klass
		],
		...restProps
	}));
</script>

{@render Kernel.render(el)(el, children, { step: part.bond })}
