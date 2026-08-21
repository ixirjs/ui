<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import type { CollapsibleHeaderProps } from './types';
	import { CollapsibleBond } from './bond.svelte';

	const props: CollapsibleHeaderProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(CollapsibleBond, 'header', () => props, {
		class: 'border-border flex cursor-pointer items-center gap-2'
	});
</script>

{@render Kernel.render(el)(el, props.children, { collapsible: el.bond })}
