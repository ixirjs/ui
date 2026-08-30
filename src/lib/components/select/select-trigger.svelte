<script lang="ts" generics="T extends HtmlElementTagName = 'div', B extends Base = Base">
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { Trigger } from '$ixirjs/ui/components/dropdown-menu/atoms';
	import type { DropdownMenuTriggerProps } from '$ixirjs/ui/components/dropdown-menu/types';
	import { SelectContext } from './bond.svelte';
	import type { SelectTriggerProps } from './types';

	const bond = SelectContext.getOrThrow('SelectTrigger must be used within a Select');

	let {
		class: klass = '',
		as = 'button' as T,
		preset = undefined,
		children = undefined,
		...restProps
	}: SelectTriggerProps<T, B> & BasePropsOf<B> = $props();
</script>

<Trigger
	{as}
	{preset}
	class={['border-border relative flex h-auto min-h-10 flex-wrap items-center', '$preset', klass]}
	{...restProps as DropdownMenuTriggerProps<T, B>}
>
	{@render children?.({ select: bond })}
</Trigger>
