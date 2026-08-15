<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { CardBond } from './bond.svelte';
	import type { CardSubtitleProps } from './types';

	const props: CardSubtitleProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(CardBond, 'subtitle', () => props, {
		as: 'p',
		class: 'card-subtitle border-border text-sm font-medium text-gray-600',
		context: 'optional'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	undefined,
	el.motion(),
	el
)}
