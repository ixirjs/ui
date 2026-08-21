<script lang="ts" generics="E extends HtmlElementTagName='div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { SlideoverFooterProps } from './types';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { DrawerBond } from './bond.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';

	const props: SlideoverFooterProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DrawerBond, 'footer', () => props, {
		class: ''
	});
</script>

{@render Kernel.render(el)(el, props.children, { drawer: el.bond })}
