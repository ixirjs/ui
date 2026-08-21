<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CardBond } from './bond.svelte';
	const PLAN = Kernel.plan(CardBond, 'header', {
		as: 'div',
		class: 'card-header border-border flex flex-col space-y-1.5 px-4 py-4'
	});
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { CardHeaderProps } from './types';

	const props: CardHeaderProps<E, B> & BasePropsOf<B> = $props();
	const node = Kernel.node(PLAN, () => props, { eagerElement: true });
</script>

{@render Kernel.render(node)(node, props.children)}
