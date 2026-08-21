<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { CardBond } from './bond.svelte';
	import type { CardMediaProps } from './types';

	const props: CardMediaProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(CardBond, 'media', () => props, {
		as: 'div',
		class: 'card-media border-border overflow-hidden',
		context: 'optional'
	});
</script>

{@render Kernel.render(el)(el, props.children)}
