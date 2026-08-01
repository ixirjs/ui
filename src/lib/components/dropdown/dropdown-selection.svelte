<script lang="ts" generics="T extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { type Base } from '$svelte-atoms/core/components/atom';
	import { DropdownBond } from './bond.svelte';
	import type { DropdownSelectionProps } from './types';
	import { Chip } from '../chip';
	import { HtmlAtom as Atom } from '../atom';

	const bond = DropdownBond.get();

	if (!bond) {
		throw new Error('DropdownValue must be used within a Dropdown');
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
	}: DropdownSelectionProps<T, B> = $props();

	const selectionProps = $derived({ preset: preset ?? 'dropdown.value', ...restProps });

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
		'dropdown-value border-border inline-flex h-6 flex-nowrap items-center gap-1 rounded-sm px-2 whitespace-nowrap',
		'$preset',
		klass
	]}
	onclose={handleClose}
	{...selectionProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{selection.label}
	{/if}
</Atom>
