<script lang="ts" generics="E extends HtmlElementTagName = 'h3', B extends Base = Base">
	// The `element` arm of the lane A/B: Card's `title` slot authored through `definePart`, which
	// resolves the full presentation for every part on every render. `Card.Title` itself authors the
	// same slot through `Kernel.part` + `Kernel.node`, which reaches the class-only lane. Same slot,
	// same plan, same rendered bytes — the only difference is which lane resolves it, which is what
	// `lane-bench.ts` measures.
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
	import type { CardTitleProps } from '$ixirjs/ui/components/card/types';

	const props: CardTitleProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(CardBond, 'title', () => props, {
		as: 'h3',
		class: 'card-title border-border text-lg leading-none font-semibold tracking-tight',
		context: 'optional'
	});
</script>

{@render Kernel.render(el)(el, props.children)}
