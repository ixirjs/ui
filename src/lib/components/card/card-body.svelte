<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CardBond } from './bond.svelte';
	const PLAN = Kernel.plan(CardBond, 'content', {
		class: 'card-content border-border px-4 pb-4'
	});
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { CardContentProps } from './types';

	const props: CardContentProps<E, B> & BasePropsOf<B> = $props();
	const node = Kernel.node(PLAN, () => props, { eagerElement: true });
</script>

{@render Kernel.render(node)(node, props.children)}
