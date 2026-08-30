<script lang="ts" generics="T extends HtmlElementTagName = 'div', B extends Base = Base">
	import { Content } from '$ixirjs/ui/components/popover/atoms';
	import type { AnchorSize, PopoverContentProps } from '$ixirjs/ui/components/popover';
	import type { Base, ComponentBase, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { Root } from '$ixirjs/ui/components/list/atoms';
	import { DropdownMenuContext, menuKeydown } from './bond.svelte';

	const bond = DropdownMenuContext.getOrThrow(
		'<DropdownMenu.Content /> must be used within a <DropdownMenu.Root />'
	);

	// Thin wrapper over popover Content (shares the popover context key, resolves preset as
	// `<family>.content`); supplies the menu container ARIA, the roving/typeahead keydown and this
	// family's own defaults, and forwards `preset`.
	let {
		class: klass = '',
		as = 'ul' as T,
		base = Root as unknown as B,
		preset = undefined,
		minWidth = 'var(--sa-anchor-width)' as AnchorSize,
		children = undefined,
		onkeydown = undefined,
		...restProps
	}: PopoverContentProps<T, B> = $props();

	// What `rovingCapability`'s container projection, `navigationCapability` and
	// `typeaheadCapability` used to put on the content element, written literally.
	const navigate = menuKeydown(bond);
	function keydown(event: KeyboardEvent) {
		(onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
		if (!event.defaultPrevented) navigate(event);
	}
	const containerAttrs = $derived(bond.contentAttrs);
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
	{...containerAttrs}
	onkeydown={keydown}
	{...restProps as PopoverContentProps<'div'>}
>
	{@render children?.({ popover: bond })}
</Content>
