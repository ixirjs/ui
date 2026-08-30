<script lang="ts" module>
	const ROOT_ATTRS = { 'data-kind': 'breadcrumb-root' };
	const rootAttrs = () => ROOT_ATTRS;
</script>

<script lang="ts" generics="E extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import type { BreadcrumbRootProps } from './types';

	const props: BreadcrumbRootProps<E, B> = $props();

	const el = Kernel.element(() => props, {
		preset: 'breadcrumb',
		class: 'border-border flex flex-nowrap items-center gap-1',
		as: () => props.as,
		base: () => props.base,
		attrs: rootAttrs
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, props.children)}
