<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { TabsBond } from './bond.svelte';
	import type { TabsHeaderProps } from './types';

	const props: TabsHeaderProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(TabsBond, 'header', () => props, {
		class: 'relative flex min-w-full'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	{ tabs: el.bond },
	el.motion(),
	el
)}
