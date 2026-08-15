<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { CardBond } from './bond.svelte';
	import type { CardDescriptionProps } from './types';

	const props: CardDescriptionProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(CardBond, 'description', () => props, {
		as: 'p',
		class: 'card-description border-border text-sm text-gray-500',
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
