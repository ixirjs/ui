<script lang="ts" generics="E extends HtmlElementTagName = 'label', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { FieldBond } from './bond.svelte';
	import type { FieldLabelProps } from '$ixirjs/ui/components/form/types';

	const props: FieldLabelProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(FieldBond, 'label', () => props, { class: 'flex' });
</script>

{@render Kernel.render(el)(el, props.children, { field: el.bond })}
