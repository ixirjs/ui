<script lang="ts" generics="E extends HtmlElementTagName = 'p', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { StepBond } from './bond.svelte';
	import type { StepDescriptionProps } from './types';

	const props: StepDescriptionProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(StepBond, 'description', () => props, {
		as: 'p',
		class: 'text-xs text-muted-foreground'
	});
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	props.children,
	{ step: el.bond },
	el.motion(),
	el
)}
