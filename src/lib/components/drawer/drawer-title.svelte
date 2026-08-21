<script lang="ts" generics="E extends HtmlElementTagName = 'h3', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { DrawerBond } from './bond.svelte';
	import type { SlideoverTitleProps } from './types';

	const props: SlideoverTitleProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DrawerBond, 'title', () => props, {
		as: 'h3',
		class: ''
	});
</script>

{@render Kernel.render(el)(el, props.children, { drawer: el.bond })}
