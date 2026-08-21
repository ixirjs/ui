<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CardBond } from './bond.svelte';
	const PLAN = Kernel.plan(CardBond, 'title', {
		as: 'h3',
		class: 'card-title border-border text-lg leading-none font-semibold tracking-tight'
	});
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'h3', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { CardTitleProps } from './types';

	const props: CardTitleProps<E, B> & BasePropsOf<B> = $props();
	const node = Kernel.node(PLAN, () => props, { eagerElement: true });
</script>

{@render Kernel.render(node)(node, props.children)}
