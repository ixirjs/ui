<script lang="ts">
	import { SelectBond } from './bond.svelte';
	import { Input } from '$svelte-atoms/core/components/input';
	import type { SelectQueryProps } from './types';

	const bond = SelectBond.get();

	if (!bond) {
		throw new Error('Select atom was not found');
	}

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: SelectQueryProps = $props();

	// The `query` atom plays role 'input' (`'query'` target): `atom.spread` carries the
	// projected combobox a11y (role, aria-autocomplete/expanded/controls/activedescendant)
	// and an `oninput` that writes `props.query`.
	const atom = bond.query();

	const queryProps = $derived({
		preset: preset ?? atom.preset,
		...atom.spread,
		...restProps
	});
</script>

<!-- The control's text IS the bond's `query` (the `'input'` capability's `query` field):
     typing filters the items, Escape (`ClearThenClose` → `InputModel.clear`) empties it.
     `value` mirrors it for the public bindable API. -->
<Input.Control
	bind:value={
		() => bond.state.props.query ?? '',
		(v) => {
			bond.state.props.query = v;
			value = v;
		}
	}
	class={['inline-flex h-auto w-auto flex-1 py-1', '$preset', klass]}
	{...queryProps}
/>
