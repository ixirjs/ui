<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { SlideoverBackdropProps } from './types';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { DrawerBond } from './bond.svelte';

	const props: SlideoverBackdropProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DrawerBond, 'backdrop', () => props, {
		class: 'border-border absolute inset-0 bg-black/30'
	});
</script>

{@render Kernel.render(el)(el)}
