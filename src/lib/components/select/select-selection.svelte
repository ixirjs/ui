<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { SelectBond } from './bond.svelte';
	import type { SelectSelectionProps } from './types';
	import { Chip } from '../chip';
	import { HtmlAtom as Atom } from '../atom';

	const bond = SelectBond.get();

	if (!bond) {
		throw new Error('SelectSelection must be used within a Select');
	}

	const isMultiple = $derived(bond.state.props.multiple);

	let {
		class: klass = '',
		as = 'div' as T,
		base = undefined,
		preset = undefined,
		selection,
		children,
		onclose,
		...restProps
	}: SelectSelectionProps<T, B> = $props();

	const atom = bond.value();

	const presentation = $derived({ preset: preset ?? atom.preset });

	const _base = $derived((base ?? isMultiple) ? Chip : undefined);

	function handleClose(ev: Event) {
		onclose?.(ev);

		if (ev.defaultPrevented) return;

		selection.unselect();
	}
</script>

<Atom
	{as}
	{bond}
	base={_base}
	class={[
		'select-value border-border inline-flex h-6 flex-nowrap items-center gap-1 rounded-sm px-2 whitespace-nowrap',
		'$preset',
		klass
	]}
	onclose={handleClose}
	{...presentation}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{selection?.label}
	{/if}
</Atom>
