<script module lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CardBond } from './bond.svelte';
	const PLAN = Kernel.part(CardBond, 'header', {
		as: 'div',
		class: 'card-header border-border flex flex-col space-y-1.5 px-4 py-4'
	});
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { CardHeaderProps } from './types';

	const props: CardHeaderProps<E, B> & BasePropsOf<B> = $props();
	const node = Kernel.node(PLAN, () => props);
</script>

{@render Kernel.render(node)(
	node.tag(),
	node.class(),
	node.attrs(),
	props.children,
	undefined,
	undefined,
	node
)}
