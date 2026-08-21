<script lang="ts" generics="E extends HtmlElementTagName = 'p', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { ToastBond } from './bond.svelte';
	import type { ToastTitleProps } from './types';

	const props: ToastTitleProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(ToastBond, 'title', () => props, {
		as: 'p',
		class: ''
	});
</script>

{@render Kernel.render(el)(el, props.children, { toast: el.bond })}
