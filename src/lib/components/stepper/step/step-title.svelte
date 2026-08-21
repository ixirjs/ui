<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { StepBond } from './bond.svelte';
	import type { StepTitleProps } from './types';

	const props: StepTitleProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(StepBond, 'title', () => props, {
		as: 'div',
		class: 'font-medium text-sm'
	});
</script>

{@render Kernel.render(el)(el, props.children, { step: el.bond })}
