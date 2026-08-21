<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { DialogBodyProps } from './types';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { DialogBond } from './bond.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';

	const props: DialogBodyProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DialogBond, 'body', () => props, {
		class: 'px-4 py-2'
	});
</script>

{@render Kernel.render(el)(el, props.children, { dialog: el.bond })}
