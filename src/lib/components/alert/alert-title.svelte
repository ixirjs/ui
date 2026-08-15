<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { AlertBond } from './bond.svelte';
	import type { AlertTitleProps } from './types';

	const props: AlertTitleProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(AlertBond, 'title', () => props, {
		as: 'h4',
		class: 'alert-title border-border text-sm leading-tight font-medium',
		context: 'optional'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	{ alert: el.bond! },
	el.motion(),
	el
)}
