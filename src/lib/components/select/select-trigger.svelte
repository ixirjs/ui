<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Trigger } from '$svelte-atoms/core/components/popover/atoms';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { SelectBond } from './bond.svelte';
	import type { SelectTriggerProps } from './types';

	const bond = SelectBond.get();

	if (!bond) {
		throw new Error('select atom was not found');
	}

	let {
		class: klass = '',
		as = 'button' as T,
		preset = undefined,
		children = undefined,
		...restProps
	}: SelectTriggerProps<T, B> = $props();

	const atom = bond.atom('trigger');

	const presentation = $derived({ preset: preset ?? atom.preset });
</script>

<Trigger
	{as}
	{bond}
	class={['border-border relative flex h-auto min-h-10 flex-wrap items-center', '$preset', klass]}
	{...presentation}
	{...restProps}
>
	{@render children?.({ select: bond, dropdown: bond })}
</Trigger>
