<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { CardBond } from './bond.svelte';
	import type { CardFooterProps } from './types';

	const props: CardFooterProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(CardBond, 'footer', () => props, {
		as: 'div',
		class: 'card-footer border-border flex items-center gap-2 px-4 pb-4',
		context: 'optional'
	});
</script>

{@render Kernel.render(el)(el, props.children)}
