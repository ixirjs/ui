<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Content } from '$svelte-atoms/core/components/popover/atoms';
	import type { AnchorSize } from '$svelte-atoms/core/components/popover';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { Root } from '../list/atoms';

	// Thin wrapper over popover Content (shares the popover context key, resolves preset
	// as `dropdown-menu.content`); supplies dropdown-specific defaults and forwards `preset`.
	let {
		class: klass = '',
		as = 'ul' as T,
		base = Root as B,
		preset = undefined,
		minWidth = 'var(--sa-anchor-width)' as AnchorSize,
		children = undefined,
		...restProps
	} = $props();
</script>

<Content
	{as}
	{base}
	{preset}
	{minWidth}
	class={['overflow-hidden p-0', '$preset', klass]}
	{...restProps}
>
	{@render children?.()}
</Content>
