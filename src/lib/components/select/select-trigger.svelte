<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { Trigger } from '$ixirjs/ui/components/popover/atoms';
	import { mergePresetProps, type Base } from '$ixirjs/ui/components/atom';
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

	// Forward only `preset` (+ restProps), not `atom.spread`: the inner popover `Trigger` resolves the
	// same shared bond's `trigger` atom and applies `mergeAtomProps` itself, so spreading the atom here
	// too would double-apply its attrs/handlers and re-mint attachment keys. Intentional omission.
	const presentation = $derived(mergePresetProps(preset, 'select.trigger', restProps));
</script>

<Trigger
	{as}
	{bond}
	class={['border-border relative flex h-auto min-h-10 flex-wrap items-center', '$preset', klass]}
	{...presentation}
>
	{@render children?.({ select: bond })}
</Trigger>
