<script lang="ts" generics="T extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Content } from '$ixirjs/ui/components/popover/atoms';
	import {
		PopoverBond,
		type AnchorSize,
		type PopoverContentProps
	} from '$ixirjs/ui/components/popover';
	import type { Base, ComponentBase, HtmlElementTagName } from '$ixirjs/ui/components/atom';
	import { Root } from '$ixirjs/ui/components/list/atoms';

	const bond = PopoverBond.getOrThrow(
		'<DropdownMenu.Content /> must be used within a <DropdownMenu.Root />'
	);

	// Thin wrapper over popover Content (shares the popover context key, resolves preset
	// as `dropdown-menu.content`); supplies dropdown-specific defaults and forwards `preset`.
	let {
		class: klass = '',
		as = 'ul' as T,
		base = Root as unknown as B,
		preset = undefined,
		minWidth = 'var(--sa-anchor-width)' as AnchorSize,
		children = undefined,
		...restProps
	}: PopoverContentProps<T, B> = $props();
</script>

<!-- `base` is still the generic `B` at this point, and Content's `BasePropsOf<B>` is a conditional
     that nothing is assignable to while `B` is unresolved. Widening to the concrete base union
     discharges it; the forwarded runtime value is unchanged. -->
<Content
	{as}
	base={base as ComponentBase}
	{preset}
	{minWidth}
	class={['overflow-hidden p-0', '$preset', klass]}
	{...restProps}
>
	{@render children?.({ popover: bond })}
</Content>
