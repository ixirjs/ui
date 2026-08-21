<script lang="ts" generics="E extends HtmlElementTagName = 'p', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import type { TabDescriptionProps } from '$ixirjs/ui/components/tabs/types';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { TabBond } from './bond.svelte';

	const props: TabDescriptionProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(TabBond, 'description', () => props, {
		as: 'p',
		class: ''
	});
</script>

{@render Kernel.render(el)(el, props.children, { tab: el.bond })}
