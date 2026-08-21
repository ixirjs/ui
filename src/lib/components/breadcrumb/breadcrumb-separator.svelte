<script lang="ts" generics="E extends HtmlElementTagName = 'span', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import type { BreadcrumbSeparatorProps } from './types';

	let {
		class: klass = '',
		as = 'span',
		preset = undefined,
		children = undefined,
		...restProps
	}: BreadcrumbSeparatorProps<E, B> & BasePropsOf<B> = $props();

	const separatorProps = $derived(mergePresetProps(preset, 'breadcrumb.separator', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		class: ['text-stroke-0/50 border-border px-0', '$preset', klass],
		'data-kind': 'breadcrumb-separator',
		...separatorProps
	}));
</script>

{@render Kernel.render(el)(el, children ?? fallback)}

{#snippet fallback()}
	/
{/snippet}
