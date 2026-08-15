<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { StepBond } from './bond.svelte';
	import type { StepHeaderProps } from './types';

	const props: StepHeaderProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(StepBond, 'header', () => props, {
		as: 'div',
		class: 'font-medium text-sm flex flex-col'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	{ step: el.bond },
	el.motion(),
	el
)}
