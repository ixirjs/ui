<script lang="ts" generics="E extends HtmlElementTagName = 'p', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { FieldBond } from './bond.svelte';
	import type { FieldTextProps } from '$ixirjs/ui/components/form/types';

	const props: FieldTextProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(FieldBond, 'description', () => props, {
		as: 'p',
		class: 'text-muted-foreground mt-1 text-xs',
		message: '<Field.HelperText /> must be used within a <Field.Root />'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	{ field: el.bond },
	el.motion(),
	el
)}
