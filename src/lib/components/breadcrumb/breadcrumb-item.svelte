<script lang="ts" generics="E extends HtmlElementTagName = 'a', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import type { BreadcrumbItemProps } from './types';

	let {
		class: klass = '',
		href = '',
		as = 'a',
		preset = undefined,
		children = undefined,
		...restProps
	}: BreadcrumbItemProps<E, B> & BasePropsOf<B> = $props();

	const itemProps = $derived(mergePresetProps(preset, 'breadcrumb.item', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		href,
		class: [
			'border-border text-foreground/70 hover:text-foreground flex gap-2 rounded-lg px-2 py-1',
			'$preset',
			klass
		],
		'data-kind': 'breadcrumb-item',
		...itemProps
	}));
</script>

{@render Kernel.render(el)(el, children)}
