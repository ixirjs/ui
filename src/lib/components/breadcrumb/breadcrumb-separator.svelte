<script lang="ts" module>
	const SEPARATOR_ATTRS = { 'data-kind': 'breadcrumb-separator' };
	const separatorAttrs = () => SEPARATOR_ATTRS;
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'span', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import type { BreadcrumbSeparatorProps } from './types';

	const props: BreadcrumbSeparatorProps<E, B> & BasePropsOf<B> = $props();

	const el = Kernel.element(() => props, {
		preset: 'breadcrumb.separator',
		class: 'text-stroke-0/50 border-border px-0',
		as: () => props.as ?? 'span',
		base: () => props.base,
		attrs: separatorAttrs
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children ?? fallback)}

{#snippet fallback()}
	/
{/snippet}
