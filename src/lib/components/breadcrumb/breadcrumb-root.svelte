<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps, type Base, type HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import type { BreadcrumbRootProps } from './types';

	let {
		class: klass = '',
		as = 'div',
		preset = undefined,
		children = undefined,
		...restProps
	}: BreadcrumbRootProps<E, B> = $props();

	const rootProps = $derived(mergePresetProps(preset, 'breadcrumb', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		class: ['border-border flex flex-nowrap items-center gap-1', '$preset', klass],
		'data-kind': 'breadcrumb-root',
		...rootProps
	}));
</script>

{@render Kernel.render(el)(el, children)}
