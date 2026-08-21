<script lang="ts" generics="E extends HtmlElementTagName = 'p', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { SlideoverDescriptionProps } from './types';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { DrawerBond } from './bond.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';

	const props: SlideoverDescriptionProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DrawerBond, 'description', () => props, {
		as: 'p',
		class: ''
	});
</script>

{@render Kernel.render(el)(el, props.children, { drawer: el.bond })}
