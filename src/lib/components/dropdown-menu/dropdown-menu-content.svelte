<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Content } from '$svelte-atoms/core/components/popover/atoms';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { Root } from '../list/atoms';

	// Thin wrapper over the popover Content: it reads the bond from context
	// (DropdownMenuBond shares the popover context key) and resolves the preset
	// itself as `dropdown-menu.content`. We only supply the dropdown-specific
	// defaults (list `Root` base, `ul` element, classes) and forward `preset`.
	let {
		class: klass = '',
		as = 'ul' as T,
		base = Root as B,
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();
</script>

<Content
	{as}
	{base}
	{preset}
	class={['overflow-hidden p-0', '$preset', klass]}
	{...restProps}
>
	{@render children?.()}
</Content>
