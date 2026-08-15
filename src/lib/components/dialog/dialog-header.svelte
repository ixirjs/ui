<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import type { DialogHeaderProps } from './types';
	import { DialogBond } from './bond.svelte';

	const props: DialogHeaderProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DialogBond, 'header', () => props, {
		class: 'flex w-full px-4 text-xl'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	{ dialog: el.bond },
	el.motion(),
	el
)}
