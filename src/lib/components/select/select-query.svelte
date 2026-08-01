<script lang="ts">
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { SelectBond, SelectQueryAtom } from './bond.svelte';
	import { Input } from '$svelte-atoms/core/components/input';
	import type { SelectQueryProps } from './types';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';

	const bond = SelectBond.getOrThrow('SelectQuery must be used within a Select');

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		...restProps
	}: SelectQueryProps = $props();

	// The `query` atom plays role 'input' (`'query'` target): `atom.spread` carries the
	// projected combobox a11y (role, aria-autocomplete/expanded/controls/activedescendant)
	// and an `oninput` that writes `props.query`.
	const atom = createAtomInstance<SelectQueryAtom, SelectBond, HTMLInputElement>('query', {
		bond,
		factory: (owner) => new SelectQueryAtom(owner as SelectBond)
	});

	const queryProps = $derived(mergeAtomProps(atom, preset, restProps));
</script>

<!-- The control's text IS the bond's `query` (the `'input'` capability's `query` field):
     typing filters the items, Escape (`ClearThenClose` → `InputModel.clear`) empties it.
     `value` mirrors it for the public bindable API. -->
<Input.Control
	bind:value={
		() => bond.props.query ?? '',
		(v) => {
			bond.props.query = v;
			value = v;
		}
	}
	class={['inline-flex h-auto w-auto flex-1 py-1', '$preset', klass]}
	{...queryProps}
/>
