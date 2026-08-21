<script lang="ts" generics="E extends HtmlElementTagName = 'h3', B extends Base = Base">
	// Bisect arm: `card-title.svelte` VERBATIM, with the one difference that `Kernel.plan` is called in
	// the instance script instead of `<script module>`. Nothing else changes — no `definePart`, no
	// options object, no `context`. Against `direct` this isolates the cost of resolving a plan per
	// component instance from everything else `definePart` does on top.
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import type { CardTitleProps } from '$ixirjs/ui/components/card/types';

	const props: CardTitleProps<E, B> & BasePropsOf<B> = $props();

	const PLAN = Kernel.plan(CardBond, 'title', {
		as: 'h3',
		class: 'card-title border-border text-lg leading-none font-semibold tracking-tight'
	});
	const node = Kernel.node(PLAN, () => props);
</script>

{@render Kernel.render(node)(node, props.children)}
