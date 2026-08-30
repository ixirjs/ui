<script lang="ts" generics="E extends HtmlElementTagName = 'a', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import type { BreadcrumbItemProps } from './types';

	let {
		href = '',
		as = undefined,
		base = undefined,
		children = undefined,
		...restProps
	}: BreadcrumbItemProps<E, B> & BasePropsOf<B> = $props();

	const el = Kernel.element(() => restProps, {
		preset: 'breadcrumb.item',
		class: 'border-border text-foreground/70 hover:text-foreground flex gap-2 rounded-lg px-2 py-1',
		as: () => as ?? 'a',
		base: () => base,
		attrs: () => ({ href, 'data-kind': 'breadcrumb-item' })
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
