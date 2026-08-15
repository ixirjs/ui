<script lang="ts" generics="E extends HtmlElementTagName = 'h2', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { DialogBond } from './bond.svelte';
	import type { DialogTitleProps } from './types';

	const props: DialogTitleProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DialogBond, 'title', () => props, {
		as: 'h3',
		class: ''
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
