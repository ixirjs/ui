<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { type Base, type BasePropsOf, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { definePart } from '$ixirjs/ui/components/atom/define-part.svelte';
	import { AlertBond } from './bond.svelte';
	import type { AlertContentProps } from './types';

	const props: AlertContentProps<E, B> & BasePropsOf<B> = $props();

	const el = definePart(AlertBond, 'content', () => props, {
		class: 'alert-content border-border flex-1 space-y-1',
		context: 'optional'
	});
</script>

{@render Kernel.render(el)(el, props.children, { alert: el.bond! })}
