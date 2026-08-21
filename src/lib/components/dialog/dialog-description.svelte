<script lang="ts" generics="E extends HtmlElementTagName = 'p', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import type { DialogDescriptionProps } from './types';
	import { DialogBond } from './bond.svelte';

	const props: DialogDescriptionProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(DialogBond, 'description', () => props, {
		as: 'p',
		class: ''
	});
</script>

{@render Kernel.render(el)(el, props.children, { dialog: el.bond })}
