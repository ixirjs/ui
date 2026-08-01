<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Trigger } from '$svelte-atoms/core/components/popover/atoms';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { DropdownBond } from './bond.svelte';
	import type { DropdownTriggerProps } from './types';

	const bond = DropdownBond.get();

	if (!bond) {
		throw new Error('dropdown atom was not found');
	}

	let {
		class: klass = '',
		as = 'button' as T,
		preset = undefined,
		children = undefined,
		...restProps
	}: DropdownTriggerProps<T, B> = $props();

	const triggerProps = $derived({ preset: preset ?? 'dropdown.trigger', ...restProps });
</script>

<Trigger
	{as}
	{bond}
	class={['relative flex h-auto min-h-10 flex-wrap items-center', '$preset', klass]}
	{...triggerProps}
>
	{@render children?.({ dropdown: bond })}
</Trigger>
