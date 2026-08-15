<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { ScrollableContentProps } from './types';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { ScrollableBond } from './bond.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';

	const props: ScrollableContentProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(ScrollableBond, 'content', () => props, {
		as: 'div',
		class: 'scrollable-content border-border h-full max-h-full'
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
