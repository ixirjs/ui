<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Trigger } from '$svelte-atoms/core/components/popover/atoms';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import { SelectBond } from './bond.svelte';
	import type { SelectTriggerProps } from './types';

	const bond = SelectBond.getOrThrow('SelectTrigger must be used within a Select');

	let {
		class: klass = '',
		as = 'button' as T,
		preset = undefined,
		children = undefined,
		...restProps
	}: SelectTriggerProps<T, B> = $props();

	// Forward only `preset`, not `atom.spread`: the inner popover `Trigger` resolves the same shared
	// bond's `trigger` atom and applies `mergeAtomProps` itself, so spreading the atom here too would
	// double-apply its attrs/handlers and re-mint attachment keys. Intentional, not a missing spread.
	const presentation = $derived({ preset: preset ?? 'select.trigger' });
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
